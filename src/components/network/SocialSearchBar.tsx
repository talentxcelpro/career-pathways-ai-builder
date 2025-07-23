import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, MapPin, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SocialSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  locationFilter: string;
  onLocationChange: (location: string) => void;
  industryFilter: string;
  onIndustryChange: (industry: string) => void;
  locations?: string[];
  industries?: string[];
  isLoading?: boolean;
  totalCount?: number;
  hasResults?: boolean;
}

const SEARCH_SUGGESTIONS = [
  'Software Engineer',
  'Product Manager', 
  'Data Scientist',
  'UI/UX Designer',
  'Marketing Manager',
  'Business Analyst',
  'Full Stack Developer',
  'DevOps Engineer'
];

export const SocialSearchBar: React.FC<SocialSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  locationFilter,
  onLocationChange,
  industryFilter,
  onIndustryChange,
  locations = [],
  industries = [],
  isLoading = false,
  totalCount = 0,
  hasResults = true
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localValue, setLocalValue] = useState(searchTerm);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    onSearchChange(value);
    setShowSuggestions(value.length > 0 && value.length < 20);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocalValue(suggestion);
    onSearchChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setLocalValue('');
    onSearchChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = SEARCH_SUGGESTIONS.filter(suggestion =>
    localValue && suggestion.toLowerCase().includes(localValue.toLowerCase())
  ).slice(0, 5);

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto mb-8">
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <div className="p-6">
          {/* Main Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search people by name, title, company, skills..."
                value={localValue}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(localValue.length > 0 && localValue.length < 20)}
                className="pl-12 pr-20 h-14 text-lg border-0 bg-muted/20 focus:bg-background transition-all duration-200 rounded-full"
              />
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                </div>
              )}
              
              {/* Clear button */}
              {localValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-muted/40"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-0 bg-white/95 backdrop-blur-md">
                <div className="p-4">
                  <div className="space-y-1">
                    {filteredSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-left hover:bg-muted/40 transition-colors duration-150 rounded-lg"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Search className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span className="flex-1">{suggestion}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Results count */}
          {(searchTerm || locationFilter !== 'all' || industryFilter !== 'all') && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
                    Searching...
                  </span>
                ) : (
                  `${totalCount.toLocaleString()} people found`
                )}
              </p>
              
              {/* Active filters */}
              <div className="flex items-center gap-2">
                {locationFilter !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {locationFilter}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                      onClick={() => onLocationChange('all')}
                    />
                  </Badge>
                )}
                {industryFilter !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {industryFilter}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                      onClick={() => onIndustryChange('all')}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full mt-4 justify-center text-muted-foreground hover:text-foreground">
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Location</label>
                  <Select value={locationFilter} onValueChange={onLocationChange}>
                    <SelectTrigger className="bg-muted/20 border-0">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Industry</label>
                  <Select value={industryFilter} onValueChange={onIndustryChange}>
                    <SelectTrigger className="bg-muted/20 border-0">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>
    </div>
  );
};