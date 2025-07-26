import { useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { CurrencyInput } from "@/components/ui/currency-input";
import { CurrencyExchangeWidget } from "@/components/ui/currency-exchange-widget";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  CurrencyDollarIcon,
  TrendUpIcon,
  ShieldIcon,
  ClockIcon,
} from "@phosphor-icons/react";

interface TokenizedProperty {
  id: string;
  token_name: string;
  token_symbol: string;
  token_price: number;
  minimum_investment: number;
  expected_roi: number;
  total_supply: string;
  property_title?: string;
  hedera_token_id?: string;
}

interface InvestNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenizedProperty: TokenizedProperty;
}

export function InvestNowDialog({
  open,
  onOpenChange,
  tokenizedProperty,
}: InvestNowDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [investmentAmount, setInvestmentAmount] = useState(
    tokenizedProperty.minimum_investment
  );
  const [loading, setLoading] = useState(false);

  const tokensToReceive = Math.floor(
    investmentAmount / tokenizedProperty.token_price
  );
  const estimatedReturns =
    (investmentAmount * tokenizedProperty.expected_roi) / 100;

  const handleInvest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make an investment",
        variant: "destructive",
      });
      return;
    }

    if (investmentAmount < tokenizedProperty.minimum_investment) {
      toast({
        title: "Invalid Amount",
        description: `Minimum investment is $${tokenizedProperty.minimum_investment}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create a token holding record
      const { error: holdingError } = await supabase
        .from("token_holdings")
        .insert({
          holder_id: user.id,
          tokenized_property_id: tokenizedProperty.id,
          tokens_owned: tokensToReceive.toString(),
          purchase_price_per_token: tokenizedProperty.token_price,
          total_investment: investmentAmount,
          acquisition_date: new Date().toISOString(),
        });

      if (holdingError) throw holdingError;

      // Create investment tracking record
      const { error: trackingError } = await supabase
        .from("investment_tracking")
        .insert({
          user_id: user.id,
          tokenized_property_id: tokenizedProperty.id,
          tokens_owned: tokensToReceive,
          investment_amount: investmentAmount,
          current_value: investmentAmount,
          roi_percentage: 0,
        });

      if (trackingError) throw trackingError;

      // Create a token transaction record - using 'mint' as transaction type since this is creating new tokens for user
      const { error: transactionError } = await supabase
        .from("token_transactions")
        .insert({
          tokenized_property_id: tokenizedProperty.id,
          to_holder: user.id,
          token_amount: tokensToReceive.toString(),
          price_per_token: tokenizedProperty.token_price,
          total_value: investmentAmount,
          transaction_type: "mint",
          status: "confirmed",
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Investment Successful!",
        description: `You have successfully invested $${investmentAmount} and received ${tokensToReceive} tokens.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Investment error:", error);
      toast({
        title: "Investment Failed",
        description:
          "There was an error processing your investment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent size="md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            Invest in {tokenizedProperty.token_name}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Purchase tokens to become a fractional owner of this property
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-6 px-4 md:px-0">
          {/* Property Info */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Token Price:</span>
              <CurrencyExchangeWidget 
                amount={tokenizedProperty.token_price}
                size="sm"
                className="font-semibold"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Expected ROI:</span>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <TrendUpIcon className="h-3 w-3 mr-1" />
                {tokenizedProperty.expected_roi}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Min Investment:</span>
              <CurrencyExchangeWidget 
                amount={tokenizedProperty.minimum_investment}
                size="sm"
                className="font-semibold"
              />
            </div>
          </div>

          {/* Investment Amount */}
          <div className="space-y-2">
            <Label htmlFor="investment-amount">Investment Amount</Label>
            <CurrencyInput
              value={investmentAmount}
              onChange={setInvestmentAmount}
              currency="USD"
              min={tokenizedProperty.minimum_investment}
            />
          </div>

          {/* Investment Summary */}
          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-semibold">Investment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tokens to receive:</span>
                <span className="font-semibold">
                  {tokensToReceive} {tokenizedProperty.token_symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Estimated annual returns:</span>
                <CurrencyExchangeWidget 
                  amount={estimatedReturns}
                  size="sm"
                  variant="toggle"
                  className="font-semibold text-green-600"
                />
              </div>
            </div>
          </div>

          {/* Investment Warnings */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <ShieldIcon className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-semibold mb-1">Investment Notice:</p>
                <p>
                  Real estate investments carry risk. Past performance doesn't
                  guarantee future results. Please invest responsibly.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ResponsiveDialogFooter>
          <ResponsiveDialogCloseButton />
          <Button
            onClick={handleInvest}
            disabled={
              loading ||
              investmentAmount < tokenizedProperty.minimum_investment
            }
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            ) : (
              `Invest $${investmentAmount}`
            )}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
