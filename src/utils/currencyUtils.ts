
// Currency utility functions for INR formatting
export const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount) return "Not specified";
  
  // Format for Indian currency system using Thousand & Lacs
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} Lacs`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)} Thousand`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

export const formatSalaryRange = (min?: number, max?: number): string => {
  if (!min && !max) return "Salary not specified";
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  if (min) return `${formatCurrency(min)}+`;
  return `Up to ${formatCurrency(max)}`;
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}k`;
  } else {
    return `₹${amount}`;
  }
};
