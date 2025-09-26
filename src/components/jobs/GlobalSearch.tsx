import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MapPin, Building, Code, Star, Clock, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { z } from 'zod';

// Input validation schema
const searchSchema = z.object({
  query: z.string().trim().max(200, "Search query must be less than 200 characters"),
  location: z.string().trim().max(100, "Location must be less than 100 characters").optional(),
  company: z.string().trim().max(100, "Company must be less than 100 characters").optional(),
});

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'job' | 'skill' | 'company' | 'location';
  count?: number;
  icon: React.ReactNode;
}

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onFiltersChange: (filters: any) => void;
  placeholder?: string;
  className?: string;
  recentJobs?: any[];
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  value,
  onChange,
  onSearch,
  onFiltersChange,
  placeholder = "Search jobs, skills, companies...",
  className = "",
  recentJobs = []
}) => {
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('talentxcel-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Generate smart suggestions based on input
  useEffect(() => {
    if (!value.trim()) {
      setSuggestions(getDefaultSuggestions());
      return;
    }

    const query = value.toLowerCase().trim();
    const newSuggestions: SearchSuggestion[] = [];

    // Job title suggestions
    const jobTitles = [
      'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
      'Data Scientist', 'Product Manager', 'UI/UX Designer',
      'DevOps Engineer', 'Software Engineer', 'Marketing Manager',
      'Business Analyst', 'Content Writer', 'Digital Marketing'
    ];

    // Skills suggestions
    const skills = [
      'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
      'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL',
      'Machine Learning', 'AI', 'Figma', 'Adobe Creative Suite'
    ];

    // Company suggestions
    const companies = [
      'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta',
      'Netflix', 'Uber', 'Airbnb', 'Spotify', 'Slack',
      'Flipkart', 'Zomato', 'Paytm', 'BYJU\'S', 'Swiggy'
    ];

    // Location suggestions
    const locations = [
      'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
      'Pune', 'Kolkata', 'Gurgaon', 'Noida', 'Remote'
    ];

    // Filter and add job title suggestions
    jobTitles
      .filter(title => title.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach(title => {
        newSuggestions.push({
          id: `job-${title}`,
          text: title,
          type: 'job',
          count: Math.floor(Math.random() * 500) + 50,
          icon: <Building className="h-4 w-4 text-blue-600" />
        });
      });

    // Filter and add skill suggestions
    skills
      .filter(skill => skill.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach(skill => {
        newSuggestions.push({
          id: `skill-${skill}`,
          text: skill,
          type: 'skill',
          count: Math.floor(Math.random() * 300) + 25,
          icon: <Code className="h-4 w-4 text-green-600" />
        });
      });

    // Filter and add company suggestions
    companies
      .filter(company => company.toLowerCase().includes(query))
      .slice(0, 2)
      .forEach(company => {
        newSuggestions.push({
          id: `company-${company}`,
          text: company,
          type: 'company',
          count: Math.floor(Math.random() * 100) + 10,
          icon: <Building className="h-4 w-4 text-purple-600" />
        });
      });

    // Filter and add location suggestions
    locations
      .filter(location => location.toLowerCase().includes(query))
      .slice(0, 2)
      .forEach(location => {
        newSuggestions.push({
          id: `location-${location}`,
          text: location,
          type: 'location',
          count: Math.floor(Math.random() * 200) + 30,
          icon: <MapPin className="h-4 w-4 text-orange-600" />
        });
      });

    setSuggestions(newSuggestions);
  }, [value]);

  const getDefaultSuggestions = (): SearchSuggestion[] => [
    {
      id: 'trending-1',
      text: 'Remote Software Engineer',
      type: 'job',
      count: 234,
      icon: <Star className="h-4 w-4 text-yellow-600" />
    },
    {
      id: 'trending-2',
      text: 'React Developer',
      type: 'skill',
      count: 156,
      icon: <Code className="h-4 w-4 text-blue-600" />
    },
    {
      id: 'trending-3',
      text: 'Product Manager',
      type: 'job',
      count: 89,
      icon: <Building className="h-4 w-4 text-green-600" />
    },
    {
      id: 'trending-4',
      text: 'Bangalore',
      type: 'location',
      count: 345,
      icon: <MapPin className="h-4 w-4 text-orange-600" />
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Validate input
    try {
      searchSchema.parse({ query: inputValue });
      onChange(inputValue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.warn('Invalid search input:', error.errors[0]?.message);
        // Still allow typing but don't process invalid input
        if (inputValue.length <= 200) {
          onChange(inputValue);
        }
      }
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const sanitizedText = suggestion.text.trim();
    onChange(sanitizedText);
    
    // Save to recent searches
    const newRecentSearches = [sanitizedText, ...recentSearches.filter(s => s !== sanitizedText)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('talentxcel-recent-searches', JSON.stringify(newRecentSearches));
    
    // Apply specific filters based on suggestion type
    if (suggestion.type === 'location') {
      onFiltersChange({ location: sanitizedText });
    } else if (suggestion.type === 'company') {
      onFiltersChange({ company_name: sanitizedText });
    } else {
      onFiltersChange({ search: sanitizedText });
    }
    
    setShowSuggestions(false);
    onSearch();
  };

  const handleVoiceSearch = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    setIsVoiceSearching(true);
    
    try {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const validatedInput = searchSchema.parse({ query: transcript }).query;
        onChange(validatedInput);
        onSearch();
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsVoiceSearching(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Voice search error:', error);
      setIsVoiceSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false);
      onSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    onChange('');
    onFiltersChange({ search: '', location: '', company_name: '' });
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('talentxcel-recent-searches');
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={suggestionsRef}>
      {/* Main Search Bar */}
      <div className="relative flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-10 h-10 text-sm border-2 border-primary/20 focus:border-primary/50 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm"
          />
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <Button
          size="sm"
          onClick={handleVoiceSearch}
          disabled={isVoiceSearching}
          variant="outline"
          className="h-10 px-3 border-2 border-primary/20 hover:border-primary/50"
        >
          <Mic className={`h-4 w-4 ${isVoiceSearching ? 'animate-pulse text-red-500' : ''}`} />
        </Button>
        
        <Button
          size="sm"
          onClick={onSearch}
          className="h-10 px-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Smart Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-4 z-50 shadow-xl border-2 border-primary/10 bg-white/95 backdrop-blur-sm max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && !value.trim() && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Searches
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-red-600"
                >
                  Clear
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    onClick={() => {
                      onChange(search);
                      setShowSuggestions(false);
                      onSearch();
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Smart Suggestions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {value.trim() ? 'Suggestions' : 'Trending Searches'}
            </h4>
            <div className="space-y-1">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors group"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center gap-3">
                    {suggestion.icon}
                    <div>
                      <span className="text-sm font-medium group-hover:text-primary">
                        {suggestion.text}
                      </span>
                      <div className="text-xs text-muted-foreground capitalize">
                        {suggestion.type === 'job' ? 'Job Title' : 
                         suggestion.type === 'skill' ? 'Skill' :
                         suggestion.type === 'company' ? 'Company' : 'Location'}
                      </div>
                    </div>
                  </div>
                  {suggestion.count && (
                    <Badge variant="outline" className="text-xs">
                      {suggestion.count}+ jobs
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {suggestions.length === 0 && value.trim() && (
            <div className="text-center py-4 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No suggestions found</p>
              <p className="text-xs">Press Enter to search for "{value}"</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};