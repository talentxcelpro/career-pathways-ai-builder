
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
    // Check for unrealistic salary ranges and correct them
    if (salaryRange.includes('Cr') || salaryRange.includes('crore')) {
      // Convert unrealistic crore amounts to reasonable LPA
      const crMatch = salaryRange.match(/(\d+(?:\.\d+)?)-?(\d+(?:\.\d+)?)?.*?Cr/i);
      if (crMatch) {
        const min = parseFloat(crMatch[1]);
        const max = crMatch[2] ? parseFloat(crMatch[2]) : min;
        // Convert from crores to reasonable LPA (divide by 100)
        const reasonableMin = Math.max(3, Math.min(min / 100, 50));
        const reasonableMax = Math.max(reasonableMin + 5, Math.min(max / 100, 80));
        return `₹${reasonableMin.toFixed(0)}-${reasonableMax.toFixed(0)} LPA`;
      }
    }
    return salaryRange;
  }
  
  // Fallback to min/max if no salary_range
  if (!min && !max) return "Salary not specified";
  
  // Fix unrealistic salary values (if they're in crores, convert to reasonable amounts)
  if (min && min > 10000000) { // > 1 crore
    min = Math.max(300000, Math.min(min / 100, 5000000)); // Convert to 3L-50L range
  }
  if (max && max > 10000000) { // > 1 crore  
    max = Math.max(500000, Math.min(max / 100, 8000000)); // Convert to 5L-80L range
  }
  
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
