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
  variant?: 'inline' | 'toggle' | 'swap';
}

export function CurrencyExchangeWidget({
  amount,
  className,
  size = 'md',
  variant = 'swap'
}: CurrencyExchangeWidgetProps) {
  const { currency, updateCurrency, isUSD } = useCurrency();
  const [showBoth, setShowBoth] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleToggleCurrency = () => {
    setIsFlipping(true);
    setTimeout(() => {
      updateCurrency(isUSD ? 'NGN' : 'USD');
      setIsFlipping(false);
    }, 150);
  };

  const handleToggleDisplay = () => {
    setShowBoth(!showBoth);
  };

  // Legacy toggle variant for backwards compatibility
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

  // Legacy inline variant
  if (variant === 'inline') {
    return (
      <div 
        className={cn(
          "group relative inline-flex items-center gap-2 cursor-pointer",
          "transition-all duration-200 hover:bg-muted/50 rounded-md px-2 py-1",
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

  // Modern swap-style widget inspired by PancakeSwap
  const sizeStyles = {
    sm: {
      container: "p-3 min-h-[80px]",
      currency: "text-lg font-bold",
      symbol: "text-xs",
      button: "h-7 w-7"
    },
    md: {
      container: "p-4 min-h-[100px]",
      currency: "text-xl font-bold",
      symbol: "text-sm",
      button: "h-8 w-8"
    },
    lg: {
      container: "p-6 min-h-[120px]",
      currency: "text-2xl font-bold",
      symbol: "text-base",
      button: "h-10 w-10"
    }
  };

  const currentSize = sizeStyles[size];

  return (
    <div className={cn("relative", className)}>
      {/* Main Currency Container */}
      <div 
        className={cn(
          "relative overflow-hidden rounded-md border-2 border-slate-200/50",
          "bg-gradient-to-br from-white to-slate-50/80",
          "hover:border-blue-300/60 hover:shadow-lg hover:shadow-blue-500/10",
          "transition-all duration-300 ease-out cursor-pointer group",
          "backdrop-blur-sm",
          currentSize.container
        )}
        onClick={handleToggleCurrency}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-between h-full">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-slate-600 font-medium", currentSize.symbol)}>
                {isUSD ? 'USD' : 'NGN'}
              </span>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                isUSD 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              )}>
                Primary
              </div>
            </div>
            <div className={cn("text-slate-900", currentSize.currency)}>
              <CurrencyDisplay 
                amount={amount}
                size={size}
                showBothCurrencies={false}
                respectUserPreference={true}
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-md border-2 border-slate-200 bg-white/80 hover:bg-white",
                "hover:border-blue-300 hover:shadow-md transition-all duration-200",
                "hover:scale-105 active:scale-95",
                isFlipping && "animate-spin",
                currentSize.button
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleCurrency();
              }}
              title="Switch currency"
            >
              <ArrowsClockwiseIcon 
                size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} 
                className="text-slate-600"
              />
            </Button>
          </div>
        </div>

        {/* Bottom glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      {/* Secondary Currency Display */}
      <div 
        className={cn(
          "mt-2 rounded-md border border-slate-200/80 bg-slate-50/50 p-3",
          "transition-all duration-200 hover:bg-slate-100/50",
          size === 'lg' ? 'p-4' : size === 'sm' ? 'p-2' : 'p-3'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-slate-500 font-medium",
              size === 'lg' ? 'text-sm' : 'text-xs'
            )}>
              {isUSD ? 'NGN' : 'USD'}
            </span>
            <div className="px-1.5 py-0.5 rounded text-xs text-slate-600 bg-slate-200/60">
              ~
            </div>
          </div>
          <div className={cn(
            "text-slate-700 font-semibold",
            size === 'lg' ? 'text-lg' : size === 'md' ? 'text-base' : 'text-sm'
          )}>
            <CurrencyDisplay 
              amount={amount}
              size={size === 'lg' ? 'md' : 'sm'}
              showBothCurrencies={false}
              primaryCurrency={isUSD ? 'NGN' : 'USD'}
              respectUserPreference={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}