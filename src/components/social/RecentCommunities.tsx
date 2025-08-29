import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Clock, ArrowRight } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
  cover_image_url?: string;
  is_private: boolean;
  user_joined?: boolean;
}

const SAMPLE_COMMUNITIES = [
  {
    id: 'javascript-dev',
    name: 'JavaScript Developers',
    description: 'Connect with JavaScript enthusiasts and share knowledge',
    member_count: 1247,
    is_private: false,
    user_joined: true
  },
  {
    id: 'react-community',
    name: 'React Community',
    description: 'Everything React.js - tips, tricks, and best practices',
    member_count: 892,
    is_private: false,
    user_joined: true
  },
  {
    id: 'startup-founders',
    name: 'Startup Founders',
    description: 'Building the future, one startup at a time',
    member_count: 456,
    is_private: false,
    user_joined: false
  },
  {
    id: 'ui-ux-designers',
    name: 'UI/UX Designers',
    description: 'Crafting beautiful and functional user experiences',
    member_count: 324,
    is_private: false,
    user_joined: false
  }
];

export const RecentCommunities: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch user's recent communities
  const { data: communities, isLoading } = useQuery({
    queryKey: ['recent-communities', currentUser],
    queryFn: async () => {
      if (!currentUser) return SAMPLE_COMMUNITIES;

      const { data, error } = await supabase
        .from('community_memberships')
        .select(`
          community_id,
          last_active_at,
          communities (
            id,
            name,
            description,
            member_count,
            cover_image_url,
            is_private
          )
        `)
        .eq('user_id', currentUser)
        .order('last_active_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching communities:', error);
        return SAMPLE_COMMUNITIES;
      }

      if (!data || data.length === 0) {
        return SAMPLE_COMMUNITIES;
      }

      return data.map(membership => {
        const community = Array.isArray(membership.communities) 
          ? membership.communities[0] 
          : membership.communities;
        
        return {
          id: community?.id || '',
          name: community?.name || '',
          description: community?.description || '',
          member_count: community?.member_count || 0,
          cover_image_url: community?.cover_image_url,
          is_private: community?.is_private || false,
          user_joined: true
        };
      }) as Community[];
    },
    enabled: !!currentUser,
  });

  if (isLoading) {
    return (
      <Card className="border-0 bg-gradient-card shadow-float">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="border-0 bg-gradient-card shadow-float">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Recent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {communities?.slice(0, 4).map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-200 group cursor-pointer",
                community.user_joined 
                  ? "bg-primary/5 hover:bg-primary/10" 
                  : "hover:bg-muted/50"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {community.name}
                  </h4>
                  {community.user_joined && (
                    <Badge variant="secondary" className="h-5 px-2 text-xs bg-primary/10 text-primary">
                      Joined
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {community.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {community.member_count.toLocaleString()}
                    </span>
                  </div>
                  {community.is_private && (
                    <Badge variant="outline" className="h-4 px-1 text-xs">
                      Private
                    </Badge>
                  )}
                </div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {community.user_joined ? (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="h-8 px-3 border-primary/20 hover:bg-primary/5">
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}

          <div className="pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-muted-foreground hover:text-primary"
            >
              Show more
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};