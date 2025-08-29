import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Share2, 
  Copy, 
  ExternalLink, 
  Eye, 
  Users, 
  Trophy,
  Settings,
  Globe,
  Lock,
  QrCode,
  Download,
  Heart,
  MessageCircle,
  LinkedinIcon,
  Twitter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import QRCode from 'qrcode.react';

interface SocialSettings {
  isPublic: boolean;
  showAchievements: boolean;
  showScores: boolean;
  showJourney: boolean;
  customUrl?: string;
  bio?: string;
}

interface ShareableContent {
  type: 'passport' | 'achievement' | 'milestone';
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
}

export function SocialSharingFeatures({ userId, userProfile }: { 
  userId?: string; 
  userProfile?: any;
}) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const isOwner = !userId || userId === user?.id;
  const queryClient = useQueryClient();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ShareableContent | null>(null);

  // Fetch social settings
  const { data: socialSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['social-settings', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('social_settings, custom_url')
        .eq('id', targetUserId)
        .single();

      if (error) throw error;
      
      return {
        ...data.social_settings,
        customUrl: data.custom_url
      } as SocialSettings;
    },
    enabled: !!targetUserId,
  });

  // Fetch passport views
  const { data: passportViews = 0 } = useQuery({
    queryKey: ['passport-views', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return 0;
      
      const { data, error } = await supabase
        .from('passport_views')
        .select('*')
        .eq('profile_user_id', targetUserId);

      if (error) return 0;
      return data.length;
    },
    enabled: !!targetUserId,
  });

  // Update social settings
  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<SocialSettings>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ 
          social_settings: newSettings,
          custom_url: newSettings.customUrl 
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-settings', targetUserId] });
      toast.success('Settings updated successfully!');
    }
  });

  // Track passport view
  const trackView = useMutation({
    mutationFn: async () => {
      if (!targetUserId || targetUserId === user?.id) return;

      const { error } = await supabase
        .from('passport_views')
        .insert({
          profile_user_id: targetUserId,
          viewer_user_id: user?.id,
          viewed_at: new Date().toISOString()
        });

      if (error && error.code !== '23505') throw error; // Ignore duplicate entries
    }
  });

  // Track view on component mount
  React.useEffect(() => {
    if (targetUserId && targetUserId !== user?.id) {
      trackView.mutate();
    }
  }, [targetUserId, user?.id]);

  const generateShareUrl = (type: string = 'passport') => {
    const baseUrl = window.location.origin;
    const customUrl = socialSettings?.customUrl;
    
    if (customUrl && type === 'passport') {
      return `${baseUrl}/passport/${customUrl}`;
    }
    
    return `${baseUrl}/passport/${targetUserId}`;
  };

  const shareContent: ShareableContent[] = [
    {
      type: 'passport',
      title: `${userProfile?.full_name}'s Career Passport`,
      description: `Check out my professional journey and achievements on TalentXcel`,
      url: generateShareUrl('passport')
    },
    {
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      description: `I just earned a new career achievement on TalentXcel`,
      url: generateShareUrl('achievement')
    }
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareToSocial = (platform: string, content: ShareableContent) => {
    const encodedText = encodeURIComponent(`${content.title} - ${content.description}`);
    const encodedUrl = encodeURIComponent(content.url);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="space-y-6">
      {/* Social Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Public Profile
              </CardTitle>
              <CardDescription>
                Share your career achievements with the world
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-2xl font-bold">{passportViews}</div>
                <div className="text-xs text-muted-foreground">Profile Views</div>
              </div>
              {isOwner && (
                <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Social Settings</DialogTitle>
                      <DialogDescription>
                        Control what others can see on your public profile
                      </DialogDescription>
                    </DialogHeader>
                    <SocialSettingsForm 
                      settings={socialSettings}
                      onUpdate={(settings) => updateSettings.mutate(settings)}
                      isLoading={updateSettings.isPending}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Visibility Status */}
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  socialSettings?.isPublic ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {socialSettings?.isPublic ? <Globe className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <div className="font-medium">
                  {socialSettings?.isPublic ? 'Public' : 'Private'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Profile Visibility
                </div>
              </CardContent>
            </Card>

            {/* Custom URL */}
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-blue-100 text-blue-600">
                  <ExternalLink className="w-6 h-6" />
                </div>
                <div className="font-medium truncate">
                  {socialSettings?.customUrl || 'Not Set'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Custom URL
                </div>
              </CardContent>
            </Card>

            {/* Share Actions */}
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share Your Profile</DialogTitle>
                      <DialogDescription>
                        Choose how you want to share your career passport
                      </DialogDescription>
                    </DialogHeader>
                    <ShareContentDialog 
                      content={shareContent[0]}
                      onCopy={copyToClipboard}
                      onShare={shareToSocial}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Viewers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Recent Viewers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentViewers userId={targetUserId} />
          </CardContent>
        </Card>

        {/* Achievement Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Shareable Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ShareableAchievements 
              userId={targetUserId}
              onShare={(achievement) => {
                setSelectedContent({
                  type: 'achievement',
                  title: `Achievement: ${achievement.title}`,
                  description: achievement.description,
                  url: `${generateShareUrl('passport')}#achievement-${achievement.id}`
                });
                setShareDialogOpen(true);
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* QR Code for easy sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            QR Code
          </CardTitle>
          <CardDescription>
            Share your profile instantly with a QR code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCode 
                value={generateShareUrl('passport')}
                size={200}
                level="M"
                includeMargin
              />
            </div>
          </div>
          <div className="text-center mt-4">
            <Button variant="outline" onClick={() => {/* Implement QR download */}}>
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SocialSettingsForm({ 
  settings, 
  onUpdate, 
  isLoading 
}: {
  settings?: SocialSettings;
  onUpdate: (settings: Partial<SocialSettings>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<SocialSettings>(
    settings || {
      isPublic: true,
      showAchievements: true,
      showScores: true,
      showJourney: true,
      customUrl: '',
      bio: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Public Profile</label>
          <Switch
            checked={formData.isPublic}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Show Achievements</label>
          <Switch
            checked={formData.showAchievements}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showAchievements: checked }))}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Show Scores</label>
          <Switch
            checked={formData.showScores}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showScores: checked }))}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Custom URL</label>
          <Input
            value={formData.customUrl || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, customUrl: e.target.value }))}
            placeholder="your-name"
          />
          <p className="text-xs text-muted-foreground">
            talentxcel.com/passport/your-name
          </p>
        </div>
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
}

