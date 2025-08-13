import { supabase } from "@/integrations/supabase/client";
import { HederaClient } from "./hedera";

export interface PaymentRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: "investment" | "dividend" | "fee" | "withdrawal";
  propertyId?: string;
  tokenizedPropertyId?: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  paymentMethod: "card" | "bank_transfer" | "crypto" | "hbar";
  reference: string;
  metadata: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: "card" | "bank_account" | "crypto_wallet";
  details: {
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    accountNumber?: string;
    bankName?: string;
    walletAddress?: string;
    walletType?: string;
  };
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface TransactionHistory {
  id: string;
  userId: string;
  type: "debit" | "credit";
  amount: number;
  currency: string;
  description: string;
  propertyTitle?: string;
  status: "pending" | "completed" | "failed";
  reference: string;
  paymentMethodId?: string;
  blockchainTxHash?: string;
  createdAt: string;
}

export class PaymentService {
  private hederaClient: HederaClient;

  constructor() {
    this.hederaClient = new HederaClient();
  }

  async processInvestmentPayment(params: {
    userId: string;
    tokenizedPropertyId: string;
    tokenAmount: number;
    paymentMethodId: string;
    investorAccountId: string;
    investorPrivateKey: string;
    paystackReference?: string;
  }): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      // Get property details
      const { data: property, error: propertyError } = await supabase
        .from("tokenized_properties")
        .select("*")
        .eq("id", params.tokenizedPropertyId)
        .single();

      if (propertyError || !property) {
        throw new Error("Property not found");
      }

