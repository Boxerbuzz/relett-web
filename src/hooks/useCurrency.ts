import { useState, useEffect } from 'react';

export type Currency = 'USD' | 'NGN';

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('NGN');

  useEffect(() => {
    // Get initial currency from localStorage
    const storedCurrency = localStorage.getItem('preferredCurrency') as Currency;
    if (storedCurrency && (storedCurrency === 'USD' || storedCurrency === 'NGN')) {
      setCurrency(storedCurrency);
    }

    // Listen for storage events to update currency when changed in other components
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'preferredCurrency' && event.newValue) {
        const newCurrency = event.newValue as Currency;
        if (newCurrency === 'USD' || newCurrency === 'NGN') {
          setCurrency(newCurrency);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'preferredCurrency',
      newValue: newCurrency,
      oldValue: currency
    }));
  };

  return {
    currency,
    updateCurrency,
    isUSD: currency === 'USD',
    isNGN: currency === 'NGN'
  };
}