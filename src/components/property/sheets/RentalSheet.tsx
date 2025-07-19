import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { PaymentDialog } from "@/components/payment/PaymentDialog";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PropertyDetails } from "@/hooks/usePropertyDetails";

const formSchema = z.object({
  payment_plan: z.string().min(1, "Payment plan is required"),
  move_in_date: z.string().min(1, "Move-in date is required"),
  message: z.string().optional(),
});

interface RentalRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: PropertyDetails;
}

const RentalSheet = ({
  open,
  onOpenChange,
  property,
}: RentalRequestModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

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

    // Calculate rental amount based on property price and payment plan
    const basePrice = property?.price?.amount || 0;
    let rentalAmount = basePrice;

    // Adjust amount based on payment plan
    switch (values.payment_plan) {
      case "monthly":
        rentalAmount = basePrice;
        break;
      case "quarterly":
        rentalAmount = basePrice * 3;
        break;
      case "annually":
        rentalAmount = basePrice * 12;
        break;
    }

    // Show payment dialog with rental metadata
    setShowPaymentDialog(true);
  };

  const calculateAmount = () => {
    const basePrice = property?.price?.amount || 0;
    const paymentPlan = form.watch("payment_plan");

    switch (paymentPlan) {
      case "monthly":
        return basePrice;
      case "quarterly":
        return basePrice * 3;
      case "annually":
        return basePrice * 12;
      default:
        return basePrice;
    }
  };
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="max-w-md">
          <SheetHeader className="flex flex-col mb-6">
            <SheetTitle>Request Rental</SheetTitle>
            <SheetDescription>
              Submit a rental request for {property?.title}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 md:px-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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

                {form.watch("payment_plan") && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium">Payment Amount</div>
                    <div className="text-lg font-bold text-primary">
                      ₦{calculateAmount().toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {form.watch("payment_plan")} payment
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>

          <SheetFooter>
            <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
              Pay & Submit Request
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        type="rental"
        amount={calculateAmount()}
        currency="NGN"
        propertyId={property?.id}
        propertyTitle={property?.title}
        agentId={property.agent?.id || ""}
        metadata={{
          payment_plan: form.watch("payment_plan"),
          move_in_date: form.watch("move_in_date"),
          message: form.watch("message"),
          agent_id: property?.user_id,
        }}
        onSuccess={() => {
          toast({
            title: "Payment Successful",
            description: "Your rental request has been submitted successfully",
          });
          form.reset();
          setShowPaymentDialog(false);
          onOpenChange(false);
        }}
        onCancel={() => {
          setShowPaymentDialog(false);
        }}
      />
    </>
  );
};

export default RentalSheet;
