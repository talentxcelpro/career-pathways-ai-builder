
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SocialSearchBar } from '@/components/network/SocialSearchBar';
import { SocialPagination } from '@/components/ui/social-pagination';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Users, MessageSquare, Star, Clock } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { usePeopleSearch } from '@/hooks/usePeopleSearch';
import { useProfileViews } from '@/hooks/useProfileViews';

const People = () => {
  const { trackProfileView } = useProfileViews();
  const navigate = useNavigate();
  
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
    hasSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount
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

  const handleProfileView = (person: any) => {
    trackProfileView(person.id);
    // Use username if available, fallback to ID
    const profilePath = person.username ? `/profile/${person.username}` : `/p/${person.id}`;
    navigate(profilePath);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">
            Connect with Professionals
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover talented professionals, build your network, and grow your career with TalentXcel's community.
          </p>
        </div>

          <SocialSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            locationFilter={locationFilter}
            onLocationChange={setLocationFilter}
            industryFilter={industryFilter}
            onIndustryChange={setIndustryFilter}
            locations={locations}
            industries={industries}
            isLoading={isLoading}
            totalCount={totalCount}
            hasResults={results.length > 0}
          />

          {/* Results Grid */}
          {results.length === 0 && !isLoading ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/20 flex items-center justify-center">
                <Users className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                {hasSearch ? 'No people found' : 'No professionals available'}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {hasSearch 
                  ? 'Try adjusting your search terms or filters to find the right professionals.'
                  : 'Be the first to create a profile and start building your network.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(isLoading ? Array.from({ length: 8 }) : results).map((person, index) => (
                <Card 
                  key={person?.id || index} 
                  className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/70 backdrop-blur-sm ${
                    isLoading ? 'animate-pulse' : 'cursor-pointer'
                  }`}
                >
                  <CardContent className="p-6">
                    {isLoading ? (
                      // Loading skeleton
                      <>
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-muted rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded mb-2"></div>
                            <div className="h-3 bg-muted rounded w-3/4"></div>
                          </div>
                        </div>
                        <div className="space-y-3 mb-4">
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-5/6"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-muted rounded flex-1"></div>
                          <div className="h-8 w-8 bg-muted rounded"></div>
                        </div>
                      </>
                    ) : (
                      // Actual content
                      <>
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="relative">
                            <Avatar className="w-16 h-16 ring-2 ring-background group-hover:ring-primary/20 transition-all">
                              <AvatarImage src={person.profile_photo_url} alt={person.full_name} />
                              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/10 to-primary/5">
                                {person.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'UN'}
                              </AvatarFallback>
                            </Avatar>
                            {/* Online indicator (mock) */}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="font-semibold text-foreground truncate text-lg group-hover:text-primary transition-colors cursor-pointer hover:underline"
                              onClick={() => handleProfileView(person)}
                            >
                              {person.full_name || 'Professional'}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate font-medium">
                              {person.headline || person.title || person.current_company || 'Experienced Professional'}
                            </p>
                            {person.location && (
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span>{person.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {person.about && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                            {person.about}
                          </p>
                        )}

                        {person.skills && person.skills.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {person.skills.slice(0, 2).map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="secondary" className="text-xs px-2 py-1">
                                  {skill}
                                </Badge>
                              ))}
                              {person.skills.length > 2 && (
                                <Badge variant="outline" className="text-xs px-2 py-1">
                                  +{person.skills.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4"
                              onClick={() => handleProfileView(person)}
                            >
                              <Users className="w-4 h-4 mr-1" />
                              Connect
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-muted-foreground/20 hover:bg-muted/50"
                              onClick={() => handleProfileView(person)}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {person.current_company && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Briefcase className="w-3 h-3 mr-1" />
                              <span className="truncate">{person.current_company}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && results.length > 0 && totalPages > 1 && (
            <SocialPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    );
};

export default People;
