
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Wallet, DollarSign, ArrowLeft, Check } from 'lucide-react';
import { WalletCombobox } from '@/components/wallet/WalletCombobox';

interface BuyTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PaymentMethod = 'card' | 'bank' | 'crypto';

export function BuyTokenDialog({ open, onOpenChange }: BuyTokenDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  
  // Card payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  // Bank transfer fields
  const [bankAccount, setBankAccount] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  
  // Crypto fields
  const [walletAddress, setWalletAddress] = useState('');
  const [cryptoType, setCryptoType] = useState('');

  const quickAmounts = [50, 100, 250, 500, 1000];
  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    console.log('Payment completed:', { amount, paymentMethod });
    onOpenChange(false);
    setCurrentStep(1);
    // Reset form
    setAmount('');
    setPaymentMethod('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardName('');
    setBankAccount('');
    setRoutingNumber('');
    setWalletAddress('');
    setCryptoType('');
  };

  const renderPaymentStep = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard size={20} />
              Credit/Debit Card Payment
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'bank':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Wallet size={20} />
              Bank Transfer
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="bankAccount">Bank Account Number</Label>
                <Input
                  id="bankAccount"
                  placeholder="Enter your account number"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="routing">Routing Number</Label>
                <Input
                  id="routing"
                  placeholder="Enter routing number"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                />
              </div>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-800">
                    Bank transfers typically take 1-3 business days to process. You'll receive a confirmation email once the transfer is initiated.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'crypto':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign size={20} />
              Cryptocurrency Payment
            </h3>
            <div className="space-y-3">
              <div>
                <Label>Cryptocurrency Type</Label>
                <Select value={cryptoType} onValueChange={setCryptoType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    <SelectItem value="usdc">USD Coin (USDC)</SelectItem>
                    <SelectItem value="usdt">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="wallet">Wallet Address</Label>
                <WalletCombobox
                  value={walletAddress}
                  onValueChange={setWalletAddress}
                  placeholder="Select or enter wallet address"
                  className="mt-1"
                />
              </div>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <p className="text-sm text-orange-800">
                    Crypto payments are processed immediately but may require network confirmations. Transaction fees may apply.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return amount && paymentMethod;
      case 2:
        if (paymentMethod === 'card') {
          return cardNumber && expiryDate && cvv && cardName;
        } else if (paymentMethod === 'bank') {
          return bankAccount && routingNumber;
        } else if (paymentMethod === 'crypto') {
          return walletAddress && cryptoType;
        }
        return false;
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet size={20} />
            Buy Tokens
          </DialogTitle>
          <div className="mt-4">
            <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">Step {currentStep} of {totalSteps}</p>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Amount and Payment Method */}
          {currentStep === 1 && (
            <>
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

              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
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
            </>
          )}

          {/* Step 2: Payment Details */}
          {currentStep === 2 && renderPaymentStep()}

          {/* Step 3: Summary and Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Check size={20} className="text-green-600" />
                Review Your Purchase
              </h3>
              
              <Card className="bg-gray-50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">${amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium capitalize">
                      {paymentMethod === 'card' ? 'Credit/Debit Card' : 
                       paymentMethod === 'bank' ? 'Bank Transfer' : 
                       'Cryptocurrency'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span className="font-medium">$2.99</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      ${(parseFloat(amount || '0') + 2.99).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-800">
                    By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex-1"
              >
                Continue
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={!isStepValid()}
                className="flex-1"
              >
                Complete Purchase
              </Button>
            )}
            
            {currentStep === 1 && (
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
