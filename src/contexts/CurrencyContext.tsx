
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  availableCurrencies: Currency[];
  formatCurrency: (amount: number, currencyCode?: string) => string;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency?: string) => Promise<number>;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

const availableCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>('USD');

  // Get current user's currency preference
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Get user profile with currency preference
  const { data: profile } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_currency')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.id
  });

  useEffect(() => {
    if (profile?.preferred_currency) {
      setCurrencyState(profile.preferred_currency);
    }
  }, [profile]);

  const setCurrency = async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    
    // Update user preference in database
    if (currentUser?.id) {
      await supabase
        .from('profiles')
        .update({ preferred_currency: newCurrency })
        .eq('id', currentUser.id);
    }
  };

  const formatCurrency = (amount: number, currencyCode: string = currency): string => {
    const currencyInfo = availableCurrencies.find(c => c.code === currencyCode);
    const symbol = currencyInfo?.symbol || '$';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace(/[^\d,.-]/g, '').replace(/^/, symbol);
  };

  const convertCurrency = async (amount: number, fromCurrency: string, toCurrency: string = currency): Promise<number> => {
    if (fromCurrency === toCurrency) return amount;
    
    try {
      const { data } = await supabase
        .from('currency_rates')
        .select('rate')
        .eq('base_currency', fromCurrency)
        .eq('target_currency', toCurrency)
        .maybeSingle();
      
      if (data?.rate) {
        return amount * Number(data.rate);
      }
      
      // Fallback to approximate conversion if no rate found
      return amount;
    } catch (error) {
      console.error('Currency conversion failed:', error);
      return amount;
    }
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      availableCurrencies,
      formatCurrency,
      convertCurrency
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
