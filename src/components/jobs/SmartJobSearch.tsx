
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, TrendingUp } from "lucide-react";

interface SmartJobSearchProps {
  searchTerm: string;
  location: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
}

export const SmartJobSearch: React.FC<SmartJobSearchProps> = ({
  searchTerm,
  location,
  onSearchChange,
  onLocationChange,
  onSearch
}) => {
  const trendingSearches = [
    "Frontend Developer", "Marketing Lead", "Data Scientist", 
    "UI/UX Designer", "Product Manager", "Full Stack Developer"
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          🌟 Find Your Next Opportunity
        </h2>
        <p className="text-gray-600 text-sm">
          Smart search. Tailored filters. AI-driven recommendations.
          Your career growth starts here.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Enter role, company, keywords..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            <div className="text-xs text-gray-500 mt-1">
              Example: "Frontend Developer", "Marketing Lead", "Wipro"
            </div>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Enter city or state (e.g., Bengaluru, Delhi)"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button onClick={onSearch} className="px-8">
            🔎 Search Jobs
          </Button>
          
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" className="rounded" />
            <span>Show Remote Jobs Only</span>
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Trending Searches:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((term) => (
              <Badge 
                key={term}
                variant="outline" 
                className="cursor-pointer hover:bg-blue-50"
                onClick={() => onSearchChange(term)}
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
