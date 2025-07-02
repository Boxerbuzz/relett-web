
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { PriceCalculationService } from '@/lib/services/PriceCalculationService';
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

  const getCalculation = () => {
    const fromDate = form.watch('from_date');
    const toDate = form.watch('to_date');
    const adults = form.watch('adults');
    const children = form.watch('children');
    const infants = form.watch('infants');

    if (!fromDate || !toDate || !property?.price) return null;

    return PriceCalculationService.calculateReservationPrice({
      pricing: property.price,
      fromDate,
      toDate,
      guests: {
        adults: adults || 1,
        children: children || 0,
        infants: infants || 0,
      },
    });
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

      // Calculate reservation amount using PriceCalculationService
      const calculation = getCalculation();
      if (!calculation) {
        throw new Error("Unable to calculate reservation price");
      }

      const nights = calculateNights(values.from_date, values.to_date);

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
          total: calculation.totalAmount,
          fee: calculation.serviceCharge,
          caution_deposit: calculation.deposit,
          note: values.note,
          status: 'pending'
        })
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Create payment session via edge function
      const { data: paymentSession, error: sessionError } = await supabase.functions.invoke(
        'create-payment-session',
        {
          body: {
            type: 'reservation',
            bookingId: reservation.id,
            amount: calculation.totalAmount,
            currency: calculation.currency,
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
              },
              breakdown: calculation.breakdown,
            },
          },
        }
      );

      if (sessionError || !paymentSession?.success) {
        throw new Error(sessionError?.message || "Failed to create payment session");
      }

      // Redirect to payment URL
      window.open(paymentSession.payment_url, '_blank');

      toast({
        title: "Payment Initiated",
        description: "Please complete your payment in the new tab",
      });

      form.reset();
      onOpenChange(false);

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
  const calculation = getCalculation();

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

            {calculation && nights > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {calculation.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.description}</span>
                    <span className={item.amount < 0 ? "text-green-600" : ""}>
                      {PriceCalculationService.formatAmount(item.amount, calculation.currency)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{PriceCalculationService.formatAmount(calculation.totalAmount, calculation.currency)}</span>
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
