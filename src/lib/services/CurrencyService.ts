interface ExchangeRates {
  USD_NGN: number;
  NGN_USD: number;
  lastUpdated: number;
}

interface CachedRates {
  rates: ExchangeRates;
  timestamp: number;
}

class CurrencyService {
  private static instance: CurrencyService;
  private cachedRates: CachedRates | null = null;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private readonly DEFAULT_USD_NGN_RATE = 1500; // Fallback rate

  private constructor() {}

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  async getExchangeRates(): Promise<ExchangeRates> {
    // Check if we have valid cached rates
    if (this.cachedRates && this.isCacheValid()) {
      return this.cachedRates.rates;
    }

    try {
      // Try to fetch live rates from a free API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      if (data.rates && data.rates.NGN) {
        const usdToNgn = data.rates.NGN;
        const rates: ExchangeRates = {
          USD_NGN: usdToNgn,
          NGN_USD: 1 / usdToNgn,
          lastUpdated: Date.now()
        };

        this.cachedRates = {
          rates,
          timestamp: Date.now()
        };

        return rates;
      }
    } catch (error) {
      console.warn('Failed to fetch live exchange rates:', error);
    }

    // Fallback to default rates
    const fallbackRates: ExchangeRates = {
      USD_NGN: this.DEFAULT_USD_NGN_RATE,
      NGN_USD: 1 / this.DEFAULT_USD_NGN_RATE,
      lastUpdated: Date.now()
    };

    this.cachedRates = {
      rates: fallbackRates,
      timestamp: Date.now()
    };

    return fallbackRates;
  }

  private isCacheValid(): boolean {
    if (!this.cachedRates) return false;
    return Date.now() - this.cachedRates.timestamp < this.CACHE_DURATION;
  }

  async convertUsdToNgn(usdAmount: number): Promise<number> {
    const rates = await this.getExchangeRates();
    return usdAmount * rates.USD_NGN;
  }

  async convertNgnToUsd(ngnAmount: number): Promise<number> {
    const rates = await this.getExchangeRates();
    return ngnAmount * rates.NGN_USD;
  }

  async convertCurrency(amount: number, from: 'USD' | 'NGN', to: 'USD' | 'NGN'): Promise<number> {
    if (from === to) return amount;
    
    if (from === 'USD' && to === 'NGN') {
      return this.convertUsdToNgn(amount);
    } else if (from === 'NGN' && to === 'USD') {
      return this.convertNgnToUsd(amount);
    }
    
    return amount;
  }

  getCurrentRate(): number {
    return this.cachedRates?.rates.USD_NGN || this.DEFAULT_USD_NGN_RATE;
  }
}

export const currencyService = CurrencyService.getInstance();
export type { ExchangeRates };