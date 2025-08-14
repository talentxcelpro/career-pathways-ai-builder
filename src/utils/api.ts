import { supabase } from '@/integrations/supabase/client';
import { APIResponse } from '@/types/platform';

class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1';
    this.timeout = 10000;
  }

  async request<T = any>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<APIResponse<T>> {
    const startTime = Date.now();
    
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': session ? `Bearer ${session.access_token}` : '',
      };

      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: options.body,
        headers: { ...defaultHeaders, ...options.headers }
      });

      const responseTime = Date.now() - startTime;
      
      // Log API call for monitoring
      this.logAPICall(endpoint, options.method || 'POST', responseTime, !error);

      if (error) {
        console.error(`API Error [${endpoint}]:`, error);
        return {
          success: false,
          error: error.message || 'API request failed',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`Network Error [${endpoint}]:`, error);
      
      this.logAPICall(endpoint, options.method || 'POST', responseTime, false);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }

  private logAPICall(endpoint: string, method: string, responseTime: number, success: boolean) {
    const logData = {
      endpoint,
      method,
      responseTime,
      success,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${method} ${endpoint} - ${success ? 'SUCCESS' : 'FAILED'} (${responseTime}ms)`);
    }

    // Could also send to analytics service
    try {
      localStorage.setItem(
        'api_logs',
        JSON.stringify([
          ...JSON.parse(localStorage.getItem('api_logs') || '[]').slice(-99), // Keep last 100 logs
          logData
        ])
      );
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  // Career Passport APIs
  async getCareerPassport(userId: string) {
    return this.request<any>('career-passport-api', {
      body: { action: 'get', userId }
    });
  }

  async updateCareerPassport(userId: string, updates: Partial<any>) {
    return this.request<any>('career-passport-api', {
      body: { action: 'update', userId, updates }
    });
  }

  // Public Profile APIs
  async getPublicProfile(userId: string) {
    return this.request<any>('public-profile-api', {
      body: { action: 'get', userId }
    });
  }

  async generateQRCode(userId: string) {
    return this.request<any>('qr-generator', {
      body: { userId }
    });
  }

  // Module APIs
  async getModuleProgress(userId: string, moduleName: string) {
    return this.request<any>('module-progress-api', {
      body: { action: 'get', userId, moduleName }
    });
  }

  async updateModuleProgress(userId: string, moduleName: string, progress: any) {
    return this.request<any>('module-progress-api', {
      body: { action: 'update', userId, moduleName, progress }
    });
  }

  // Analytics APIs
  async getPlatformAnalytics(userId: string) {
    return this.request<any>('platform-analytics', {
      body: { userId }
    });
  }

  // AI-powered APIs
  async generatePrefill(module: string, context: any) {
    return this.request<any>('ai-prefill-generator', {
      body: { module, ...context }
    });
  }

  async enhanceResume(resumeData: any, jobDescription?: string) {
    return this.request<any>('ai-resume-enhancer', {
      body: { action: 'enhance', resumeData, jobDescription }
    });
  }

  async getCareerRecommendations(userId: string) {
    return this.request<any>('ai-career-advisor', {
      body: { action: 'recommendations', userId }
    });
  }

  // Error recovery with exponential backoff
  async retryRequest<T>(
    requestFn: () => Promise<APIResponse<T>>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<APIResponse<T>> {
    let lastError: APIResponse<T>;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFn();
        if (result.success) {
          return result;
        }
        lastError = result;
      } catch (error) {
        lastError = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return lastError!;
  }
}

export const apiClient = new APIClient();

// Convenience methods with error handling and fallbacks
export const safeApiCall = async <T>(
  apiFunction: () => Promise<APIResponse<T>>,
  fallbackData?: T
): Promise<T | null> => {
  try {
    const result = await apiFunction();
    if (result.success && result.data) {
      return result.data;
    }
    
    console.warn('API call failed:', result.error);
    return fallbackData || null;
  } catch (error) {
    console.error('API call error:', error);
    return fallbackData || null;
  }
};

export default apiClient;