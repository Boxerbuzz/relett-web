import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/types/database";

export interface PaymentInfo {
  id: string;
  user_id: string;
  agent_id: string | null;
  property_id: string | null;
  amount: number;
  currency: string | null;
  reference: string;
  related_id: string;
  related_type: string;
  type: string | null;
  method: string | null;
  provider: string | null;
  status: string | null;
  link: string | null;
  metadata: Json | null;
  paid_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface RelatedEntity {
  id: string;
  type: "rental" | "reservation";
  status: string;
  payment_status: string;
  payment_reference: string | null;
  payment_url: string | null;
  // Rental specific fields
  move_in_date: string | null;
  payment_plan: string;
  price: number | null;
  // Reservation specific fields
  from_date: string | null;
  to_date: string | null;
  nights: number | null;
  adults: number | null;
  children: number | null;
  infants: number | null;
  total: number | null;
  fee: number | null;
  caution_deposit: number | null;
  note: string | null;
}

export interface PaymentWithRelatedEntity extends PaymentInfo {
  related_entity: RelatedEntity | null;
  property?: {
    id: string;
    title: string | null;
    location: any; // Changed from address to location
  } | null;
}

export interface UsePaymentOptions {
  reference?: string;
  relatedId?: string;
  relatedType?: "rental" | "reservation";
  autoFetch?: boolean;
}

export function usePayment(options: UsePaymentOptions = {}) {
  const { toast } = useToast();
  const [payment, setPayment] = useState<PaymentWithRelatedEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentByReference = async (reference: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("payments")
        .select(
          `
          *,
          property:properties(
            id,
            title,
            location
          )
        `
        )
        .eq("reference", reference)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        throw new Error("Payment not found");
      }

      // Fetch related entity based on related_type and related_id
      let relatedEntity: RelatedEntity | null = null;

      if (data.related_type === "rental") {
        const { data: rentalData, error: rentalError } = await supabase
          .from("rentals")
          .select("*")
          .eq("id", data.related_id)
          .single();

        if (!rentalError && rentalData) {
          relatedEntity = {
            id: rentalData.id,
            type: "rental",
            status: rentalData.status, // NOT null
            payment_status: rentalData.payment_status, // NOT null
            payment_reference: rentalData.payment_reference,
            payment_url: rentalData.payment_url,
            move_in_date: rentalData.move_in_date,
            payment_plan: rentalData.payment_plan, // NOT null
            price: rentalData.price,
            // Add missing reservation fields with null defaults
            from_date: null,
            to_date: null,
            nights: null,
            adults: null,
            children: null,
            infants: null,
            total: null,
            fee: null,
            caution_deposit: null,
            note: null,
          };
        }
      } else if (data.related_type === "reservation") {
        const { data: reservationData, error: reservationError } =
          await supabase
            .from("reservations")
            .select("*")
            .eq("id", data.related_id)
            .single();

        if (!reservationError && reservationData) {
          relatedEntity = {
            id: reservationData.id,
            type: "reservation",
            status: reservationData.status, // NOT null
            payment_status: "pending", // reservations don't have payment_status, use default
            payment_reference: reservationData.payment_reference,
            payment_url: reservationData.payment_url,
            // Add missing rental fields with null/default defaults
            move_in_date: null,
            payment_plan: "",
            price: null,
            // Reservation fields
            from_date: reservationData.from_date,
            to_date: reservationData.to_date,
            nights: reservationData.nights,
            adults: reservationData.adults,
            children: reservationData.children,
            infants: reservationData.infants,
            total: reservationData.total,
            fee: reservationData.fee,
            caution_deposit: reservationData.caution_deposit,
            note: reservationData.note,
          };
        }
      }

      setPayment({
        ...data,
        related_entity: relatedEntity,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch payment";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentByRelatedEntity = async (
    relatedId: string,
    relatedType: "rental" | "reservation"
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("payments")
        .select(
          `
          *,
          property:properties(
            id,
            title,
            location
          )
        `
        )
        .eq("related_id", relatedId)
        .eq("related_type", relatedType)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        throw new Error("Payment not found for this booking");
      }

      // Fetch related entity
      let relatedEntity: RelatedEntity | null = null;

      if (relatedType === "rental") {
        const { data: rentalData, error: rentalError } = await supabase
          .from("rentals")
          .select("*")
          .eq("id", relatedId)
          .single();

        if (!rentalError && rentalData) {
          relatedEntity = {
            id: rentalData.id,
            type: "rental",
            status: rentalData.status,
            payment_status: rentalData.payment_status,
            payment_reference: rentalData.payment_reference || null,
            payment_url: rentalData.payment_url || null,
            move_in_date: rentalData.move_in_date,
            payment_plan: rentalData.payment_plan,
            price: rentalData.price,
            from_date: null,
            to_date: null,
            nights: null,
            adults: null,
            children: null,
            infants: null,
            total: null,
            fee: null,
            caution_deposit: null,
            note: null,
          };
        }
      } else {
        const { data: reservationData, error: reservationError } =
          await supabase
            .from("reservations")
            .select("*")
            .eq("id", relatedId)
            .single();

        if (!reservationError && reservationData) {
          relatedEntity = {
            id: reservationData.id,
            type: "reservation",
            status: reservationData.status,
            payment_status: "pending", // Add this missing field
            payment_reference: reservationData.payment_reference || null,
            payment_url: reservationData.payment_url || null,
            from_date: reservationData.from_date,
            to_date: reservationData.to_date,
            nights: reservationData.nights,
            adults: reservationData.adults,
            children: reservationData.children,
            infants: reservationData.infants,
            total: reservationData.total,
            fee: reservationData.fee,
            caution_deposit: reservationData.caution_deposit,
            note: reservationData.note,
            move_in_date: null,
            payment_plan: "",
            price: 0,
          };
        }
      }

      setPayment({
        ...data,
        related_entity: relatedEntity,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch payment";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayment = async () => {
    if (options.reference) {
      await fetchPaymentByReference(options.reference);
    } else if (options.relatedId && options.relatedType) {
      await fetchPaymentByRelatedEntity(options.relatedId, options.relatedType);
    } else {
      setError(
        "Either reference or relatedId with relatedType must be provided"
      );
    }
  };

  const verifyPaymentStatus = async (reference: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.functions.invoke(
        "verify-payment",
        {
          body: { reference },
        }
      );

      if (verifyError) {
        throw verifyError;
      }

      // Refresh payment data after verification
      await fetchPaymentByReference(reference);

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to verify payment";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = async (
    bookingId: string,
    type: "rental" | "reservation"
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Get booking details
      let booking: any;
      let amount: number;
      let metadata: Record<string, any>;
      let agentId: string | null;

      if (type === "rental") {
        const { data: rentalData, error: rentalError } = await supabase
          .from("rentals")
          .select("*")
          .eq("id", bookingId)
          .single();

        if (rentalError) throw rentalError;
        booking = rentalData;
        amount = booking.price || 0;
        agentId = rentalData.agent_id;
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
        agentId = reservationData.agent_id;
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

      // Create new payment session
      const { data: sessionData, error: sessionError } =
        await supabase.functions.invoke("create-payment-session", {
          body: {
            type,
            bookingId,
            amount,
            currency: "NGN",
            metadata,
            agentId: agentId || null,
            propertyId: booking.property_id,
          },
        });

      if (sessionError) throw sessionError;

      // Open payment URL
      if (sessionData?.payment_url) {
        window.open(sessionData.payment_url, "_blank");
      }

      return sessionData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to retry payment";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if options are provided
  useEffect(() => {
    if (
      options.autoFetch &&
      (options.reference || (options.relatedId && options.relatedType))
    ) {
      fetchPayment();
    }
  }, [
    options.reference,
    options.relatedId,
    options.relatedType,
    options.autoFetch,
  ]);

  return {
    payment,
    loading,
    error,
    fetchPayment,
    fetchPaymentByReference,
    fetchPaymentByRelatedEntity,
    verifyPaymentStatus,
    retryPayment,
  };
}
