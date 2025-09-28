import { aiToolsRateLimiter } from './rateLimiter';

// Input validation utilities for TXC operations
export interface TXCValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

export class TXCSecurityValidator {
  // Validate TXC amounts
  static validateAmount(amount: any): TXCValidationResult {
    const errors: string[] = [];
    
    // Type validation
    if (typeof amount !== 'number') {
      errors.push('Amount must be a number');
      return { isValid: false, errors };
    }
    
    // Range validation
    if (amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    if (amount > 10000) {
      errors.push('Amount exceeds maximum allowed (10,000 TXC)');
    }
    
    // Precision validation (max 2 decimal places)
    if (amount % 0.01 !== 0) {
      errors.push('Amount cannot have more than 2 decimal places');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: Math.round(amount * 100) / 100
    };
  }

  // Validate user IDs
  static validateUserId(userId: any): TXCValidationResult {
    const errors: string[] = [];
    
    if (typeof userId !== 'string') {
      errors.push('User ID must be a string');
      return { isValid: false, errors };
    }
    
    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      errors.push('User ID must be a valid UUID');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: userId.toLowerCase()
    };
  }

  // Validate activity types for earning TXC
  static validateActivityType(activityType: any): TXCValidationResult {
    const errors: string[] = [];
    const allowedTypes = [
      'post_created', 'profile_completed', 'job_applied', 'connection_made',
      'skill_added', 'course_completed', 'achievement_earned', 'daily_login',
      'referral_signup', 'review_written', 'event_attended'
    ];
    
    if (typeof activityType !== 'string') {
      errors.push('Activity type must be a string');
      return { isValid: false, errors };
    }
    
    if (!allowedTypes.includes(activityType)) {
      errors.push(`Invalid activity type. Allowed: ${allowedTypes.join(', ')}`);
    }
    
    // Length validation
    if (activityType.length > 50) {
      errors.push('Activity type too long (max 50 characters)');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: activityType.toLowerCase().trim()
    };
  }

  // Validate descriptions and prevent XSS
  static validateDescription(description: any): TXCValidationResult {
    const errors: string[] = [];
    
    if (typeof description !== 'string') {
      errors.push('Description must be a string');
      return { isValid: false, errors };
    }
    
    // Length validation
    if (description.length > 500) {
      errors.push('Description too long (max 500 characters)');
    }
    
    // XSS prevention - basic sanitization
    const sanitized = description
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
    
    if (sanitized !== description) {
      errors.push('Description contains potentially unsafe content');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitized
    };
  }

  // Rate limiting check with user context
  static checkClientRateLimit(userId: string, action: string): boolean {
    const identifier = `${userId}:${action}`;
    const result = aiToolsRateLimiter.checkLimit(identifier);
    
    if (!result.allowed) {
      console.warn(`Rate limit exceeded for user ${userId} on action ${action}`);
      return false;
    }
    
    return true;
  }

  // Comprehensive transaction validation
  static validateTransaction(params: {
    fromUserId?: string;
    toUserId?: string;
    amount: number;
    description: string;
    activityType?: string;
  }): TXCValidationResult {
    const errors: string[] = [];
    
    // Validate amount
    const amountValidation = this.validateAmount(params.amount);
    if (!amountValidation.isValid) {
      errors.push(...amountValidation.errors);
    }
    
    // Validate user IDs if provided
    if (params.fromUserId) {
      const fromUserValidation = this.validateUserId(params.fromUserId);
      if (!fromUserValidation.isValid) {
        errors.push(...fromUserValidation.errors.map(e => `From user: ${e}`));
      }
    }
    
    if (params.toUserId) {
      const toUserValidation = this.validateUserId(params.toUserId);
      if (!toUserValidation.isValid) {
        errors.push(...toUserValidation.errors.map(e => `To user: ${e}`));
      }
    }
    
    // Validate description
    const descValidation = this.validateDescription(params.description);
    if (!descValidation.isValid) {
      errors.push(...descValidation.errors);
    }
    
    // Validate activity type if provided
    if (params.activityType) {
      const activityValidation = this.validateActivityType(params.activityType);
      if (!activityValidation.isValid) {
        errors.push(...activityValidation.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: {
        fromUserId: params.fromUserId?.toLowerCase(),
        toUserId: params.toUserId?.toLowerCase(),
        amount: amountValidation.sanitizedValue,
        description: descValidation.sanitizedValue,
        activityType: params.activityType ? this.validateActivityType(params.activityType).sanitizedValue : undefined
      }
    };
  }
}

// Security event logging
export const logTXCSecurityEvent = (event: {
  userId: string;
  action: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}) => {
  console.warn(`[TXC Security] ${event.severity.toUpperCase()}: ${event.action}`, {
    userId: event.userId,
    timestamp: new Date().toISOString(),
    details: event.details
  });
  
  // In production, this would send to a security monitoring service
  if (event.severity === 'critical') {
    // Could trigger alerts for critical security events
    console.error('[TXC CRITICAL SECURITY EVENT]', event);
  }
};

export default TXCSecurityValidator;