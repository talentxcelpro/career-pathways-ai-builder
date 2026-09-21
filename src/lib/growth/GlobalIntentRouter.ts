import { SupportedCurrencyMeta } from './types';
import { ProductMagnetEngine } from './ProductMagnetEngine';

export interface RouteResolution {
  targetProduct: string;
  targetPath: string;
  currency: string;
  currencySymbol: string;
  hasVerifiedRegionalData: boolean;
  dataStatusMessage?: string;
}

/**
 * Global Intent -> Product Magnet Router
 * =========================================================================
 * Directly connects UDX search demand signals to the optimal interactive utility.
 * Localizes currency (USD, GBP, EUR, CAD, AUD, SGD, AED, INR) and provides
 * DATA NOT AVAILABLE protection when local benchmarks do not exist.
 */
export class GlobalIntentRouter {
  public static readonly CURRENCIES: Record<string, SupportedCurrencyMeta> = {
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', countries: ['usa'], salaryUnit: 'per year', hasVerifiedData: true, unverifiedFallbackMessage: '' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', countries: ['gbr'], salaryUnit: 'per year', hasVerifiedData: true, unverifiedFallbackMessage: '' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', countries: ['fra', 'deu', 'esp', 'ita', 'nld'], salaryUnit: 'per year', hasVerifiedData: false, unverifiedFallbackMessage: 'DATA NOT AVAILABLE — European labor datasets pending partner integration.' },
    CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', countries: ['can'], salaryUnit: 'per year', hasVerifiedData: false, unverifiedFallbackMessage: 'DATA NOT AVAILABLE — Canadian compensation benchmarks awaiting employer intake.' },
    AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', countries: ['aus'], salaryUnit: 'per year', hasVerifiedData: false, unverifiedFallbackMessage: 'DATA NOT AVAILABLE — Australian salary index pending verification.' },
    SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', countries: ['sgp'], salaryUnit: 'per month', hasVerifiedData: false, unverifiedFallbackMessage: 'DATA NOT AVAILABLE — Singapore wage models awaiting verified intake.' },
    AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', countries: ['are'], salaryUnit: 'per month', hasVerifiedData: false, unverifiedFallbackMessage: 'DATA NOT AVAILABLE — UAE compensation data pending regional adapter.' },
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', countries: ['ind'], salaryUnit: 'LPA', hasVerifiedData: true, unverifiedFallbackMessage: '' }
  };

  /**
   * Resolves a raw search query and country code into an actionable product landing destination.
   */
  public static resolve(query: string, countryCode: string = 'global'): RouteResolution {
    const q = query.toLowerCase();
    const c = countryCode.toLowerCase();

    // Determine target currency based on country
    let targetCurrency = 'USD';
    if (c === 'ind') targetCurrency = 'INR';
    else if (c === 'gbr') targetCurrency = 'GBP';
    else if (['fra', 'deu', 'esp', 'ita', 'nld'].includes(c)) targetCurrency = 'EUR';
    else if (c === 'can') targetCurrency = 'CAD';
    else if (c === 'aus') targetCurrency = 'AUD';
    else if (c === 'sgp') targetCurrency = 'SGD';
    else if (c === 'are') targetCurrency = 'AED';

    const currMeta = this.CURRENCIES[targetCurrency] || this.CURRENCIES.USD;

    // Route based on intent keywords
    if (q.includes('resume') || q.includes('ats') || q.includes('cv')) {
      const magnet = ProductMagnetEngine.getMagnetById('magnet-ats-checker')!;
      return {
        targetProduct: magnet.name,
        targetPath: `${magnet.primaryRoute}?q=${encodeURIComponent(query)}&country=${c}`,
        currency: targetCurrency,
        currencySymbol: currMeta.symbol,
        hasVerifiedRegionalData: true
      };
    }

    if (q.includes('salary') || q.includes('pay') || q.includes('compensation') || q.includes('package')) {
      const magnet = ProductMagnetEngine.getMagnetById('magnet-salary-analyzer')!;
      const isVerified = currMeta.hasVerifiedData;
      return {
        targetProduct: magnet.name,
        targetPath: `${magnet.primaryRoute}?role=${encodeURIComponent(query)}&country=${c}&currency=${targetCurrency}`,
        currency: targetCurrency,
        currencySymbol: currMeta.symbol,
        hasVerifiedRegionalData: isVerified,
        dataStatusMessage: isVerified ? undefined : currMeta.unverifiedFallbackMessage
      };
    }

    if (q.includes('interview') || q.includes('questions') || q.includes('star method')) {
      const magnet = ProductMagnetEngine.getMagnetById('magnet-ai-mock-interview')!;
      return {
        targetProduct: magnet.name,
        targetPath: `${magnet.primaryRoute}?q=${encodeURIComponent(query)}`,
        currency: targetCurrency,
        currencySymbol: currMeta.symbol,
        hasVerifiedRegionalData: true
      };
    }

    if (q.includes('career change') || q.includes('switch') || q.includes('transition') || q.includes('roadmap')) {
      const magnet = ProductMagnetEngine.getMagnetById('magnet-career-change')!;
      return {
        targetProduct: magnet.name,
        targetPath: `${magnet.primaryRoute}?from=${encodeURIComponent(query)}`,
        currency: targetCurrency,
        currencySymbol: currMeta.symbol,
        hasVerifiedRegionalData: true
      };
    }

    // Default to Job Matcher
    const defaultMagnet = ProductMagnetEngine.getMagnetById('magnet-job-matcher')!;
    return {
      targetProduct: defaultMagnet.name,
      targetPath: `${defaultMagnet.primaryRoute}?q=${encodeURIComponent(query)}&location=${c}`,
      currency: targetCurrency,
      currencySymbol: currMeta.symbol,
      hasVerifiedRegionalData: true
    };
  }
}
