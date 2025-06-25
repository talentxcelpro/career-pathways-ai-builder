
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Building, UserPlus, MessageCircle, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const People = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles', searchTerm, locationFilter, industryFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_profile_public', true);

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,skills.cs.{${searchTerm}}`);
      }
      if (locationFilter) {
        query = query.ilike('location', `%${locationFilter}%`);
      }
      if (industryFilter) {
        query = query.eq('industry', industryFilter);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    }
  });

  const handleConnect = async (profileId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to connect with people');
        return;
      }

      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: profileId,
          status: 'pending'
        });

      if (error) throw error;
      toast.success('Connection request sent!');
    } catch (error) {
      toast.error('Failed to send connection request');
      console.error('Connection error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find People</h1>
          <p className="text-gray-600 mt-2">Discover and connect with professionals in your field</p>
        </div>

        {/* Search and Filters */}
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
                  <SelectItem value="">All Locations</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="San Francisco">San Francisco</SelectItem>
                  <SelectItem value="London">London</SelectItem>
                  <SelectItem value="Toronto">Toronto</SelectItem>
                </SelectContent>
              </Select>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Industries</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4 mx-auto"></div>
                    <div className="flex justify-center space-x-2">
                      <div className="h-8 bg-gray-300 rounded w-20"></div>
                      <div className="h-8 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles?.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    {/* Profile Picture */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {profile.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>

                    {/* Basic Info */}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {profile.full_name || 'Anonymous User'}
                      </h3>
                      <p className="text-gray-600 text-sm">{profile.title}</p>
                    </div>

                    {/* Location and Company */}
                    <div className="space-y-1">
                      {profile.location && (
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {profile.location}
                        </div>
                      )}
                      {profile.current_company && (
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          <Building className="h-4 w-4 mr-1" />
                          {profile.current_company}
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1">
                        {profile.skills.slice(0, 3).map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {profile.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleConnect(profile.id)}
                        className="flex items-center"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {profiles && profiles.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No people found</h3>
              <p className="text-gray-600">Try adjusting your search criteria to find more professionals.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default People;
