import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Clock, Building2, Users, Briefcase, FileText, Globe, BookOpen, Sparkles } from 'lucide-react';
import { MobileNavWrapper } from '@/components/layout/MobileNavWrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUniversalSearch } from '@/hooks/useUniversalSearch';
import type { SearchEntityType } from '@/services/search/universal/types';

function getCategoryIcon(type: SearchEntityType) {
  switch (type) {
    case 'jobs':
      return <Briefcase className="w-5 h-5 text-blue-600" />;
    case 'people':
    case 'talent':
    case 'connections':
      return <Users className="w-5 h-5 text-purple-600" />;
    case 'companies':
      return <Building2 className="w-5 h-5 text-emerald-600" />;
    case 'communities':
      return <Globe className="w-5 h-5 text-cyan-600" />;
    case 'posts':
      return <FileText className="w-5 h-5 text-amber-600" />;
    case 'articles':
    case 'courses':
      return <BookOpen className="w-5 h-5 text-indigo-600" />;
    default:
      return <Search className="w-5 h-5 text-gray-600" />;
  }
}

export const MobileSearch = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const {
    query: searchTerm,
    setQuery: setSearchTerm,
    activeCategory,
    setActiveCategory,
    response,
    isLoading,
    recentSearches,
    recordClick,
  } = useUniversalSearch({ enabled: true, debounceMs: 250, limitPerScope: 8 });

  const results = response?.topResults || [];
  const availableGroups = response
    ? Object.values(response.groups).filter((g): g is NonNullable<typeof g> => Boolean(g && g.items.length > 0))
    : [];

  return (
    <MobileNavWrapper>
      <div className="bg-white native-app-style ios-scroll">
        {/* Search Bar */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 safe-area-top z-20">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs, people, posts, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 touch-feedback"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="touch-feedback"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Filter Chips */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(['all', 'jobs', 'people', 'posts', 'companies', 'communities', 'courses'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                    activeCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Intent Chips */}
          {response && response.intent.explanationChips.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              {response.intent.explanationChips.map((chip) => (
                <Badge key={chip} variant="secondary" className="text-[10px]">
                  {chip}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Search Suggestions */}
              {searchTerm.trim().length < 2 && (
                <div className="space-y-4">
                  <div className="native-card p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Try Natural Language Search</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Remote Python developer jobs',
                        'HR managers in Bengaluru',
                        'Jobs for freshers in Delhi',
                        'Posts about AI recruitment',
                        'Startup communities',
                      ].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchTerm(term)}
                          className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 touch-feedback text-left"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {recentSearches.length > 0 && (
                    <div className="native-card p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Recent Searches</h3>
                      <div className="space-y-2">
                        {recentSearches.slice(0, 5).map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchTerm(search)}
                            className="w-full flex items-center gap-3 py-2 touch-feedback text-left"
                          >
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{search}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Live Results */}
              {searchTerm.trim().length >= 2 && results.length > 0 && (
                <div className="space-y-3">
                  {availableGroups.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {availableGroups.map((g) => (
                        <Badge
                          key={g.type}
                          variant={activeCategory === g.type ? 'default' : 'outline'}
                          className="cursor-pointer whitespace-nowrap"
                          onClick={() => setActiveCategory(activeCategory === g.type ? 'all' : g.type)}
                        >
                          {g.label} ({g.totalCount})
                        </Badge>
                      ))}
                    </div>
                  )}

                  {results.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => {
                        recordClick(result.type, result.id);
                        navigate(result.url);
                      }}
                      className="native-card p-4 touch-feedback cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          {getCategoryIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{result.title}</h3>
                            <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                              {result.type}
                            </Badge>
                          </div>
                          {result.subtitle && (
                            <p className="text-sm text-gray-600 mt-1 truncate">{result.subtitle}</p>
                          )}
                          {result.matchReasons.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.matchReasons.map((reason) => (
                                <span
                                  key={reason}
                                  className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded"
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                          )}
                          {typeof result.metadata?.location === 'string' && result.metadata.location && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{result.metadata.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searchTerm.trim().length >= 2 && results.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-sm text-gray-600 mb-4">Try adjusting your search terms or filters</p>
                  {response?.emptyAlternatives && response.emptyAlternatives.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {response.emptyAlternatives.map((alt) => (
                        <Button
                          key={alt.query}
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchTerm(alt.query)}
                        >
                          {alt.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MobileNavWrapper>
  );
};

export default MobileSearch;
