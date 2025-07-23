
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SmartSearchBar } from '@/components/network/SmartSearchBar';
import { useNaturalLanguageSearch } from '@/hooks/useNaturalLanguageSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Briefcase, Calendar, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const People = () => {
  const [locationFilter, setLocationFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  
  const {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error,
    parsedQuery,
    suggestions,
    selectSuggestion
  } = useNaturalLanguageSearch();

  // Fetch unique locations
  const { data: locations = [] } = useQuery({
    queryKey: ['unique-locations-people'],
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
  const { data: industries = [] } = useQuery({
    queryKey: ['unique-industries-people'],
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

  // Apply additional filters to AI search results
  const filteredResults = React.useMemo(() => {
    let filtered = results;

    if (locationFilter !== 'all') {
      filtered = filtered.filter(person => 
        person.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(person => 
        person.industry?.toLowerCase().includes(industryFilter.toLowerCase())
      );
    }

    return filtered;
  }, [results, locationFilter, industryFilter]);

  const handleConnect = async (personId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: (await supabase.auth.getUser()).data.user?.id,
          recipient_id: personId,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Connection request sent!');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  };

  const formatSkills = (skills: string[] | null) => {
    if (!skills || !Array.isArray(skills)) return [];
    return skills.slice(0, 3); // Show only first 3 skills
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                <p className="text-lg font-medium">Search Error</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Find People
          </h1>
          <p className="text-gray-600">
            Connect with professionals using natural language search
          </p>
        </div>

        {/* Smart Search Bar */}
        <SmartSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          suggestions={suggestions}
          onSuggestionSelect={selectSuggestion}
          parsedQuery={parsedQuery}
          isLoading={isLoading}
          locations={locations}
          industries={industries}
          onLocationChange={setLocationFilter}
          onIndustryChange={setIndustryFilter}
          locationFilter={locationFilter}
          industryFilter={industryFilter}
        />

        {/* Results Count */}
        {searchTerm && (
          <div className="text-center text-gray-600">
            {isLoading ? (
              <p>Searching...</p>
            ) : (
              <p>
                Found {filteredResults.length} people
                {parsedQuery && parsedQuery.query && ` for "${parsedQuery.query}"`}
              </p>
            )}
          </div>
        )}

        {/* People Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((person) => (
            <Card key={person.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {person.avatar_url ? (
                      <img 
                        src={person.avatar_url} 
                        alt={person.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-medium">
                        {person.full_name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {person.full_name || 'Anonymous User'}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {person.user_role || 'User'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {person.current_position && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{person.current_position}</span>
                    </div>
                  )}
                  
                  {person.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{person.location}</span>
                    </div>
                  )}

                  {person.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {person.bio}
                    </p>
                  )}

                  {person.skills && formatSkills(person.skills).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formatSkills(person.skills).map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {person.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{person.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button 
                      onClick={() => handleConnect(person.id)}
                      className="w-full"
                      variant="outline"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && filteredResults.length === 0 && searchTerm && (
          <Card className="bg-gray-50">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No people found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['React developers', 'UI designers', 'Product managers'].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm(suggestion)}
                  >
                    Try "{suggestion}"
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Initial State */}
        {!searchTerm && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start your search
              </h3>
              <p className="text-gray-600 mb-4">
                Use natural language to find people. Try examples like:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'React developers in Mumbai',
                  'Senior UI/UX designers',
                  'Product managers with 3+ years',
                  'Data scientists remote'
                ].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm(example)}
                    className="hover:bg-blue-100"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default People;
