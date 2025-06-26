
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from '@/contexts/CurrencyContext';

interface CurrencySelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Select currency"
}) => {
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  
  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setCurrency(newValue);
    }
  };

  const currentValue = value || currency;

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {availableCurrencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{curr.symbol}</span>
              <span>{curr.code}</span>
              <span className="text-gray-500">- {curr.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
