"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useHederaWallet } from "@/contexts/HederaWalletContext";
import { supabase } from "@/integrations/supabase/client";
import { CoinsIcon, TrendingUpIcon, DollarSignIcon } from "@phosphor-icons/react";

interface TokenHolding {
  id: string;
  tokenized_property_id: string;
  tokens_owned: string;
  total_investment: number;
  current_value: number;
  roi_percentage: number;
  tokenized_property: {
    token_name: string;
    token_symbol: string;
    token_price: number;
    hedera_tokens: Array<{
      hedera_token_id: string;
    }>;
  };
}

export function TokenBalanceCard() {
  const { wallet, tokenBalances, refreshBalances } = useHederaWallet();
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [totalROI, setTotalROI] = useState(0);

  useEffect(() => {
    if (wallet?.id) {
      fetchTokenHoldings();
    }
  }, [wallet?.id]);

  const fetchTokenHoldings = async () => {
    if (!wallet?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('token_holdings')
        .select(`
          id,
          tokenized_property_id,
          tokens_owned,
          total_investment,
          tokenized_properties!inner(
            token_name,
            token_symbol,
            token_price,
            hedera_tokens!inner(hedera_token_id)
          )
        `)
        .eq('holder_id', wallet.id);

      if (error) throw error;

      if (data) {
        // Calculate current values and ROI
        const holdingsWithMetrics = data.map(holding => {
          const currentPrice = holding.tokenized_properties.token_price;
          const tokensOwned = parseFloat(holding.tokens_owned);
          const currentValue = tokensOwned * currentPrice;
          const roi = holding.total_investment > 0 
            ? ((currentValue - holding.total_investment) / holding.total_investment) * 100 
            : 0;

          return {
            ...holding,
            current_value: currentValue,
            roi_percentage: roi,
            tokenized_property: holding.tokenized_properties,
          };
        });

        setHoldings(holdingsWithMetrics as TokenHolding[]);

        // Calculate totals
        const total = holdingsWithMetrics.reduce((sum, h) => sum + h.current_value, 0);
        const totalInvestment = holdingsWithMetrics.reduce((sum, h) => sum + h.total_investment, 0);
        const overallROI = totalInvestment > 0 ? ((total - totalInvestment) / totalInvestment) * 100 : 0;

        setTotalValue(total);
        setTotalROI(overallROI);
      }
    } catch (error) {
      console.error('Error fetching token holdings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await refreshBalances();
    await fetchTokenHoldings();
  };

  if (!wallet?.isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <CoinsIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Connect your wallet to view token balances</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CoinsIcon className="w-5 h-5" />
          Token Portfolio
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSignIcon className="w-4 h-4" />
              Total Value
            </p>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUpIcon className="w-4 h-4" />
              Total ROI
            </p>
            <p className={`text-2xl font-bold ${totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Individual Holdings */}
        <div className="space-y-4">
          {holdings.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No token holdings found</p>
              <p className="text-sm">Start investing to see your portfolio here</p>
            </div>
          )}

          {holdings.map((holding) => {
            const accountBalance = tokenBalances.get(wallet.id)?.get(
              holding.tokenized_property.hedera_tokens[0]?.hedera_token_id
            );

            return (
              <div key={holding.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{holding.tokenized_property.token_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {holding.tokenized_property.token_symbol}
                    </p>
                  </div>
                  <Badge 
                    className={
                      holding.roi_percentage >= 0 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {holding.roi_percentage >= 0 ? '+' : ''}{holding.roi_percentage.toFixed(2)}%
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tokens Owned</p>
                    <p className="font-medium">{parseFloat(holding.tokens_owned).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Investment</p>
                    <p className="font-medium">${holding.total_investment.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Value</p>
                    <p className="font-medium">${holding.current_value.toFixed(2)}</p>
                  </div>
                </div>

                {accountBalance && (
                  <div className="text-xs text-muted-foreground">
                    Wallet Balance: {accountBalance}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* HBAR Balance */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">HBAR Balance</p>
              <p className="text-sm text-muted-foreground">Account: {wallet.id}</p>
            </div>
            <p className="font-mono text-lg">{wallet.balance || "0 HBAR"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}