import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { 
  MapPin, 
  Briefcase, 
  Link as LinkIcon, 
  Users, 
  Eye,
  Plus,
  Check,
  MessageCircle,
  Share2,
  Globe
} from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  username?: string;
  title?: string;
  current_company?: string;
  location?: string;
  about?: string;
  skills?: string[];
  profile_picture_url?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  followers_count?: number;
  following_count?: number;
  connections_count?: number;
  profile_views?: number;
}

interface ConnectionStatus {
  status: 'none' | 'pending' | 'connected' | 'following';
  isRequester?: boolean;
}

interface MobileUserProfileModalProps {
  userId: string;
  trigger: React.ReactNode;
  onConnectionChange?: () => void;
}

export const MobileUserProfileModal: React.FC<MobileUserProfileModalProps> = ({
  userId,
  trigger,
  onConnectionChange
}) => {
  const { user } = useAuth();
  const { triggerHaptic } = useHapticFeedback();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: 'none' });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchProfile = async () => {
    if (!userId || userId === user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          username,
          title,
          current_company,
          location,
          about,
          skills,
          profile_picture_url,
          website,
          linkedin_url,
          github_url
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);

      // Fetch connection status
      if (user?.id) {
        const { data: connectionData } = await supabase
          .from('connections')
          .select('status, requester_id, recipient_id')
          .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`)
          .maybeSingle();

        if (connectionData) {
          setConnectionStatus({
            status: connectionData.status === 'accepted' ? 'connected' : 'pending',
            isRequester: connectionData.requester_id === user.id
          });
        }

        // Check if following
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('followed_id', userId)
          .eq('followed_type', 'user')
          .maybeSingle();

        if (followData) {
          setConnectionStatus(prev => ({ 
            ...prev, 
            status: prev.status === 'connected' ? 'connected' : 'following' 
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    }
  }, [isOpen, userId, user?.id]);

  const handleConnect = async () => {
    if (!user?.id || !userId) return;
    
    triggerHaptic('light');
    setLoading(true);

    try {
      if (connectionStatus.status === 'none') {
        // Send connection request
        const { error } = await supabase
          .from('connections')
          .insert({
            requester_id: user.id,
            recipient_id: userId,
            status: 'pending'
          });

        if (error) throw error;
        setConnectionStatus({ status: 'pending', isRequester: true });
        toast.success('Connection request sent!');
      } else if (connectionStatus.status === 'pending' && connectionStatus.isRequester) {
        // Cancel connection request
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('requester_id', user.id)
          .eq('recipient_id', userId);

        if (error) throw error;
        setConnectionStatus({ status: 'none' });
        toast.success('Connection request cancelled');
      }
      onConnectionChange?.();
    } catch (error) {
      console.error('Error updating connection:', error);
      toast.error('Failed to update connection');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user?.id || !userId) return;
    
    triggerHaptic('light');
    setLoading(true);

    try {
      if (connectionStatus.status === 'following') {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', userId)
          .eq('followed_type', 'user');

        if (error) throw error;
        setConnectionStatus({ status: 'none' });
        toast.success('Unfollowed');
      } else if (connectionStatus.status === 'none') {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            followed_id: userId,
            followed_type: 'user'
          });

        if (error) throw error;
        setConnectionStatus({ status: 'following' });
        toast.success('Following!');
      }
      onConnectionChange?.();
    } catch (error) {
      console.error('Error updating follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    triggerHaptic('light');
    // Navigate to messages - implementation depends on your routing
    toast.info('Opening message...');
  };

  const handleShare = async () => {
    triggerHaptic('light');
    
    if (navigator.share && profile) {
      try {
        await navigator.share({
          title: `${profile.full_name}'s Profile`,
          text: `Check out ${profile.full_name}'s profile on TalentXcel`,
          url: `${window.location.origin}/profile/${profile.username || profile.id}`
        });
      } catch (error) {
        // Fallback to copy
        navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.username || profile.id}`);
        toast.success('Profile link copied!');
      }
    } else if (profile) {
      navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.username || profile.id}`);
      toast.success('Profile link copied!');
    }
  };

  const calculateProfileStrength = (profile: UserProfile): number => {
    let score = 0;
    const fields = [
      profile.full_name,
      profile.title,
      profile.about,
      profile.location,
      profile.current_company,
      profile.skills?.length,
      profile.profile_picture_url
    ];
    
    fields.forEach(field => {
      if (field) score += 1;
    });
    
    return Math.round((score / fields.length) * 100);
  };

  const getConnectionButton = () => {
    if (userId === user?.id) return null;

    switch (connectionStatus.status) {
      case 'connected':
        return (
          <Button 
            variant="outline" 
            className="flex-1 bg-green-50 border-green-200 text-green-700"
            disabled
          >
            <Check className="w-4 h-4 mr-2" />
            Connected
          </Button>
        );
      case 'pending':
        return (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleConnect}
            disabled={loading}
          >
            {connectionStatus.isRequester ? 'Cancel Request' : 'Pending'}
          </Button>
        );
      case 'following':
        return (
          <Button 
            variant="outline" 
            className="flex-1 bg-blue-50 border-blue-200 text-blue-700"
            onClick={handleFollow}
            disabled={loading}
          >
            Following
          </Button>
        );
      default:
        return (
          <Button 
            className="flex-1 bg-primary"
            onClick={handleConnect}
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect
          </Button>
        );
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto p-0 bg-background/95 backdrop-blur-sm border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Header */}
          <div className="text-center p-6 pb-4">
            <div className="relative inline-block">
              <UserAvatar
                src={profile.profile_picture_url}
                userName={profile.full_name}
                size="2xl"
                className="border-4 border-background shadow-lg"
              />
            </div>
            
            <h2 className="text-2xl font-bold mt-4 text-foreground">
              {profile.full_name}
            </h2>
            
            {profile.title && (
              <p className="text-muted-foreground font-medium">
                {profile.title}
              </p>
            )}
            
            {profile.location && (
              <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                {profile.location}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-4">
            <div className="flex gap-3">
              {getConnectionButton()}
              
              {connectionStatus.status !== 'none' && connectionStatus.status !== 'pending' && (
                <Button
                  variant="outline"
                  onClick={handleMessage}
                  disabled={loading}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {connectionStatus.status === 'none' && (
              <Button
                variant="ghost"
                className="w-full mt-2 text-primary"
                onClick={handleFollow}
                disabled={loading}
              >
                Follow
              </Button>
            )}
          </div>

          {/* Profile Strength */}
          <div className="px-6 pb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-foreground">Profile Strength</span>
              <span className="font-bold text-primary">
                {calculateProfileStrength(profile)}%
              </span>
            </div>
            <Progress 
              value={calculateProfileStrength(profile)} 
              className="h-2 bg-muted"
            />
          </div>

          {/* About */}
          {profile.about && (
            <div className="px-6 pb-4">
              <h3 className="font-semibold text-foreground mb-2">About</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {profile.about}
              </p>
            </div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="font-semibold text-foreground mb-3">Skills</h3>
              <div className="grid grid-cols-2 gap-2">
                {profile.skills.slice(0, 6).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="justify-center py-2 text-xs bg-muted/50"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              {profile.skills.length > 6 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  +{profile.skills.length - 6} more skills
                </p>
              )}
            </div>
          )}

          {/* Links */}
          <div className="px-6 pb-6">
            <div className="flex gap-3 justify-center">
              {profile.website && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(profile.website, '_blank')}
                >
                  <Globe className="w-4 h-4" />
                </Button>
              )}
              {profile.linkedin_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(profile.linkedin_url, '_blank')}
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
              )}
              {profile.github_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(profile.github_url, '_blank')}
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};