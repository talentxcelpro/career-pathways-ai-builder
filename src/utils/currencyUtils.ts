
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

export const formatSalaryRange = (min?: number, max?: number, lpa: boolean = true): string => {
  if (!min && !max) return "Salary not specified";
  
  const formatAmount = (amount: number) => {
    if (lpa) {
      // Convert to LPA format
      if (amount >= 100000) {
        return `${(amount / 100000).toFixed(0)} LPA`;
      } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K`;
      } else {
        return `${amount}`;
      }
    }
    return formatCurrency(amount);
  };
  
  if (min && max) return `₹${formatAmount(min)} - ${formatAmount(max)}`;
  if (min) return `₹${formatAmount(min)}+`;
  return `Up to ₹${formatAmount(max)}`;
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
