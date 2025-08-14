import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrefillButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  variant?: 'ai' | 'template' | 'bulk';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}

export function PrefillButton({
  onClick,
  isLoading = false,
  variant = 'ai',
  size = 'md',
  children,
  className,
}: PrefillButtonProps) {
  const getIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    
    switch (variant) {
      case 'ai':
        return <Sparkles className="h-4 w-4" />;
      case 'template':
        return <Zap className="h-4 w-4" />;
      case 'bulk':
        return <Zap className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'ai':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';
      case 'template':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600';
      case 'bulk':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  const getText = () => {
    if (children) return children;
    
    switch (variant) {
      case 'ai':
        return isLoading ? 'Generating...' : 'AI Prefill';
      case 'template':
        return isLoading ? 'Loading...' : 'Quick Fill';
      case 'bulk':
        return isLoading ? 'Applying...' : 'Bulk Fill';
      default:
        return isLoading ? 'Loading...' : 'Prefill';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-xs';
      case 'md':
        return 'h-10 px-4 text-sm';
      case 'lg':
        return 'h-12 px-6 text-base';
      default:
        return 'h-10 px-4 text-sm';
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'text-white border-0 font-medium transition-all duration-200',
        'shadow-lg hover:shadow-xl transform hover:scale-[1.02]',
        getVariantStyles(),
        getSizeClass(),
        className
      )}
    >
      {getIcon()}
      <span className="ml-2">{getText()}</span>
    </Button>
  );
}