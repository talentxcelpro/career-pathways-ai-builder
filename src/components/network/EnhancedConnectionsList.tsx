import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Filter, MessageCircle, Calendar, Building2, MapPin, Globe } from "lucide-react";
import { useRealtimeConnections } from '@/hooks/useRealtimeConnections';
import { Link } from 'react-router-dom';

export const EnhancedConnectionsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  
  const { 
    users: connections, 
    loading, 
    stats,
    showOnlineOnly,
    setShowOnlineOnly,
    getLastSeenText 
  } = useRealtimeConnections();

  const formatDisplayName = (profile: any) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
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

  // Enhanced filtering and sorting
  const filteredAndSortedConnections = connections
    ?.filter(user => {
      if (!searchTerm && filterBy === 'all' && !showOnlineOnly) return true;
      
      const name = formatDisplayName(user).toLowerCase();
      const title = user?.title?.toLowerCase() || '';
      const company = user?.current_company?.toLowerCase() || '';
      const location = user?.location?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = !searchTerm || 
        name.includes(search) || 
        title.includes(search) || 
        company.includes(search) || 
        location.includes(search);
      
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'online' && user.is_online) ||
        (filterBy === 'same_company' && user.current_company);
      
      const matchesOnline = !showOnlineOnly || user.is_online;
      
      return matchesSearch && matchesFilter && matchesOnline;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return formatDisplayName(a).localeCompare(formatDisplayName(b));
        case 'recent':
          return new Date(b.last_seen || 0).getTime() - new Date(a.last_seen || 0).getTime();
        case 'online':
          return Number(b.is_online) - Number(a.is_online);
        default:
          return new Date(b.last_seen || 0).getTime() - new Date(a.last_seen || 0).getTime();
      }
    });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Connections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Online Now</p>
                <p className="text-2xl font-bold text-gray-900">{stats.online}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(connections?.map(c => c.location).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search connections by name, title, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent Activity</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="online">Online Status</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Connections</SelectItem>
                  <SelectItem value="online">Online Now</SelectItem>
                  <SelectItem value="same_company">Same Company</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showOnlineOnly ? "default" : "outline"}
                onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                size="sm"
              >
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                Online Only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connections List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Network ({filteredAndSortedConnections?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedConnections?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterBy !== 'all' || showOnlineOnly ? 'No matching connections' : 'No connections yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterBy !== 'all' || showOnlineOnly
                  ? 'Try adjusting your filters or search terms' 
                  : 'Start building your professional network'
                }
              </p>
              <Link to="/network/people">
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Discover People
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedConnections?.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50/50 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Link to={`/network/people/${user.id}`}>
                        <Avatar className="cursor-pointer hover:scale-105 transition-transform">
                          <AvatarImage src={user.profile_picture_url} />
                          <AvatarFallback>
                            {generateInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      {user.is_online && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <Link 
                        to={`/network/people/${user.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        <h4 className="font-semibold text-gray-900">
                          {formatDisplayName(user)}
                        </h4>
                      </Link>
                      
                      {user.title && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {user.title}
                          {user.current_company && ` at ${user.current_company}`}
                        </p>
                      )}
                      
                      {user.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {user.location}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {user.is_online ? 'Online' : getLastSeenText(user.last_seen || '')}
                        </Badge>
                        {user.skills && user.skills.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {user.skills.length} skills
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/network/messages/new?userId=${user.id}`}>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};