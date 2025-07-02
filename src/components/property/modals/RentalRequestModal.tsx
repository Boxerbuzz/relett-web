import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { PriceCalculationService } from "@/lib/services/PriceCalculationService";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from "@/components/ui/responsive-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  payment_plan: z.string().min(1, "Payment plan is required"),
  move_in_date: z.string().min(1, "Move-in date is required"),
  message: z.string().optional(),
});

interface RentalRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
}

export function RentalRequestModal({
  open,
  onOpenChange,
  property,
}: RentalRequestModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_plan: "",
      move_in_date: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a rental request",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Calculate rental amount using PriceCalculationService
      const calculation = PriceCalculationService.calculateRentalPrice({
        pricing: property.price,
        paymentPlan: values.payment_plan as 'monthly' | 'quarterly' | 'annually',
        moveInDate: values.move_in_date,
      });

      // Create rental record first
      const { data: rental, error: rentalError } = await supabase
        .from("rentals")
        .insert({
          user_id: user.id,
          property_id: property.id,
          agent_id: property.user_id,
          payment_plan: values.payment_plan,
          move_in_date: values.move_in_date,
          message: values.message,
          price: calculation.totalAmount,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (rentalError) throw rentalError;

      // Create payment session via edge function
      const { data: paymentSession, error: sessionError } = await supabase.functions.invoke(
        'create-payment-session',
        {
          body: {
            type: 'rental',
            bookingId: rental.id,
            amount: calculation.totalAmount,
            currency: calculation.currency,
            metadata: {
              rental_id: rental.id,
              property_title: property.title,
              payment_plan: values.payment_plan,
              move_in_date: values.move_in_date,
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
      console.error("Error submitting rental request:", error);
      toast({
        title: "Error",
        description: "Failed to submit rental request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCalculation = () => {
    const paymentPlan = form.watch("payment_plan");
    if (!paymentPlan || !property?.price) return null;

    return PriceCalculationService.calculateRentalPrice({
      pricing: property.price,
      paymentPlan: paymentPlan as 'monthly' | 'quarterly' | 'annually',
      moveInDate: form.watch("move_in_date") || new Date().toISOString(),
    });
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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

              {(() => {
                const calculation = getCalculation();
                return calculation ? (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="text-sm font-medium">Payment Breakdown</div>
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
                        <span>Total Amount</span>
                        <span className="text-primary">
                          {PriceCalculationService.formatAmount(calculation.totalAmount, calculation.currency)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {form.watch("payment_plan")} payment plan
                    </div>
                  </div>
                ) : null;
              })()}
            </form>
          </Form>
        </div>

        <ResponsiveDialogFooter>
          <ResponsiveDialogCloseButton />
          <Button
            type="submit"
            disabled={loading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {loading ? "Processing..." : "Pay & Submit Request"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
