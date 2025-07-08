
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, UserPlus, MessageCircle, Users, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PeopleSearch } from "@/components/network/PeopleSearch";
import { useConversations } from "@/hooks/useConversations";
import { useNavigate } from 'react-router-dom';
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';

const People = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const navigate = useNavigate();
  const { findOrCreateConversation } = useConversations();

  const handleUniversalSearch = (query: string, aiFilters?: SearchFilters) => {
    setSearchTerm(query);
    if (aiFilters?.location) setLocationFilter(aiFilters.location);
  };

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles', searchTerm, locationFilter, industryFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_profile_public', true);

      // Don't show current user in the list
      if (currentUser?.id) {
        query = query.neq('id', currentUser.id);
      }

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,skills.cs.{${searchTerm}}`);
      }
      if (locationFilter && locationFilter !== 'all') {
        query = query.ilike('location', `%${locationFilter}%`);
      }
      if (industryFilter && industryFilter !== 'all') {
        query = query.eq('industry', industryFilter);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser
  });

  // Get connections status for all profiles
  const { data: connections } = useQuery({
    queryKey: ['connections', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
        .from('connections')
        .select('recipient_id, requester_id, status')
        .or(`requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .eq('status', 'accepted');

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.id
  });

  // Get pending connection requests
  const { data: pendingRequests } = useQuery({
    queryKey: ['pendingRequests', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
        .from('connections')
        .select('recipient_id, requester_id')
        .eq('requester_id', currentUser.id)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.id
  });

  const getConnectionStatus = (profileId: string) => {
    if (!currentUser?.id || !connections || !pendingRequests) return 'not_connected';

    // Check if already connected
    const isConnected = connections.some(conn => 
      (conn.requester_id === currentUser.id && conn.recipient_id === profileId) ||
      (conn.recipient_id === currentUser.id && conn.requester_id === profileId)
    );

    if (isConnected) return 'connected';

    // Check if request is pending
    const isPending = pendingRequests.some(req => req.recipient_id === profileId);
    if (isPending) return 'pending';

    return 'not_connected';
  };

  const handleConnect = async (profileId: string) => {
    try {
      if (!currentUser) {
        toast.error('Please sign in to connect with people');
        return;
      }

      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentUser.id,
          recipient_id: profileId,
          status: 'pending'
        });

      if (error) throw error;
      toast.success('Connection request sent!');
      
      // Refresh pending requests
      await supabase.from('connections').select('*');
    } catch (error) {
      toast.error('Failed to send connection request');
      console.error('Connection error:', error);
    }
  };

  const handleMessage = async (profileId: string) => {
    try {
      if (!currentUser) {
        toast.error('Please sign in to send messages');
        return;
      }

      const conversation = await findOrCreateConversation([profileId]);
      navigate(`/network/messages/${conversation.id}`);
    } catch (error) {
      toast.error('Failed to start conversation');
      console.error('Message error:', error);
    }
  };

  const formatDisplayName = (profile: any) => {
    if (profile.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    if (profile.email) {
      return profile.email.split('@')[0];
    }
    return 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const shouldShowProfilePrompt = (profile: any) => {
    return !profile.full_name || !profile.title || !profile.profile_picture_url;
  };

  const getConnectionButton = (profile: any) => {
    const status = getConnectionStatus(profile.id);
    
    switch (status) {
      case 'connected':
        return (
          <Button 
            size="sm" 
            variant="outline"
            className="flex items-center bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            disabled
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Connected
          </Button>
        );
      case 'pending':
        return (
          <Button 
            size="sm" 
            variant="outline"
            className="flex items-center bg-yellow-50 text-yellow-700 border-yellow-200"
            disabled
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Pending
          </Button>
        );
      default:
        return (
          <Button 
            size="sm" 
            onClick={() => handleConnect(profile.id)}
            className="flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Connect
          </Button>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Find People</h1>
            <p className="text-gray-600 mt-2">Discover and connect with professionals in your field</p>
          </div>

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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find People</h1>
          <p className="text-gray-600 mt-2">Discover and connect with professionals in your field</p>
        </div>

        {/* Search and Filters */}
        <PeopleSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          industryFilter={industryFilter}
          setIndustryFilter={setIndustryFilter}
        />

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles?.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {/* Profile Picture - Clickable */}
                  <Link 
                    to={`/network/people/${profile.id}`}
                    className="block w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {profile.profile_picture_url ? (
                      <img 
                        src={profile.profile_picture_url} 
                        alt={formatDisplayName(profile)}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-lg">
                        {generateInitials(profile)}
                      </span>
                    )}
                  </Link>

                  {/* Basic Info - Clickable */}
                  <div>
                    <Link 
                      to={`/network/people/${profile.id}`}
                      className="block hover:text-blue-600 transition-colors"
                    >
                      <h3 className="font-semibold text-lg text-gray-900">
                        {formatDisplayName(profile)}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm">
                      {profile.title || 'Professional'}
                    </p>
                    {shouldShowProfilePrompt(profile) && (
                      <p className="text-xs text-orange-600 mt-1">
                        Incomplete profile
                      </p>
                    )}
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
                    {getConnectionButton(profile)}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMessage(profile.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
