import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Search, MapPin, Mic, TrendingUp, Clock, Building2, Filter,
  X, Sparkles, Brain, Target, Zap, Star, Globe, 
  ChevronDown, BookmarkPlus, Settings, History
} from "lucide-react";

interface IntelligentSearchBarProps {
  searchTerm: string;
  location: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
  className?: string;
}

const TRENDING_SEARCHES = [
  { term: "React Developer", count: "2.4K jobs", trend: "+12%" },
  { term: "SAP Consultant", count: "890 jobs", trend: "+8%" },
  { term: "Remote Work", count: "5.1K jobs", trend: "+25%" },
  { term: "Data Scientist", count: "1.2K jobs", trend: "+15%" },
  { term: "Product Manager", count: "980 jobs", trend: "+10%" }
];

const AI_SUGGESTIONS = [
  { role: "Frontend Developer", match: 95, salary: "₹8-15L", companies: 245 },
  { role: "Full Stack Engineer", match: 88, salary: "₹12-22L", companies: 156 },
  { role: "DevOps Engineer", match: 82, salary: "₹10-18L", companies: 89 },
  { role: "UI/UX Designer", match: 78, salary: "₹6-12L", companies: 134 }
];

const SMART_FILTERS = [
  { name: "Remote Only", icon: Globe, active: false },
  { name: "High Salary", icon: TrendingUp, active: false },
  { name: "Quick Apply", icon: Zap, active: false },
  { name: "Top Companies", icon: Star, active: false }
];

export const IntelligentSearchBar: React.FC<IntelligentSearchBarProps> = ({
  searchTerm,
  location,
  onSearchChange,
  onLocationChange,
  onSearch,
  className = ''
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [aiMode, setAiMode] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVoiceSearch = useCallback(() => {
    setIsListening(!isListening);
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onSearchChange(transcript);
        setSearchHistory(prev => [transcript, ...prev.slice(0, 4)]);
        setIsListening(false);
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.start();
    }
  }, [isListening, onSearchChange]);

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    setSearchHistory(prev => [suggestion, ...prev.filter(s => s !== suggestion).slice(0, 4)]);
    setShowSuggestions(false);
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  const handleAISearch = () => {
    setAiMode(true);
    // AI search implementation would go here
    onSearch();
  };

  return (
    <div className={`space-y-6 ${className}`} ref={searchRef}>
      {/* Main Search Interface */}
      <Card className="p-8 bg-gradient-to-br from-background via-muted/30 to-accent/5 border-2 border-primary/20 shadow-2xl rounded-3xl">
        <div className="space-y-6">
          {/* Search Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant={aiMode ? "default" : "outline"}
                size="sm"
                onClick={() => setAiMode(!aiMode)}
                className="font-semibold"
              >
                <Brain className="mr-2 h-4 w-4" />
                {aiMode ? "AI Mode: ON" : "Standard Search"}
              </Button>
              {aiMode && (
                <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI Enhanced
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button variant="ghost" size="sm">
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Saved
              </Button>
            </div>
          </div>

          {/* Enhanced Search Inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Job Search Input */}
            <div className="lg:col-span-2 relative">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={aiMode ? "Tell AI what job you're looking for..." : "Job title, skills, or company name"}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-12 pr-16 h-14 text-base border-2 border-primary/20 focus:border-primary/50 rounded-2xl bg-white/80 backdrop-blur-sm"
                />
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceSearch}
                    className={`h-10 w-10 p-0 ${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  {aiMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 text-purple-500"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Location Input */}
            <div className="relative">
              <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Location or Remote"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="pl-12 h-14 text-base border-2 border-primary/20 focus:border-primary/50 rounded-2xl bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Smart Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground">Quick Filters:</span>
            {SMART_FILTERS.map((filter, index) => (
              <Button
                key={index}
                variant={activeFilters.includes(filter.name) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(filter.name)}
                className="rounded-full"
              >
                <filter.icon className="mr-2 h-4 w-4" />
                {filter.name}
              </Button>
            ))}
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button 
              onClick={aiMode ? handleAISearch : onSearch}
              className="bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-lg px-8 h-10 rounded-full font-semibold"
            >
              {aiMode ? (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  AI Search
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Jobs
                </>
              )}
            </Button>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                  {filter}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeFilter(filter)}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilters([])}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Trending & AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Searches */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">🔥 Trending This Week</span>
            </div>
            <div className="space-y-2">
              {TRENDING_SEARCHES.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/60 rounded-xl cursor-pointer hover:bg-white/80 transition-colors"
                  onClick={() => handleSuggestionClick(item.term)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{item.term}</div>
                    <Badge variant="outline" className="text-xs">
                      {item.count}
                    </Badge>
                  </div>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    {item.trend}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* AI Recommendations */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">🧠 AI Recommendations</span>
            </div>
            <div className="space-y-2">
              {AI_SUGGESTIONS.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/60 rounded-xl cursor-pointer hover:bg-white/80 transition-colors"
                  onClick={() => handleSuggestionClick(item.role)}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{item.role}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.salary}</span>
                      <span>•</span>
                      <span>{item.companies} companies</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs">
                      {item.match}% match
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Recent Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleSuggestionClick(term)}
              >
                <Clock className="mr-1 h-3 w-3" />
                {term}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};