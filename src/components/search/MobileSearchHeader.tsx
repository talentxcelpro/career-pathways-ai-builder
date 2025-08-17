import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MobileSearchHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  activeFilters?: string[];
  onClearFilters?: () => void;
}

export const MobileSearchHeader: React.FC<MobileSearchHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  showFilters,
  onToggleFilters,
  activeFilters = [],
  onClearFilters
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <div className={`flex items-center gap-2 p-3 rounded-2xl border transition-all duration-200 ${
          isFocused ? 'border-primary bg-white shadow-lg' : 'border-gray-200 bg-gray-50'
        }`}>
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search jobs, companies, skills..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            className="flex-1 border-0 bg-transparent focus:ring-0 focus:border-0 text-sm placeholder:text-gray-500"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="p-1 h-auto rounded-full hover:bg-gray-200"
            >
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          )}
          <Button
            onClick={onToggleFilters}
            variant="ghost"
            size="sm"
            className="p-2 h-auto rounded-full hover:bg-gray-200"
          >
            <Filter className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge 
              key={index}
              variant="secondary" 
              className="text-xs rounded-full bg-primary/10 text-primary border-primary/20"
            >
              {filter}
            </Badge>
          ))}
          {onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 p-1 h-auto"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Quick Search Suggestions */}
      {isFocused && !searchTerm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-3">Trending searches</p>
          <div className="flex flex-wrap gap-2">
            {['Software Engineer', 'Remote', 'Marketing', 'Data Science', 'UI/UX'].map((term) => (
              <Badge
                key={term}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => {
                  onSearchChange(term);
                  onSearch();
                }}
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};