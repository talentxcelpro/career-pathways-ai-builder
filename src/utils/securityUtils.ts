import { supabase } from '@/integrations/supabase/client';

/**
 * Comprehensive security utilities for robust system protection
 */

export interface SecurityEvent {
  eventType: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  autoBlock?: boolean;
}

export interface RateLimitConfig {
  actionType: string;
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes: number;
}

// Default rate limit configurations
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: {
    actionType: 'login_attempt',
    maxAttempts: 5,
    windowMinutes: 15,
    blockDurationMinutes: 30
  },
  registration: {
    actionType: 'registration_attempt',
    maxAttempts: 3,
    windowMinutes: 60,
    blockDurationMinutes: 120
  },
  password_reset: {
    actionType: 'password_reset_attempt',
    maxAttempts: 3,
    windowMinutes: 60,
    blockDurationMinutes: 120
  },
  api_call: {
    actionType: 'api_call',
    maxAttempts: 100,
    windowMinutes: 1,
    blockDurationMinutes: 5
  },
  admin_action: {
    actionType: 'admin_action',
    maxAttempts: 20,
    windowMinutes: 5,
    blockDurationMinutes: 60
  }
};

/**
 * Log comprehensive security events with threat detection
 */
export const logSecurityEvent = async (event: SecurityEvent): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Security event logged for unauthenticated user:', event.eventType);
    }

    const { data, error } = await supabase.rpc('log_security_event_comprehensive', {
      p_user_id: user?.id || null,
      p_event_type: event.eventType,
      p_description: event.description,
      p_severity: event.severity || 'medium',
      p_ip_address: null, // Will be captured server-side
      p_user_agent: navigator.userAgent,
      p_metadata: event.metadata || {},
      p_auto_block: event.autoBlock || false
    });

    if (error) {
      console.error('Failed to log security event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Security event logging error:', error);
    return false;
  }
};

/**
 * Check if user is rate limited for a specific action
 */
export const checkRateLimit = async (actionType: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('log_security_attempt', {
      p_action_type: actionType,
      p_success: true
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return false;
    }

    return data === true; // Function returns true if not blocked
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false;
  }
};

/**
 * Validate admin operations with enhanced security
 */
export const validateAdminOperation = async (
  requiredRole: 'super_admin' | 'admin' | 'moderator' = 'admin',
  operation: string = 'general',
  targetUserId?: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('validate_admin_operation_enhanced', {
      _required_role: requiredRole,
      _operation: operation,
      _target_user_id: targetUserId || null
    });

    if (error) {
      console.error('Admin validation error:', error);
      await logSecurityEvent({
        eventType: 'admin_validation_failed',
        description: `Admin validation failed for operation: ${operation}`,
        severity: 'high',
        metadata: { operation, error: error.message }
      });
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Admin validation error:', error);
    return false;
  }
};

/**
 * Enhanced input validation with security patterns
 */
export const validateSecureInput = async (
  input: string,
  inputType: 'general' | 'email' | 'url' | 'phone' | 'alphanumeric' = 'general',
  maxLength: number = 1000,
  allowHtml: boolean = false
): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedInput?: string;
}> => {
  try {
    // Client-side basic validation first
    if (!input || input.trim().length === 0) {
      return {
        valid: false,
        errors: ['Input cannot be empty'],
        warnings: []
      };
    }

    if (input.length > maxLength) {
      return {
        valid: false,
        errors: [`Input exceeds maximum length of ${maxLength} characters`],
        warnings: []
      };
    }

    // Server-side comprehensive validation
    const { data, error } = await supabase.rpc('validate_user_input_enhanced', {
      input_text: input,
      input_type: inputType,
      max_length: maxLength,
      allow_html: allowHtml
    });

    if (error) {
      console.error('Input validation error:', error);
      return {
        valid: false,
        errors: ['Validation service error'],
        warnings: []
      };
    }

    return {
      valid: data.valid,
      errors: data.errors || [],
      warnings: data.warnings || [],
      sanitizedInput: input // Could be enhanced with server-side sanitization
    };
  } catch (error) {
    console.error('Input validation error:', error);
    return {
      valid: false,
      errors: ['Validation failed'],
      warnings: []
    };
  }
};

/**
 * Security-aware fetch wrapper with automatic logging
 */
export const secureFetch = async (
  url: string,
  options: RequestInit = {},
  actionType: string = 'api_call'
): Promise<Response | null> => {
  try {
    // Check rate limit before making request
    const isAllowed = await checkRateLimit(actionType);
    if (!isAllowed) {
      await logSecurityEvent({
        eventType: 'rate_limit_blocked_request',
        description: `Request blocked due to rate limiting: ${url}`,
        severity: 'medium',
        metadata: { url, actionType }
      });
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // Log suspicious response patterns
    if (!response.ok) {
      await logSecurityEvent({
        eventType: 'api_error_response',
        description: `API request failed: ${response.status} ${response.statusText}`,
        severity: response.status >= 500 ? 'high' : 'medium',
        metadata: { 
          url, 
          status: response.status, 
          statusText: response.statusText,
          actionType 
        }
      });
    }

    return response;
  } catch (error) {
    await logSecurityEvent({
      eventType: 'api_request_error',
      description: `API request error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'medium',
      metadata: { url, error: String(error), actionType }
    });
    return null;
  }
};

/**
 * Monitor and log user activity patterns
 */
export const trackUserActivity = async (
  activityType: string,
  activityData: Record<string, any> = {}
): Promise<void> => {
  try {
    await logSecurityEvent({
      eventType: 'user_activity',
      description: `User activity: ${activityType}`,
      severity: 'low',
      metadata: {
        activity_type: activityType,
        ...activityData,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });
  } catch (error) {
    console.error('Activity tracking error:', error);
  }
};

/**
 * Enhanced session security validation
 */
export const validateSession = async (): Promise<{
  valid: boolean;
  warnings: string[];
  shouldRefresh: boolean;
}> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return {
        valid: false,
        warnings: ['No valid session found'],
        shouldRefresh: true
      };
    }

    const warnings: string[] = [];
    let shouldRefresh = false;

    // Check session age
    const sessionAge = Date.now() - new Date(session.user.created_at).getTime();
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxSessionAge) {
      warnings.push('Session is older than 24 hours');
      shouldRefresh = true;
    }

    // Check token expiration
    const expiresAt = session.expires_at || 0;
    const timeUntilExpiry = expiresAt - Math.floor(Date.now() / 1000);
    
    if (timeUntilExpiry < 300) { // Less than 5 minutes
      warnings.push('Session expires soon');
      shouldRefresh = true;
    }

    // Log session validation
    await logSecurityEvent({
      eventType: 'session_validation',
      description: 'Session security validation performed',
      severity: 'low',
      metadata: {
        session_age_hours: Math.floor(sessionAge / (1000 * 60 * 60)),
        time_until_expiry_minutes: Math.floor(timeUntilExpiry / 60),
        warnings_count: warnings.length
      }
    });

    return {
      valid: true,
      warnings,
      shouldRefresh
    };
  } catch (error) {
    await logSecurityEvent({
      eventType: 'session_validation_error',
      description: `Session validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'high',
      metadata: { error: String(error) }
    });

    return {
      valid: false,
      warnings: ['Session validation failed'],
      shouldRefresh: true
    };
  }
};

export default {
  logSecurityEvent,
  checkRateLimit,
  validateAdminOperation,
  validateSecureInput,
  secureFetch,
  trackUserActivity,
  validateSession,
  DEFAULT_RATE_LIMITS
};