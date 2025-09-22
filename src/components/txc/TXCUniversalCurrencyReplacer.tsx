import React from 'react';

/**
 * Universal component that replaces all currency references with TXC
 * This component can be used to wrap any content and automatically convert currency displays
 */
export const TXCUniversalCurrencyReplacer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const convertCurrencyToTXC = (text: string): string => {
    // Replace common currency patterns with TXC
    return text
      // Replace Indian Rupees
      .replace(/₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(L|Lac|Lacs|K|Thousand|Cr|Crore)?/gi, (match, amount, unit) => {
        const numAmount = parseFloat(amount.replace(/,/g, ''));
        if (unit?.toLowerCase().includes('cr') || unit?.toLowerCase().includes('crore')) {
          return `${(numAmount * 10000).toLocaleString()} TXC`;
        } else if (unit?.toLowerCase().includes('l') || unit?.toLowerCase().includes('lac')) {
          return `${(numAmount * 1000).toLocaleString()} TXC`;
        } else if (unit?.toLowerCase().includes('k') || unit?.toLowerCase().includes('thousand')) {
          return `${(numAmount * 10).toLocaleString()} TXC`;
        }
        return `${numAmount.toLocaleString()} TXC`;
      })
      // Replace USD
      .replace(/\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(K|M|B)?/gi, (match, amount, unit) => {
        const numAmount = parseFloat(amount.replace(/,/g, ''));
        if (unit?.toLowerCase() === 'b') {
          return `${(numAmount * 80000000).toLocaleString()} TXC`;
        } else if (unit?.toLowerCase() === 'm') {
          return `${(numAmount * 80000).toLocaleString()} TXC`;
        } else if (unit?.toLowerCase() === 'k') {
          return `${(numAmount * 80).toLocaleString()} TXC`;
        }
        return `${(numAmount * 80).toLocaleString()} TXC`;
      })
      // Replace generic price/cost/salary references
      .replace(/\b(\d+(?:,\d+)*(?:\.\d+)?)\s*(LPA|per annum|annually)\b/gi, (match, amount) => {
        const numAmount = parseFloat(amount.replace(/,/g, ''));
        return `${(numAmount * 10).toLocaleString()} TXC annually`;
      })
      // Replace rupees text
      .replace(/\b(\d+(?:,\d+)*(?:\.\d+)?)\s*rupees?\b/gi, (match, amount) => {
        const numAmount = parseFloat(amount.replace(/,/g, ''));
        return `${numAmount.toLocaleString()} TXC`;
      })
      // Replace dollars text
      .replace(/\b(\d+(?:,\d+)*(?:\.\d+)?)\s*dollars?\b/gi, (match, amount) => {
        const numAmount = parseFloat(amount.replace(/,/g, ''));
        return `${(numAmount * 80).toLocaleString()} TXC`;
      });
  };

  // If children is a string, convert it
  if (typeof children === 'string') {
    return <>{convertCurrencyToTXC(children)}</>;
  }

  // For React elements, we need to recursively process text nodes
  const processElement = (element: React.ReactNode): React.ReactNode => {
    if (typeof element === 'string') {
      return convertCurrencyToTXC(element);
    }
    
    if (React.isValidElement(element)) {
      // Clone the element and process its children
      return React.cloneElement(element, {
        ...element.props,
        children: React.Children.map(element.props.children, processElement)
      });
    }
    
    return element;
  };

  return <>{React.Children.map(children, processElement)}</>;
};

// Utility function to convert any currency string to TXC
export const convertToTXC = (text: string): string => {
  return text
    .replace(/₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(L|Lac|Lacs|K|Thousand|Cr|Crore)?/gi, (match, amount, unit) => {
      const numAmount = parseFloat(amount.replace(/,/g, ''));
      if (unit?.toLowerCase().includes('cr') || unit?.toLowerCase().includes('crore')) {
        return `${(numAmount * 10000).toLocaleString()} TXC`;
      } else if (unit?.toLowerCase().includes('l') || unit?.toLowerCase().includes('lac')) {
        return `${(numAmount * 1000).toLocaleString()} TXC`;
      } else if (unit?.toLowerCase().includes('k') || unit?.toLowerCase().includes('thousand')) {
        return `${(numAmount * 10).toLocaleString()} TXC`;
      }
      return `${numAmount.toLocaleString()} TXC`;
    })
    .replace(/\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(K|M|B)?/gi, (match, amount, unit) => {
      const numAmount = parseFloat(amount.replace(/,/g, ''));
      if (unit?.toLowerCase() === 'b') {
        return `${(numAmount * 80000000).toLocaleString()} TXC`;
      } else if (unit?.toLowerCase() === 'm') {
        return `${(numAmount * 80000).toLocaleString()} TXC`;
      } else if (unit?.toLowerCase() === 'k') {
        return `${(numAmount * 80).toLocaleString()} TXC`;
      }
      return `${(numAmount * 80).toLocaleString()} TXC`;
    })
    .replace(/\b(\d+(?:,\d+)*(?:\.\d+)?)\s*(LPA|per annum|annually)\b/gi, (match, amount) => {
      const numAmount = parseFloat(amount.replace(/,/g, ''));
      return `${(numAmount * 10).toLocaleString()} TXC annually`;
    });
};

// Hook for easy currency conversion
export const useTXCConversion = () => {
  return {
    convertToTXC,
    convertRupeesToTXC: (rupees: number): number => rupees,
    convertUSDToTXC: (usd: number): number => usd * 80,
    formatTXC: (amount: number): string => `${amount.toLocaleString()} TXC`
  };
};