
interface PaystackConfig {
  publicKey: string;
  currency: string;
}

interface PaystackCustomer {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface PaystackTransaction {
  amount: number;
  email: string;
  currency?: string;
  reference?: string;
  callback_url?: string;
  plan?: string;
  invoice_limit?: number;
  metadata?: Record<string, any>;
  channels?: string[];
  split_code?: string;
  subaccount?: string;
  transaction_charge?: number;
  bearer?: string;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

interface PaystackInlineOptions extends PaystackTransaction {
  key: string;
  onSuccess: (transaction: any) => void;
  onLoad?: (response: any) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackInlineOptions) => {
        openIframe: () => void;
      };
    };
  }
}

export class PaystackService {
  private config: PaystackConfig;
  private isScriptLoaded: boolean = false;

  constructor() {
    this.config = {
      publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
      currency: 'NGN'
    };
  }

  async loadPaystackScript(): Promise<void> {
    if (this.isScriptLoaded) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.head.appendChild(script);
    });
  }

  async initializePayment(options: {
    amount: number;
    email: string;
    reference?: string;
    metadata?: Record<string, any>;
    onSuccess: (transaction: any) => void;
    onCancel?: () => void;
    onError?: (error: any) => void;
  }): Promise<void> {
    await this.loadPaystackScript();

    const paystackOptions: PaystackInlineOptions = {
      key: this.config.publicKey,
      email: options.email,
      amount: Math.round(options.amount * 100), // Convert to kobo
      currency: this.config.currency,
      reference: options.reference || this.generateReference(),
      metadata: options.metadata || {},
      onSuccess: options.onSuccess,
      onCancel: options.onCancel || (() => console.log('Payment cancelled')),
      onError: options.onError || ((error) => console.error('Payment error:', error)),
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
    };

    const popup = window.PaystackPop.setup(paystackOptions);
    popup.openIframe();
  }

  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `ref_${timestamp}_${random}`;
  }

  async verifyTransaction(reference: string): Promise<PaystackResponse> {
    try {
      // Use the verify-payment-status edge function for real verification
      const response = await fetch(`https://wossuijahchhtjzphsgh.supabase.co/functions/v1/verify-payment-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({ reference })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Verification failed');
      }

      return {
        status: result.success,
        message: result.success ? 'Transaction verified successfully' : 'Transaction verification failed',
        data: result.payment
      };
    } catch (error) {
      console.error('Transaction verification failed:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Transaction verification failed'
      };
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: this.config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  isConfigured(): boolean {
    return !!this.config.publicKey;
  }
}

export const paystackService = new PaystackService();
