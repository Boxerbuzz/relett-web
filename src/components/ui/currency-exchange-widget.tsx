import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowsHorizontalIcon, ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import { CurrencyDisplay, DualCurrencyDisplay } from "./currency-display";

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

  return (
    <div 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:bg-muted/50 rounded-md p-1",
        className
      )}
      onClick={handleToggleCurrency}
      title="Click to switch currency"
    >
      <div className="flex items-center gap-2">
        <DualCurrencyDisplay 
          amount={amount}
          size={size}
          separator=" ⟷ "
        />
        <ArrowsClockwiseIcon 
          size={14} 
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
}