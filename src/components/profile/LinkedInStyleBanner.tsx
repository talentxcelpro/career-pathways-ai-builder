import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Edit3, Zap, CheckCircle2, MapPin, Briefcase, Building2, ChevronRight, ShieldCheck, Users, ArrowUpDown, Bookmark, Clock, Settings, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LinkedInStyleBannerProps {
  profile?: any;
  isOwnProfile?: boolean;
  stats?: {
    connections: number;
    profileViews: number;
  };
}

export const LinkedInStyleBanner: React.FC<LinkedInStyleBannerProps> = ({
  profile: propProfile,
  isOwnProfile = true,
  stats = { connections: 250, profileViews: 120 }
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [uploading, setUploading] = useState<'banner' | 'avatar' | null>(null);

  // Fetch real live profile from Supabase profiles table
  const { data: dbProfile } = useQuery({
    queryKey: ['live-user-profile-card', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

  const liveProfile = dbProfile || propProfile || user?.user_metadata || {};
  
  const { uploadFile } = useFileUpload({
    bucket: 'avatars',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/*']
  });

  const { updateProfile, updateProfilePicture } = useProfileUpdate();

  const handleImageUpload = async (type: 'banner' | 'avatar', file: File) => {
    setUploading(type);
    try {
      const uploadedUrl = await uploadFile(file);
      if (type === 'avatar') {
        await updateProfilePicture.mutateAsync(uploadedUrl);
      } else {
        await updateProfile.mutateAsync({ cover_image_url: uploadedUrl } as any);
      }
      toast.success(`${type} updated successfully!`);
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to update ${type}`);
    } finally {
      setUploading(null);
    }
  };

  const fullName = liveProfile?.full_name || liveProfile?.name || user?.email?.split('@')[0] || "TalentXcelServices";
  const title = liveProfile?.title || liveProfile?.headline || "Transforming Businesses and Lives";
  const company = liveProfile?.company || liveProfile?.current_company || liveProfile?.organization || "TalentXcel Services";
  const location = liveProfile?.location || "India";
  const avatarUrl = liveProfile?.profile_picture_url || liveProfile?.profile_photo_url || liveProfile?.avatar_url;
  const coverUrl = liveProfile?.cover_image_url;

  return (
    <div className="space-y-4">
      {/* 1. PROFILE CARD MATCHING MOCKUP 1:1 */}
      <Card className="overflow-hidden border border-slate-200/80 dark:border-border/60 shadow-sm bg-white dark:bg-card rounded-3xl">
        
        {/* Cover Banner Header - Clean without chatr badge */}
        <div className="relative w-full h-24 sm:h-28 bg-gradient-to-r from-[#0d1b2a] via-[#1b263b] to-[#0d1b2a] overflow-hidden flex items-center justify-end px-4">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-600/30 via-teal-700/20 to-slate-950" />
          )}

          {/* Camera Edit Button */}
          {isOwnProfile && (
            <label className="relative z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer backdrop-blur-md transition-colors">
              <Camera className="h-4 w-4" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleImageUpload('banner', e.target.files[0])} 
              />
            </label>
          )}
        </div>

        {/* Profile Avatar & Details Content */}
        <CardContent className="px-5 pb-5 pt-0 relative flex flex-col items-center text-center">
          
          {/* Circular Overlapping Avatar */}
          <div className="relative -mt-12 mb-3">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-900 shadow-xl bg-slate-900">
              <AvatarImage src={avatarUrl || undefined} alt={fullName} className="object-cover" />
              <AvatarFallback className="text-2xl font-black bg-slate-900 text-white">
                {fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-md" />
          </div>

          {/* Candidate Name & Verified Badge */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-base font-extrabold text-foreground tracking-tight">{fullName}</h2>
              <CheckCircle2 className="h-4 w-4 text-blue-600 fill-blue-600/20 shrink-0" />
            </div>

            <p className="text-xs font-semibold text-muted-foreground max-w-xs">{title}</p>
            
            <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-muted-foreground pt-0.5">
              <span className="flex items-center gap-1"><Briefcase className="h-3 w-3 text-primary" /> {company}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {location}</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-2.5 w-full pt-4 mt-2 border-t border-slate-100 dark:border-border/60">
            <Button 
              onClick={() => navigate('/profile/edit')} 
              variant="outline" 
              className="rounded-2xl text-xs font-bold border-slate-200 dark:border-border/60 bg-slate-50 dark:bg-muted/40 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1 text-slate-500" />
              Edit Profile
            </Button>

            <Button 
              onClick={() => navigate('/pro')} 
              className="rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md"
            >
              <Zap className="h-3.5 w-3.5 mr-1" />
              Upgrade Now
            </Button>
          </div>

        </CardContent>

      </Card>

      {/* 2. NAVIGATION MENU CARD MATCHING MOCKUP 1:1 */}
      <Card className="border border-slate-200/80 dark:border-border/60 shadow-sm bg-white dark:bg-card rounded-3xl p-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-3 px-1">Navigation</h3>
        
        <div className="space-y-1">
          <Link to="/network/verified" className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600"><ShieldCheck className="h-4 w-4" /></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary">Verified</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link to="/network/connections" className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600"><Users className="h-4 w-4" /></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary">My Network</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link to="/network/skill-swap" className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600"><ArrowUpDown className="h-4 w-4" /></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary">Skill Swap</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link to="/saved-jobs" className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600"><Bookmark className="h-4 w-4" /></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary">Saved Items</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link to="/profile/analytics" className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600"><Clock className="h-4 w-4" /></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary">My Activities</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link to="/profile/settings" className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400"><Settings className="h-4 w-4" /></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary">Settings</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

      </Card>
    </div>
  );
};