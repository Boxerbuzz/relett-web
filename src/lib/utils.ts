import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatCurrency(
  amount: number,
  currency: string = "NGN"
): string {
  const locale = currency === "USD" ? "en-US" : "en-NG";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(amount);
}

// Convert kobo to naira for display
export function convertKoboToNaira(kobo: number): number {
  return kobo / 100;
}

// Format price with proper kobo to naira conversion
export function formatPriceFromKobo(
  koboAmount: number,
  currency: string = "NGN"
): string {
  const nairaAmount = convertKoboToNaira(koboAmount);
  return formatCurrency(nairaAmount, currency);
}

export function formatDualCurrency(
  amount: number,
  primaryCurrency: string = "NGN",
  convertedAmount?: number,
  separator: string = " ⟷ "
): string {
  const secondaryCurrency = primaryCurrency === "USD" ? "NGN" : "USD";
  const primary = formatCurrency(amount, primaryCurrency);
  
  if (convertedAmount === undefined) {
    return `${primary}${separator}...`;
  }
  
  const secondary = formatCurrency(convertedAmount, secondaryCurrency);
  return `${primary}${separator}${secondary}`;
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function appLogger(domain: string, message: string) {
  console.log(`[${domain}] <=!=> ${message}`);
}


export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Masks an ID by showing only the first and last few characters
 * @param id - The ID to mask
 * @param visibleChars - Number of characters to show at the beginning and end (default: 4)
 * @param maskChar - Character to use for masking (default: '*')
 * @returns The masked ID
 */
export const maskId = (
  id: string,
  visibleChars: number = 4,
  maskChar: string = '*'
): string => {
  // If the ID is too short to mask, return it as is
  if (id.length <= visibleChars * 2) {
    return id;
  }

  // Extract the parts to show
  const start = id.slice(0, visibleChars);
  const end = id.slice(-visibleChars);
  
  // Create the masked portion represented by a single mask character
  // regardless of the actual length of the masked section
  return `${start}${maskChar}${end}`;
};