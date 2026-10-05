// src/lib/seo/searchUniverse/localeCurrencyEngine.ts
/**
 * TalentXcel Global Language, Locale & Currency Engine
 *
 * Binds geographic destinations to authentic local currency, compensation notation,
 * regulatory vocabulary, and localized career terminology.
 *
 * Rule: Zero low-quality machine-translation spam. Localization is applied to currency,
 * employment standards, visa frameworks, and verified regional search demand.
 */

export interface LocaleProfile {
  countryCode: string;
  defaultLocale: string;
  supportedLocales: string[];
  currencyCode: string;
  currencySymbol: string;
  salaryFormatType: 'ANNUAL_LAKHS' | 'ANNUAL_THOUSANDS' | 'MONTHLY_AMOUNT';
  formatSalary: (min: number, max?: number) => string;
  localEmploymentTerminology: {
    compensationLabel: string;
    entryLevelTerm: string;
    regulatoryTerm: string;
    workArrangementTerm: string;
    taxTerm: string;
  };
}

export const REGIONAL_LOCALE_PROFILES: Record<string, LocaleProfile> = {
  IN: {
    countryCode: 'IN',
    defaultLocale: 'en-IN',
    supportedLocales: ['en-IN', 'hi-IN'],
    currencyCode: 'INR',
    currencySymbol: '₹',
    salaryFormatType: 'ANNUAL_LAKHS',
    formatSalary: (min: number, max?: number) => {
      const minLakhs = (min / 100000).toFixed(1).replace(/\.0$/, '');
      if (!max) return `₹${minLakhs} LPA`;
      const maxLakhs = (max / 100000).toFixed(1).replace(/\.0$/, '');
      return `₹${minLakhs} - ${maxLakhs} LPA`;
    },
    localEmploymentTerminology: {
      compensationLabel: 'Cost to Company (CTC)',
      entryLevelTerm: 'Freshers & Campus Graduates',
      regulatoryTerm: 'Notice Period & PF Deduction',
      workArrangementTerm: 'Work from Office / Hybrid',
      taxTerm: 'TDS & Old/New Tax Regime',
    },
  },

  AE: {
    countryCode: 'AE',
    defaultLocale: 'en-AE',
    supportedLocales: ['en-AE', 'ar-AE'],
    currencyCode: 'AED',
    currencySymbol: 'AED',
    salaryFormatType: 'MONTHLY_AMOUNT',
    formatSalary: (min: number, max?: number) => {
      const minMonthly = Math.round(min / 12);
      if (!max) return `AED ${minMonthly.toLocaleString()}/month`;
      const maxMonthly = Math.round(max / 12);
      return `AED ${minMonthly.toLocaleString()} - ${maxMonthly.toLocaleString()}/month`;
    },
    localEmploymentTerminology: {
      compensationLabel: 'Tax-Free Monthly Package',
      entryLevelTerm: 'Junior / Graduate Associates',
      regulatoryTerm: 'UAE Labour Law & End of Service Gratuity',
      workArrangementTerm: 'On-site Dubai / Hybrid GCC',
      taxTerm: '0% Personal Income Tax',
    },
  },

  US: {
    countryCode: 'US',
    defaultLocale: 'en-US',
    supportedLocales: ['en-US', 'es-US'],
    currencyCode: 'USD',
    currencySymbol: '$',
    salaryFormatType: 'ANNUAL_THOUSANDS',
    formatSalary: (min: number, max?: number) => {
      const minK = Math.round(min / 1000);
      if (!max) return `$${minK}k/year`;
      const maxK = Math.round(max / 1000);
      return `$${minK}k - $${maxK}k/year`;
    },
    localEmploymentTerminology: {
      compensationLabel: 'Base Salary + Equity (RSUs)',
      entryLevelTerm: 'Entry-Level / University Grads',
      regulatoryTerm: 'At-Will Employment & W-2 / 1099',
      workArrangementTerm: 'Remote US / Hybrid Bay Area / NYC',
      taxTerm: 'Federal + State Tax / 401(k) Match',
    },
  },

  GB: {
    countryCode: 'GB',
    defaultLocale: 'en-GB',
    supportedLocales: ['en-GB'],
    currencyCode: 'GBP',
    currencySymbol: '£',
    salaryFormatType: 'ANNUAL_THOUSANDS',
    formatSalary: (min: number, max?: number) => {
      const minK = Math.round(min / 1000);
      if (!max) return `£${minK}k/year`;
      const maxK = Math.round(max / 1000);
      return `£${minK}k - £${maxK}k/year`;
    },
    localEmploymentTerminology: {
      compensationLabel: 'Base Salary + Pension Scheme',
      entryLevelTerm: 'Graduate Scheme / Junior Roles',
      regulatoryTerm: 'PAYE & Statutory Notice Period',
      workArrangementTerm: 'Hybrid London / UK Remote',
      taxTerm: 'PAYE National Insurance Contributions',
    },
  },

  DE: {
    countryCode: 'DE',
    defaultLocale: 'de-DE',
    supportedLocales: ['de-DE', 'en-DE'],
    currencyCode: 'EUR',
    currencySymbol: '€',
    salaryFormatType: 'ANNUAL_THOUSANDS',
    formatSalary: (min: number, max?: number) => {
      const minK = Math.round(min / 1000);
      if (!max) return `€${minK}k/Jahr`;
      const maxK = Math.round(max / 1000);
      return `€${minK}k - €${maxK}k/Jahr`;
    },
    localEmploymentTerminology: {
      compensationLabel: 'Bruttojahresgehalt',
      entryLevelTerm: 'Berufseinsteiger / Trainee',
      regulatoryTerm: 'Kündigungsfrist & EU Blue Card',
      workArrangementTerm: 'Mobiles Arbeiten / Berlin Hybrid',
      taxTerm: 'Lohnsteuer & Sozialabgaben',
    },
  },

  CA: {
    countryCode: 'CA',
    defaultLocale: 'en-CA',
    supportedLocales: ['en-CA', 'fr-CA'],
    currencyCode: 'CAD',
    currencySymbol: 'C$',
    salaryFormatType: 'ANNUAL_THOUSANDS',
    formatSalary: (min: number, max?: number) => {
      const minK = Math.round(min / 1000);
      if (!max) return `C$${minK}k/year`;
      const maxK = Math.round(max / 1000);
      return `C$${minK}k - C$${maxK}k/year`;
    },
    localEmploymentTerminology: {
      compensationLabel: 'Annual Base + RRSP Match',
      entryLevelTerm: 'New Grad / Junior Analyst',
      regulatoryTerm: 'Provincial Employment Standards',
      workArrangementTerm: 'Hybrid Toronto / Remote Canada',
      taxTerm: 'CRA Federal & Provincial Taxes',
    },
  },

  SG: {
    countryCode: 'SG',
    defaultLocale: 'en-SG',
    supportedLocales: ['en-SG'],
    currencyCode: 'SGD',
    currencySymbol: 'S$',
    salaryFormatType: 'MONTHLY_AMOUNT',
    formatSalary: (min: number, max?: number) => {
      const minM = Math.round(min / 12);
      if (!max) return `S$${minM.toLocaleString()}/month`;
      const maxM = Math.round(max / 12);
      return `S$${minM.toLocaleString()} - S$${maxM.toLocaleString()}/month`;
    },
    localEmploymentTerminology: {
      compensationLabel: 'Monthly Base + AWS (13th Month)',
      entryLevelTerm: 'Fresh Graduates',
      regulatoryTerm: 'MOM Employment Act & EP / S-Pass',
      workArrangementTerm: 'Hybrid CBD / Singapore Office',
      taxTerm: 'IRAS Progressive Income Tax',
    },
  },
};

export class LocaleCurrencyEngine {
  /**
   * Resolves the complete locale profile for any given country code
   */
  static getLocaleProfile(countryCode: string): LocaleProfile {
    const code = (countryCode || 'IN').toUpperCase();
    return REGIONAL_LOCALE_PROFILES[code] || REGIONAL_LOCALE_PROFILES.IN;
  }

  /**
   * Formats salary figures intelligently based on geographic destination
   */
  static formatSalaryForLocation(countryCode: string, minAmount: number, maxAmount?: number): string {
    const profile = this.getLocaleProfile(countryCode);
    return profile.formatSalary(minAmount, maxAmount);
  }
}
