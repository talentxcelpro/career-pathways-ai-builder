
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import ProfileLayout from "@/components/profile/ProfileLayout";
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { SocialLinksManager } from '@/components/profile/SocialLinksManager';
import { ProfileVisibilitySettings } from '@/components/profile/ProfileVisibilitySettings';
import { useFileUpload } from '@/hooks/useFileUpload';
import { generateCustomProfileUrl } from '@/utils/profileHelpers';
import { SkillsSection } from '@/components/profile/edit/SkillsSection';
import { ResumeUploadSection } from '@/components/profile/edit/ResumeUploadSection';
import { BasicInformationSection } from '@/components/profile/edit/BasicInformationSection';
import { ProfessionalDetailsSection } from '@/components/profile/edit/ProfessionalDetailsSection';
import { useAuth } from '@/contexts/AuthContext';
import { SessionStatusIndicator } from '@/components/auth/SessionStatusIndicator';

type WorkExperience = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  location: string;
};

const ProfileEdit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser, loading: authLoading, refreshSession } = useAuth();
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'resumes',
    maxSize: 50 * 1024 * 1024, // 50MB for resumes
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });
  const resolveAuthenticatedUser = async () => {
    if (currentUser?.id) return currentUser;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return session.user;
    try { await refreshSession(); } catch (_) { /* noop */ }
    for (let i = 0; i < 5; i++) {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (s?.user) return s.user;
      await new Promise(r => setTimeout(r, 400));
    }
    throw new Error('Your session could not be verified. Please sign in again.');
  };

  // Get profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !authLoading && !!currentUser?.id
  });

  const [formData, setFormData] = useState({
    full_name: '',
    title: '',
    headline: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    about: '',
    skills: [] as string[],
    industry: '',
    current_company: '',
    experience_years: 0,
    profile_picture_url: '',
    social_links: {} as Record<string, string>,
    profile_visibility: 'public' as 'public' | 'private' | 'connections_only',
    allow_profile_sharing: true,
    custom_profile_url: '',
    resume_url: '',
    work_experiences: [] as WorkExperience[]
  });

  const handleFieldChange = (field: string, value: string | number | boolean | unknown[] | Record<string, string>) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      let rawPic = profile.profile_picture_url || profile.profile_photo_url || '';
      if (rawPic.startsWith('?') || (!rawPic.startsWith('http') && !rawPic.startsWith('/') && !rawPic.startsWith('data:'))) {
        rawPic = '';
      }

      setFormData({
        full_name: profile.full_name || '',
        title: profile.title || '',
        headline: profile.headline || '',
        location: profile.location || '',
        email: profile.email || currentUser?.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        about: profile.about || '',
        skills: profile.skills || [],
        industry: profile.industry || '',
        current_company: profile.current_company || '',
        experience_years: profile.experience_years || 0,
        profile_picture_url: rawPic,
        social_links: (profile.social_links && typeof profile.social_links === 'object' && !Array.isArray(profile.social_links)) 
          ? profile.social_links as Record<string, string> 
          : {},
        profile_visibility: (profile.profile_visibility === 'public' || profile.profile_visibility === 'private' || profile.profile_visibility === 'connections_only') 
          ? profile.profile_visibility 
          : 'public',
        allow_profile_sharing: profile.allow_profile_sharing ?? true,
        custom_profile_url: profile.custom_profile_url || '',
        resume_url: profile.resume_url || '',
        work_experiences: ((profile.work_experiences as any[]) || []).map(exp => ({
          id: exp.id || Date.now().toString(),
          company: exp.company || '',
          position: exp.position || '',
          startDate: exp.startDate || '',
          endDate: (exp.isCurrent || exp.is_current) ? '' : (exp.endDate || ''),
          isCurrent: Boolean(exp.isCurrent ?? exp.is_current ?? false),
          description: exp.description || '',
          location: exp.location || ''
        }))
      });

      // Auto-heal missing or corrupted avatar from storage if user uploaded one previously
      if (!rawPic && currentUser?.id) {
        supabase.storage.from('avatars').list(currentUser.id).then(({ data: files }) => {
          if (files && files.length > 0) {
            const sorted = files.sort((a, b) => new Date(b.created_at || b.updated_at || 0).getTime() - new Date(a.created_at || a.updated_at || 0).getTime());
            const newest = sorted[0];
            if (newest) {
              const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`${currentUser.id}/${newest.name}`);
              if (publicUrl) {
                setFormData(prev => ({
                  ...prev,
                  profile_picture_url: publicUrl
                }));
                // Heal in database silently
                supabase.from('profiles').update({
                  profile_picture_url: publicUrl,
                  profile_photo_url: publicUrl,
                  updated_at: new Date().toISOString()
                }).eq('id', currentUser.id);
              }
            }
          }
        }).catch(err => console.warn('Avatar auto-heal check notice:', err));
      }
    }
  }, [profile, currentUser?.id, currentUser?.email]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const activeUser = await resolveAuthenticatedUser();

      // Normalize work experiences
      const normalizedWorkExperiences = (data.work_experiences || []).map(exp => ({
        id: exp.id || Date.now().toString(),
        company: exp.company || '',
        position: exp.position || '',
        startDate: exp.startDate || '',
        endDate: exp.isCurrent ? '' : (exp.endDate || ''),
        isCurrent: Boolean(exp.isCurrent),
        description: exp.description || '',
        location: exp.location || ''
      }));

      // Validate and clean picture URL
      let cleanPictureUrl = (data.profile_picture_url && (data.profile_picture_url.startsWith('http') || data.profile_picture_url.startsWith('/') || data.profile_picture_url.startsWith('data:')))
        ? data.profile_picture_url.trim()
        : null;

      // If still missing, check storage for any existing uploaded avatar
      if (!cleanPictureUrl && activeUser.id) {
        try {
          const { data: files } = await supabase.storage.from('avatars').list(activeUser.id);
          if (files && files.length > 0) {
            const sorted = files.sort((a, b) => new Date(b.created_at || b.updated_at || 0).getTime() - new Date(a.created_at || a.updated_at || 0).getTime());
            if (sorted[0]) {
              const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`${activeUser.id}/${sorted[0].name}`);
              if (publicUrl) cleanPictureUrl = publicUrl;
            }
          }
        } catch (_) { /* ignore */ }
      }

      // Build safe update payload - NEVER include 'id' in update body to avoid FK validation errors
      const updatePayload: Record<string, any> = {
        full_name: data.full_name?.trim() || null,
        title: data.title?.trim() || null,
        headline: data.headline?.trim() || null,
        location: data.location?.trim() || null,
        phone: data.phone?.trim() || null,
        website: data.website?.trim() || null,
        about: data.about?.trim() || null,
        skills: Array.isArray(data.skills) ? data.skills : [],
        industry: data.industry?.trim() || null,
        current_company: data.current_company?.trim() || null,
        experience_years: typeof data.experience_years === 'number' ? data.experience_years : Number(data.experience_years) || 0,
        profile_picture_url: cleanPictureUrl,
        profile_photo_url: cleanPictureUrl,
        social_links: data.social_links && typeof data.social_links === 'object' ? data.social_links : {},
        profile_visibility: data.profile_visibility || 'public',
        allow_profile_sharing: data.allow_profile_sharing ?? true,
        resume_url: data.resume_url?.trim() || null,
        work_experiences: normalizedWorkExperiences,
        updated_at: new Date().toISOString()
      };

      if (data.email && data.email.trim()) {
        updatePayload.email = data.email.trim();
      }

      if (data.custom_profile_url && data.custom_profile_url.trim()) {
        updatePayload.custom_profile_url = data.custom_profile_url.trim();
      }

      // Try to update existing profile first
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', activeUser.id)
        .select()
        .maybeSingle();

      if (updateError) {
        // If unique constraint violation on custom_profile_url, retry without custom_profile_url
        if (updateError.code === '23505' && updatePayload.custom_profile_url) {
          delete updatePayload.custom_profile_url;
          const { data: retryUpdated, error: retryError } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', activeUser.id)
            .select()
            .maybeSingle();
          if (retryError) throw retryError;
          return retryUpdated;
        }
        console.error('Profile update failed:', updateError);
        throw updateError;
      }

      if (updated) {
        return updated;
      }

      // If no existing profile, create one with required fields (for new users)
      const fallbackUsername = (data.full_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user') + '_' + activeUser.id.slice(0, 6);
      let finalUsername = profile?.username as string | undefined;
      if (!finalUsername) {
        try {
          const sourceName = data.full_name || activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0] || 'user';
          const { data: genUsername } = await supabase.rpc('generate_username_from_name', { full_name: sourceName });
          finalUsername = (genUsername as unknown as string) || fallbackUsername;
        } catch (_) {
          finalUsername = fallbackUsername;
        }
      }

      const insertData = {
        id: activeUser.id,
        username: finalUsername || fallbackUsername,
        ...updatePayload
      };

      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        // If username or custom_profile_url collided, append random suffix and retry
        if (insertError.code === '23505') {
          insertData.username = `${fallbackUsername}_${Math.floor(Math.random() * 1000)}`;
          delete insertData.custom_profile_url;
          const { data: retryInserted, error: retryInsertErr } = await supabase
            .from('profiles')
            .insert(insertData)
            .select()
            .single();
          if (retryInsertErr) throw retryInsertErr;
          return retryInserted;
        }
        console.error('Profile insert failed:', insertError);
        throw insertError;
      }
      return inserted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      navigate('/profile');
    },
    onError: (error: unknown) => {
      console.error('Save error:', error);
      const profileError = error as { message?: string; details?: string; hint?: string };
      toast({
        title: "Error saving profile",
        description: profileError.message || profileError.details || profileError.hint || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const activeUser = await resolveAuthenticatedUser();
      const url = await uploadFile(file, activeUser.id);
      setFormData(prev => ({ ...prev, resume_url: url }));
      
      toast({
        title: "Resume uploaded successfully!",
        description: "Your resume has been uploaded and linked to your profile.",
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (!formData.full_name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (authLoading) {
      toast({
        title: "Still signing you in",
        description: "Please wait a moment while we restore your session.",
      });
      return;
    }

    saveProfileMutation.mutate(formData);
  };

  if (authLoading || isLoading) {
    return (
      <ProfileLayout title="Edit Profile" description="Update your professional information">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProfileLayout>
    );
  }

  if (!currentUser) {
    return (
      <ProfileLayout title="Edit Profile" description="Update your professional information">
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
          <p className="text-body text-muted-foreground">Please sign in to edit your profile.</p>
          <Button onClick={() => navigate('/auth/login')}>Sign in</Button>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout 
      title="Edit Profile" 
      description="Update your professional information and preferences"
    >
      <div className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a professional photo</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfilePictureUpload
              currentImageUrl={formData.profile_picture_url}
              userName={formData.full_name}
              userId={currentUser?.id || ''}
              onImageChange={(url) => setFormData(prev => ({ ...prev, profile_picture_url: url }))}
            />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <BasicInformationSection
          formData={{
            full_name: formData.full_name,
            title: formData.title,
            headline: formData.headline || '',
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            website: formData.website,
          }}
          onFieldChange={handleFieldChange}
        />

        {/* Resume Upload */}
        <ResumeUploadSection
          resumeUrl={formData.resume_url}
          onResumeUpload={handleResumeUpload}
          uploading={uploading}
        />

        {/* Professional Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
            <CardDescription>Tell potential employers about yourself</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.about}
              onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
              placeholder="Write a compelling summary of your professional background..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.about.length}/500 characters
            </p>
          </CardContent>
        </Card>

        {/* Skills */}
        <SkillsSection
          skills={formData.skills}
          onSkillsChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
        />

        {/* Professional Details */}
        <ProfessionalDetailsSection
          formData={{
            industry: formData.industry,
            experience_years: formData.experience_years,
            current_company: formData.current_company,
            work_experiences: formData.work_experiences,
          }}
          onFieldChange={handleFieldChange}
        />

        {/* Social Links */}
        <SocialLinksManager
          socialLinks={formData.social_links}
          onSocialLinksChange={(links) => setFormData(prev => ({ ...prev, social_links: links }))}
        />

        {/* Privacy & Visibility */}
        <ProfileVisibilitySettings
          visibility={formData.profile_visibility}
          allowSharing={formData.allow_profile_sharing}
          customUrl={formData.custom_profile_url}
          onVisibilityChange={(visibility) => setFormData(prev => ({ ...prev, profile_visibility: visibility }))}
          onSharingChange={(allow) => setFormData(prev => ({ ...prev, allow_profile_sharing: allow }))}
        />

        {/* Save Button */}
        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SessionStatusIndicator />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={authLoading || saveProfileMutation.isPending}
            >
              {saveProfileMutation.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfileEdit;
