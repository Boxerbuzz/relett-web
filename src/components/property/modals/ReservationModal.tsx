
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { paystackService } from '@/lib/paystack';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

const formSchema = z.object({
  from_date: z.string().min(1, 'Check-in date is required'),
  to_date: z.string().min(1, 'Check-out date is required'),
  adults: z.number().min(1, 'At least 1 adult required'),
  children: z.number().min(0).optional(),
  infants: z.number().min(0).optional(),
  note: z.string().optional(),
});

interface ReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
}

export function ReservationModal({ open, onOpenChange, property }: ReservationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_date: '',
      to_date: '',
      adults: 1,
      children: 0,
      infants: 0,
      note: '',
    },
  });

  const calculateNights = (fromDate: string, toDate: string) => {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const fromDate = form.watch('from_date');
    const toDate = form.watch('to_date');
    const nights = calculateNights(fromDate, toDate);
    const basePrice = property?.price?.amount || 0;
    return basePrice * nights;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to make a reservation',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const nights = calculateNights(values.from_date, values.to_date);
      const basePrice = property?.price?.amount || 0;
      const total = basePrice * nights;
      const serviceFee = Math.round(total * 0.1); // 10% service fee
      const finalTotal = total + serviceFee;

      // Create reservation record first
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          user_id: user.id,
          property_id: property.id,
          agent_id: property.user_id,
          from_date: values.from_date,
          to_date: values.to_date,
          nights,
          adults: values.adults,
          children: values.children || 0,
          infants: values.infants || 0,
          total: finalTotal,
          fee: serviceFee,
          note: values.note,
          status: 'pending'
        })
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Generate payment reference
      const paymentReference = `reservation_${reservation.id}_${Date.now()}`;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: Math.round(finalTotal * 100), // Convert to kobo
          currency: 'NGN',
          type: 'reservation',
          property_id: property.id,
          related_id: reservation.id,
          related_type: 'reservations',
          status: 'pending',
          method: 'card',
          provider: 'paystack',
          reference: paymentReference,
          metadata: {
            reservation_id: reservation.id,
            property_title: property.title,
            check_in: values.from_date,
            check_out: values.to_date,
            nights,
            guests: {
              adults: values.adults,
              children: values.children || 0,
              infants: values.infants || 0
            }
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
        amount: finalTotal,
        email: user.email!,
        reference: paymentReference,
        metadata: {
          user_id: user.id,
          reservation_id: reservation.id,
          property_id: property.id,
          type: 'reservation'
        },
        onSuccess: (transaction) => {
          toast({
            title: 'Payment Successful',
            description: 'Your reservation has been confirmed!'
          });
          form.reset();
          onOpenChange(false);
        },
        onCancel: () => {
          toast({
            title: 'Payment Cancelled',
            description: 'Your reservation payment was cancelled',
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
      console.error('Error submitting reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit reservation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const watchedFromDate = form.watch('from_date');
  const watchedToDate = form.watch('to_date');
  const nights = calculateNights(watchedFromDate, watchedToDate);
  const total = calculateTotal();
  const serviceFee = Math.round(total * 0.1);
  const finalTotal = total + serviceFee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make Reservation</DialogTitle>
          <DialogDescription>
            Reserve {property?.title} for your stay
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="from_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="to_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {nights > 0 && (
              <div className="text-sm text-gray-600">
                {nights} night{nights !== 1 ? 's' : ''}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="adults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adults</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="children"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Children</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="infants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Infants</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requests or requirements..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {nights > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>₦{property?.price?.amount?.toLocaleString()} × {nights} nights</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service fee</span>
                  <span>₦{serviceFee.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₦{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || nights === 0}>
                {loading ? 'Processing...' : 'Pay & Reserve'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
