
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, DollarSign, Coins, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { TradingService } from '@/lib/trading';
import { MarketDepth } from './MarketDepth';

interface TradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    tokenPrice: number;
    currentValue: number;
    ownedTokens: number;
    totalTokens: number;
    roi: number;
  };
  onTradeComplete?: () => void;
}

export function TradeDialog({ isOpen, onClose, property, onTradeComplete }: TradeDialogProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tokenAmount, setTokenAmount] = useState('');
  const [pricePerToken, setPricePerToken] = useState(property.currentValue.toString());
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [isProcessing, setIsProcessing] = useState(false);
  const [marketPrice, setMarketPrice] = useState(property.currentValue);
  const { toast } = useToast();
  const { user } = useAuth();

  const tradingService = new TradingService();

  const totalCost = parseFloat(tokenAmount || '0') * parseFloat(pricePerToken || '0');
  const platformFee = totalCost * 0.025; // 2.5% platform fee
  const gasFee = 5; // Estimated gas fee
  const totalWithFees = totalCost + platformFee + gasFee;

  useEffect(() => {
    if (isOpen) {
      fetchMarketPrice();
    }
  }, [isOpen, property.id]);

  useEffect(() => {
    if (orderType === 'market') {
      setPricePerToken(marketPrice.toString());
    }
  }, [orderType, marketPrice]);

  const fetchMarketPrice = async () => {
    try {
      const price = await tradingService.getMarketPrice(property.id);
      setMarketPrice(price);
      if (orderType === 'market') {
        setPricePerToken(price.toString());
      }
    } catch (error) {
      console.error('Error fetching market price:', error);
    }
  };

  const validateTrade = (): string | null => {
    if (!user) {
      return 'Please log in to trade tokens.';
    }

    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      return 'Please enter a valid token amount.';
    }

    if (!pricePerToken || parseFloat(pricePerToken) <= 0) {
      return 'Please enter a valid price per token.';
    }

    if (tradeType === 'sell' && parseFloat(tokenAmount) > property.ownedTokens) {
      return 'You cannot sell more tokens than you own.';
    }

    return null;
  };

  const handleTrade = async () => {
    const validationError = validateTrade();
    if (validationError) {
      toast({
        title: 'Invalid Trade',
        description: validationError,
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await tradingService.executeTrade({
        tokenizedPropertyId: property.id,
        tokenAmount: parseFloat(tokenAmount),
        pricePerToken: parseFloat(pricePerToken),
        tradeType,
        userId: user!.id
      });

      if (result.success) {
        toast({
          title: 'Trade Successful',
          description: `Successfully ${tradeType === 'buy' ? 'purchased' : 'sold'} ${tokenAmount} tokens.`,
        });
        
        onTradeComplete?.();
        onClose();
        setTokenAmount('');
      } else {
        throw new Error(result.error || 'Trade failed');
      }
    } catch (error) {
      console.error('Trade error:', error);
      toast({
        title: 'Trade Failed',
        description: error instanceof Error ? error.message : 'An error occurred while processing your trade.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <DialogHeader>
            <DialogTitle>Trade Tokens</DialogTitle>
            <DialogDescription>
              {property.title}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1">
            {/* Trading Form */}
            <div className="space-y-6">
              <Tabs value={tradeType} onValueChange={(value) => setTradeType(value as 'buy' | 'sell')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Sell
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4 space-y-4">
                  {/* Order Type */}
                  <div>
                    <Label htmlFor="orderType">Order Type</Label>
                    <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'limit')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="market">Market</TabsTrigger>
                        <TabsTrigger value="limit">Limit</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Token Amount */}
                  <div>
                    <Label htmlFor="tokenAmount">Token Amount</Label>
                    <Input
                      id="tokenAmount"
                      type="number"
                      placeholder="Enter number of tokens"
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                      max={tradeType === 'sell' ? property.ownedTokens : undefined}
                    />
                    {tradeType === 'sell' && (
                      <p className="text-xs text-gray-600 mt-1">
                        Available: {property.ownedTokens} tokens
                      </p>
                    )}
                  </div>

                  {/* Price per Token */}
                  <div>
                    <Label htmlFor="pricePerToken">Price per Token ($)</Label>
                    <Input
                      id="pricePerToken"
                      type="number"
                      step="0.01"
                      placeholder="Price per token"
                      value={pricePerToken}
                      onChange={(e) => setPricePerToken(e.target.value)}
                      disabled={orderType === 'market'}
                    />
                    {orderType === 'market' && (
                      <p className="text-xs text-gray-600 mt-1">
                        Market price will be used
                      </p>
                    )}
                  </div>

                  {/* Trade Summary */}
                  {tokenAmount && parseFloat(tokenAmount) > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Trade Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tokens:</span>
                          <span>{tokenAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price per token:</span>
                          <span>${parseFloat(pricePerToken || '0').toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${totalCost.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Platform fee (2.5%):</span>
                          <span>${platformFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Gas fee:</span>
                          <span>${gasFee.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>${totalWithFees.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Validation Warnings */}
                  {tradeType === 'sell' && tokenAmount && parseFloat(tokenAmount) > property.ownedTokens && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-700">
                        You can only sell up to {property.ownedTokens} tokens
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleTrade} 
                      disabled={!tokenAmount || parseFloat(tokenAmount) <= 0 || isProcessing || !!validateTrade()}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `${tradeType === 'buy' ? 'Buy' : 'Sell'} Tokens`
                      )}
                    </Button>
                  </div>
                </div>
              </Tabs>
            </div>

            {/* Market Information */}
            <div className="space-y-6">
              {/* Current Price */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Current Market Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">${marketPrice.toFixed(2)}</span>
                    <Badge variant={property.roi >= 0 ? 'default' : 'destructive'}>
                      {property.roi >= 0 ? '+' : ''}{property.roi.toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Holdings Info */}
              {tradeType === 'sell' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Your Holdings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tokens Owned:</span>
                        <span className="font-medium">{property.ownedTokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Value:</span>
                        <span className="font-medium">${(property.ownedTokens * marketPrice).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Market Depth */}
              <div>
                <h3 className="text-sm font-medium mb-3">Market Depth</h3>
                <MarketDepth 
                  tokenizedPropertyId={property.id} 
                  currentPrice={marketPrice}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
