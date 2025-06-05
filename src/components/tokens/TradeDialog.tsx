
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Coins, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

export function TradeDialog({ isOpen, onClose, property }: TradeDialogProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tokenAmount, setTokenAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const totalCost = parseFloat(tokenAmount || '0') * property.currentValue;
  const platformFee = totalCost * 0.025; // 2.5% platform fee
  const gasFee = 5; // Estimated gas fee
  const totalWithFees = totalCost + platformFee + gasFee;

  const handleTrade = async () => {
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid token amount.',
        variant: 'destructive'
      });
      return;
    }

    if (tradeType === 'sell' && parseFloat(tokenAmount) > property.ownedTokens) {
      toast({
        title: 'Insufficient Tokens',
        description: 'You cannot sell more tokens than you own.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Trade Successful',
        description: `Successfully ${tradeType === 'buy' ? 'purchased' : 'sold'} ${tokenAmount} tokens.`,
      });
      
      onClose();
      setTokenAmount('');
    } catch (error) {
      toast({
        title: 'Trade Failed',
        description: 'An error occurred while processing your trade.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Trade Tokens</DialogTitle>
          <DialogDescription>
            {property.title}
          </DialogDescription>
        </DialogHeader>

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

            <TabsContent value="buy" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Current Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">${property.currentValue.toFixed(2)}</span>
                    <Badge variant={property.roi >= 0 ? 'default' : 'destructive'}>
                      {property.roi >= 0 ? '+' : ''}{property.roi.toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sell" className="space-y-4">
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
                      <span className="font-medium">${(property.ownedTokens * property.currentValue).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
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
            </div>

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
                    <span>${property.currentValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Platform fee (2.5%):</span>
                    <span>${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Gas fee:</span>
                    <span>${gasFee.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${totalWithFees.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {tradeType === 'sell' && tokenAmount && parseFloat(tokenAmount) > property.ownedTokens && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">
                  You can only sell up to {property.ownedTokens} tokens
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleTrade} 
              disabled={!tokenAmount || parseFloat(tokenAmount) <= 0 || isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} Tokens`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
