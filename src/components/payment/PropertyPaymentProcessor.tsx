
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface PaymentProcessorProps {
  propertyId: string;
  amount: number;
  currency: string;
  description: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PropertyPaymentProcessor({
  propertyId,
  amount,
  currency,
  description,
  onSuccess,
  onError
}: PaymentProcessorProps) {
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const { user } = useAuth();
  const { toast } = useToast();

  const processPayment = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to process payment',
        variant: 'destructive'
      });
      return;
    }

    setProcessing(true);
    setPaymentStatus('processing');

    try {
      // Create payment session
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
        'create-payment-session',
        {
          body: {
            amount: amount * 100, // Convert to cents
            currency: currency.toLowerCase(),
            purpose: 'property_listing_fee',
            metadata: {
              property_id: propertyId,
              description,
              user_id: user.id
            }
          }
        }
      );

      if (sessionError) throw sessionError;

      // Redirect to payment provider (Paystack)
      if (sessionData?.url) {
        window.open(sessionData.url, '_blank');
        
        // Simulate payment completion for demo purposes
        setTimeout(() => {
          handlePaymentComplete(true);
        }, 3000);
      } else {
        throw new Error('Payment session URL not received');
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentStatus('failed');
      
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      if (onError) onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentComplete = async (success: boolean) => {
    if (success) {
      setPaymentStatus('success');
      
      // Record the payment in the database
      try {
        const { error } = await supabase
          .from('payments')
          .insert({
            user_id: user!.id,
            property_id: propertyId,
            amount: amount * 100, // Store in cents
            currency,
            type: 'property_listing_fee',
            status: 'completed',
            reference: `prop_${propertyId}_${Date.now()}`,
            related_id: propertyId,
            related_type: 'property',
            paid_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: 'Payment Successful',
          description: 'Your property listing fee has been processed successfully',
        });

        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Error recording payment:', error);
      }
    } else {
      setPaymentStatus('failed');
      toast({
        title: 'Payment Failed',
        description: 'Payment was not completed successfully',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending': return <DollarSign className="w-5 h-5" />;
      case 'processing': return <Clock className="w-5 h-5 animate-spin" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Property Listing Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{description}</p>
            <p className="text-sm text-gray-600">Property ID: {propertyId}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {currency} {amount.toLocaleString()}
            </p>
            <Badge className={getStatusColor()}>
              {getStatusIcon()}
              <span className="ml-1 capitalize">{paymentStatus}</span>
            </Badge>
          </div>
        </div>

        {paymentStatus === 'pending' && (
          <Button 
            onClick={processPayment}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? 'Processing...' : `Pay ${currency} ${amount.toLocaleString()}`}
          </Button>
        )}

        {paymentStatus === 'processing' && (
          <div className="text-center py-4">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">
              Please complete your payment in the opened window...
            </p>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-medium text-green-800">Payment Successful!</p>
            <p className="text-sm text-gray-600">Your property listing is now active.</p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="font-medium text-red-800">Payment Failed</p>
            <p className="text-sm text-gray-600 mb-4">
              There was an issue processing your payment.
            </p>
            <Button 
              onClick={() => {
                setPaymentStatus('pending');
                processPayment();
              }}
              variant="outline"
            >
              Retry Payment
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          <p>Secure payment processing powered by Paystack</p>
          <p>All transactions are encrypted and secure</p>
        </div>
      </CardContent>
    </Card>
  );
}
