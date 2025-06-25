
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, MessageCircle, MapPin, Building } from "lucide-react";

interface ConnectionCardProps {
  profile: {
    id: string;
    full_name?: string;
    title?: string;
    location?: string;
    current_company?: string;
    profile_picture_url?: string;
    skills?: string[];
    email?: string;
  };
  onConnect?: (profileId: string) => void;
  onMessage?: (profileId: string) => void;
  showActions?: boolean;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  profile,
  onConnect,
  onMessage,
  showActions = true
}) => {
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Profile Picture */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto flex items-center justify-center">
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
          </div>

          {/* Basic Info */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {formatDisplayName(profile)}
            </h3>
            <p className="text-gray-600 text-sm">
              {profile.title || 'Professional'}
            </p>
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
          {showActions && (
            <div className="flex justify-center space-x-2">
              <Button 
                size="sm" 
                onClick={() => onConnect?.(profile.id)}
                className="flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Connect
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onMessage?.(profile.id)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
