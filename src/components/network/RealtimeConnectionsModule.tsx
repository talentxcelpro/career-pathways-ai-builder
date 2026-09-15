import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageCircle, UserPlus, MapPin, Building2, Clock, Wifi, WifiOff } from 'lucide-react';
import { useRealtimeConnections } from '@/hooks/useRealtimeConnections';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const RealtimeConnectionsModule: React.FC = () => {
  const {
    users,
    loading,
    showOnlineOnly,
    setShowOnlineOnly,
    sendConnectionRequest,
    getLastSeenText
  } = useRealtimeConnections();

  const handleConnect = async (userId: string, userName: string) => {
    const result = await sendConnectionRequest(userId);
    if (result.success) {
      toast.success(`Connection request sent to ${userName}!`);
    } else {
      toast.error('Failed to send connection request');
    }
  };

  const generateInitials = (name: string | null): string => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-green-500" />
            Find Your Next Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl animate-pulse">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-green-500" />
            Find Your Next Connection
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="online-only" className="text-sm font-medium">
              Online Only
            </Label>
            <Switch
              id="online-only"
              checked={showOnlineOnly}
              onCheckedChange={setShowOnlineOnly}
            />
          </div>
        </div>
        
        {/* Online Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{users.filter(u => u.is_online).length} online now</span>
          </div>
          <div className="flex items-center gap-1">
            <WifiOff className="w-3 h-3" />
            <span>{users.filter(u => !u.is_online).length} recently active</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showOnlineOnly ? 'No one online right now' : 'No new connections available'}
            </h3>
            <p className="text-gray-500">
              {showOnlineOnly 
                ? 'Try turning off "Online Only" to see more people'
                : 'Check back later for new connection opportunities'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl shadow-md bg-white hover:shadow-lg transition-all duration-200 border border-gray-100">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                      <AvatarImage src={user.profile_picture_url || undefined} alt={user.full_name || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {generateInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Online Status Indicator */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      user.is_online ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {user.full_name || 'Professional User'}
                    </h3>
                    
                    {(user.headline || user.title) && (
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {user.headline || user.title}
                      </p>
                    )}

                    {/* Company and Location */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      {user.current_company && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{user.current_company}</span>
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[100px]">{user.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Status and Skills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Online Status Text */}
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" />
                        <span className={user.is_online ? 'text-green-600 font-medium' : 'text-gray-500'}>
                          {user.is_online ? 'Online now' : getLastSeenText(user.last_seen)}
                        </span>
                      </div>

                      {/* Skills */}
                      {user.skills && user.skills.length > 0 && (
                        <div className="flex gap-1">
                          {user.skills.slice(0, 2).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                              {skill}
                            </Badge>
                          ))}
                          {user.skills.length > 2 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              +{user.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs"
                    onClick={() => handleConnect(user.id, user.full_name || 'User')}
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Connect
                  </Button>
                  
                  {user.is_online && (
                    <Link to={`/network/messages`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-3 py-1 rounded-lg border-green-200 text-green-700 hover:bg-green-50 transition-colors text-xs"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Suggestion Banner */}
        {users.filter(u => u.is_online).length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">AI Suggestion</span>
            </div>
            <p className="text-sm text-blue-600">
              {users.filter(u => u.is_online).length} professionals are online right now - 
              perfect time to make new connections and expand your network!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};