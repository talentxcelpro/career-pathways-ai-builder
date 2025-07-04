import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, Clock, X } from 'lucide-react';
import { AISearchService, SearchFilters } from '@/services/aiSearchService';
import { cn } from '@/lib/utils';

interface UniversalSearchBarProps {
  searchType: SearchFilters['search_type'];
  onSearch: (query: string, filters?: SearchFilters) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  showFilters?: boolean;
  defaultValue?: string;
}

export const UniversalSearchBar: React.FC<UniversalSearchBarProps> = ({
  searchType,
  onSearch,
  placeholder,
  className,
  showSuggestions = true,
  showFilters = true,
  defaultValue = ''
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const suggestions = AISearchService.getSearchSuggestions(searchType);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`recent_searches_${searchType}`);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, [searchType]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(`recent_searches_${searchType}`, JSON.stringify(updated));
  }, [recentSearches, searchType]);

  const handleSearch = useCallback(async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestionsDropdown(false);
    
    try {
      // Parse query with AI and get results
      let searchResult;
      let filters: SearchFilters | undefined;

      switch (searchType) {
        case 'jobs':
          searchResult = await AISearchService.searchJobs(searchQuery);
          filters = searchResult.filters;
          break;
        case 'companies':
          searchResult = await AISearchService.searchCompanies(searchQuery);
          filters = searchResult.filters;
          break;
        case 'learning':
          searchResult = await AISearchService.searchCourses(searchQuery);
          filters = searchResult.filters;
          break;
        case 'people':
          searchResult = await AISearchService.searchPeople(searchQuery);
          filters = searchResult.filters;
          break;
        case 'network':
          searchResult = await AISearchService.searchPosts(searchQuery);
          filters = searchResult.filters;
          break;
        default:
          filters = { query: searchQuery, search_type: searchType };
      }

      setActiveFilters(filters);
      saveRecentSearch(searchQuery);
      onSearch(searchQuery, filters);
    } catch (error) {
      console.error('Search failed:', error);
      onSearch(searchQuery);
    } finally {
      setIsSearching(false);
    }
  }, [query, searchType, onSearch, saveRecentSearch]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearFilter = (filterKey: string) => {
    if (!activeFilters) return;
    
    const updated = { ...activeFilters };
    delete updated[filterKey as keyof SearchFilters];
    setActiveFilters(updated);
    
    // Re-trigger search with updated filters
    onSearch(query, updated);
  };

  const getFilterDisplayValue = (key: string, value: any): string => {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (key.includes('salary') && typeof value === 'number') {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return String(value);
  };

  const getPlaceholderText = () => {
    if (placeholder) return placeholder;
    
    const placeholders = {
      jobs: 'Search jobs, skills, companies, or locations...',
      companies: 'Search companies by name, industry, or location...',
      learning: 'Search courses, skills, or topics...',
      people: 'Search people by name, role, or skills...',
      network: 'Search posts, topics, or hashtags...'
    };

    return placeholders[searchType] || 'Search...';
  };

  return (
    <div className={cn('relative w-full', className)}>
      {/* Main Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => showSuggestions && setShowSuggestionsDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            } else if (e.key === 'Escape') {
              setShowSuggestionsDropdown(false);
            }
          }}
          placeholder={getPlaceholderText()}
          className="pl-12 pr-20 h-10 text-sm border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
          disabled={isSearching}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <Button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="h-6 px-3 text-xs"
          >
            {isSearching ? (
              <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestionsDropdown && showSuggestions && (
        <Card
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 p-2 shadow-lg border-border"
        >
          {recentSearches.length > 0 && (
            <>
              <div className="flex items-center gap-1 mb-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Recent</span>
              </div>
              <div className="space-y-1 mb-3">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </>
          )}
          
          <div className="flex items-center gap-1 mb-2">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Try searching for</span>
          </div>
          <div className="space-y-1">
            {suggestions.slice(0, 6).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Active Filters */}
      {showFilters && activeFilters && (
        <div className="flex flex-wrap gap-1 mt-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (key === 'search_type' || key === 'query' || !value) return null;
            
            return (
              <Badge
                key={key}
                variant="secondary"
                className="text-xs px-2 py-1 flex items-center gap-1"
              >
                <span className="font-medium">{key.replace('_', ' ')}:</span>
                <span>{getFilterDisplayValue(key, value)}</span>
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};