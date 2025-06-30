
import { useMemo } from 'react';

export const useJobExpiration = (createdAt: string, expiresAt?: string) => {
  const expirationInfo = useMemo(() => {
    const now = new Date();
    const created = new Date(createdAt);
    const expires = expiresAt ? new Date(expiresAt) : new Date(created.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days
    
    const timeDiff = expires.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    const isExpired = daysDiff <= 0;
    const isExpiringSoon = daysDiff <= 3 && daysDiff > 0;
    
    let statusText = '';
    let statusColor = '';
    
    if (isExpired) {
      statusText = 'Expired';
      statusColor = 'text-red-600';
    } else if (isExpiringSoon) {
      statusText = `Expires in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`;
      statusColor = 'text-yellow-600';
    } else {
      statusText = `Expires in ${daysDiff} days`;
      statusColor = 'text-green-600';
    }
    
    return {
      expiresAt: expires,
      daysRemaining: daysDiff,
      isExpired,
      isExpiringSoon,
      statusText,
      statusColor
    };
  }, [createdAt, expiresAt]);
  
  return expirationInfo;
};
