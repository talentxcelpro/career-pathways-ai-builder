
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

// Enhanced salary range formatting with frequency support
export const formatSalaryRange = (
  min?: number, 
  max?: number, 
  lpa: boolean = true, 
  salaryRange?: string, 
  frequency: 'hourly' | 'monthly' | 'yearly' = 'yearly'
): string => {
  // First check if we have a salary_range string (for quality jobs)
  if (salaryRange && salaryRange.trim() !== '') {
    return salaryRange;
  }
  
  // Fallback to min/max if no salary_range
  if (!min && !max) return "Salary not specified";
  
  const formatAmount = (amount: number) => {
    if (frequency === 'hourly') {
      return `${amount.toLocaleString('en-IN')}/hr`;
    }
    
    if (frequency === 'monthly') {
      if (amount >= 100000) {
        return `${(amount / 100000).toFixed(1)} L/month`;
      } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K/month`;
      } else {
        return `${amount.toLocaleString('en-IN')}/month`;
      }
    }
    
    // Yearly format (default)
    if (lpa) {
      if (amount >= 100000) {
        return `${(amount / 100000).toFixed(1)} LPA`;
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
    return `${(amount / 100000).toFixed(0)}L`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`;
  } else {
    return `${amount}`;
  }
};
