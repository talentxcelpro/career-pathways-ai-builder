import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/ui/tier-badge';
import { useTieredAccess } from '@/hooks/useTieredAccess';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  title: string;
  to: string;
  icon?: React.ReactNode;
  requiresTier?: 'free' | 'pro' | 'enterprise';
  requiresAuth?: boolean;
  isPublic?: boolean;
}

export const TierAwareNavItem: React.FC<NavItemProps> = ({
  title,
  to,
  icon,
  requiresTier = 'free',
  requiresAuth = true,
  isPublic = false
}) => {
  const { hasFeatureAccess, currentTier, showUpgradePrompt } = useTieredAccess();
  const location = useLocation();
  const isActive = location.pathname === to;

  const canAccess = isPublic || hasFeatureAccess('navigation_access', requiresAuth);
  const hasTierAccess = currentTier === 'enterprise' || 
    (currentTier === 'pro' && ['free', 'pro'].includes(requiresTier)) ||
    (currentTier === 'free' && requiresTier === 'free');

  const handleClick = (e: React.MouseEvent) => {
    if (!canAccess || !hasTierAccess) {
      e.preventDefault();
      showUpgradePrompt(title, requiresTier);
    }
  };

  return (
    <div className="relative">
      {canAccess && hasTierAccess ? (
        <Link to={to}>
          <Button
            variant={isActive ? 'default' : 'ghost'}
            className={cn(
              "w-full justify-start gap-2",
              isActive && "bg-primary text-primary-foreground"
            )}
          >
            {icon}
            {title}
            {requiresTier !== 'free' && (
              <TierBadge tier={requiresTier} size="sm" />
            )}
          </Button>
        </Link>
      ) : (
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 opacity-60 cursor-not-allowed"
          onClick={handleClick}
        >
          {icon}
          {title}
          <Lock className="h-3 w-3 ml-auto" />
          {requiresTier !== 'free' && (
            <TierBadge tier={requiresTier} size="sm" />
          )}
        </Button>
      )}
    </div>
  );
};