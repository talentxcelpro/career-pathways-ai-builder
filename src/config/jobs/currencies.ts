/**
 * TalentXcel Global Currency Registry
 * Covers all major currencies used in global job markets.
 * Regional default: India → INR
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimalPlaces: number;
  typicalAnnualRange?: { min: number; max: number };
  schemaCurrency: string;
}

export const CURRENCIES: readonly CurrencyConfig[] = [
  // South Asia
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', decimalPlaces: 0, schemaCurrency: 'INR', typicalAnnualRange: { min: 200000, max: 2000000 } },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', locale: 'bn-BD', decimalPlaces: 2, schemaCurrency: 'BDT', typicalAnnualRange: { min: 120000, max: 1200000 } },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'ur-PK', decimalPlaces: 2, schemaCurrency: 'PKR', typicalAnnualRange: { min: 300000, max: 3000000 } },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', locale: 'en-LK', decimalPlaces: 2, schemaCurrency: 'LKR', typicalAnnualRange: { min: 600000, max: 6000000 } },
  { code: 'NPR', symbol: 'रू', name: 'Nepalese Rupee', locale: 'ne-NP', decimalPlaces: 2, schemaCurrency: 'NPR', typicalAnnualRange: { min: 180000, max: 1800000 } },
  // Southeast Asia
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG', decimalPlaces: 2, schemaCurrency: 'SGD', typicalAnnualRange: { min: 40000, max: 200000 } },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY', decimalPlaces: 2, schemaCurrency: 'MYR', typicalAnnualRange: { min: 24000, max: 120000 } },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH', decimalPlaces: 2, schemaCurrency: 'THB', typicalAnnualRange: { min: 180000, max: 1200000 } },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID', decimalPlaces: 0, schemaCurrency: 'IDR', typicalAnnualRange: { min: 36000000, max: 300000000 } },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH', decimalPlaces: 2, schemaCurrency: 'PHP', typicalAnnualRange: { min: 180000, max: 1200000 } },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN', decimalPlaces: 0, schemaCurrency: 'VND', typicalAnnualRange: { min: 60000000, max: 500000000 } },
  // East Asia & Pacific
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', decimalPlaces: 0, schemaCurrency: 'JPY', typicalAnnualRange: { min: 3000000, max: 15000000 } },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR', decimalPlaces: 0, schemaCurrency: 'KRW', typicalAnnualRange: { min: 30000000, max: 100000000 } },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK', decimalPlaces: 2, schemaCurrency: 'HKD', typicalAnnualRange: { min: 150000, max: 800000 } },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar', locale: 'zh-TW', decimalPlaces: 0, schemaCurrency: 'TWD', typicalAnnualRange: { min: 400000, max: 2000000 } },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', decimalPlaces: 2, schemaCurrency: 'AUD', typicalAnnualRange: { min: 50000, max: 180000 } },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ', decimalPlaces: 2, schemaCurrency: 'NZD', typicalAnnualRange: { min: 45000, max: 150000 } },
  // Middle East
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE', decimalPlaces: 2, schemaCurrency: 'AED', typicalAnnualRange: { min: 36000, max: 360000 } },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA', decimalPlaces: 2, schemaCurrency: 'SAR', typicalAnnualRange: { min: 36000, max: 360000 } },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal', locale: 'ar-QA', decimalPlaces: 2, schemaCurrency: 'QAR', typicalAnnualRange: { min: 36000, max: 360000 } },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', locale: 'ar-KW', decimalPlaces: 3, schemaCurrency: 'KWD', typicalAnnualRange: { min: 6000, max: 60000 } },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', locale: 'ar-BH', decimalPlaces: 3, schemaCurrency: 'BHD', typicalAnnualRange: { min: 6000, max: 60000 } },
  { code: 'OMR', symbol: '﷼', name: 'Omani Rial', locale: 'ar-OM', decimalPlaces: 3, schemaCurrency: 'OMR', typicalAnnualRange: { min: 6000, max: 60000 } },
  // Europe
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-IE', decimalPlaces: 2, schemaCurrency: 'EUR', typicalAnnualRange: { min: 25000, max: 150000 } },
  { code: 'GBP', symbol: '£', name: 'British Pound Sterling', locale: 'en-GB', decimalPlaces: 2, schemaCurrency: 'GBP', typicalAnnualRange: { min: 20000, max: 130000 } },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH', decimalPlaces: 2, schemaCurrency: 'CHF', typicalAnnualRange: { min: 60000, max: 200000 } },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE', decimalPlaces: 2, schemaCurrency: 'SEK', typicalAnnualRange: { min: 300000, max: 1000000 } },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO', decimalPlaces: 2, schemaCurrency: 'NOK', typicalAnnualRange: { min: 400000, max: 1200000 } },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK', decimalPlaces: 2, schemaCurrency: 'DKK', typicalAnnualRange: { min: 300000, max: 900000 } },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL', decimalPlaces: 2, schemaCurrency: 'PLN', typicalAnnualRange: { min: 40000, max: 200000 } },
  // Americas
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimalPlaces: 2, schemaCurrency: 'USD', typicalAnnualRange: { min: 40000, max: 300000 } },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', decimalPlaces: 2, schemaCurrency: 'CAD', typicalAnnualRange: { min: 40000, max: 200000 } },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR', decimalPlaces: 2, schemaCurrency: 'BRL', typicalAnnualRange: { min: 24000, max: 240000 } },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX', decimalPlaces: 2, schemaCurrency: 'MXN', typicalAnnualRange: { min: 100000, max: 800000 } },
  // Africa
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA', decimalPlaces: 2, schemaCurrency: 'ZAR', typicalAnnualRange: { min: 80000, max: 800000 } },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG', decimalPlaces: 2, schemaCurrency: 'NGN', typicalAnnualRange: { min: 1000000, max: 10000000 } },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE', decimalPlaces: 2, schemaCurrency: 'KES', typicalAnnualRange: { min: 200000, max: 2000000 } },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'ar-EG', decimalPlaces: 2, schemaCurrency: 'EGP', typicalAnnualRange: { min: 40000, max: 400000 } },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH', decimalPlaces: 2, schemaCurrency: 'GHS', typicalAnnualRange: { min: 15000, max: 150000 } },
] as const;

export const CURRENCY_MAP: Readonly<Record<string, CurrencyConfig>> =
  Object.fromEntries(CURRENCIES.map((c) => [c.code, c]));

export const DEFAULT_CURRENCY = CURRENCY_MAP['INR'];
export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export function formatSalary(amount: number, currencyCode: string): string {
  const cfg = CURRENCY_MAP[currencyCode] ?? DEFAULT_CURRENCY;
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.code,
      maximumFractionDigits: cfg.decimalPlaces,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${cfg.symbol}${amount.toLocaleString()}`;
  }
}

export function getSchemaCurrency(currencyCode: string): string {
  return CURRENCY_MAP[currencyCode]?.schemaCurrency ?? 'INR';
}

export const CURRENCY_GROUPS: Record<string, string[]> = {
  'South Asia': ['INR', 'BDT', 'PKR', 'LKR', 'NPR'],
  'Southeast Asia': ['SGD', 'MYR', 'THB', 'IDR', 'PHP', 'VND'],
  'East Asia & Pacific': ['JPY', 'KRW', 'HKD', 'TWD', 'AUD', 'NZD'],
  'Middle East': ['AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR'],
  'Europe': ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN'],
  'Americas': ['USD', 'CAD', 'BRL', 'MXN'],
  'Africa': ['ZAR', 'NGN', 'KES', 'EGP', 'GHS'],
};
