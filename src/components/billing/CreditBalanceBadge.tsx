// src/components/billing/CreditBalanceBadge.tsx
// Displays current AI Credit balance with quick top-up action

import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

interface CreditBalanceBadgeProps {
  balance: number;
  onTopUpClick: () => void;
  className?: string;
  variant?: 'compact' | 'expanded';
}

export const CreditBalanceBadge: React.FC<CreditBalanceBadgeProps> = ({
  balance,
  onTopUpClick,
  className = '',
  variant = 'compact'
}) => {
  const isLow = balance <= 2;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
        isLow
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-blue-50/80 border-blue-200/80 text-blue-900'
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <Sparkles className={`w-3.5 h-3.5 ${isLow ? 'text-amber-600' : 'text-blue-600'}`} />
        <span>
          <strong className="font-semibold">{balance}</strong> {variant === 'expanded' ? 'AI Credits Available' : 'Credits'}
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTopUpClick();
        }}
        className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs transition-transform active:scale-95 ${
          isLow
            ? 'bg-amber-600 hover:bg-amber-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        title="Top up AI Credits"
      >
        <Plus className="w-2.5 h-2.5" />
        <span>Add</span>
      </button>
    </div>
  );
};
