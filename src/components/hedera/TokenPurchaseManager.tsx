"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Coins,
  ArrowRight,
  Calculator,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface TokenPurchaseManagerProps {
  tokenizedProperty: {
    id: string;
    token_name: string;
    token_symbol: string;
    token_price: number;
    hedera_token_id: string;
    minimum_investment: number;
    available_tokens?: number;
    total_supply?: string;
    status: string;
  };
  userWallet: {
    address: string;
    encrypted_private_key: string;
  };
  onPurchaseComplete?: () => void;
}

export function TokenPurchaseManager({
  tokenizedProperty,
  userWallet,
  onPurchaseComplete,
}: TokenPurchaseManagerProps) {
  const [tokenAmount, setTokenAmount] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isAssociating, setIsAssociating] = useState(false);
  const [isAssociated, setIsAssociated] = useState(false);
  const { toast } = useToast();
  const { currency } = useCurrency();

  const requestedTokens = parseFloat(tokenAmount || "0");
  const totalCost = requestedTokens * tokenizedProperty.token_price;
  const availableTokens = tokenizedProperty.available_tokens || 0;
  const totalSupply = parseInt(tokenizedProperty.total_supply || "0");

  // Validation checks
  const isValidAmount =
    requestedTokens > 0 && totalCost >= tokenizedProperty.minimum_investment;
  const isWithinSupply = requestedTokens <= availableTokens;
  const isValidPurchase = isValidAmount && isWithinSupply;

  // Calculate supply metrics
  const soldTokens = totalSupply - availableTokens;
  const supplyProgress = totalSupply > 0 ? (soldTokens / totalSupply) * 100 : 0;

  const handleTokenAssociation = async () => {
    setIsAssociating(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "associate-hedera-token",
        {
          body: {
            tokenId: tokenizedProperty.hedera_token_id,
            investorAccountId: userWallet.address,
            investorPrivateKey: userWallet.encrypted_private_key,
          },
        }
      );

      if (error) throw error;

      setIsAssociated(true);
      toast({
        title: "Token Associated",
        description: "Your account is now ready to receive tokens",
      });
    } catch (error) {
      console.error("Token association error:", error);
      toast({
        title: "Association Failed",
        description: "Failed to associate token with your account",
        variant: "destructive",
      });
    } finally {
      setIsAssociating(false);
    }
  };

  const handleTokenPurchase = async () => {
    if (!isValidPurchase) return;

    setIsPurchasing(true);

    try {
      // Check if this is during sales window (status = 'approved') or after (status = 'minted')
      const isSalesWindow = tokenizedProperty.status === "approved";
      const actionType = isSalesWindow ? "commitment" : "purchase";

      // Create payment session for token purchase/commitment
      const { data: paymentData, error: paymentError } =
        await supabase.functions.invoke("create-token-purchase-payment", {
          body: {
            tokenizedPropertyId: tokenizedProperty.id,
            tokenAmount: parseFloat(tokenAmount),
            investorAccountId: userWallet.address,
            actionType, // Pass whether this is a commitment or direct purchase
          },
        });

      if (paymentError) throw paymentError;

      // Redirect to Paystack payment page
      if (paymentData.payment_url) {
        window.open(paymentData.payment_url, "_self");
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error("Token purchase payment error:", error);
      toast({
        title: "Payment Failed",
        description: `Failed to initialize token ${
          tokenizedProperty.status === "approved" ? "commitment" : "purchase"
        } payment`,
        variant: "destructive",
      });
      setIsPurchasing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          {tokenizedProperty.status === "approved"
            ? "Commit to"
            : "Purchase"}{" "}
          {tokenizedProperty.token_symbol} Tokens
        </CardTitle>
        <CardDescription>
          {tokenizedProperty.status === "approved"
            ? `Commit to investing in ${tokenizedProperty.token_name} during the sales window`
            : `Invest in ${tokenizedProperty.token_name}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Supply Overview */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Token Supply Overview
            </h4>
            <Badge
              variant={
                supplyProgress > 80
                  ? "destructive"
                  : supplyProgress > 50
                  ? "default"
                  : "secondary"
              }
            >
              {supplyProgress.toFixed(1)}% Sold
            </Badge>
          </div>

          <div className="space-y-3">
            <Progress value={supplyProgress} className="h-2" />

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">Total Supply</p>
                <p className="font-semibold">{formatNumber(totalSupply)}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Available</p>
                <p className="font-semibold text-green-600">
                  {formatNumber(availableTokens)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Sold</p>
                <p className="font-semibold">{formatNumber(soldTokens)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Token Association Step */}
        {!isAssociated && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Step 1: Associate Token</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Before purchasing, you need to associate this token with your
              account.
            </p>
            <Button
              onClick={handleTokenAssociation}
              disabled={isAssociating}
              size="sm"
            >
              {isAssociating ? "Associating..." : "Associate Token"}
            </Button>
          </div>
        )}

        {isAssociated && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Token Associated - Ready to Purchase
              </span>
            </div>
          </div>
        )}

        {/* Purchase Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Token Price:</span>
              <span className="font-medium ml-2">
                {formatCurrency(tokenizedProperty.token_price, currency)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Min Investment:</span>
              <span className="font-medium ml-2">
                {formatCurrency(tokenizedProperty.minimum_investment, currency)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token-amount">Number of Tokens</Label>
            <Input
              id="token-amount"
              type="number"
              placeholder="100"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              min="1"
              max={availableTokens}
              step="1"
            />
            {availableTokens > 0 && (
              <p className="text-xs text-muted-foreground">
                Maximum available: {formatNumber(availableTokens)} tokens
              </p>
            )}
          </div>

          {tokenAmount && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Total Cost:
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(totalCost, currency)}
                  </span>
                </div>
              </div>

              {/* Validation Messages */}
              {!isValidAmount && totalCost > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                    <p className="text-sm">
                      Minimum investment is{" "}
                      {formatCurrency(
                        tokenizedProperty.minimum_investment,
                        currency
                      )}
                    </p>
                  </div>
                </div>
              )}

              {isValidAmount && !isWithinSupply && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <AlertTriangle className="w-4 h-4" />
                    <p className="text-sm">
                      Only {formatNumber(availableTokens)} tokens available.
                      Please reduce your amount.
                    </p>
                  </div>
                </div>
              )}

              {availableTokens === 0 && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <AlertTriangle className="w-4 h-4" />
                    <p className="text-sm">
                      This token offering is completely sold out.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleTokenPurchase}
            disabled={
              !isAssociated ||
              !isValidPurchase ||
              isPurchasing ||
              availableTokens === 0
            }
            className="w-full"
          >
            {isPurchasing ? (
              `Processing ${
                tokenizedProperty.status === "approved"
                  ? "Commitment"
                  : "Purchase"
              }...`
            ) : availableTokens === 0 ? (
              "Sold Out"
            ) : (
              <span className="flex items-center gap-2">
                {tokenizedProperty.status === "approved"
                  ? "Commit to Tokens"
                  : "Purchase Tokens"}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
