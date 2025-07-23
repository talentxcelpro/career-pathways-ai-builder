
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SimpleSearchBar } from '@/components/network/SimpleSearchBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Users, MessageSquare } from "lucide-react";
import { usePeopleSearch } from '@/hooks/usePeopleSearch';
import { useProfileViews } from '@/hooks/useProfileViews';

const People = () => {
  const { trackProfileView } = useProfileViews();
  
  const {
    searchTerm,
    setSearchTerm,
    locationFilter,
    setLocationFilter,
    industryFilter,
    setIndustryFilter,
    results,
    isLoading,
    error,
    hasSearch
  } = usePeopleSearch();

  // Fetch unique locations
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

  // Fetch unique industries
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

  const handleProfileView = (profileId: string) => {
    trackProfileView(profileId);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading People</h2>
            <p className="text-gray-600">
              {error instanceof Error ? error.message : 'Failed to load people. Please try again.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect with People</h1>
        <p className="text-gray-600">
          {hasSearch 
            ? `Found ${results.length} people matching your search`
            : `Discover and connect with ${results.length} professionals`
          }
        </p>
      </div>

      <SimpleSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        locationFilter={locationFilter}
        onLocationChange={setLocationFilter}
        industryFilter={industryFilter}
        onIndustryChange={setIndustryFilter}
        locations={locations}
        industries={industries}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {hasSearch ? 'No people found' : 'No people available'}
            </h2>
            <p className="text-gray-600">
              {hasSearch 
                ? 'Try adjusting your search terms or filters'
                : 'Be the first to create a profile and connect with others'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((person) => (
            <Card key={person.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={person.profile_photo_url} alt={person.full_name} />
                    <AvatarFallback>
                      {person.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {person.full_name || 'Anonymous User'}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {person.current_position || person.user_role || 'Professional'}
                    </p>
                  </div>
                </div>

                {person.about && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {person.about}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {person.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="truncate">{person.location}</span>
                    </div>
                  )}
                  
                  {person.user_role && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-1" />
                      <span className="truncate capitalize">{person.user_role}</span>
                    </div>
                  )}
                </div>

                {person.skills && person.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {person.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {person.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{person.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleProfileView(person.id)}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Connect
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleProfileView(person.id)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default People;
