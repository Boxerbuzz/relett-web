import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentFlowParams {
  type: "rental" | "reservation";
  bookingId?: string;
  amount: number;
  currency?: string;
  metadata: Record<string, any>;
  propertyId: string;
  onSuccess?: (transaction: any) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

export interface PaymentStatus {
  status: "pending" | "processing" | "completed" | "failed" | "expired";
  paymentUrl?: string;
  reference?: string;
  error?: string;
}

export function usePaymentFlow() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null
  );

  const generatePaymentReference = (type: string, bookingId?: string) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return bookingId
      ? `${type}_${bookingId}_${timestamp}_${random}`
      : `${type}_${timestamp}_${random}`;
  };

  const createBooking = async (params: PaymentFlowParams) => {
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const bookingData = {
      user_id: user.id,
      property_id: params.propertyId,
      status: "awaiting_payment",
      ...params.metadata,
    };

    if (params.type === "rental") {
      const { data, error } = await supabase
        .from("rentals")
        .insert({
          ...bookingData,
          payment_plan: params.metadata.payment_plan,
          move_in_date: params.metadata.move_in_date,
          message: params.metadata.message,
          price: params.amount,
          payment_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          ...bookingData,
          from_date: params.metadata.from_date,
          to_date: params.metadata.to_date,
          nights: params.metadata.nights,
          adults: params.metadata.adults,
          children: params.metadata.children || 0,
          infants: params.metadata.infants || 0,
          total: params.amount,
          fee: params.metadata.fee || 0,
          note: params.metadata.note,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };

  const initializePayment = async (
    params: PaymentFlowParams
  ): Promise<string> => {
    if (!user) {
      throw new Error("User must be authenticated");
    }

    setLoading(true);
    setPaymentStatus({ status: "processing" });

    try {
      // Create booking if no bookingId provided
      let bookingId = params.bookingId;
      if (!bookingId) {
        const booking = await createBooking(params);
        bookingId = booking.id;
      }

      // Call centralized payment session creation
      const { data, error } = await supabase.functions.invoke(
        "create-payment-session",
        {
          body: {
            type: params.type,
            bookingId,
            amount: params.amount,
            currency: params.currency || "NGN",
            metadata: {
              ...params.metadata,
              property_id: params.propertyId,
              user_email: user.email,
            },
          },
        }
      );

      if (error) throw error;

      setPaymentStatus({
        status: "pending",
        paymentUrl: data.payment_url,
        reference: data.payment_reference,
      });

      // Open payment URL in new tab
      window.open(data.payment_url, "_blank");

      return data.payment_reference;
    } catch (error) {
      console.error("Payment initialization failed:", error);
      setPaymentStatus({
        status: "failed",
        error: error instanceof Error ? error.message : "Payment failed",
      });

      toast({
        title: "Payment Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to initialize payment",
        variant: "destructive",
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPaymentStatus = async (
    reference: string
  ): Promise<PaymentStatus> => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "verify-payment",
        {
          body: { reference },
        }
      );

      if (error) throw error;

      const status: PaymentStatus = {
        status: data.success ? "completed" : "failed",
        reference,
      };

      setPaymentStatus(status);
      return status;
    } catch (error) {
      console.error("Payment verification failed:", error);
      const status: PaymentStatus = {
        status: "failed",
        reference,
        error: error instanceof Error ? error.message : "Verification failed",
      };

      setPaymentStatus(status);
      return status;
    }
  };

  const retryPayment = async (
    bookingId: string,
    type: "rental" | "reservation"
  ): Promise<string> => {
    try {
      let booking: any;
      let amount: number;
      let metadata: Record<string, any>;

      if (type === "rental") {
        const { data: rentalData, error: rentalError } = await supabase
          .from("rentals")
          .select("*")
          .eq("id", bookingId)
          .single();

        if (rentalError) throw rentalError;
        booking = rentalData;
        amount = booking.price || 0;
        metadata = {
          payment_plan: booking.payment_plan,
          move_in_date: booking.move_in_date,
          message: booking.message,
        };
      } else {
        const { data: reservationData, error: reservationError } =
          await supabase
            .from("reservations")
            .select("*")
            .eq("id", bookingId)
            .single();

        if (reservationError) throw reservationError;
        booking = reservationData;
        amount = booking.total || 0;
        metadata = {
          from_date: booking.from_date,
          to_date: booking.to_date,
          nights: booking.nights,
          adults: booking.adults,
          children: booking.children,
          infants: booking.infants,
          fee: booking.fee,
          note: booking.note,
        };
      }

      return await initializePayment({
        type,
        bookingId,
        amount,
        propertyId: booking.property_id,
        metadata,
      });
    } catch (error) {
      console.error("Payment retry failed:", error);
      throw error;
    }
  };

  return {
    loading,
    paymentStatus,
    initializePayment,
    verifyPaymentStatus,
    retryPayment,
    generatePaymentReference,
  };
}
