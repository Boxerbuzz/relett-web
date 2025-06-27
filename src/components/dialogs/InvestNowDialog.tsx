
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import {
  CubeIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  TrendUpIcon,
  ArrowPathIcon
} from '@phosphor-icons/react';

interface InvestNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenizedProperty: {
    id: string;
    token_name: string;
    token_symbol: string;
    token_price: number;
    minimum_investment: number;
    expected_roi: number;
    total_supply: string;
    property_title?: string;
    hedera_token_id?: string;
  };
}

export function InvestNowDialog({ 
  open, 
  onOpenChange, 
  tokenizedProperty 
}: InvestNowDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const tokenAmount = investmentAmount ? 
    Math.floor(parseFloat(investmentAmount) / tokenizedProperty.token_price) : 0;

  const handleInvestment = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to make an investment',
        variant: 'destructive'
      });
      return;
    }

    const amount = parseFloat(investmentAmount);
    if (!amount || amount < tokenizedProperty.minimum_investment) {
      toast({
        title: 'Invalid Amount',
        description: `Minimum investment is $${tokenizedProperty.minimum_investment.toLocaleString()}`,
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      // Create payment session
      const { data: paymentSession, error: paymentError } = await supabase
        .functions.invoke('create-payment-session', {
          body: {
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'USD',
            purpose: 'token_purchase',
            metadata: {
              tokenized_property_id: tokenizedProperty.id,
              token_amount: tokenAmount,
              token_price: tokenizedProperty.token_price,
              hedera_token_id: tokenizedProperty.hedera_token_id
            }
          }
        });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      // Redirect to payment
      if (paymentSession?.payment_url) {
        window.location.href = paymentSession.payment_url;
      } else {
        // Simulate successful investment for demo
        await simulateInvestment(amount, tokenAmount);
      }

    } catch (error) {
      console.error('Investment error:', error);
      toast({
        title: 'Investment Failed',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateInvestment = async (amount: number, tokens: number) => {
    try {
      // Create token holding record
      const { error: holdingError } = await supabase
        .from('token_holdings')
        .insert({
          holder_id: user!.id,
          tokenized_property_id: tokenizedProperty.id,
          tokens_owned: tokens.toString(),
          purchase_price_per_token: tokenizedProperty.token_price,
          total_investment: amount,
          acquisition_date: new Date().toISOString()
        });

      if (holdingError) throw holdingError;

      // Create investment tracking record
      const { error: trackingError } = await supabase
        .from('investment_tracking')
        .insert({
          user_id: user!.id,
          tokenized_property_id: tokenizedProperty.id,
          tokens_owned: tokens,
          investment_amount: amount,
          current_value: amount,
          roi_percentage: 0
        });

      if (trackingError) throw trackingError;

      // Create token transaction record
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          tokenized_property_id: tokenizedProperty.id,
          to_holder: user!.id,
          token_amount: tokens.toString(),
          price_per_token: tokenizedProperty.token_price,
          total_value: amount,
          transaction_type: 'purchase' as const,
          status: 'completed' as const
        });

      if (transactionError) throw transactionError;

      toast({
        title: 'Investment Successful!',
        description: `You have successfully invested $${amount.toLocaleString()} and received ${tokens} tokens.`
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Simulation error:', error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CubeIcon className="h-5 w-5 text-blue-600" />
            Invest in {tokenizedProperty.token_name}
          </DialogTitle>
          <DialogDescription>
            Purchase tokens to become a fractional owner of this property
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${tokenizedProperty.token_price}
                  </div>
                  <div className="text-sm text-gray-600">Per Token</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {tokenizedProperty.expected_roi}%
                  </div>
                  <div className="text-sm text-gray-600">Expected ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ${tokenizedProperty.minimum_investment.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Min Investment</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="investment-amount">Investment Amount (USD)</Label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="investment-amount"
                  type="number"
                  placeholder="Enter investment amount"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="pl-10"
                  min={tokenizedProperty.minimum_investment}
                />
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Minimum: ${tokenizedProperty.minimum_investment.toLocaleString()}
              </div>
            </div>

            {investmentAmount && tokenAmount > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalculatorIcon className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">You will receive:</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {tokenAmount} {tokenizedProperty.token_symbol}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Investment Summary */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4" />
              Investment Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Property:</span>
                <span className="font-medium">{tokenizedProperty.property_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Token Symbol:</span>
                <span className="font-medium">{tokenizedProperty.token_symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Investment Amount:</span>
                <span className="font-medium">${parseFloat(investmentAmount || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tokens to Receive:</span>
                <span className="font-medium">{tokenAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Annual Return:</span>
                <span className="font-medium text-green-600">
                  ${((parseFloat(investmentAmount || '0') * tokenizedProperty.expected_roi) / 100).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ownership Percentage:</span>
                <span className="font-medium">
                  {((tokenAmount / parseFloat(tokenizedProperty.total_supply)) * 100).toFixed(4)}%
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvestment}
              disabled={loading || !investmentAmount || parseFloat(investmentAmount) < tokenizedProperty.minimum_investment}
              className="flex-1"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Invest Now
                </>
              )}
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Investment Disclaimer:</strong> Real estate investments carry risks. 
            Past performance does not guarantee future results. Please review all 
            property documentation before investing.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
