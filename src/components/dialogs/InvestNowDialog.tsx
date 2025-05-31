
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, TrendingUp } from 'lucide-react';

interface InvestNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    title: string;
    tokenPrice: string;
    availableTokens: number;
    totalTokens: number;
    roi: string;
    location: string;
    image: string;
  };
}

export function InvestNowDialog({ open, onOpenChange, property }: InvestNowDialogProps) {
  const [tokenAmount, setTokenAmount] = useState(100);
  const [investmentAmount, setInvestmentAmount] = useState(0);

  const tokenPrice = parseFloat(property.tokenPrice.replace('$', ''));

  const handleTokenChange = (value: number) => {
    const newAmount = Math.max(1, Math.min(value, property.availableTokens));
    setTokenAmount(newAmount);
    setInvestmentAmount(newAmount * tokenPrice);
  };

  const handleInvestmentChange = (value: number) => {
    const newTokens = Math.floor(value / tokenPrice);
    const clampedTokens = Math.max(1, Math.min(newTokens, property.availableTokens));
    setTokenAmount(clampedTokens);
    setInvestmentAmount(clampedTokens * tokenPrice);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invest in Property</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{property.title}</h3>
                  <p className="text-xs text-gray-600">{property.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium">{property.tokenPrice}</span>
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp size={10} className="mr-1" />
                      {property.roi}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Controls */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="tokens">Number of Tokens</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleTokenChange(tokenAmount - 10)}
                >
                  <Minus size={14} />
                </Button>
                <Input
                  id="tokens"
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => handleTokenChange(parseInt(e.target.value) || 0)}
                  className="text-center"
                  min={1}
                  max={property.availableTokens}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleTokenChange(tokenAmount + 10)}
                >
                  <Plus size={14} />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Max: {property.availableTokens.toLocaleString()} tokens available
              </p>
            </div>

            <div>
              <Label htmlFor="amount">Investment Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                value={investmentAmount}
                onChange={(e) => handleInvestmentChange(parseFloat(e.target.value) || 0)}
                className="mt-1"
                step="0.01"
              />
            </div>
          </div>

          {/* Investment Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tokens:</span>
                <span className="font-medium">{tokenAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Price per token:</span>
                <span className="font-medium">{property.tokenPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ownership:</span>
                <span className="font-medium">
                  {((tokenAmount / property.totalTokens) * 100).toFixed(3)}%
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Investment:</span>
                <span className="text-blue-600">${investmentAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">
              Invest Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
