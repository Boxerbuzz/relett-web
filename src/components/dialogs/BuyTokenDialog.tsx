
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Wallet, DollarSign } from 'lucide-react';

interface BuyTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BuyTokenDialog({ open, onOpenChange }: BuyTokenDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const quickAmounts = [50, 100, 250, 500, 1000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet size={20} />
            Buy Tokens
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Amount Selection */}
          <div>
            <Label>Quick Select Amount</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className={amount === quickAmount.toString() ? 'border-blue-600 bg-blue-50' : ''}
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <Label htmlFor="amount">Amount (USD)</Label>
            <div className="relative mt-1">
              <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} />
                    Credit/Debit Card
                  </div>
                </SelectItem>
                <SelectItem value="bank">
                  <div className="flex items-center gap-2">
                    <Wallet size={16} />
                    Bank Transfer
                  </div>
                </SelectItem>
                <SelectItem value="crypto">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
                    Cryptocurrency
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Amount:</span>
                <span className="font-medium">${amount || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing Fee:</span>
                <span className="font-medium">$2.99</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-blue-600">
                  ${amount ? (parseFloat(amount) + 2.99).toFixed(2) : '2.99'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              className="flex-1"
              disabled={!amount || !paymentMethod}
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
