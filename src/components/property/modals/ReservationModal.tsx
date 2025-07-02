
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { PriceCalculationService } from '@/lib/services/PriceCalculationService';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
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
  from_date: z.date({ required_error: 'Check-in date is required' }),
  to_date: z.date({ required_error: 'Check-out date is required' }),
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
  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_date: undefined,
      to_date: undefined,
      adults: 1,
      children: 0,
      infants: 0,
      note: '',
    },
  });

  // Fetch booked dates for this property
  useEffect(() => {
    if (property?.id && open) {
      fetchBookedDates();
    }
  }, [property?.id, open]);

  const fetchBookedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('from_date, to_date')
        .eq('property_id', property.id)
        .in('status', ['confirmed', 'active', 'pending', 'awaiting_payment']);

      if (error) throw error;

      const dates: Date[] = [];
      data?.forEach((reservation) => {
        if (reservation.from_date && reservation.to_date) {
          const start = new Date(reservation.from_date);
          const end = new Date(reservation.to_date);
          
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
          }
        }
      });

      setBookedDates(dates);
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  };

  const calculateNights = (fromDate: Date, toDate: Date) => {
    if (!fromDate || !toDate) return 0;
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
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
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
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
          from_date: values.from_date.toISOString(),
          to_date: values.to_date.toISOString(),
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
                check_in: values.from_date.toISOString(),
                check_out: values.to_date.toISOString(),
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
  const nights = watchedFromDate && watchedToDate ? calculateNights(watchedFromDate, watchedToDate) : 0;
  const calculation = getCalculation();

  // Function to check if a date is booked or in the past
  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // Disable booked dates
    return bookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
  };

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
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-in</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick check-in date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={isDateDisabled}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="to_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-out</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick check-out date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            // Disable past dates and booked dates
                            if (isDateDisabled(date)) return true;
                            
                            // If check-in is selected, disable dates before check-in
                            const checkIn = form.getValues('from_date');
                            if (checkIn && date <= checkIn) return true;
                            
                            return false;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
