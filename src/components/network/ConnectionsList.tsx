import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, UserMinus, Users, UserPlus } from "lucide-react";
import { useRealtimeConnections } from "@/hooks/useRealtimeConnections";
import { Link } from 'react-router-dom';

export const ConnectionsList = () => {
  const { connections, isLoading } = useRealtimeConnections();

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

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Your Connections</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-muted rounded"></div>
                  <div className="h-8 w-8 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 p-3 bg-muted/50 rounded-full w-fit">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No connections yet</h3>
          <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
            Start building your professional network by connecting with colleagues, 
            industry professionals, and potential collaborators.
          </p>
          <Link 
            to="/network/discover" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Find People to Connect
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-6">
        <div className="space-y-3">
          {connections.map((connection, index) => {
            const otherUser = connection.otherUser;
            
            return (
              <div 
                key={connection.id} 
                className="group p-4 rounded-lg border hover:border-primary/20 hover:bg-muted/30 transition-all duration-200 animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Link to={`/network/people/${otherUser?.id}`}>
                      <Avatar className="w-12 h-12 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        <AvatarImage src={otherUser?.profile_picture_url} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-semibold">
                          {generateInitials(otherUser)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <Link 
                        to={`/network/people/${otherUser?.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors story-link"
                      >
                        {formatDisplayName(otherUser)}
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {otherUser?.title || 'Professional'}
                      </p>
                      {(otherUser as any)?.current_company && (
                        <p className="text-xs text-muted-foreground/80">
                          at {(otherUser as any).current_company}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/network/messages/new?userId=${otherUser?.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        // Handle remove connection
                        console.log('Remove connection:', connection.id);
                      }}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};