
import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface PeopleSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  industryFilter: string;
  setIndustryFilter: (industry: string) => void;
}

export const PeopleSearch: React.FC<PeopleSearchProps> = ({
  searchTerm,
  setSearchTerm,
  locationFilter,
  setLocationFilter,
  industryFilter,
  setIndustryFilter
}) => {
  // Local search state to prevent excessive re-renders
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  // Debounce search to prevent excessive queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, setSearchTerm]);

  // Update local state when prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Generate smart search suggestions based on input
  const generateSearchSuggestions = useCallback((input: string) => {
    if (!input || input.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const suggestions = [];
    const lowerInput = input.toLowerCase();

    // Technology suggestions
    if (['dev', 'prog', 'code', 'tech', 'soft'].some(term => lowerInput.includes(term))) {
      suggestions.push('Software Engineers', 'Frontend Developers', 'Full Stack Developers');
    }

    // Business suggestions
    if (['manage', 'lead', 'business', 'product'].some(term => lowerInput.includes(term))) {
      suggestions.push('Product Managers', 'Team Leaders', 'Business Analysts');
    }

    // Design suggestions
    if (['design', 'ui', 'ux', 'creative'].some(term => lowerInput.includes(term))) {
      suggestions.push('UI/UX Designers', 'Creative Directors', 'Graphic Designers');
    }

    // Experience level suggestions
    if (['senior', 'experienced', 'expert'].some(term => lowerInput.includes(term))) {
      suggestions.push('Senior Professionals', 'Industry Experts');
    }

    if (['junior', 'entry', 'new', 'fresh'].some(term => lowerInput.includes(term))) {
      suggestions.push('Entry Level', 'Junior Developers', 'New Graduates');
    }

    setSearchSuggestions(suggestions.slice(0, 3));
  }, []);

  useEffect(() => {
    generateSearchSuggestions(localSearchTerm);
  }, [localSearchTerm, generateSearchSuggestions]);
  // Fetch unique locations from user profiles
  const { data: locations } = useQuery({
    queryKey: ['unique-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('location')
        .not('location', 'is', null)
        .neq('location', '');
        
      if (error) throw error;
      
      const uniqueLocations = [...new Set(data?.map(item => item.location?.trim()).filter(Boolean))];
      return uniqueLocations.sort();
    }
  });

  // Fetch unique industries from user profiles
  const { data: industries } = useQuery({
    queryKey: ['unique-industries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('industry')
        .not('industry', 'is', null)
        .neq('industry', '');
        
      if (error) throw error;
      
      const uniqueIndustries = [...new Set(data?.map(item => item.industry?.trim()).filter(Boolean))];
      return uniqueIndustries.sort();
    }
  });

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
          Smart Search & Filter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Try: 'software engineers in NYC' or 'senior product managers'"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations?.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries?.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Smart Suggestions */}
          {searchSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600">Suggestions:</span>
              {searchSuggestions.map((suggestion, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => {
                    setLocalSearchTerm(suggestion);
                    setSearchSuggestions([]);
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
