
// Currency utility functions for INR formatting
export const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount) return "Not specified";
  
  // Format for Indian currency system using Thousand & Lacs
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)} Lacs`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)} Thousand`;
  } else {
    return `${amount.toLocaleString('en-IN')}`;
  }
};

export const formatSalaryRange = (min?: number, max?: number, monthly: boolean = false): string => {
  if (!min && !max) return "Salary not specified";
  
  // Convert yearly to monthly if needed
  const formatAmount = (amount: number) => {
    if (monthly && amount >= 100000) {
      // Convert yearly to monthly (divide by 12)
      return formatCurrency(Math.round(amount / 12));
    }
    return formatCurrency(amount);
  };
  
  if (min && max) return `₹${formatAmount(min)} - ${formatAmount(max)}${monthly ? '/month' : ''}`;
  if (min) return `₹${formatAmount(min)}+${monthly ? '/month' : ''}`;
  return `Up to ₹${formatAmount(max)}${monthly ? '/month' : ''}`;
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(0)}L`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`;
  } else {
    return `${amount}`;
  }
};
