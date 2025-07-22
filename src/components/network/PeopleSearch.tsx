
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
          <Filter className="h-5 w-5 mr-2" />
          Search & Filter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, title, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
      </CardContent>
    </Card>
  );
};
