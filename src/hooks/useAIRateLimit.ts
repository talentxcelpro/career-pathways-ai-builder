import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RateLimitInfo {
  requestsRemaining: number;
  requestsUsed: number;
  maxRequests: number;
  resetTime: number;
  isLimited: boolean;
}

interface UseAIRateLimitReturn extends RateLimitInfo {
  canMakeRequest: () => boolean;
  recordRequest: () => void;
  getTimeUntilReset: () => number;
}

const RATE_LIMIT_STORAGE_KEY = 'ai_rate_limit';
const DEFAULT_RATE_LIMITS = {
  free: { maxRequests: 10, windowMinutes: 60 },
  pro: { maxRequests: 100, windowMinutes: 60 },
  enterprise: { maxRequests: 1000, windowMinutes: 60 },
};

export const useAIRateLimit = (feature?: string): UseAIRateLimitReturn => {
  const { user } = useAuth();
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({
    requestsRemaining: 0,
    requestsUsed: 0,
    maxRequests: 0,
    resetTime: 0,
    isLimited: false,
  });

  const getUserTier = useCallback(() => {
    // Determine user tier based on subscription or role
    // For now, using a simple check - in production, check actual subscription
    if (!user) return 'free';
    // Check if user has pro subscription or admin role
    return 'free'; // Default to free tier
  }, [user]);

  const getRateLimitData = useCallback(() => {
    const tier = getUserTier();
    const limits = DEFAULT_RATE_LIMITS[tier as keyof typeof DEFAULT_RATE_LIMITS];
    const storageKey = feature ? `${RATE_LIMIT_STORAGE_KEY}_${feature}` : RATE_LIMIT_STORAGE_KEY;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // Check if the rate limit window has expired
        if (now > data.resetTime) {
          // Reset the rate limit
          const newResetTime = now + (limits.windowMinutes * 60 * 1000);
          const newData = {
            requestsUsed: 0,
            resetTime: newResetTime,
          };
          localStorage.setItem(storageKey, JSON.stringify(newData));
          return {
            requestsUsed: 0,
            resetTime: newResetTime,
          };
        }
        
        return data;
      }
    } catch (error) {
      console.warn('Failed to parse rate limit data:', error);
    }
    
    // Initialize new rate limit data
    const resetTime = Date.now() + (limits.windowMinutes * 60 * 1000);
    const data = {
      requestsUsed: 0,
      resetTime,
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    return data;
  }, [getUserTier, feature]);

  const updateRateLimitInfo = useCallback(() => {
    const tier = getUserTier();
    const limits = DEFAULT_RATE_LIMITS[tier as keyof typeof DEFAULT_RATE_LIMITS];
    const data = getRateLimitData();
    
    const requestsUsed = data.requestsUsed;
    const requestsRemaining = Math.max(0, limits.maxRequests - requestsUsed);
    const isLimited = requestsUsed >= limits.maxRequests;
    
    setRateLimitInfo({
      requestsRemaining,
      requestsUsed,
      maxRequests: limits.maxRequests,
      resetTime: data.resetTime,
      isLimited,
    });
  }, [getUserTier, getRateLimitData]);

  const canMakeRequest = useCallback((): boolean => {
    const data = getRateLimitData();
    const tier = getUserTier();
    const limits = DEFAULT_RATE_LIMITS[tier as keyof typeof DEFAULT_RATE_LIMITS];
    
    return data.requestsUsed < limits.maxRequests;
  }, [getRateLimitData, getUserTier]);

  const recordRequest = useCallback(() => {
    const tier = getUserTier();
    const limits = DEFAULT_RATE_LIMITS[tier as keyof typeof DEFAULT_RATE_LIMITS];
    const storageKey = feature ? `${RATE_LIMIT_STORAGE_KEY}_${feature}` : RATE_LIMIT_STORAGE_KEY;
    
    try {
      const data = getRateLimitData();
      const newRequestsUsed = Math.min(data.requestsUsed + 1, limits.maxRequests);
      
      const updatedData = {
        ...data,
        requestsUsed: newRequestsUsed,
      };
      
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
      updateRateLimitInfo();
    } catch (error) {
      console.error('Failed to record AI request:', error);
    }
  }, [getUserTier, getRateLimitData, feature, updateRateLimitInfo]);

  const getTimeUntilReset = useCallback((): number => {
    const now = Date.now();
    return Math.max(0, rateLimitInfo.resetTime - now);
  }, [rateLimitInfo.resetTime]);

  useEffect(() => {
    updateRateLimitInfo();
    
    // Set up an interval to update the rate limit info
    const interval = setInterval(updateRateLimitInfo, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [updateRateLimitInfo]);

  return {
    ...rateLimitInfo,
    canMakeRequest,
    recordRequest,
    getTimeUntilReset,
  };
};