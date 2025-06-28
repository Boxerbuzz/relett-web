import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { paystackService } from '@/lib/paystack';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from '@/components/ui/responsive-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  payment_plan: z.string().min(1, 'Payment plan is required'),
  move_in_date: z.string().min(1, 'Move-in date is required'),
  message: z.string().optional(),
});

interface RentalRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
}

export function RentalRequestModal({ open, onOpenChange, property }: RentalRequestModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_plan: '',
      move_in_date: '',
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit a rental request',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      // Calculate rental amount based on property price and payment plan
      const basePrice = property?.price?.amount || 0;
      let rentalAmount = basePrice;
      
      // Adjust amount based on payment plan
      switch (values.payment_plan) {
        case 'monthly':
          rentalAmount = basePrice;
          break;
        case 'quarterly':
          rentalAmount = basePrice * 3;
          break;
        case 'annually':
          rentalAmount = basePrice * 12;
          break;
      }

      // Create rental record first
      const { data: rental, error: rentalError } = await supabase
        .from('rentals')
        .insert({
          user_id: user.id,
          property_id: property.id,
          agent_id: property.user_id,
          payment_plan: values.payment_plan,
          move_in_date: values.move_in_date,
          message: values.message,
          price: rentalAmount,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (rentalError) throw rentalError;

      // Generate payment reference
      const paymentReference = `rental_${rental.id}_${Date.now()}`;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: Math.round(rentalAmount * 100), // Convert to kobo
          currency: 'NGN',
          type: 'rental',
          property_id: property.id,
          related_id: rental.id,
          related_type: 'rentals',
          status: 'pending',
          method: 'card',
          provider: 'paystack',
          reference: paymentReference,
          metadata: {
            rental_id: rental.id,
            property_title: property.title,
            payment_plan: values.payment_plan,
            move_in_date: values.move_in_date
          }
        });

      if (paymentError) throw paymentError;

      // Initialize Paystack payment
      if (!paystackService.isConfigured()) {
        toast({
          title: 'Payment Configuration Error',
          description: 'Payment system is not properly configured',
          variant: 'destructive'
        });
        return;
      }

      await paystackService.initializePayment({
        amount: rentalAmount,
        email: user.email!,
        reference: paymentReference,
        metadata: {
          user_id: user.id,
          rental_id: rental.id,
          property_id: property.id,
          type: 'rental'
        },
        onSuccess: (transaction) => {
          toast({
            title: 'Payment Successful',
            description: 'Your rental payment has been processed successfully'
          });
          form.reset();
          onOpenChange(false);
        },
        onCancel: () => {
          toast({
            title: 'Payment Cancelled',
            description: 'Your payment was cancelled',
            variant: 'destructive'
          });
        },
        onError: (error) => {
          toast({
            title: 'Payment Error',
            description: 'There was an error processing your payment',
            variant: 'destructive'
          });
          console.error('Payment error:', error);
        }
      });

    } catch (error) {
      console.error('Error submitting rental request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit rental request',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAmount = () => {
    const basePrice = property?.price?.amount || 0;
    const paymentPlan = form.watch('payment_plan');
    
    switch (paymentPlan) {
      case 'monthly':
        return basePrice;
      case 'quarterly':
        return basePrice * 3;
      case 'annually':
        return basePrice * 12;
      default:
        return basePrice;
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent size="md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Request Rental</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Submit a rental request for {property?.title}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="px-4 md:px-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="payment_plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Plan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="move_in_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Move-in Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information or special requests..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('payment_plan') && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium">Payment Amount</div>
                  <div className="text-lg font-bold text-primary">
                    ₦{calculateAmount().toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    {form.watch('payment_plan')} payment
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        <ResponsiveDialogFooter>
          <ResponsiveDialogCloseButton />
          <Button type="submit" disabled={loading} onClick={form.handleSubmit(onSubmit)}>
            {loading ? 'Processing...' : 'Pay & Submit Request'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
