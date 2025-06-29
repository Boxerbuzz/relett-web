// Property Specifications
export interface PropertySpecification {
  area: number;
  units: number;
  floors: number;
  garages: number;
  toilets: number;
  bedrooms: number;
  area_unit: string;
  bathrooms: number;
  year_built: number;
  is_furnished: boolean;
  full_bedroom_count: number;
  full_bathroom_count: number;
}

// Property Location
export interface PropertyLocation {
  city: string;
  state: string;
  address: string;
  country: string;
  landmark: string;
  latitude: number;
  longitude: number;
  postal_code: string;
  formatted_address: string;
}

// Property Pricing
export interface PropertyPricing {
  term: string;
  total: number;
  amount: number;
  deposit: number;
  currency: string;
  discount: number;
  duration: number;
  interest: number;
  is_negotiable: boolean;
  service_charge: number;
  yearly_payment: number;
  monthly_payment: number;
}

// Optional: More specific types for better type safety
export type CurrencyCode = "NGN" | "USD" | "EUR" | "GBP";
export type PricingTerm = "night" | "week" | "month" | "year" | "total";
export type AreaUnit = "sqm" | "sqft" | "acres" | "hectares";

// Enhanced versions with more specific types
export interface EnhancedPropertySpecification {
  area: number;
  units: number;
  floors: number;
  garages: number;
  toilets: number;
  bedrooms: number;
  area_unit: AreaUnit;
  bathrooms: number;
  year_built: number;
  is_furnished: boolean;
  full_bedroom_count: number;
  full_bathroom_count: number;
}

export interface EnhancedPropertyPricing {
  term: PricingTerm;
  total: number;
  amount: number;
  deposit: number;
  currency: CurrencyCode;
  discount: number;
  duration: number;
  interest: number;
  is_negotiable: boolean;
  service_charge: number;
  yearly_payment: number;
  monthly_payment: number;
}
