import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowsHorizontalIcon, ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import { CurrencyDisplay } from "./currency-display";

interface CurrencyExchangeWidgetProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'toggle';
}

export function CurrencyExchangeWidget({
  amount,
  className,
  size = 'md',
  variant = 'inline'
}: CurrencyExchangeWidgetProps) {
  const { currency, updateCurrency, isUSD } = useCurrency();
  const [showBoth, setShowBoth] = useState(true);

  const handleToggleCurrency = () => {
    updateCurrency(isUSD ? 'NGN' : 'USD');
  };

  const handleToggleDisplay = () => {
    setShowBoth(!showBoth);
  };

  if (variant === 'toggle') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <CurrencyDisplay 
          amount={amount} 
          showBothCurrencies={showBoth}
          size={size}
        />
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleDisplay}
            className="h-6 w-6 p-0"
            title={showBoth ? "Show single currency" : "Show both currencies"}
          >
            <ArrowsHorizontalIcon size={12} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCurrency}
            className="h-6 w-6 p-0"
            title="Switch primary currency"
          >
            <ArrowsClockwiseIcon size={12} />
          </Button>
        </div>
      </div>
    );
  }

  // Exchange-style widget with clean currency switching
  return (
    <div 
      className={cn(
        "group relative inline-flex items-center gap-2 cursor-pointer",
        "transition-all duration-200 hover:bg-muted/50 rounded-lg px-2 py-1",
        className
      )}
      onClick={handleToggleCurrency}
      title="Click to switch currency"
    >
      <div className="flex flex-col">
        <CurrencyDisplay 
          amount={amount}
          size={size}
          showBothCurrencies={false}
          respectUserPreference={true}
        />
        <div className="text-xs text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
          <CurrencyDisplay 
            amount={amount}
            size="sm"
            showBothCurrencies={false}
            primaryCurrency={isUSD ? 'NGN' : 'USD'}
            respectUserPreference={false}
          />
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-60 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        title="Switch currency"
      >
        <ArrowsClockwiseIcon size={12} />
      </Button>
    </div>
  );
}