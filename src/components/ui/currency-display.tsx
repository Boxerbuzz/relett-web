import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { currencyService } from "@/lib/services/CurrencyService";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";

interface CurrencyDisplayProps {
  amount: number;
  primaryCurrency?: 'USD' | 'NGN';
  showBothCurrencies?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  respectUserPreference?: boolean;
}

export function CurrencyDisplay({
  amount,
  primaryCurrency = 'NGN',
  showBothCurrencies = true,
  className,
  size = 'md',
  loading = false,
  respectUserPreference = true
}: CurrencyDisplayProps) {
  const { currency: userCurrency } = useCurrency();
  const effectivePrimary = respectUserPreference ? userCurrency : primaryCurrency;
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const convertAmount = async () => {
      if (!showBothCurrencies) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const secondaryCurrency = effectivePrimary === 'USD' ? 'NGN' : 'USD';
        const converted = await currencyService.convertCurrency(
          amount,
          effectivePrimary,
          secondaryCurrency
        );
        setConvertedAmount(converted);
      } catch (error) {
        console.warn('Currency conversion failed:', error);
        setConvertedAmount(null);
      } finally {
        setIsLoading(false);
      }
    };

    convertAmount();
  }, [amount, effectivePrimary, showBothCurrencies]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  if (loading || isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-4 bg-muted rounded w-24"></div>
      </div>
    );
  }

  if (!showBothCurrencies) {
    return (
      <span className={cn(sizeClasses[size], className)}>
        {formatCurrency(amount, effectivePrimary)}
      </span>
    );
  }

  const secondaryCurrency = effectivePrimary === 'USD' ? 'NGN' : 'USD';
  const primaryFormatted = formatCurrency(amount, effectivePrimary);
  const secondaryFormatted = convertedAmount 
    ? formatCurrency(convertedAmount, secondaryCurrency)
    : '...';

  return (
    <div className={cn('flex flex-col', className)}>
      <span className={cn(sizeClasses[size], 'font-medium')}>
        {primaryFormatted}
      </span>
      {convertedAmount && (
        <span className={cn('text-muted-foreground', size === 'lg' ? 'text-sm' : 'text-xs')}>
          ≈ {secondaryFormatted}
        </span>
      )}
    </div>
  );
}