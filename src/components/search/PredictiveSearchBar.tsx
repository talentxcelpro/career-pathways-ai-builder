import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePredictiveSearch } from '@/hooks/usePredictiveSearch';
import { Search, Briefcase, User, Building2, FileText, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PredictiveSearchBarProps {
  onResultClick?: (url: string) => void;
  className?: string;
  placeholder?: string;
}

export function PredictiveSearchBar({
  onResultClick,
  className,
  placeholder = 'Search jobs, people, companies...',
}: PredictiveSearchBarProps) {
  const { query, setQuery, results, suggestions, isLoading, recordClick } = usePredictiveSearch();
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const showResults = isFocused && (query || suggestions.length > 0);
  const displayItems = query ? results : suggestions.map(s => ({ query: s, type: 'suggestion' }));

  const handleResultClick = (result: any) => {
    if (result.type === 'suggestion') {
      setQuery(result.query);
    } else {
      recordClick(result.id);
      onResultClick?.(result.url);
      setQuery('');
      setIsFocused(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, displayItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (displayItems[selectedIndex]) {
          handleResultClick(displayItems[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        break;
    }
  };

  const getIcon = (type: string) => {
    const icons = {
      job: Briefcase,
      profile: User,
      company: Building2,
      post: FileText,
      suggestion: TrendingUp,
    };
    const Icon = icons[type as keyof typeof icons] || Search;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showResults && displayItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50"
          >
            <ScrollArea className="max-h-96">
              <div className="p-2">
                {displayItems.map((item: any, index) => (
                  <motion.button
                    key={item.id || item.query || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleResultClick(item)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                      'hover:bg-accent',
                      selectedIndex === index && 'bg-accent'
                    )}
                  >
                    <div className="mt-1">{getIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {item.title || item.query}
                      </div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {item.description}
                        </div>
                      )}
                      {item.metadata?.company && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.metadata.company}
                        </div>
                      )}
                    </div>
                    {item.score !== undefined && (
                      <div className="text-xs text-muted-foreground shrink-0">
                        {Math.round(item.score * 100)}% match
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
