import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { PaymentDialog } from "@/components/payment/PaymentDialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  adults: z.number().min(1, "At least 1 adult required"),
  children: z.number().min(0).optional(),
  infants: z.number().min(0).optional(),
  note: z.string().optional(),
});

interface ReservationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
}

export function ReservationSheet({
  open,
  onOpenChange,
  property,
}: ReservationSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adults: 1,
      children: 0,
      infants: 0,
      note: "",
    },
  });

  const calculateNights = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const diffTime = Math.abs(
      dateRange.to.getTime() - dateRange.from.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const basePrice = property?.price?.amount / 100 || 0;
    const deposit = property?.price?.deposit / 100 || 0;
    const serviceCharge = property?.price?.service_charge / 100 || 0;

    const accommodationCost = basePrice * nights;
    const totalCost = accommodationCost + deposit + serviceCharge;

    return totalCost;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a reservation",
        variant: "destructive",
      });
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Date Required",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    // Add the missing validation
    if (dateRange.from >= dateRange.to) {
      toast({
        title: "Invalid Date Range",
        description: "Check-out date must be after check-in date",
        variant: "destructive",
      });
      return;
    }

    // Show payment dialog with reservation metadata
    setShowPaymentDialog(true);
  };

  const nights = calculateNights();
  const basePrice = property?.price?.amount / 100 || 0;
  const deposit = property?.price?.deposit / 100 || 0;
  const serviceCharge = property?.price?.service_charge / 100 || 0;

  const accommodationCost = basePrice * nights;
  const total = calculateTotal();
  const platformServiceFee = Math.round(accommodationCost * 0.01); // Only apply platform fee to accommodation cost
  const finalTotal = total + platformServiceFee;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:w-[400px] sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Make Reservation</SheetTitle>
            <SheetDescription>
              Reserve {property?.title} for your stay
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 mt-6"
            >
              <div className="space-y-4">
                <FormLabel>Select Dates</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick your dates</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      disabled={(date) => date < new Date()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {nights > 0 && (
                <div className="text-sm text-gray-600">
                  {nights} night{nights !== 1 ? "s" : ""}
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
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
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
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
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
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
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
                    <span>
                      ₦{(property?.price?.amount / 100).toLocaleString()} ×{" "}
                      {nights} nights
                    </span>
                    <span>₦{accommodationCost.toLocaleString()}</span>
                  </div>
                  {deposit > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Refundable deposit</span>
                      <span>₦{deposit.toLocaleString()}</span>
                    </div>
                  )}
                  {serviceCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Service charge</span>
                      <span>₦{serviceCharge.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Platform service fee</span>
                    <span>₦{platformServiceFee.toLocaleString()}</span>
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
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={nights === 0}>
                  Pay & Reserve
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        type="reservation"
        amount={finalTotal}
        agentId={property.agent?.id || ""}
        currency="NGN"
        propertyId={property?.id}
        propertyTitle={property?.title}
        metadata={{
          from_date: dateRange?.from
            ? format(dateRange.from, "yyyy-MM-dd")
            : "",
          to_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
          nights: calculateNights(),
          adults: form.watch("adults"),
          children: form.watch("children") || 0,
          infants: form.watch("infants") || 0,
          fee: platformServiceFee,
          note: form.watch("note"),
          agent_id: property?.user_id,
        }}
        onSuccess={() => {
          toast({
            title: "Payment Successful",
            description: "Your reservation has been confirmed!",
          });
          form.reset();
          setDateRange(undefined);
          setShowPaymentDialog(false);
          onOpenChange(false);
        }}
        onCancel={() => {
          setShowPaymentDialog(false);
        }}
      />
    </>
  );
}
