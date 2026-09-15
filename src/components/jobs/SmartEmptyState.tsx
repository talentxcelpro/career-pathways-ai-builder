import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, MapPin, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ActiveFilter {
  key: string;
  label: string;
}

interface SmartEmptyStateProps {
  activeFilters?: ActiveFilter[];
  onClearFilter?: (key: string) => void;
  onClearAll?: () => void;
  trendingRoles?: string[];
  className?: string;
}

const DEFAULT_TRENDING = [
  'Frontend Engineer',
  'Product Manager',
  'Data Analyst',
  'DevOps Engineer',
  'UX Designer',
  'Backend Engineer',
];

const SMART_SUGGESTIONS = [
  { emoji: '🏠', label: 'Try Remote', action: 'remote' },
  { emoji: '🎯', label: 'Entry Level', action: 'entry' },
  { emoji: '💰', label: 'High Salary', action: 'salary' },
  { emoji: '⚡', label: 'Easy Apply', action: 'easy' },
];

export const SmartEmptyState: React.FC<SmartEmptyStateProps> = ({
  activeFilters = [],
  onClearFilter,
  onClearAll,
  trendingRoles = DEFAULT_TRENDING,
  className,
}) => {
  const navigate = useNavigate();

  const hasFilters = activeFilters.length > 0;

  return (
    <div className={cn('flex flex-col items-center text-center py-12 px-4 max-w-lg mx-auto', className)}>
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center">
          <Search className="h-10 w-10 text-slate-300" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
          <span className="text-base">🤔</span>
        </div>
      </div>

      <h3 className="text-xl font-black text-slate-900 mb-2">
        {hasFilters ? 'No exact matches' : 'No jobs found'}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        {hasFilters
          ? "Your filters are too specific — try relaxing some to discover more opportunities."
          : "We couldn't find jobs matching your search. Try different keywords or browse trending roles."}
      </p>

      {/* Active filters — quick removal chips */}
      {hasFilters && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => onClearFilter?.(f.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors group"
            >
              <span>{f.label}</span>
              <span className="text-red-400 group-hover:text-red-600">×</span>
            </button>
          ))}
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Clear all
          </button>
        </div>
      )}

      {/* Smart suggestions */}
      <div className="w-full mb-8">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
          Try instead
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SMART_SUGGESTIONS.map(({ emoji, label, action }) => (
            <button
              key={action}
              onClick={() => {
                if (action === 'remote') onClearAll?.();
                else if (action === 'salary') onClearAll?.();
                else onClearAll?.();
              }}
              className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md transition-all duration-200 text-left group"
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trending roles */}
      <div className="w-full mb-8">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Trending right now
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {trendingRoles.map((role) => (
            <Badge
              key={role}
              variant="outline"
              className="cursor-pointer rounded-full border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors font-semibold text-slate-600 py-1.5 px-4"
            >
              {role}
            </Badge>
          ))}
        </div>
      </div>

      {/* TalentXcel Navigator CTA */}
      <div className="w-full rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-violet-600" />
          <span className="text-xs font-extrabold text-violet-700 uppercase tracking-wider">AI Career Coach</span>
        </div>
        <p className="text-sm font-bold text-slate-800 mb-1">
          Can't find what you're looking for?
        </p>
        <p className="text-xs text-slate-500 mb-4">
          Tell our TalentXcel Navigator your target role and get personalized job leads, skill gap analysis, and a step-by-step plan.
        </p>
        <Button
          onClick={() => navigate('/intelligence-navigator')}
          className="w-full h-10 rounded-xl bg-violet-600 text-white hover:bg-violet-700 font-bold text-sm"
        >
          Talk to TalentXcel Navigator
        </Button>
      </div>

      {/* Browse all */}
      <button
        onClick={onClearAll}
        className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
      >
        Browse all jobs →
      </button>
    </div>
  );
};

