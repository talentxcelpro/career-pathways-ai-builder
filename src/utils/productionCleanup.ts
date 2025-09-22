// Production cleanup utilities - removes development artifacts for launch
import { ENV } from '@/lib/environment';

// Safe console replacement for production
export const productionConsole = {
  log: ENV.isDevelopment ? console.log : () => {},
  warn: ENV.isDevelopment ? console.warn : () => {},
  error: console.error, // Always keep errors for monitoring
  info: ENV.isDevelopment ? console.info : () => {},
  debug: ENV.isDevelopment ? console.debug : () => {},
};

// Remove development console logs from production builds
export const cleanupDevelopmentLogs = () => {
  if (ENV.isProduction && typeof window !== 'undefined') {
    ['log', 'info', 'debug', 'warn'].forEach(method => {
      (window.console as any)[method] = () => {};
    });
  }
};

// Initialize production cleanup
cleanupDevelopmentLogs();

// Data validation utility
export const validateProductionData = (data: any, context: string = 'data'): boolean => {
  if (!data) {
    if (ENV.isDevelopment) {
      console.warn(`⚠️ ${context}: No data received`);
    }
    return false;
  }
  
  // Check for mock data indicators
  const dataStr = JSON.stringify(data).toLowerCase();
  const mockIndicators = [
    'mock', 'fake', 'test', 'dummy', 'example.com', 
    'lorem ipsum', '192.168.', 'localhost', '127.0.0.1',
    'john doe', 'jane doe', 'placeholder'
  ];
  
  const hasMockData = mockIndicators.some(indicator => dataStr.includes(indicator));
  
  if (hasMockData && ENV.isProduction) {
    console.error(`❌ Production Error: Mock data detected in ${context}`);
    return false;
  }
  
  return true;
};

// Fetch production data with fallback and validation
export const fetchProductionData = async <T>(
  fetcher: () => Promise<T>,
  fallback: T,
  context: string = 'unknown'
): Promise<T> => {
  try {
    const data = await fetcher();
    
    if (validateProductionData(data, context)) {
      return data;
    }
    
    // Return fallback if validation fails
    if (ENV.isDevelopment) {
      console.warn(`⚠️ Using fallback data for ${context}`);
    }
    return fallback;
    
  } catch (error) {
    if (ENV.isDevelopment) {
      console.error(`❌ Error fetching ${context}:`, error);
    }
    return fallback;
  }
};

// Remove test users from data arrays
export const removeTestUsers = (users: any[]): any[] => {
  if (!Array.isArray(users)) return users;
  
  return users.filter(user => {
    const email = user.email || user.user_email || '';
    const name = user.full_name || user.name || '';
    
    // Filter out test users
    const isTestUser = 
      email.includes('@test.com') ||
      email.includes('@example.com') ||
      email.includes('@upload.local') ||
      name.toLowerCase().includes('test') ||
      name.toLowerCase().includes('dummy') ||
      name.toLowerCase() === 'candidate' ||
      name.toLowerCase().includes('lorem');
    
    return !isTestUser;
  });
};

// Clean mock data from API responses
export const cleanMockData = (data: any): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(cleanMockData).filter(item => {
      // Remove obvious test items
      const str = JSON.stringify(item).toLowerCase();
      return !str.includes('mock') && !str.includes('test@example.com');
    });
  }
  
  if (typeof data === 'object') {
    const cleaned = { ...data };
    
    Object.keys(cleaned).forEach(key => {
      const value = cleaned[key];
      
      if (typeof value === 'string') {
        // Replace mock emails
        if (value.includes('@example.com') || value.includes('@test.com')) {
          cleaned[key] = value.replace(/@(example|test)\.com/g, '@talentxcel.in');
        }
        
        // Replace mock IPs
        if (value.includes('192.168.') || value.includes('127.0.0.1')) {
          cleaned[key] = 'Production Environment';
        }
        
        // Replace lorem ipsum
        if (value.toLowerCase().includes('lorem ipsum')) {
          cleaned[key] = 'Professional content for career advancement';
        }
      }
      
      if (typeof value === 'object') {
        cleaned[key] = cleanMockData(value);
      }
    });
    
    return cleaned;
  }
  
  return data;
};