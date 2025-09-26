import React, { useState, useMemo } from 'react';
import { Search, Filter, Zap, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlobalSearch } from '@/components/ui/global-search';
import { useNaturalLanguageSearch } from '@/hooks/useNaturalLanguageSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { cn } from '@/lib/utils';

interface SearchHubProps {
  defaultTab?: 'natural' | 'global';
  className?: string;
}

export const SearchHub: React.FC<SearchHubProps> = ({
  defaultTab = 'global',
  className
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [naturalQuery, setNaturalQuery] = useState('');

  const {
    searchTerm: naturalSearchTerm,
    setSearchTerm: setNaturalSearchTerm,
    results: naturalResults,
    isLoading: naturalLoading,
    error: naturalError,
    parsedQuery,
    suggestions,
    selectSuggestion
  } = useNaturalLanguageSearch();

  const {
    results: globalResults,
    isLoading: globalLoading
  } = useGlobalSearch({ enabled: true });

  const handleNaturalSearch = (query: string) => {
    setNaturalQuery(query);
    setNaturalSearchTerm(query);
  };

  const searchSuggestions = useMemo(() => [
    'React developers in Mumbai with 3+ years experience',
    'Senior UI/UX designers for fintech startups',
    'Entry level data scientist positions',
    'Remote Python developers with machine learning skills',
    'Full-time marketing managers in Bangalore',
    'Frontend engineers proficient in Vue.js'
  ], []);

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Global Search
          </TabsTrigger>
          <TabsTrigger value="natural" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Everything
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GlobalSearch 
                placeholder="Search jobs, people, companies, hashtags..." 
                className="w-full"
              />
              
              {globalResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Recent Results ({globalResults.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {globalResults.slice(0, 6).map((result) => (
                      <Badge key={`${result.type}-${result.id}`} variant="outline">
                        {result.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="natural" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Natural Language Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Ask naturally: 'Find React developers in Mumbai with 3+ years experience' or 'Remote data scientist jobs with Python'"
                  value={naturalQuery}
                  onChange={(e) => handleNaturalSearch(e.target.value)}
                  className="pr-10"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  disabled={naturalLoading}
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggestions */}
              {!naturalQuery && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Try asking:</h4>
                  <div className="flex flex-wrap gap-2">
                    {searchSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleNaturalSearch(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active suggestions */}
              {suggestions.length > 0 && naturalQuery && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Suggestions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => selectSuggestion(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading state */}
              {naturalLoading && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Searching with AI...
                  </div>
                </div>
              )}

              {/* Error state */}
              {naturalError && (
                <div className="text-center py-4 text-destructive">
                  {naturalError}
                </div>
              )}

              {/* Parsed query display */}
              {parsedQuery && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">AI understood:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(parsedQuery).map(([key, value]) => (
                      value && (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                        </Badge>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {naturalResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Found {naturalResults.length} results
                  </h4>
                  <div className="grid gap-2">
                    {naturalResults.slice(0, 5).map((result: any) => (
                      <div key={result.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            💼
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{result.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.company_name} • {result.location}
                              {result.is_remote && ' • Remote'}
                            </p>
                            {result.relevance_score && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${Math.min(result.relevance_score * 5, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">Match</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};