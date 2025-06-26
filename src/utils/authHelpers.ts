
import { User } from '@supabase/supabase-js';

export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'Guest';
  
  // Try to get name from user metadata
  const fullName = user.user_metadata?.full_name;
  if (fullName) return fullName;
  
  // Fallback to email username
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
};

export const getUserInitials = (user: User | null): string => {
  const displayName = getUserDisplayName(user);
  
  if (displayName === 'Guest' || displayName === 'User') {
    return 'U';
  }
  
  const names = displayName.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  
  return displayName.slice(0, 2).toUpperCase();
};

export const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isPasswordStrong = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getRedirectPath = (location: any): string => {
  // Get the intended destination from location state
  const from = location.state?.from?.pathname;
  
  // If there's a valid return path, use it
  if (from && from !== '/login' && from !== '/register') {
    return from;
  }
  
  // Default redirect to dashboard
  return '/dashboard';
};
