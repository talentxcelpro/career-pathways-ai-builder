import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Building2 } from 'lucide-react';

interface UserProfileProps {
  trigger: React.ReactNode;
  profile: {
    id: string;
    full_name: string | null;
    profile_picture_url: string | null;
    title: string | null;
    current_company: string | null;
    location: string | null;
    about: string | null;
    skills: string[] | null;
    headline: string | null;
    pro_plan?: string;
    pro_status?: string;
    pro_expires_at?: string;
  };
}

const calculateProfileStrength = (profile: any) => {
  let score = 0;
  const fields = [
    profile.full_name,
    profile.title,
    profile.about,
    profile.location,
    profile.profile_picture_url,
    profile.skills?.length > 0,
    profile.current_company,
    profile.headline
  ];
  
  fields.forEach(field => {
    if (field) score += 12.5;
  });
  
  return Math.round(score);
};

export const MobileUserProfile: React.FC<UserProfileProps> = ({ trigger, profile }) => {
  const profileStrength = calculateProfileStrength(profile);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-auto bg-background border-border">
        <DialogHeader className="pb-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage 
                src={profile.profile_picture_url || ''} 
                alt={profile.full_name || 'User'} 
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold text-foreground">
                {profile.full_name || 'Professional User'}
              </h2>
              {profile.title && (
                <p className="text-muted-foreground">{profile.title}</p>
              )}
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                {profile.current_company && (
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-4 h-4" />
                    <span>{profile.current_company}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Strength */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground">Profile Strength</span>
              <span className="font-semibold text-primary">{profileStrength}%</span>
            </div>
            <Progress value={profileStrength} className="h-2" />
          </div>

          {/* About Section */}
          {(profile.about || profile.headline) && (
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile.about || profile.headline}
              </p>
            </div>
          )}

          {/* Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.slice(0, 8).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 8 && (
                  <Badge variant="outline" className="text-xs px-3 py-1">
                    +{profile.skills.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};