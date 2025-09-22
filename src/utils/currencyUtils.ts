
// Production-ready TXC token utility functions
import { formatTXCToUSD } from '@/config/constants';

export const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount) return "Not specified";
  
  // Format for TXC token system only
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)}L TXC`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K TXC`;
  } else {
    return `${amount.toLocaleString('en-IN')} TXC`;
  }
};

// Get USD value for TXC amount
export const getTXCUSDValue = (txcAmount: number): string => {
  return formatTXCToUSD(txcAmount);
};

// Enhanced TXC range formatting with frequency support
export const formatSalaryRange = (
  min?: number, 
  max?: number, 
  lpa: boolean = true, 
  salaryRange?: string, 
  frequency: 'hourly' | 'monthly' | 'yearly' = 'yearly'
): string => {
  // First check if we have a salary_range string (for quality jobs)
  if (salaryRange && salaryRange.trim() !== '') {
    // Check for unrealistic salary ranges and correct them
    if (salaryRange.includes('Cr') || salaryRange.includes('crore')) {
      // Convert unrealistic crore amounts to reasonable TXC
      const crMatch = salaryRange.match(/(\d+(?:\.\d+)?)-?(\d+(?:\.\d+)?)?.*?Cr/i);
      if (crMatch) {
        const min = parseFloat(crMatch[1]);
        const max = crMatch[2] ? parseFloat(crMatch[2]) : min;
        // Convert from crores to reasonable TXC (multiply by 10000)
        const reasonableMin = Math.max(30000, Math.min(min * 10000, 500000));
        const reasonableMax = Math.max(reasonableMin + 50000, Math.min(max * 10000, 800000));
        return `${reasonableMin.toLocaleString()}-${reasonableMax.toLocaleString()} TXC`;
      }
    }
    // Convert any legacy currency symbols to TXC (production cleanup)
    return salaryRange.replace(/₹|Rs\.?|INR|LPA|L/gi, 'TXC').replace(/\s+/g, ' ').trim();
  }
  
  // Fallback to min/max if no salary_range
  if (!min && !max) return "TXC not specified";
  
  // Fix unrealistic values (convert to reasonable TXC amounts)
  if (min && min > 10000000) { // > 1 crore, convert to TXC
    min = Math.max(30000, Math.min(min / 100, 500000)); // Convert to 30K-500K TXC range
  }
  if (max && max > 10000000) { // > 1 crore, convert to TXC
    max = Math.max(50000, Math.min(max / 100, 800000)); // Convert to 50K-800K TXC range
  }
  
  const formatAmount = (amount: number) => {
    if (frequency === 'hourly') {
      return `${amount.toLocaleString('en-IN')} TXC/hr`;
    }
    
    if (frequency === 'monthly') {
      if (amount >= 100000) {
        return `${(amount / 100000).toFixed(1)}L TXC/month`;
      } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K TXC/month`;
      } else {
        return `${amount.toLocaleString('en-IN')} TXC/month`;
      }
    }
    
    // Yearly format (default)
    if (lpa) {
      if (amount >= 100000) {
        return `${(amount / 100000).toFixed(1)}L TXC`;
      } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K TXC`;
      } else {
        return `${amount} TXC`;
      }
    }
    return formatCurrency(amount);
  };
  
  if (min && max) return `${formatAmount(min)} - ${formatAmount(max)} TXC`;
  if (min) return `${formatAmount(min)}+ TXC`;
  return `Up to ${formatAmount(max)} TXC`;
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
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(0)}L TXC`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K TXC`;
  } else {
    return `${amount} TXC`;
  }
};
