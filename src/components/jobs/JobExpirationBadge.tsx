
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, X } from 'lucide-react';
import { useJobExpiration } from '@/hooks/useJobExpiration';

interface JobExpirationBadgeProps {
  createdAt: string;
  expiresAt?: string;
  showIcon?: boolean;
}

export const JobExpirationBadge: React.FC<JobExpirationBadgeProps> = ({ 
  createdAt, 
  expiresAt,
  showIcon = true 
}) => {
  const { isExpired, isExpiringSoon, statusText, statusColor } = useJobExpiration(createdAt, expiresAt);

  const getIcon = () => {
    if (isExpired) return <X className="h-3 w-3" />;
    if (isExpiringSoon) return <AlertTriangle className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  const getBadgeVariant = () => {
    if (isExpired) return 'destructive';
    if (isExpiringSoon) return 'secondary';
    return 'outline';
  };

  return (
    <Badge variant={getBadgeVariant()} className={`${statusColor} flex items-center gap-1`}>
      {showIcon && getIcon()}
      {statusText}
    </Badge>
  );
};
