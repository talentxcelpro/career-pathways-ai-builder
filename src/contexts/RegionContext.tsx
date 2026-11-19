import React, { createContext, useContext, useState, useEffect } from 'react';

export type RegionCode = 'IN' | 'MENA' | 'EU' | 'NA' | 'GLOBAL';

export interface RegionConfig {
  code: RegionCode;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  salaryUnit: string;
  paperSize: 'A4' | 'US Letter';
  defaultCities: string[];
  visaHighlight: boolean;
  gdprEnabled: boolean;
  atsPreset: 'Standard' | 'Workday' | 'Greenhouse' | 'GulfTalent';
}

export const REGION_CONFIGS: Record<RegionCode, RegionConfig> = {
  IN: {
    code: 'IN',
    name: 'India & South Asia',
    flag: '🇮🇳',
    currency: 'INR',
    currencySymbol: '₹',
    salaryUnit: 'LPA',
    paperSize: 'A4',
    defaultCities: ['Bangalore', 'Pune', 'Hyderabad', 'Delhi NCR', 'Mumbai'],
    visaHighlight: false,
    gdprEnabled: false,
    atsPreset: 'Standard'
  },
  MENA: {
    code: 'MENA',
    name: 'MENA & GCC',
    flag: '🇦🇪',
    currency: 'AED',
    currencySymbol: 'AED ',
    salaryUnit: 'per month',
    paperSize: 'A4',
    defaultCities: ['Dubai', 'Abu Dhabi', 'Riyadh', 'Doha', 'Jeddah'],
    visaHighlight: true,
    gdprEnabled: false,
    atsPreset: 'GulfTalent'
  },
  EU: {
    code: 'EU',
    name: 'United Kingdom & Europe',
    flag: '🇬🇧',
    currency: 'EUR',
    currencySymbol: '€',
    salaryUnit: 'per year',
    paperSize: 'A4',
    defaultCities: ['London', 'Berlin', 'Amsterdam', 'Dublin', 'Munich', 'Zurich'],
    visaHighlight: true,
    gdprEnabled: true,
    atsPreset: 'Standard'
  },
  NA: {
    code: 'NA',
    name: 'North America',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    salaryUnit: 'per year',
    paperSize: 'US Letter',
    defaultCities: ['San Francisco', 'New York', 'Austin', 'Seattle', 'Toronto', 'Vancouver'],
    visaHighlight: false,
    gdprEnabled: false,
    atsPreset: 'Workday'
  },
  GLOBAL: {
    code: 'GLOBAL',
    name: 'Global Remote',
    flag: '🌐',
    currency: 'USD',
    currencySymbol: '$',
    salaryUnit: 'per year',
    paperSize: 'US Letter',
    defaultCities: ['Worldwide Remote', 'US Remote', 'EU Remote', 'APAC Remote'],
    visaHighlight: true,
    gdprEnabled: false,
    atsPreset: 'Greenhouse'
  }
};

