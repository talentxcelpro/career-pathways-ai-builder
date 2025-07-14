import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  MapPin, 
  Mic, 
  TrendingUp, 
  Clock, 
  Building2, 
  Filter,
  X
} from "lucide-react";

interface EnhancedSearchBarProps {
  searchTerm: string;
  location: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
  className?: string;
}

const TRENDING_SEARCHES = [
  "React Dev", "SAP Consultant", "Remote Jobs", "Noida", "10+ LPA"
];

const SUGGESTED_ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "DevOps Engineer", "UI/UX Designer",
  "Product Manager", "Business Analyst", "QA Engineer"
];

const SUGGESTED_COMPANIES = [
  "Google", "Microsoft", "Amazon", "TCS", "Infosys", "Wipro",
  "Accenture", "IBM", "Cognizant", "HCL"
];

const SUGGESTED_LOCATIONS = [
  "Bangalore", "Hyderabad", "Pune", "Chennai", "Mumbai", "Delhi",
  "Noida", "Gurgaon", "Kolkata", "Ahmedabad"
];

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
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

  const handleVoiceSearch = () => {
    setIsListening(!isListening);
    // Voice search implementation would go here
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onSearchChange(transcript);
        setIsListening(false);
      };
      recognition.start();
    }
  };

  const handleSuggestionClick = (suggestion: string, type: 'role' | 'company' | 'location') => {
    if (type === 'location') {
      onLocationChange(suggestion);
    } else {
      onSearchChange(suggestion);
    }
    setShowSuggestions(false);
  };

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  return (
    <div className={`space-y-6 ${className}`} ref={searchRef}>
      {/* Main Search Interface */}
      <Card className="p-6 bg-gradient-to-r from-background to-muted/50 border-2 border-primary/10">
        <div className="space-y-4">
          {/* Search Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Skills / Designations / Companies"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="pl-10 pr-12 h-12 text-base"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceSearch}
                className={`absolute right-2 top-2 h-8 w-8 p-0 ${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>

            {/* Location Input */}
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Experience"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {/* Additional Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Location</span>
              <Button variant="outline" size="sm" onClick={() => addFilter('Remote')}>
                Remote
              </Button>
            </div>
            
            <Button 
              onClick={onSearch}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 px-8 h-10"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {filter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter(filter)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Trending Searches */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">🌐 Suggested Searches:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRENDING_SEARCHES.map((term, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => onSearchChange(term)}
            >
              {term}
            </Badge>
          ))}
        </div>
      </div>

      {/* AI Search CTA */}
      <div className="text-center">
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8"
        >
          🧠 Ask AI to find best jobs for me
        </Button>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (searchTerm || location) && (
        <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Role Suggestions */}
            {searchTerm && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Job Roles</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_ROLES
                    .filter(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
                    .slice(0, 6)
                    .map((role, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-muted rounded cursor-pointer text-sm"
                        onClick={() => handleSuggestionClick(role, 'role')}
                      >
                        {role}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Location Suggestions */}
            {location && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Locations</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_LOCATIONS
                    .filter(loc => loc.toLowerCase().includes(location.toLowerCase()))
                    .slice(0, 6)
                    .map((loc, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-muted rounded cursor-pointer text-sm"
                        onClick={() => handleSuggestionClick(loc, 'location')}
                      >
                        {loc}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};