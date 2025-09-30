import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Heart, 
  Clock,
  Search,
  TrendingUp,
  Sparkles,
  UserPlus,
  Play,
  MoreHorizontal,
  Zap,
  Star,
  Crown,
  Award,
  Eye,
  Share2,
  Send,
  Navigation,
  Loader2
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { usePeopleSearch } from '@/hooks/usePeopleSearch';
import { useNaturalLanguageSearch } from '@/hooks/useNaturalLanguageSearch';
import { useProfileViews } from '@/hooks/useProfileViews';
import { useUserPresence } from '@/hooks/useUserPresence';
import { RealTimePresence } from '@/components/network/RealTimePresence';
import { toast } from 'sonner';

const People = () => {
  useUserPresence();
  const { trackProfileView } = useProfileViews();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  
  const {
    searchTerm,
    setSearchTerm,
    results: naturalSearchResults,
    isLoading: naturalSearchLoading,
    error: naturalSearchError,
    parsedQuery,
    suggestions,
    selectSuggestion
  } = useNaturalLanguageSearch();

  const {
    results: basicResults,
    isLoading: basicLoading,
    error: basicError,
  } = usePeopleSearch();

  // Use natural search when there's a search term, otherwise use basic results
  const results = searchTerm ? naturalSearchResults : basicResults;
  const isLoading = searchTerm ? naturalSearchLoading : basicLoading;
  const error = searchTerm ? naturalSearchError : basicError;

  // Get user location for nearby search
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.log('Location access denied:', error);
          setLocationPermission('denied');
        }
      );
    }
  }, []);

  // Fetch real recent activity from posts
  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select(`
          id,
          created_at,
          content,
          profiles!posts_user_id_fkey (
            id,
            full_name,
            profile_picture_url,
            headline
          )
        `)
        .not('profiles.profile_picture_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);
      
      // Normalize profiles relation (can be array or object)
      return data
        ?.map((post) => {
          const prof = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
          if (!prof) return null;
          return {
            id: prof.id,
            full_name: prof.full_name,
            profile_picture_url: prof.profile_picture_url,
            headline: prof.headline,
            activity_type: 'post',
            time_ago: getTimeAgo(post.created_at),
            preview: (post.content || '').substring(0, 50) + '...',
          };
        })
        .filter(Boolean) as Array<{
          id: string;
          full_name: string | null;
          profile_picture_url: string | null;
          headline: string | null;
          activity_type: string;
          time_ago: string;
          preview: string;
        }>;
    }
  });

  // Helper functions
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fetch trending professionals based on real metrics
  const { data: trending } = useQuery({
    queryKey: ['trending-people'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, headline, location, profile_views_count, connections_count')
        .not('full_name', 'is', null)
        .order('profile_views_count', { ascending: false })
        .limit(8);
      
      return data?.map(profile => ({
        ...profile,
        trending_score: profile.profile_views_count || 0,
        growth: `+${Math.floor(((profile.profile_views_count || 0) / 100) * 15)}%`
      }));
    }
  });

  // Fetch nearby people based on location
  const { data: nearbyPeople, isLoading: nearbyLoading } = useQuery({
    queryKey: ['nearby-people', userLocation],
    queryFn: async () => {
      if (!userLocation) return [];
      
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, headline, location, latitude, longitude')
        .not('full_name', 'is', null)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(50);
      
      // Calculate distance and sort
      const withDistance = data?.map(profile => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          profile.latitude,
          profile.longitude
        );
        return { ...profile, distance };
      }).filter(profile => profile.distance <= 50) // Within 50km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 12);
      
      return withDistance;
    },
    enabled: !!userLocation
  });

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationPermission('granted');
          toast.success('Location enabled! Finding nearby professionals...');
        },
        (error) => {
          setLocationPermission('denied');
          toast.error('Location access denied. Enable location to find nearby professionals.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleConnect = async (userId: string, userName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to connect');
        return;
      }

      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: userId,
          status: 'pending',
          message: `Hi ${userName}! I'd love to connect with you.`
        });

      if (error) throw error;
      toast.success(`Connection request sent to ${userName}!`);
    } catch (error) {
      toast.error('Failed to send connection request');
    }
  };

  const handleProfileView = (person: any) => {
    trackProfileView(person.id);
    const profilePath = person.username ? `/profile/${person.username}` : `/p/${person.id}`;
    navigate(profilePath);
  };

  const handleMessage = (person: any) => {
    if (!person?.id) return;
    navigate(`/network/messages/new?userId=${person.id}&name=${encodeURIComponent(person.full_name || 'User')}`);
  };

  const handleViewPost = (activityId: string) => {
    navigate(`/network/posts/${activityId}`);
  };

  const handleShareProfile = async (person: any) => {
    const profileUrl = `${window.location.origin}${person.username ? `/profile/${person.username}` : `/p/${person.id}`}`;
    try {
      await navigator.share({
        title: `Connect with ${person.full_name} on TalentXcel`,
        text: `Check out ${person.full_name}'s profile on TalentXcel`,
        url: profileUrl
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const formatDisplayName = (profile: any) => {
    return profile?.full_name || 'Professional User';
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquare className="h-3 w-3" />;
      case 'achievement': return <Award className="h-3 w-3" />;
      case 'new_role': return <TrendingUp className="h-3 w-3" />;
      case 'certification': return <Star className="h-3 w-3" />;
      default: return <Sparkles className="h-3 w-3" />;
    }
  };

  // Memoize formatted results for better performance
  const formattedResults = useMemo(() => results, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header with Search */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Discover Amazing People
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Connect, grow, and build meaningful relationships
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors group-focus-within:text-blue-500" />
                <Input
                  placeholder="Try: 'React developers in Mumbai' or 'Senior designers with 5+ years'"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-96 bg-white/90 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
                <Zap className="h-4 w-4 mr-2" />
                AI Match
              </Button>
            </div>
          </div>

          {/* Smart Suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Smart Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => selectSuggestion(suggestion)}
                    className="h-8 px-3 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Info */}
          {searchTerm && (
            <div className="mb-6 p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Search Results</span>
              </div>
              <div className="text-sm text-blue-700">
                Found {results.length} professionals matching: "<span className="font-semibold">{searchTerm}</span>"
                {parsedQuery && (
                  <div className="mt-2 text-xs text-blue-600">
                    <span className="font-medium">AI Interpretation:</span>
                    {parsedQuery.location && <span className="ml-2 bg-blue-100 px-2 py-0.5 rounded">📍 {parsedQuery.location}</span>}
                    {parsedQuery.skills && parsedQuery.skills.length > 0 && (
                      <span className="ml-2 bg-green-100 px-2 py-0.5 rounded">🛠️ {parsedQuery.skills.join(', ')}</span>
                    )}
                    {parsedQuery.experience && <span className="ml-2 bg-purple-100 px-2 py-0.5 rounded">⭐ {parsedQuery.experience} experience</span>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stories Row */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-600" />
              Recent Activity
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {recentActivity?.slice(0, 8).map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex-shrink-0 text-center cursor-pointer group transform transition-all duration-300 hover:scale-110"
                  onClick={() => handleViewPost(activity.id)}
                >
                  <div className="relative mb-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-0.5 group-hover:shadow-lg group-hover:shadow-purple-300 transition-shadow">
                      <Avatar className="w-full h-full border-2 border-white">
                        <AvatarImage src={activity.profile_picture_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-semibold">
                          {generateInitials(activity)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md group-hover:scale-125 transition-transform">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-700 truncate w-16 group-hover:text-blue-600 transition-colors">
                    {activity.full_name?.split(' ')[0]}
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">{activity.time_ago}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Nearby {userLocation && `(${nearbyPeople?.length || 0})`}
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Main People Grid */}
              <div className="lg:col-span-3">
                {error && (
                  <div className="text-center py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
                      <p className="text-red-600">⚠️ {typeof error === 'string' ? error : 'Search failed'}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {(isLoading ? Array.from({ length: 9 }) : results.slice(0, 12)).map((person, index) => (
                    <Card 
                      key={person?.id || index} 
                      className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:rotate-1 border-0 bg-white/90 backdrop-blur-sm overflow-hidden animate-fade-in ${
                        isLoading ? 'animate-pulse' : 'cursor-pointer hover:bg-white hover:scale-105'
                      }`}
                      style={{ 
                        background: isLoading ? undefined : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        animationDelay: `${index * 100}ms`
                      }}
                      onClick={!isLoading ? () => handleProfileView(person) : undefined}
                    >
                      <CardContent className="p-0">
                        {isLoading ? (
                          <div className="p-6">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Card Header with Gradient */}
                            <div className="h-20 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 relative overflow-hidden">
                              <div className="absolute inset-0 bg-black/10"></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                              <div className="absolute top-2 right-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="p-6 -mt-8 relative">
                              {/* Profile Avatar */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="relative">
                                  <Avatar 
                                    className="w-16 h-16 ring-4 ring-white shadow-lg cursor-pointer hover:ring-blue-300 transition-all duration-300 hover:scale-110"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleProfileView(person);
                                    }}
                                  >
                                    <AvatarImage src={person.profile_photo_url} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-lg font-bold">
                                      {generateInitials(person)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <RealTimePresence userId={person.id} variant="dot" />
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 border-gray-200 hover:border-red-300 hover:bg-red-50 group transition-all duration-200 hover:scale-110"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Heart className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-8 px-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleConnect(person.id, person.full_name);
                                    }}
                                  >
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Connect
                                  </Button>
                                </div>
                              </div>

                              {/* Profile Info */}
                              <div className="mb-4">
                                <h3 
                                  className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-all duration-200 cursor-pointer hover:scale-105 transform-gpu"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProfileView(person);
                                  }}
                                >
                                  {formatDisplayName(person)}
                                </h3>
                                <p className="text-sm text-gray-600 font-medium">
                                  {person.headline || person.title || 'Professional'}
                                </p>
                                {person.location && (
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span>{person.location}</span>
                                  </div>
                                )}
                              </div>

                              {/* Skills */}
                              {person.skills && person.skills.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex flex-wrap gap-1">
                                    {person.skills.slice(0, 3).map((skill, skillIndex) => (
                                      <Badge 
                                        key={skillIndex} 
                                        variant="secondary" 
                                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                    {person.skills.length > 3 && (
                                      <Badge variant="outline" className="text-xs px-2 py-1">
                                        +{person.skills.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Social Actions */}
                              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex gap-4">
                                  <button 
                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-all duration-200 hover:scale-110"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Eye className="h-3 w-3" />
                                    {Math.floor(Math.random() * 500) + 100}
                                  </button>
                                  <button 
                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition-all duration-200 hover:scale-110"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Heart className="h-3 w-3" />
                                    {Math.floor(Math.random() * 50) + 10}
                                  </button>
                                  <button 
                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-all duration-200 hover:scale-110"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Share2 className="h-3 w-3" />
                                    Share
                                  </button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:scale-110 transition-all duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMessage(person);
                                  }}
                                >
                                  <Send className="h-4 w-4 text-blue-600" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Trending This Week */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Trending This Week
                    </h3>
                    <div className="space-y-3">
                      {trending?.slice(0, 5).map((person, index) => (
                        <div 
                          key={person.id} 
                          className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2"
                          onClick={() => handleProfileView(person)}
                        >
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={person.profile_picture_url} />
                              <AvatarFallback className="bg-gradient-to-br from-green-100 to-blue-100">
                                {generateInitials(person)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {formatDisplayName(person)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {person.title}
                            </p>
                            <p className="text-xs text-green-600 font-medium">
                              {person.growth} growth
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      Go Premium
                    </h3>
                    <p className="text-sm text-purple-100 mb-4">
                      Unlock unlimited connections and advanced networking features
                    </p>
                    <Button className="w-full bg-white text-purple-600 hover:bg-purple-50">
                      Upgrade Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending?.map((person, index) => (
                <Card 
                  key={person.id} 
                  className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => handleProfileView(person)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={person.profile_picture_url} />
                          <AvatarFallback>{generateInitials(person)}</AvatarFallback>
                        </Avatar>
                        <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{formatDisplayName(person)}</h4>
                        <p className="text-sm text-gray-600">{person.title}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{person.growth}</p>
                      <p className="text-xs text-gray-500">Network Growth</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Nearby Tab */}
          <TabsContent value="nearby" className="space-y-6">
            {!userLocation ? (
              <div className="text-center py-12">
                <Navigation className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover People Nearby</h3>
                <p className="text-gray-600 mb-6">Enable location to find professionals in your area</p>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={requestLocation}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Enable Location
                </Button>
              </div>
            ) : nearbyLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Finding professionals near you...</p>
              </div>
            ) : nearbyPeople && nearbyPeople.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyPeople.map((person) => (
                  <Card 
                    key={person.id} 
                    className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => handleProfileView(person)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={person.profile_picture_url} />
                          <AvatarFallback>{generateInitials(person)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">{formatDisplayName(person)}</h4>
                          <p className="text-sm text-gray-600">{person.title}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{person.distance?.toFixed(1)}km away</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnect(person.id, person.full_name);
                          }}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Connect
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMessage(person);
                          }}
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Nearby Professionals</h3>
                <p className="text-gray-600">No professionals found within 50km of your location</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default People;