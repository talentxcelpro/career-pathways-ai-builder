
import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SmartSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  suggestions: string[];
  onSuggestionSelect: (suggestion: string) => void;
  parsedQuery: any;
  isLoading: boolean;
  locations?: string[];
  industries?: string[];
  onLocationChange?: (location: string) => void;
  onIndustryChange?: (industry: string) => void;
  locationFilter?: string;
  industryFilter?: string;
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  suggestions,
  onSuggestionSelect,
  parsedQuery,
  isLoading,
  locations = [],
  industries = [],
  onLocationChange,
  onIndustryChange,
  locationFilter = 'all',
  industryFilter = 'all'
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    onSearchChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const renderParsedQuery = () => {
    if (!parsedQuery || !searchTerm) return null;

    const queryParts = [];
    if (parsedQuery.query) queryParts.push(`"${parsedQuery.query}"`);
    if (parsedQuery.location) queryParts.push(`in ${parsedQuery.location}`);
    if (parsedQuery.skills?.length) queryParts.push(`with ${parsedQuery.skills.join(', ')}`);
    if (parsedQuery.years_experience) queryParts.push(`${parsedQuery.years_experience}+ years exp`);

    return (
      <div className="flex items-center gap-2 mt-2">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <span className="text-sm text-gray-600">
          Searching for: {queryParts.join(' ') || searchTerm}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="🔍 Search people by name, job title, skills, location, or industry..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                  className="pl-10 pr-12 h-12 text-lg border-2 border-blue-200 focus:border-blue-500 transition-colors"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {isLoading && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-2 border-blue-100">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600 mb-2">Suggestions:</div>
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start text-left hover:bg-blue-50 transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <Search className="h-4 w-4 mr-2 text-blue-500" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Parsed Query Display */}
            {renderParsedQuery()}

            {/* Advanced Filters Toggle */}
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Advanced Filters
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Location</label>
                    <Select value={locationFilter} onValueChange={onLocationChange}>
                      <SelectTrigger>
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
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Industry</label>
                    <Select value={industryFilter} onValueChange={onIndustryChange}>
                      <SelectTrigger>
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
        </CardContent>
      </Card>
    </div>
  );
};
