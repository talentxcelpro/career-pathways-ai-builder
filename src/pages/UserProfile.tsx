import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Phone,
  Calendar,
  Award,
  BookOpen,
  Briefcase,
  Globe,
  MessageCircle,
  UserPlus,
  Clock,
  Coins
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name: string;
  profile_picture_url: string;
  headline: string;
  title: string;
  current_company: string;
  location: string;
  bio: string;
  skills: string[];
  email: string;
  phone: string;
  website: string;
  created_at: string;
  education: any[];
  experience: any[];
  certifications: any[];
}

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { availableBalance, isLoading: balanceLoading } = useTokenBalance();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [profileStrength, setProfileStrength] = useState(0);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
      if (currentUser) {
        checkConnectionStatus();
      }
    }
  }, [username, currentUser]);

  const fetchUserProfile = async () => {
    try {
      // First try to find by username, then by ID
      let query = supabase
        .from('profiles')
        .select('*');
      
      // Check if parameter is a UUID (for backwards compatibility)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username || '');
      
      if (isUUID) {
        query = query.eq('id', username);
      } else {
        query = query.eq('username', username);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('User not found');
        navigate('/network');
        return;
      }

      // If legacy UUID URL is used, redirect to slug-based URL for SEO
      if (isUUID && (data as any)?.slug) {
        navigate(`/${(data as any).slug}`, { replace: true });
        return;
      }

      setProfile(data);
      calculateProfileStrength(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileStrength = (profileData: any) => {
    let score = 0;
    const fields = [
      'full_name', 'profile_picture_url', 'headline', 'title', 
      'current_company', 'location', 'bio', 'skills'
    ];
    
    fields.forEach(field => {
      if (profileData[field]) {
        if (field === 'skills' && Array.isArray(profileData[field]) && profileData[field].length > 0) {
          score += 12.5;
        } else if (field !== 'skills') {
          score += 12.5;
        }
      }
    });
    
    setProfileStrength(Math.round(score));
  };

  const checkConnectionStatus = async () => {
    if (!currentUser?.id || !profile?.id) return;

    try {
      const { data } = await supabase
        .from('connections')
        .select('status')
        .or(`and(requester_id.eq.${currentUser.id},recipient_id.eq.${profile.id}),and(requester_id.eq.${profile.id},recipient_id.eq.${currentUser.id})`)
        .single();

      if (data) {
        setConnectionStatus(data.status);
      }
    } catch (error) {
      // No connection exists
      setConnectionStatus('none');
    }
  };

  const handleConnect = async () => {
    if (!currentUser?.id || !profile?.id) return;

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentUser.id,
          recipient_id: profile.id,
          status: 'pending'
        });

      if (error) throw error;

      setConnectionStatus('pending');
      toast.success('Connection request sent!');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  };

  const handleMessage = () => {
    toast.info('Messaging feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <Button onClick={() => navigate('/network')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Network
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Profile</h1>
          <div className="w-9" /> {/* Spacer for alignment */}
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <Avatar className="w-20 h-20 border-2 border-sky-400 bg-sky-100 dark:bg-sky-950 shadow-md">
              <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} className="w-full h-full object-contain p-1 bg-sky-100 dark:bg-sky-950 rounded-full" />
              <AvatarFallback className="text-xl font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-200">
                {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">{profile.full_name}</h2>
            <p className="text-muted-foreground font-medium">
              {profile.title || profile.headline || 'Professional'}
            </p>
            {profile.location && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </p>
            )}
          </div>
        </div>

        {/* Profile Strength */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Profile Strength</h3>
            <span className="text-lg font-bold text-primary">{profileStrength}%</span>
          </div>
          <Progress value={profileStrength} className="h-2" />
        </div>

        {/* Token Balance - Only show for own profile */}
        {isOwnProfile && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">TXC Balance</h3>
                  <p className="text-sm text-muted-foreground">TalentXcel Coins</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {balanceLoading ? '...' : availableBalance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Available TXC</p>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        {profile.bio && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">About</h3>
            <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Skills</h3>
            <div className="grid grid-cols-2 gap-2">
              {profile.skills.map((skill, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {profile.current_company && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Experience</h3>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{profile.title || 'Current Position'}</h4>
                  <p className="text-sm text-muted-foreground">{profile.current_company}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Actions */}
        {!isOwnProfile && (
          <div className="flex gap-3 pt-4">
            {connectionStatus === 'none' && (
              <Button onClick={handleConnect} className="flex-1">
                <UserPlus className="w-4 h-4 mr-2" />
                Connect
              </Button>
            )}
            {connectionStatus === 'pending' && (
              <Button variant="outline" className="flex-1" disabled>
                <Clock className="w-4 h-4 mr-2" />
                Pending
              </Button>
            )}
            {connectionStatus === 'connected' && (
              <Button onClick={handleMessage} className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            )}
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <div className="space-y-3">
            {profile.email && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{profile.email}</span>
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{profile.phone}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{profile.website}</span>
              </div>
            )}
          </div>
        </div>

        {/* Member Since */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
          <Calendar className="w-4 h-4" />
          <span>
            Member since {new Date(profile.created_at).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;