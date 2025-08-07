
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Coins, 
  ArrowRight, 
  Calculator,
  CheckCircle
} from 'lucide-react';

interface TokenPurchaseManagerProps {
  tokenizedProperty: {
    id: string;
    token_name: string;
    token_symbol: string;
    token_price: number;
    hedera_token_id: string;
    minimum_investment: number;
    available_tokens?: number;
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
  onPurchaseComplete 
}: TokenPurchaseManagerProps) {
  const [tokenAmount, setTokenAmount] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isAssociating, setIsAssociating] = useState(false);
  const [isAssociated, setIsAssociated] = useState(false);
  const { toast } = useToast();

  const totalCost = parseFloat(tokenAmount || '0') * tokenizedProperty.token_price;
  const isValidAmount = parseFloat(tokenAmount || '0') > 0 && 
    totalCost >= tokenizedProperty.minimum_investment;

  const handleTokenAssociation = async () => {
    setIsAssociating(true);

    try {
      const { data, error } = await supabase.functions.invoke('associate-hedera-token', {
        body: {
          tokenId: tokenizedProperty.hedera_token_id,
          investorAccountId: userWallet.address,
          investorPrivateKey: userWallet.encrypted_private_key
        }
      });

      if (error) throw error;

      setIsAssociated(true);
      toast({
        title: 'Token Associated',
        description: 'Your account is now ready to receive tokens',
      });

    } catch (error) {
      console.error('Token association error:', error);
      toast({
        title: 'Association Failed',
        description: 'Failed to associate token with your account',
        variant: 'destructive'
      });
    } finally {
      setIsAssociating(false);
    }
  };

  const handleTokenPurchase = async () => {
    if (!isValidAmount) return;

    setIsPurchasing(true);

    try {
      // Check if this is during sales window (status = 'approved') or after (status = 'minted')
      const isSalesWindow = tokenizedProperty.status === 'approved';
      const actionType = isSalesWindow ? 'commitment' : 'purchase';

      // Create payment session for token purchase/commitment
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-token-purchase-payment', {
        body: {
          tokenizedPropertyId: tokenizedProperty.id,
          tokenAmount: parseFloat(tokenAmount),
          investorAccountId: userWallet.address,
          actionType, // Pass whether this is a commitment or direct purchase
        }
      });

      if (paymentError) throw paymentError;

      // Redirect to Paystack payment page
      if (paymentData.payment_url) {
        window.open(paymentData.payment_url, '_self');
      } else {
        throw new Error('No payment URL received');
      }

    } catch (error) {
      console.error('Token purchase payment error:', error);
      toast({
        title: 'Payment Failed',
        description: `Failed to initialize token ${tokenizedProperty.status === 'approved' ? 'commitment' : 'purchase'} payment`,
        variant: 'destructive'
      });
      setIsPurchasing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          {tokenizedProperty.status === 'approved' ? 'Commit to' : 'Purchase'} {tokenizedProperty.token_symbol} Tokens
        </CardTitle>
        <CardDescription>
          {tokenizedProperty.status === 'approved' 
            ? `Commit to investing in ${tokenizedProperty.token_name} during the sales window`
            : `Invest in ${tokenizedProperty.token_name}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Association Step */}
        {!isAssociated && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Step 1: Associate Token</h4>
            <p className="text-sm text-gray-600 mb-3">
              Before purchasing, you need to associate this token with your account.
            </p>
            <Button 
              onClick={handleTokenAssociation}
              disabled={isAssociating}
              size="sm"
            >
              {isAssociating ? 'Associating...' : 'Associate Token'}
            </Button>
          </div>
        )}

        {isAssociated && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Token Associated - Ready to Purchase
              </span>
            </div>
          </div>
        )}

        {/* Purchase Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Token Price:</span>
              <span className="font-medium ml-2">${tokenizedProperty.token_price}</span>
            </div>
            <div>
              <span className="text-gray-600">Min Investment:</span>
              <span className="font-medium ml-2">${tokenizedProperty.minimum_investment}</span>
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
              step="1"
            />
          </div>

          {tokenAmount && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Total Cost:
                </span>
                <span className="font-semibold">${totalCost.toFixed(2)}</span>
              </div>
              
              {!isValidAmount && totalCost > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Minimum investment is ${tokenizedProperty.minimum_investment}
                </p>
              )}
            </div>
          )}

          <Button 
            onClick={handleTokenPurchase}
            disabled={!isAssociated || !isValidAmount || isPurchasing}
            className="w-full"
          >
            {isPurchasing ? (
              `Processing ${tokenizedProperty.status === 'approved' ? 'Commitment' : 'Purchase'}...`
            ) : (
              <span className="flex items-center gap-2">
                {tokenizedProperty.status === 'approved' ? 'Commit to Tokens' : 'Purchase Tokens'}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>

        {/* Available Tokens Info */}
        {tokenizedProperty.available_tokens && (
          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Available Tokens:</span>
              <Badge variant="outline">
                {tokenizedProperty.available_tokens.toLocaleString()}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
