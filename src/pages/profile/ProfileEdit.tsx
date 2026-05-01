
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

const ProfileEdit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'resumes',
    maxSize: 50 * 1024 * 1024, // 50MB for resumes
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });
  
  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

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
    enabled: !!currentUser?.id
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
    work_experiences: [] as Array<{
      id: string;
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      isCurrent: boolean;
      description: string;
      location: string;
    }>
  });

  const handleFieldChange = (field: string, value: string | number | Array<any>) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        title: profile.title || '',
        headline: profile.headline || '',
        location: profile.location || '',
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        about: profile.about || '',
        skills: profile.skills || [],
        industry: profile.industry || '',
        current_company: profile.current_company || '',
        experience_years: profile.experience_years || 0,
        profile_picture_url: profile.profile_picture_url || '',
        social_links: (profile.social_links && typeof profile.social_links === 'object' && !Array.isArray(profile.social_links)) 
          ? profile.social_links as Record<string, string> 
          : {},
        profile_visibility: (profile.profile_visibility === 'public' || profile.profile_visibility === 'private' || profile.profile_visibility === 'connections_only') 
          ? profile.profile_visibility 
          : 'public',
        allow_profile_sharing: profile.allow_profile_sharing ?? true,
        custom_profile_url: profile.custom_profile_url || generateCustomProfileUrl(profile.full_name || ''),
        resume_url: profile.resume_url || '',
        work_experiences: (profile.work_experiences as any) || []
      });
    }
  }, [profile]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log('Starting save mutation...');
      console.log('User ID:', currentUser?.id);
      
      if (!currentUser?.id) throw new Error('No user ID');

      const updateData = {
        id: currentUser.id,
        ...data,
        username: profile?.username || `user${currentUser.id.slice(0, 8)}`, // Preserve existing username
        updated_at: new Date().toISOString()
      };
      
      console.log('Update data:', updateData);

      // Try to update existing profile first
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', currentUser.id)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;

      if (updated) {
        return updated;
      }

      // If no existing profile, create one with required fields
      let finalUsername = profile?.username as string | undefined;
      if (!finalUsername) {
        const sourceName = data.full_name || (currentUser?.user_metadata as any)?.full_name || currentUser?.email?.split('@')[0] || 'user';
        const { data: genUsername } = await supabase.rpc('generate_username_from_name', { full_name: sourceName });
        finalUsername = (genUsername as unknown as string) || `user${currentUser.id.slice(0, 8)}`;
      }

      const insertData = {
        id: currentUser.id,
        username: finalUsername,
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert(insertData)
        .select()
        .single();

      if (insertError) throw insertError;
      return inserted;

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', currentUser?.id] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      navigate('/profile');
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast({
        title: "Error saving profile",
        description: error?.message || error?.details || error?.hint || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser?.id) return;

    try {
      const url = await uploadFile(file, currentUser.id);
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
    console.log('Save button clicked');
    console.log('Form data:', formData);
    console.log('Current user:', currentUser);
    
    if (!formData.full_name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    console.log('About to save profile...');
    saveProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <ProfileLayout title="Edit Profile" description="Update your professional information">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate('/profile')}>
            Cancel
          </Button>
          <Button 
            onClick={(e) => {
              console.log('Button clicked event:', e);
              handleSave();
            }} 
            disabled={saveProfileMutation.isPending}
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
    </ProfileLayout>
  );
};

export default ProfileEdit;
