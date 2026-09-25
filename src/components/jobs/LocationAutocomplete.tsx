/**
 * LocationAutocomplete
 * Searchable combobox for the 1,194-location corpus.
 * Debounced search, country flag, state label, canonical value output.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Search, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchLocations, getTopLocationsByCountry, LocationSearchResult } from '@/config/jobs/locationSearch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface LocationAutocompleteProps {
  value?: string;
  onChange: (canonical: string, result?: LocationSearchResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Default country code to pre-populate popular options (default: 'IN') */
  defaultCountry?: string;
  required?: boolean;
  id?: string;
  name?: string;
  error?: string;
}

const DEBOUNCE_MS = 220;

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value = '',
  onChange,
  placeholder = 'Search city, e.g. Dubai, London, San Francisco, Bengaluru…',
  className,
  disabled = false,
  defaultCountry = 'IN',
  required = false,
  id,
  name,
  error,
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedLabel, setSelectedLabel] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show popular cities when empty
  const showPopular = useCallback(() => {
    const popular = getTopLocationsByCountry(defaultCountry, 12);
    setResults(popular);
    setOpen(true);
  }, [defaultCountry]);

  const handleSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      showPopular();
      return;
    }
    debounceRef.current = setTimeout(() => {
      const found = searchLocations(q, 12);
      setResults(found);
      setOpen(true);
    }, DEBOUNCE_MS);
  }, [showPopular]);

  // Keep local query in sync when parent value changes
  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
      setSelectedLabel(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setSelectedLabel(q);
    setActiveIndex(-1);
    onChange(q);
    handleSearch(q);
  };

  const handleSelect = (result: LocationSearchResult) => {
    setQuery(result.displayLabel);
    setSelectedLabel(result.displayLabel);
    onChange(result.canonical, result);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedLabel('');
    onChange('', undefined);
    inputRef.current?.focus();
    showPopular();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        showPopular();
        return;
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!inputRef.current?.parentElement?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isEmpty = !query.trim();

  return (
    <div className={cn('relative w-full', className)}>
      {/* Input wrapper */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (!open) showPopular(); setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={cn(
            'pl-9 pr-16 h-10 text-sm',
            error && 'border-destructive ring-destructive/20',
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
              tabIndex={-1}
              aria-label="Clear location"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </div>
      </div>

      {/* Error */}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg overflow-hidden">
          {isEmpty && (
            <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium border-b flex items-center gap-1.5">
              <Search className="h-3 w-3" />
              Popular tech hubs
            </div>
          )}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-64 overflow-y-auto py-1"
            aria-label="Location suggestions"
          >
            {results.map((result, index) => (
              <li
                key={result.slug}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm transition-colors select-none',
                  index === activeIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50',
                )}
              >
                <span className="text-base flex-shrink-0">{result.flag}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium truncate">{result.cityName}</span>
                  {result.stateName && (
                    <span className="text-muted-foreground text-xs ml-1.5">{result.stateName}</span>
                  )}
                </div>
                {result.tier === 1 && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 font-normal flex-shrink-0">
                    Metro
                  </Badge>
                )}
              </li>
            ))}
          </ul>
          {!isEmpty && results.length === 0 && (
            <div className="px-3 py-3 text-sm text-muted-foreground text-center">
              No locations found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