function ShareContentDialog({ 
  content, 
  onCopy, 
  onShare 
}: {
  content: ShareableContent;
  onCopy: (text: string) => void;
  onShare: (platform: string, content: ShareableContent) => void;
}) {
  return (
    <div className="space-y-4">
      {/* URL Copy */}
      <div className="flex items-center gap-2">
        <Input value={content.url} readOnly className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => onCopy(content.url)}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>

      {/* Social Share Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="outline" 
          onClick={() => onShare('linkedin', content)}
          className="text-blue-600"
        >
          <LinkedinIcon className="w-4 h-4 mr-1" />
          LinkedIn
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onShare('twitter', content)}
          className="text-sky-500"
        >
          <Twitter className="w-4 h-4 mr-1" />
          Twitter
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onShare('whatsapp', content)}
          className="text-green-600"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          WhatsApp
        </Button>
      </div>

      {/* QR Code */}
      <div className="text-center pt-4 border-t">
        <div className="bg-white p-2 inline-block rounded">
          <QRCode value={content.url} size={120} />
        </div>
      </div>
    </div>
  );
}

function RecentViewers({ userId }: { userId?: string }) {
  const { data: viewers = [] } = useQuery({
    queryKey: ['recent-viewers', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('passport_views')
        .select(`
          viewer_user_id,
          viewed_at,
          profiles:viewer_user_id (
            full_name,
            profile_picture_url,
            headline
          )
        `)
        .eq('profile_user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  if (viewers.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No recent viewers
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {viewers.map((viewer, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={viewer.profiles?.profile_picture_url} />
            <AvatarFallback>{viewer.profiles?.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{viewer.profiles?.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{viewer.profiles?.headline}</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(viewer.viewed_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function ShareableAchievements({ 
  userId, 
  onShare 
}: { 
  userId?: string;
  onShare: (achievement: any) => void;
}) {
  const { data: achievements = [] } = useQuery({
    queryKey: ['shareable-achievements', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('career_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('earned_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  if (achievements.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No public achievements to share
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {achievements.map((achievement) => (
        <div key={achievement.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{achievement.achievement_title}</h4>
            <p className="text-xs text-muted-foreground">{achievement.points_awarded} points</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onShare(achievement)}
          >
            <Share2 className="w-3 h-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}