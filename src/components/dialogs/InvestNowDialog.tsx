
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { 
  TrendingUp,
  CreditCard,
  Shield,
  Calculator,
  CheckCircle
} from '@phosphor-icons/react';

interface InvestNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: {
    id: string;
    token_name: string;
    token_symbol: string;
    token_price: number;
    minimum_investment: number;
    expected_roi: number;
    total_value_usd: number;
    status: string;
  };
}

export function InvestNowDialog({ open, onOpenChange, property }: InvestNowDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'amount' | 'confirm' | 'processing' | 'success'>('amount');

  const calculateTokens = () => {
    if (!property || !investmentAmount) return 0;
    return parseFloat(investmentAmount) / property.token_price;
  };

  const calculateProjectedReturns = () => {
    if (!property || !investmentAmount) return 0;
    return (parseFloat(investmentAmount) * property.expected_roi) / 100;
  };

  const handleProceed = () => {
    if (!property || !investmentAmount) return;
    
    const amount = parseFloat(investmentAmount);
    if (amount < property.minimum_investment) {
      toast({
        title: 'Invalid Amount',
        description: `Minimum investment is $${property.minimum_investment.toLocaleString()}`,
        variant: 'destructive'
      });
      return;
    }

    setStep('confirm');
  };

  const handleConfirmInvestment = async () => {
    if (!property || !user) return;

    setStep('processing');
    setProcessing(true);

    try {
      // Simulate investment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // In a real app, this would:
      // 1. Process payment
      // 2. Transfer tokens via Hedera
      // 3. Update user's portfolio
      // 4. Record the transaction

      setStep('success');
      
      toast({
        title: 'Investment Successful!',
        description: `You've successfully invested $${investmentAmount} in ${property.token_name}`,
      });

      // Auto-close after success
      setTimeout(() => {
        onOpenChange(false);
        resetDialog();
      }, 3000);

    } catch (error) {
      console.error('Investment error:', error);
      toast({
        title: 'Investment Failed',
        description: 'There was an error processing your investment. Please try again.',
        variant: 'destructive'
      });
      setStep('amount');
    } finally {
      setProcessing(false);
    }
  };

  const resetDialog = () => {
    setStep('amount');
    setInvestmentAmount('');
    setProcessing(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetDialog();
  };

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Invest in {property.token_symbol}
          </DialogTitle>
        </DialogHeader>

        {step === 'amount' && (
          <div className="space-y-6">
            {/* Property Info */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Property</span>
                    <span className="font-medium">{property.token_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Token Price</span>
                    <span className="font-medium">${property.token_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expected ROI</span>
                    <Badge variant="secondary" className="text-green-600">
                      {property.expected_roi}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Min. Investment</span>
                    <span className="font-medium">${property.minimum_investment.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                min={property.minimum_investment}
                step="0.01"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder={`Min. $${property.minimum_investment}`}
                className="text-lg"
              />
            </div>

            {/* Investment Summary */}
            {investmentAmount && parseFloat(investmentAmount) >= property.minimum_investment && (
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Investment Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Investment Amount</span>
                      <span className="font-medium">${parseFloat(investmentAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tokens to Receive</span>
                      <span className="font-medium">{calculateTokens().toFixed(4)} {property.token_symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Annual Returns</span>
                      <span className="font-medium text-green-600">${calculateProjectedReturns().toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleProceed}
                disabled={!investmentAmount || parseFloat(investmentAmount) < property.minimum_investment}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <Card className="border-2 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Confirm Your Investment</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Property</span>
                    <span className="font-medium">{property.token_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investment Amount</span>
                    <span className="font-medium">${parseFloat(investmentAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tokens to Receive</span>
                    <span className="font-medium">{calculateTokens().toFixed(4)} {property.token_symbol}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Your investment is secured by blockchain technology</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('amount')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleConfirmInvestment} className="flex-1 bg-green-600 hover:bg-green-700">
                <CreditCard className="mr-2 h-4 w-4" />
                Confirm Investment
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="space-y-6 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <div>
              <h3 className="font-medium mb-2">Processing Your Investment</h3>
              <p className="text-sm text-gray-600">
                We're processing your payment and transferring tokens to your wallet.
                This may take a few moments.
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="font-medium mb-2 text-green-900">Investment Successful!</h3>
              <p className="text-sm text-gray-600 mb-4">
                You've successfully invested ${investmentAmount} in {property.token_name}.
                Your tokens will be available in your portfolio shortly.
              </p>
              <Badge className="bg-green-100 text-green-800">
                +{calculateTokens().toFixed(4)} {property.token_symbol}
              </Badge>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
