import React from 'react';
import { Search, Brain, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppleJobHeaderProps {
  totalCount: number;
  filters: any;
  setFilters: (filters: any) => void;
  experienceLevel: string;
  setExperienceLevel: (level: string) => void;
  onRefetch: () => void;
}

export const AppleJobHeader: React.FC<AppleJobHeaderProps> = ({
  totalCount,
  filters,
  setFilters,
  experienceLevel,
  setExperienceLevel,
  onRefetch
}) => {
  return (
    <div className="bg-background/80 backdrop-blur-xl border-b border-border/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center p-1 shadow-sm">
              <img 
                src="/talentxcel-official-logo.png" 
                alt="TalentXcel" 
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <Brain className="icon-apple-sm text-primary" />
              <h1 className="text-apple-body font-apple-semibold text-foreground">
                AI Career Discovery
              </h1>
            </div>
          </div>
          <div className="bg-muted/50 text-foreground px-3 py-1 rounded-full text-apple-small font-apple-medium flex items-center gap-1">
            <Zap className="icon-apple-xs text-primary" />
            {totalCount.toLocaleString()} Jobs
          </div>
        </div>
        
        {/* Apple-style compact search */}
        <div className="flex gap-2 items-center max-w-4xl mx-auto mt-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 icon-apple-xs text-muted-foreground" />
              <Input
                placeholder="Search jobs, skills, companies"
                value={filters.search}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                  if (e.target.value.length > 2) {
                    setTimeout(() => onRefetch(), 500);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onRefetch();
                  }
                }}
                className="pl-8 h-9 text-apple-caption border-border/30 focus:ring-1 focus:ring-primary/30 rounded-xl"
              />
            </div>
          </div>
          
          <Select 
            value={experienceLevel} 
            onValueChange={(value) => {
              setExperienceLevel(value);
              setFilters(prev => ({ 
                ...prev, 
                experience_level: value === 'all' ? [] : [value] 
              }));
              setTimeout(() => onRefetch(), 100);
            }}
          >
            <SelectTrigger className="h-9 w-32 text-apple-caption border-border/30 rounded-xl">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Experience</SelectItem>
              <SelectItem value="Entry level">Entry Level</SelectItem>
              <SelectItem value="Mid level">Mid Level</SelectItem>
              <SelectItem value="Senior level">Senior Level</SelectItem>
              <SelectItem value="Executive">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};