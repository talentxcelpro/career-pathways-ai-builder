import React from 'react';
import { useRegion, REGION_CONFIGS, RegionCode } from '@/contexts/RegionContext';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface RegionSelectorProps {
  variant?: 'compact' | 'footer' | 'nav';
  className?: string;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({ variant = 'compact', className = '' }) => {
  const { region, setRegion, config } = useRegion();

  const regions: RegionCode[] = ['IN', 'MENA', 'EU', 'NA', 'GLOBAL'];

  if (variant === 'footer') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Globe className="h-3.5 w-3.5" />
          <span>Regional Market:</span>
        </span>
        <div className="flex flex-wrap gap-1">
          {regions.map((r) => {
            const item = REGION_CONFIGS[r];
            const isSelected = region === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{item.flag}</span>
                <span>{item.name.split(' ')[0]}</span>
                <span className="opacity-75 text-[10px]">({item.currency})</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 px-2 text-xs font-semibold rounded-lg border border-slate-200/80 dark:border-border/60 bg-white/80 dark:bg-card/80 backdrop-blur-xs hover:bg-slate-100 dark:hover:bg-muted flex items-center gap-1.5 shadow-2xs ${className}`}
        >
          <span className="text-sm">{config.flag}</span>
          <span className="hidden sm:inline text-[11px] font-bold text-foreground">{config.code}</span>
          <span className="text-[10px] text-muted-foreground font-medium">({config.currency})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-lg border border-slate-200/80 dark:border-border/60">
        <DropdownMenuLabel className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider px-2 py-1">
          Select Regional Market
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {regions.map((r) => {
          const item = REGION_CONFIGS[r];
          const isSelected = region === r;
          return (
            <DropdownMenuItem
              key={r}
              onClick={() => setRegion(r)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{item.flag}</span>
                <div>
                  <p className="leading-none text-xs">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Currency: {item.currency} ({item.currencySymbol.trim()})</p>
                </div>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