      const totalAmount = params.tokenAmount * property.token_price;

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: params.userId,
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: "NGN", // Changed to Nigerian Naira for Paystack
          type: "investment",
          property_id: property.property_id,
          related_id: params.tokenizedPropertyId,
          related_type: "tokenized_property",
          status: "processing",
          method: "card",
          provider: "paystack", // Changed from default
          reference: params.paystackReference || `INV-${Date.now()}`,
          metadata: {
            token_amount: params.tokenAmount,
            token_price: property.token_price,
            property_title: property.token_name,
            paystack_reference: params.paystackReference,
          },
        })
        .select()
        .single();

      if (paymentError) {
        throw new Error("Failed to create payment record");
      }

      // If we have a Paystack reference, verify the payment
      let paymentSuccess = false;
      if (params.paystackReference) {
        paymentSuccess = await this.verifyPaystackPayment(
          params.paystackReference
        );
      } else {
        throw new Error("Payment reference is required for Paystack transactions");
      }

      if (!paymentSuccess) {
        // Update payment status to failed
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", payment.id);

        throw new Error("Payment processing failed");
      }

      // SECURITY: Token transfer operations moved to secure edge function
      if (property.hedera_token_id) {
        try {
          // Call secure edge function for token operations
          const { data, error } = await supabase.functions.invoke('process-token-transfer', {
            body: {
              tokenId: property.hedera_token_id,
              toAccountId: params.investorAccountId,
              amount: params.tokenAmount,
              paymentId: payment.id,
              type: 'investment'
            }
          });

          if (error) {
            console.error("Token transfer failed:", error);
            // Mark payment as requiring manual review
            await supabase
              .from("payments")
              .update({ 
                status: "requires_review",
                metadata: {
                  ...payment.metadata,
                  transfer_error: error.message
                }
              })
              .eq("id", payment.id);
          }
        } catch (hederaError) {
          console.error("Hedera transfer failed:", hederaError);
          // In a real system, you'd need to reverse the payment or handle this error
        }
      }

      // Update payment status to completed
      await supabase
        .from("payments")
        .update({
          status: "completed",
          paid_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      return { success: true, paymentId: payment.id };
    } catch (error) {
      console.error("Investment payment failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment failed",
      };
    }
  }

  private async verifyPaystackPayment(reference: string): Promise<boolean> {
    try {
      // Use the verify-payment edge function for real Paystack verification
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference }
      });

      if (error) {
        console.error("Payment verification error:", error);
        return false;
      }

      return data?.success === true;
    } catch (error) {
      console.error("Paystack verification failed:", error);
      return false;
    }
  }

  async processWithdrawal(params: {
    userId: string;
    amount: number;
    paymentMethodId: string;
    currency: string;
  }): Promise<{ success: boolean; withdrawalId?: string; error?: string }> {
    try {
      // Check user balance
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("amount")
        .eq("user_id", params.userId)
        .eq("type", "main")
        .single();

      if (accountError || !account) {
        throw new Error("Account not found");
      }

      const availableBalance = account.amount / 100; // Convert from cents
      if (availableBalance < params.amount) {
        throw new Error("Insufficient balance");
      }

      // Create withdrawal record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: params.userId,
          amount: Math.round(params.amount * 100), // Convert to cents
          currency: params.currency,
          type: "withdrawal",
          related_id: params.userId,
          related_type: "user_account",
          status: "processing",
          method: "bank_transfer",
          reference: `WTH-${Date.now()}`,
          metadata: {
            payment_method_id: params.paymentMethodId,
          },
        })
        .select()
        .single();

      if (paymentError) {
        throw new Error("Failed to create withdrawal record");
      }

      // Process withdrawal with payment provider
      const withdrawalSuccess = await this.processWithdrawalWithProvider({
        amount: params.amount,
        currency: params.currency,
        paymentMethodId: params.paymentMethodId,
        reference: payment.reference,
      });

      if (!withdrawalSuccess) {
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", payment.id);

        throw new Error("Withdrawal processing failed");
      }

      // Update user balance
      await supabase
        .from("accounts")
        .update({
          amount: account.amount - Math.round(params.amount * 100),
        })
        .eq("user_id", params.userId)
        .eq("type", "main");

      // Update payment status
      await supabase
        .from("payments")
        .update({
          status: "completed",
          paid_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      return { success: true, withdrawalId: payment.id };
    } catch (error) {
      console.error("Withdrawal failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Withdrawal failed",
      };
    }
  }

  async getTransactionHistory(
    userId: string,
    limit: number = 50
  ): Promise<TransactionHistory[]> {
    try {
      const { data: payments, error } = await supabase
        .from("payments")
        .select(
          `
          *,
          property:properties(title)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (
        payments?.map((payment) => ({
          id: payment.id,
          userId: payment.user_id,
          type: ["withdrawal", "fee"].includes(payment.type || "")
            ? "debit"
            : "credit",
          amount: payment.amount / 100, // Convert from cents
          currency: payment.currency || "NGN",
          description: this.getTransactionDescription(payment),
          propertyTitle: payment.property?.title || "",
          status:
            payment.status === "completed"
              ? "completed"
              : payment.status === "failed"
              ? "failed"
              : "pending",
          reference: payment.reference,
          paymentMethodId: this.getMetadataValue(
            payment.metadata,
            "payment_method_id"
          ),
          blockchainTxHash: this.getMetadataValue(
            payment.metadata,
            "blockchain_tx_hash"
          ),
          createdAt: payment.created_at || new Date().toISOString(),
        })) || []
      );
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw error;
    }
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // In a real app, this would fetch from your payment provider (Stripe, etc.)
    // For now, return mock data
    return [
      {
        id: "pm_1",
        userId,
        type: "card",
        details: {
          last4: "4242",
          brand: "visa",
          expiryMonth: 12,
          expiryYear: 2025,
        },
        isDefault: true,
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }


  private async processWithdrawalWithProvider(params: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    reference: string;
  }): Promise<boolean> {
    // For Paystack withdrawals, this would integrate with Paystack Transfer API
    console.log("Processing withdrawal:", params);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock success (95% success rate for demo)
    return Math.random() > 0.05;
  }

  private getTransactionDescription(payment: any): string {
    const metadata = payment.metadata || {};

    switch (payment.type) {
      case "investment":
        return `Investment in ${
          this.getMetadataValue(metadata, "property_title") || "Property"
        }`;
      case "dividend":
        return `Dividend payment from ${
          this.getMetadataValue(metadata, "property_title") || "Property"
        }`;
      case "fee":
        return `Platform fee for ${
          this.getMetadataValue(metadata, "description") || "service"
        }`;
      case "withdrawal":
        return "Withdrawal to bank account";
      default:
        return "Transaction";
    }
  }

  private getMetadataValue(metadata: any, key: string): string | undefined {
    if (!metadata) return undefined;

    // Handle both object and string metadata
    if (typeof metadata === "string") {
      try {
        const parsed = JSON.parse(metadata);
        return parsed[key];
      } catch {
        return undefined;
      }
    }

    return metadata[key];
  }

  close() {
    this.hederaClient.close();
  }
}
