import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { X, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const LinkedInStyleSuggestions: React.FC = () => {
  const { user } = useAuth();

  // Get suggested connections
  const { data: suggestedUsers = [] } = useQuery({
    queryKey: ['suggested-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(3);
      
      if (error) {
        console.warn('Failed to fetch suggested connections:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });

  if (suggestedUsers.length === 0) return null;

  return (
    <Card className="mx-4 mb-4 bg-card border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <h3 className="text-sm font-semibold text-foreground">Suggested</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">See all</span>
          <Button variant="ghost" size="icon" className="w-6 h-6">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="px-4 pb-4 space-y-3">
        {suggestedUsers.map((profile) => (
          <div key={profile.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile.full_name || 'Professional'}
                  </p>
                  {profile.is_verified && (
                    <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.title || 'HR Professional Based In Pune With Overall 9+ Years...'}
                </p>
                <p className="text-xs text-muted-foreground">1d • 🌐</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="text-xs px-4 py-1.5 h-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-3 h-3 mr-1" />
              Follow
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};