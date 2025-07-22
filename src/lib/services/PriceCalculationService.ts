import { PropertyPricing } from "@/types/property";

export interface BookingCalculation {
  baseAmount: number;
  serviceCharge: number;
  discount: number;
  deposit: number;
  totalAmount: number;
  currency: string;
  breakdown: {
    description: string;
    amount: number;
  }[];
}

export interface RentalCalculationInput {
  pricing: PropertyPricing;
  paymentPlan: 'monthly' | 'quarterly' | 'annually';
  moveInDate: string;
}

export interface ReservationCalculationInput {
  pricing: PropertyPricing;
  fromDate: string;
  toDate: string;
  guests: {
    adults: number;
    children?: number;
    infants?: number;
  };
}

export class PriceCalculationService {
  
  /**
   * Calculate rental pricing based on property pricing and payment plan
   */
  static calculateRentalPrice(input: RentalCalculationInput): BookingCalculation {
    const { pricing, paymentPlan } = input;

    // Normalize to monthly price based on the term
    let monthlyPrice: number;
    switch (pricing.term) {
      case "year":
        monthlyPrice = pricing.amount / 12;
        break;
      case "quarter":
        monthlyPrice = pricing.amount / 3;
        break;
      case "month":
        monthlyPrice = pricing.amount;
        break;
      case "week":
        monthlyPrice = (pricing.amount * 52) / 12; // 52 weeks in a year, divided by 12 months
        break;
      case "night":
        monthlyPrice = (pricing.amount * 30); // 30 nights in a month
        break;
      default:
        monthlyPrice = pricing.amount;
    }

    // Determine multiplier for the selected payment plan
    let multiplier = 1;
    let planLabel = "";
    switch (paymentPlan) {
      case "monthly":
        multiplier = 1;
        planLabel = "Monthly rent";
        break;
      case "quarterly":
        multiplier = 3;
        planLabel = "Quarterly rent";
        break;
      case "annually":
        multiplier = 12;
        planLabel = "Annual rent";
        break;
      default:
        planLabel = "Rent";
    }

    const totalBaseAmount = Math.round(monthlyPrice * multiplier);

    // Charges
    const serviceCharge = pricing.service_charge || 0;
    const discountAmount = pricing.discount || 0;
    const deposit = pricing.deposit || 0;

    // Calculate final amount
    const subtotal = totalBaseAmount + serviceCharge - discountAmount;
    const totalAmount = subtotal + deposit;

    // Breakdown
    const breakdown = [
      { description: planLabel, amount: totalBaseAmount }
    ];
    if (serviceCharge > 0) breakdown.push({ description: "Service charge", amount: serviceCharge });
    if (discountAmount > 0) breakdown.push({ description: "Discount", amount: -discountAmount });
    if (deposit > 0) breakdown.push({ description: "Security deposit", amount: deposit });

    return {
      baseAmount: totalBaseAmount,
      serviceCharge,
      discount: discountAmount,
      deposit,
      totalAmount,
      currency: pricing.currency,
      breakdown
    };
  }
  
  /**
   * Calculate reservation pricing based on property pricing and stay details
   */
  static calculateReservationPrice(input: ReservationCalculationInput): BookingCalculation {
    const { pricing, fromDate, toDate, guests } = input;
    
    // Calculate nights
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const nights = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    
    let baseAmount: number;
    
    // Use appropriate pricing based on term
    switch (pricing.term) {
      case 'night':
        baseAmount = pricing.amount * nights;
        break;
      case 'week':
        const weeks = Math.ceil(nights / 7);
        baseAmount = pricing.amount * weeks;
        break;
      case 'month':
        const months = Math.ceil(nights / 30);
        baseAmount = pricing.amount * months;
        break;
      default:
        baseAmount = pricing.amount * nights;
    }
    
    // Apply guest-based pricing adjustments (optional)
    const totalGuests = guests.adults + (guests.children || 0);
    if (totalGuests > 2) {
      // Add extra guest fee (could be configurable)
      const extraGuests = totalGuests - 2;
      const extraGuestFee = baseAmount * 0.1 * extraGuests; // 10% per extra guest
      baseAmount += extraGuestFee;
    }
    
    // Apply service charge from pricing object
    const serviceCharge = pricing.service_charge || Math.round(baseAmount * 0.1); // Default 10% if not specified
    
    // Apply discount from pricing object
    const discountAmount = pricing.discount || 0;
    
    // Use deposit from pricing object
    const deposit = pricing.deposit || 0;
    
    // Calculate final amount
    const subtotal = baseAmount + serviceCharge - discountAmount;
    const totalAmount = subtotal;
    
    const breakdown = [
      {
        description: `₦${pricing.amount.toLocaleString()} × ${nights} night${nights !== 1 ? 's' : ''}`,
        amount: baseAmount
      }
    ];
    
    if (totalGuests > 2) {
      const extraGuests = totalGuests - 2;
      const extraGuestFee = baseAmount * 0.1 * extraGuests;
      breakdown.push({
        description: `Extra guest fee (${extraGuests} guest${extraGuests !== 1 ? 's' : ''})`,
        amount: extraGuestFee
      });
    }
    
    if (serviceCharge > 0) {
      breakdown.push({
        description: 'Service fee',
        amount: serviceCharge
      });
    }
    
    if (discountAmount > 0) {
      breakdown.push({
        description: 'Discount',
        amount: -discountAmount
      });
    }
    
    if (deposit > 0) {
      breakdown.push({
        description: 'Security deposit',
        amount: deposit
      });
    }
    
    return {
      baseAmount,
      serviceCharge,
      discount: discountAmount,
      deposit,
      totalAmount: totalAmount + deposit,
      currency: pricing.currency,
      breakdown
    };
  }
  
  /**
   * Format amount with currency
   */
  static formatAmount(amount: number, currency: string = 'NGN'): string {
    const symbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency;
    return `${symbol}${amount.toLocaleString()}`;
  }
  
  /**
   * Generate payment reference
   */
  static generatePaymentReference(type: 'rental' | 'reservation', id: string): string {
    const timestamp = Date.now();
    return `${type}_${id}_${timestamp}`;
  }
}