interface RegionContextType {
  region: RegionCode;
  config: RegionConfig;
  setRegion: (region: RegionCode) => void;
  formatSalary: (amount: number, isMonthly?: boolean) => string;
  formatSalaryRange: (min: number, max?: number) => string;
  formatPrice: (tier: 'pro' | 'recruiter') => { amount: string; currency: string; display: string };
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

const REGION_STORAGE_KEY = 'txc_preferred_region';

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegionState] = useState<RegionCode>('IN');

  useEffect(() => {
    // 1. Check local storage preference
    const stored = localStorage.getItem(REGION_STORAGE_KEY) as RegionCode;
    if (stored && REGION_CONFIGS[stored]) {
      setRegionState(stored);
      return;
    }

    // 2. Client-side Timezone / Locale Geo-detection fallback
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const tzLower = tz.toLowerCase();

      if (tzLower.includes('dubai') || tzLower.includes('riyadh') || tzLower.includes('qatar') || tzLower.includes('kuwait') || tzLower.includes('muscat')) {
        setRegionState('MENA');
      } else if (tzLower.includes('london') || tzLower.includes('europe') || tzLower.includes('berlin') || tzLower.includes('paris') || tzLower.includes('dublin')) {
        setRegionState('EU');
      } else if (tzLower.includes('america') || tzLower.includes('new_york') || tzLower.includes('chicago') || tzLower.includes('los_angeles') || tzLower.includes('toronto')) {
        setRegionState('NA');
      } else {
        setRegionState('IN');
      }
    } catch (_) {
      setRegionState('IN');
    }
  }, []);

  const setRegion = (newRegion: RegionCode) => {
    setRegionState(newRegion);
    try {
      localStorage.setItem(REGION_STORAGE_KEY, newRegion);
    } catch (_) {}
  };

  const config = REGION_CONFIGS[region] || REGION_CONFIGS.IN;

  const formatSalary = (amount: number, isMonthly: boolean = false): string => {
    if (!amount || amount <= 0) return 'Competitive';
    if (region === 'IN') {
      const lpa = (amount / 100000).toFixed(1);
      return `₹${lpa} LPA`;
    }
    if (region === 'MENA') {
      return `${config.currencySymbol}${amount.toLocaleString()} /mo`;
    }
    return `${config.currencySymbol}${amount.toLocaleString()} /yr`;
  };

  const formatSalaryRange = (min: number, max?: number): string => {
    if (!min || min <= 0) return 'Competitive CTC';
    if (region === 'IN') {
      const minLpa = (min / 100000).toFixed(1);
      if (!max || max === min) return `₹${minLpa} LPA`;
      const maxLpa = (max / 100000).toFixed(1);
      return `₹${minLpa}L – ₹${maxLpa}L CTC`;
    }
    if (region === 'MENA') {
      if (!max || max === min) return `${config.currencySymbol}${min.toLocaleString()} /mo`;
      return `${config.currencySymbol}${min.toLocaleString()} – ${max.toLocaleString()} /mo`;
    }
    if (!max || max === min) return `${config.currencySymbol}${min.toLocaleString()}`;
    return `${config.currencySymbol}${min.toLocaleString()} – ${config.currencySymbol}${max.toLocaleString()}`;
  };

  const formatPrice = (tier: 'pro' | 'recruiter') => {
    if (tier === 'pro') {
      switch (region) {
        case 'MENA': return { amount: '109', currency: 'AED', display: '109 AED /mo' };
        case 'EU': return { amount: '27', currency: 'EUR', display: '€27 /mo' };
        case 'NA': return { amount: '29', currency: 'USD', display: '$29 /mo' };
        case 'GLOBAL': return { amount: '29', currency: 'USD', display: '$29 /mo' };
        default: return { amount: '999', currency: 'INR', display: '₹999 /mo' };
      }
    } else {
      switch (region) {
        case 'MENA': return { amount: '1,099', currency: 'AED', display: '1,099 AED /mo' };
        case 'EU': return { amount: '279', currency: 'EUR', display: '€279 /mo' };
        case 'NA': return { amount: '299', currency: 'USD', display: '$299 /mo' };
        case 'GLOBAL': return { amount: '299', currency: 'USD', display: '$299 /mo' };
        default: return { amount: '9,999', currency: 'INR', display: '₹9,999 /mo' };
      }
    }
  };

  return (
    <RegionContext.Provider value={{
      region,
      config,
      setRegion,
      formatSalary,
      formatSalaryRange,
      formatPrice
    }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    // Graceful fallback if invoked outside provider
    return {
      region: 'IN' as RegionCode,
      config: REGION_CONFIGS.IN,
      setRegion: () => {},
      formatSalary: (amount: number) => `₹${(amount / 100000).toFixed(1)} LPA`,
      formatSalaryRange: (min: number, max?: number) => `₹${(min / 100000).toFixed(1)}L CTC`,
      formatPrice: (tier: 'pro' | 'recruiter') => tier === 'pro' ? { amount: '999', currency: 'INR', display: '₹999 /mo' } : { amount: '9,999', currency: 'INR', display: '₹9,999 /mo' }
    };
  }
  return context;
};
