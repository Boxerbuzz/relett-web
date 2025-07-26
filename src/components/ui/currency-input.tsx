import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  currency?: 'USD' | 'NGN';
  min?: number;
  max?: number;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, currency, min = 0, max, className, ...props }, ref) => {
    const { currency: userCurrency } = useCurrency();
    const effectiveCurrency = currency || userCurrency;
    
    const formatValue = (val: number) => {
      if (val === 0) return '';
      return val.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: effectiveCurrency === 'USD' ? 2 : 0,
      });
    };

    const parseValue = (str: string) => {
      // Remove commas and parse
      const cleaned = str.replace(/,/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      
      // Allow empty string
      if (rawValue === '') {
        onChange(0);
        return;
      }

      // Allow only numbers, commas, and decimal points
      if (!/^[\d,]*\.?\d*$/.test(rawValue)) return;

      const numericValue = parseValue(rawValue);
      
      // Apply min/max constraints
      if (min !== undefined && numericValue < min) return;
      if (max !== undefined && numericValue > max) return;

      onChange(numericValue);
    };

    const currencySymbol = effectiveCurrency === 'USD' ? '$' : '₦';

    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
          {currencySymbol}
        </div>
        <Input
          ref={ref}
          value={formatValue(value)}
          onChange={handleChange}
          className={cn("pl-8", className)}
          placeholder={`0${effectiveCurrency === 'USD' ? '.00' : ''}`}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";