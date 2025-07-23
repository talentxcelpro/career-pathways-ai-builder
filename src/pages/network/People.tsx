
import React, { useState, useEffect } from 'react';
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
import ProBadge from "@/components/network/ProBadge";
import { useEmailAutomation } from '@/hooks/useEmailAutomation';

const People = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const navigate = useNavigate();
  const { findOrCreateConversation } = useConversations();
  const { triggerConnectionEmail } = useEmailAutomation();

  // Debounce search term to prevent excessive queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles', debouncedSearchTerm, locationFilter, industryFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_profile_public', true);

      // Don't show current user in the list
      if (currentUser?.id) {
        query = query.neq('id', currentUser.id);
      }

      if (debouncedSearchTerm) {
        query = query.or(`full_name.ilike.%${debouncedSearchTerm}%,title.ilike.%${debouncedSearchTerm}%,skills.cs.{${debouncedSearchTerm}}`);
      }
      if (locationFilter && locationFilter !== 'all') {
        query = query.ilike('location', `%${locationFilter}%`);
      }
      if (industryFilter && industryFilter !== 'all') {
        query = query.eq('industry', industryFilter);
      }

      const { data, error } = await query;
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
      
      // Trigger connection request email
      try {
        const recipientProfile = profiles?.find(profile => profile.id === profileId);
        if (recipientProfile) {
          await triggerConnectionEmail(
            recipientProfile.email,
            recipientProfile.full_name || recipientProfile.email?.split('@')[0] || 'Professional',
            currentUser.email?.split('@')[0] || 'Someone'
          );
        }
      } catch (emailError) {
        console.error('Failed to send connection request email:', emailError);
        // Don't show error to user as connection request was successful
      }
      
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

  const getCompanyLogo = (companyName: string) => {
    if (!companyName) return null;
    
    const companyLogos: { [key: string]: string } = {
      'TalentXcel Services': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=faces',
      'Google': 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=64&h=64&fit=crop&crop=faces',
      'Microsoft': 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=64&h=64&fit=crop&crop=faces',
      'Apple': 'https://images.unsplash.com/photo-1621768216002-5ac171876625?w=64&h=64&fit=crop&crop=faces',
      'Amazon': 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=64&h=64&fit=crop&crop=faces',
      'Meta': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=64&h=64&fit=crop&crop=faces',
      'Netflix': 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=64&h=64&fit=crop&crop=faces',
      'Tesla': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=faces',
      'OpenAI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=64&h=64&fit=crop&crop=faces',
      'Spotify': 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=64&h=64&fit=crop&crop=faces',
    };
    
    return companyLogos[companyName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&color=fff&size=64`;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 font-system">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Find People</h1>
            <p className="text-slate-700 mt-2 font-medium">Discover and connect with professionals in your field</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse bg-white/95 backdrop-blur-sm border-slate-200/60 rounded-3xl shadow-lg overflow-hidden">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-slate-300 rounded-full mx-auto"></div>
                    <div className="h-4 bg-slate-300 rounded"></div>
                    <div className="h-3 bg-slate-300 rounded w-3/4 mx-auto"></div>
                    <div className="flex justify-center space-x-2">
                      <div className="h-6 bg-slate-300 rounded w-16"></div>
                      <div className="h-6 bg-slate-300 rounded w-16"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 font-system">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Find People</h1>
          <p className="text-slate-700 mt-2 font-medium">Discover and connect with professionals in your field</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{/* Changed gap from 6 to 4 for tighter layout */}
          {profiles?.map((profile) => (
            <Card key={profile.id} className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 bg-white/95 backdrop-blur-sm border-slate-200/60 rounded-3xl overflow-hidden">
              <CardContent className="p-5">
                <div className="text-center space-y-3">
                  {/* Profile Picture - Smaller and more engaging */}
                  <div className="relative mx-auto w-12 h-12">
                    <Link 
                      to={`/network/people/${profile.id}`}
                      className="block w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl"
                    >
                      {profile.profile_picture_url ? (
                        <img 
                          src={profile.profile_picture_url} 
                          alt={formatDisplayName(profile)}
                          className="w-full h-full rounded-full object-cover border-2 border-white/20"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {generateInitials(profile)}
                        </span>
                      )}
                    </Link>
                    {profile.pro_plan && profile.pro_status === 'active' && 
                     profile.pro_expires_at && new Date(profile.pro_expires_at) > new Date() && (
                      <div className="absolute -top-1 -right-1">
                        <ProBadge plan={profile.pro_plan as any} size="sm" />
                      </div>
                    )}
                  </div>

                  {/* Basic Info - More compact */}
                  <div>
                    <Link 
                      to={`/network/people/${profile.id}`}
                      className="block hover:text-blue-600 transition-colors"
                    >
                      <h3 className="font-semibold text-base text-slate-900 tracking-tight leading-tight">
                        {formatDisplayName(profile)}
                      </h3>
                    </Link>
                    <p className="text-slate-700 text-xs font-medium mt-1">
                      {profile.title || 'Professional'}
                    </p>
                    {shouldShowProfilePrompt(profile) && (
                      <p className="text-xs text-orange-600 mt-1 font-medium">
                        Incomplete profile
                      </p>
                    )}
                  </div>

                  {/* Location and Company with Logo */}
                  <div className="space-y-1">
                    {profile.location && (
                      <div className="flex items-center justify-center text-xs text-slate-600 font-medium">
                        <MapPin className="h-3 w-3 mr-1" />
                        {profile.location}
                      </div>
                    )}
                    {profile.current_company && (
                      <div className="flex items-center justify-center text-xs text-slate-600 font-medium">
                        <div className="flex items-center">
                          <img 
                            src={getCompanyLogo(profile.current_company)} 
                            alt={profile.current_company}
                            className="h-4 w-4 mr-1.5 rounded-full object-cover border border-slate-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.setAttribute('style', 'display: inline;');
                            }}
                          />
                          <Building className="h-3 w-3 mr-1 hidden" />
                          <span className="truncate max-w-[120px]">{profile.current_company}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills - More compact */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1">
                      {profile.skills.slice(0, 2).map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 border-slate-200 rounded-full">
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 border-slate-300 text-slate-500 rounded-full">
                          +{profile.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action Buttons - More compact */}
                  <div className="flex justify-center space-x-2 pt-1">
                    <div className="scale-90">
                      {getConnectionButton(profile)}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMessage(profile.id)}
                      className="scale-90 hover:scale-95 transition-transform"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {profiles && profiles.length === 0 && !isLoading && (
          <Card className="bg-white/95 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-lg">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">No people found</h3>
              <p className="text-slate-600 font-medium">Try adjusting your search criteria to find more professionals.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default People;
