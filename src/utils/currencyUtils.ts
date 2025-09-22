
// Production-ready TXC token utility functions
import { formatTXCToUSD } from '@/config/constants';

export const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount) return "Not specified";
  
  // Format for INR currency system
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

// Get USD value for INR amount (conversion rate: 1 USD = 83 INR approximately)
export const getINRUSDValue = (inrAmount: number): string => {
  const usdAmount = inrAmount / 83;
  return `$${usdAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

// Enhanced INR range formatting with frequency support
export const formatSalaryRange = (
  min?: number, 
  max?: number, 
  lpa: boolean = true, 
  salaryRange?: string, 
  frequency: 'hourly' | 'monthly' | 'yearly' = 'yearly'
): string => {
  // First check if we have a salary_range string (for quality jobs)
  if (salaryRange && salaryRange.trim() !== '') {
    // Return salary range as-is if it already contains INR symbols
    if (salaryRange.includes('₹') || salaryRange.includes('INR') || salaryRange.includes('Rs')) {
      return salaryRange;
    }
    // Convert TXC references back to INR for display
    return salaryRange.replace(/TXC/gi, '₹').replace(/\s+/g, ' ').trim();
  }
  
  // Fallback to min/max if no salary_range
  if (!min && !max) return "Salary not specified";
  
  // Use values as-is for INR display (no conversion needed)
  const minValue = min || 0;
  const maxValue = max || 0;
  
  const formatAmount = (amount: number) => {
    if (frequency === 'hourly') {
      return `₹${amount.toLocaleString('en-IN')}/hr`;
    }
    
    if (frequency === 'monthly') {
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L/month`;
      } else if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(0)}K/month`;
      } else {
        return `₹${amount.toLocaleString('en-IN')}/month`;
      }
    }
    
    // Yearly format (default)
    if (lpa) {
      if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)} Cr`;
      } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
      } else if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(0)}K`;
      } else {
        return `₹${amount}`;
      }
    }
    return formatCurrency(amount);
  };
  
  if (minValue && maxValue) return `${formatAmount(minValue)} - ${formatAmount(maxValue)}`;
  if (minValue) return `${formatAmount(minValue)}+`;
  return `Up to ${formatAmount(maxValue)}`;
};

// Normalize salary to annual for comparison
export const normalizeSalaryToAnnual = (
  amount: number, 
  frequency: 'hourly' | 'monthly' | 'yearly' = 'yearly'
): number => {
  switch (frequency) {
    case 'hourly':
      return amount * 40 * 52; // 40 hours/week * 52 weeks
    case 'monthly':
      return amount * 12;
    case 'yearly':
    default:
      return amount;
  }
};

// Detect salary frequency from text patterns
export const detectSalaryFrequency = (text: string): 'hourly' | 'monthly' | 'yearly' => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('/hr') || lowerText.includes('per hour') || lowerText.includes('hourly')) {
    return 'hourly';
  }
  
  if (lowerText.includes('/month') || lowerText.includes('per month') || lowerText.includes('monthly')) {
    return 'monthly';
  }
  
  return 'yearly'; // Default
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(0)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  } else {
    return `₹${amount}`;
  }
};
