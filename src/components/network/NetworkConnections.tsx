import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MessageCircle, UserMinus, MoreHorizontal, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
  requester_profile?: {
    id: string;
    full_name?: string;
    profile_picture_url?: string;
    title?: string;
    location?: string;
    current_company?: string;
    is_online?: boolean;
  };
  recipient_profile?: {
    id: string;
    full_name?: string;
    profile_picture_url?: string;
    title?: string;
    location?: string;
    current_company?: string;
    is_online?: boolean;
  };
}

export const NetworkConnections: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: connections = [], isLoading, refetch } = useQuery({
    queryKey: ['user-connections', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester_profile:profiles!connections_requester_id_fkey (
            id, full_name, profile_picture_url, title, location, current_company, is_online
          ),
          recipient_profile:profiles!connections_recipient_id_fkey (
            id, full_name, profile_picture_url, title, location, current_company, is_online
          )
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Connection[];
    },
    enabled: !!user,
  });

  const handleRemoveConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      
      toast.success('Connection removed');
      refetch();
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error('Failed to remove connection');
    }
  };

  const filteredConnections = connections.filter(connection => {
    const otherProfile = connection.requester_id === user?.id 
      ? connection.recipient_profile 
      : connection.requester_profile;
    
    if (!otherProfile) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      otherProfile.full_name?.toLowerCase().includes(searchLower) ||
      otherProfile.title?.toLowerCase().includes(searchLower) ||
      otherProfile.current_company?.toLowerCase().includes(searchLower) ||
      otherProfile.location?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">My Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            My Network ({connections.length})
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {connections.filter(c => {
              const otherProfile = c.requester_id === user?.id ? c.recipient_profile : c.requester_profile;
              return otherProfile?.is_online;
            }).length} online
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredConnections.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No matching connections' : 'No connections yet'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {searchTerm 
                ? 'Try adjusting your search terms.'
                : 'Start connecting with professionals in your field.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConnections.map((connection) => {
              const otherProfile = connection.requester_id === user?.id 
                ? connection.recipient_profile 
                : connection.requester_profile;
              
              if (!otherProfile) return null;

              return (
                <div key={connection.id} className="flex items-start space-x-4 p-4 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={otherProfile.profile_picture_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {otherProfile.full_name?.slice(0, 2).toUpperCase() || 'UN'}
                      </AvatarFallback>
                    </Avatar>
                    {otherProfile.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-card"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm mb-1">
                      {otherProfile.full_name || 'Professional User'}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {otherProfile.title || 'Professional'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {otherProfile.current_company && (
                        <div className="flex items-center">
                          <Briefcase className="h-3 w-3 mr-1" />
                          <span>{otherProfile.current_company}</span>
                        </div>
                      )}
                      {otherProfile.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{otherProfile.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="h-8 px-3">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveConnection(connection.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};