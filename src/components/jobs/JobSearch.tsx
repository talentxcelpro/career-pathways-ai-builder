
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Filter } from "lucide-react";

interface JobSearchProps {
  searchTerm: string;
  location: string;
  onSearchChange: (search: string) => void;
  onLocationChange: (location: string) => void;
  onSearch: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
}

export const JobSearch: React.FC<JobSearchProps> = ({
  searchTerm,
  location,
  onSearchChange,
  onLocationChange,
  onSearch,
  onToggleFilters,
  showFilters
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Job title, company, or keywords"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        
        <div className="relative flex-1 md:max-w-xs">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onSearch} className="px-8">
            Search
          </Button>
          <Button
            variant="outline"
            onClick={onToggleFilters}
            className={`md:hidden ${showFilters ? 'bg-gray-100' : ''}`}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
        <span>Quick filters:</span>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Remote
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Full-time
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Entry Level
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Tech
          </Button>
        </div>
      </div>
    </div>
  );
};
