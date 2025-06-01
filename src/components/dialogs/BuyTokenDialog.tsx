
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Wallet, DollarSign, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { WalletCombobox } from '@/components/wallet/WalletCombobox';
import { paystackService } from '@/lib/paystack';
import { toast } from 'sonner';

interface BuyTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PaymentMethod = 'card' | 'bank' | 'crypto';

export function BuyTokenDialog({ open, onOpenChange }: BuyTokenDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // User details for Paystack
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
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

  const handlePaystackPayment = async () => {
    if (!paystackService.isConfigured()) {
      toast.error('Paystack is not configured. Please contact support.');
      return;
    }

    setIsProcessing(true);

    try {
      await paystackService.initializePayment({
        amount: parseFloat(amount),
        email: email,
        metadata: {
          user_email: email,
          user_name: `${firstName} ${lastName}`,
          payment_type: 'token_purchase',
          amount_usd: amount
        },
        onSuccess: async (transaction) => {
          console.log('Payment successful:', transaction);
          
          // Verify transaction
          const verification = await paystackService.verifyTransaction(transaction.reference);
          
          if (verification.status) {
            toast.success('Payment successful! Tokens will be credited to your account.');
            handleComplete();
          } else {
            toast.error('Payment verification failed. Please contact support.');
          }
          
          setIsProcessing(false);
        },
        onCancel: () => {
          toast.info('Payment cancelled');
          setIsProcessing(false);
        },
        onError: (error) => {
          console.error('Payment error:', error);
          toast.error('Payment failed. Please try again.');
          setIsProcessing(false);
        }
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    onOpenChange(false);
    setCurrentStep(1);
    // Reset form
    setAmount('');
    setPaymentMethod('');
    setEmail('');
    setFirstName('');
    setLastName('');
    setWalletAddress('');
    setCryptoType('');
  };

  const renderPaymentStep = () => {
    switch (paymentMethod) {
      case 'card':
      case 'bank':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard size={20} />
              Paystack Payment
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm text-blue-800">
                  You'll be able to pay with your card, bank transfer, USSD, or mobile money through Paystack's secure payment system.
                </p>
              </CardContent>
            </Card>
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
        if (paymentMethod === 'card' || paymentMethod === 'bank') {
          return email && firstName && lastName;
        } else if (paymentMethod === 'crypto') {
          return walletAddress && cryptoType;
        }
        return false;
      default:
        return true;
    }
  };

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'card': return 'Card/Bank Payment';
      case 'bank': return 'Bank Transfer';
      case 'crypto': return 'Cryptocurrency';
      default: return '';
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
                <Label>Quick Select Amount (USD)</Label>
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
                        Card/Bank Payment (Paystack)
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

              {!paystackService.isConfigured() && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800">
                        Paystack payment is not configured. Please contact support or use cryptocurrency payment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
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
                    <span className="font-medium">
                      {getPaymentMethodName()}
                    </span>
                  </div>
                  {(paymentMethod === 'card' || paymentMethod === 'bank') && (
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-medium">{email}</span>
                    </div>
                  )}
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
              <Button variant="outline" onClick={handleBack} className="flex-1" disabled={isProcessing}>
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={!isStepValid() || isProcessing}
                className="flex-1"
              >
                Continue
              </Button>
            ) : (
              <Button 
                onClick={paymentMethod === 'crypto' ? handleComplete : handlePaystackPayment}
                disabled={!isStepValid() || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 
                 paymentMethod === 'crypto' ? 'Complete Purchase' : 'Pay with Paystack'}
              </Button>
            )}
            
            {currentStep === 1 && (
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isProcessing}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
