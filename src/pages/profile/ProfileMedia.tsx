
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { PortfolioManager } from '@/components/profile/PortfolioManager';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from '@/hooks/useFileUpload';
import { Upload, Video } from "lucide-react";

const ProfileMedia = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'portfolio',
    maxSize: 50 * 1024 * 1024, // 50MB for videos
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime']
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
  const { data: profile } = useQuery({
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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!currentUser?.id) throw new Error('No user ID');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', currentUser?.id] });
    }
  });

  const handleProfilePictureChange = (url: string) => {
    updateProfileMutation.mutate({ profile_picture_url: url });
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser?.id) return;

    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file.",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = await uploadFile(file, currentUser.id, 'portfolio');
      if (url) {
        // You might want to store this in a separate field or as a portfolio item
        toast({
          title: "Video uploaded",
          description: "Your video resume has been uploaded successfully."
        });
      }
    } catch (error) {
      console.error('Video upload failed:', error);
    }
  };

  if (!currentUser) {
    return (
      <ProfileLayout title="Media & Portfolio" description="Please log in to manage your media">
        <div className="text-center py-8">
          <p className="text-gray-600">Please log in to access your media and portfolio.</p>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout 
      title="Media & Portfolio" 
      description="Upload your profile photo, video resume, and showcase your work"
    >
      <div className="space-y-6">
        {/* Profile Photo & Video */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Media</CardTitle>
            <CardDescription>Update your profile photo and video resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Photo */}
              <div className="text-center">
                <h3 className="font-medium mb-4">Profile Photo</h3>
                <ProfilePictureUpload
                  currentImageUrl={profile?.profile_picture_url}
                  userName={profile?.full_name}
                  userId={currentUser.id}
                  onImageChange={handleProfilePictureChange}
                />
                <p className="text-sm text-gray-600 mt-2">
                  Upload a professional headshot. JPG or PNG format, max 50MB.
                </p>
              </div>

              {/* Video Resume */}
              <div className="text-center">
                <h3 className="font-medium mb-4">Video Resume</h3>
                <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload">
                  <Button variant="outline" className="cursor-pointer" disabled={uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Video'}
                  </Button>
                </label>
                <p className="text-sm text-gray-600 mt-2">
                  Record a 60-90 second video introduction. MP4 format, max 50MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Section */}
        <PortfolioManager userId={currentUser.id} />

        {/* Media Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Media Guidelines</CardTitle>
            <CardDescription>Best practices for your profile media</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Profile Photo Tips</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Use a high-quality, recent photo</li>
                  <li>• Face should be clearly visible</li>
                  <li>• Professional attire recommended</li>
                  <li>• Neutral background works best</li>
                  <li>• Smile and make eye contact</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Video Resume Tips</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Keep it between 60-90 seconds</li>
                  <li>• Good lighting and audio quality</li>
                  <li>• Professional appearance</li>
                  <li>• Introduce yourself and key skills</li>
                  <li>• Practice before recording</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  );
};

export default ProfileMedia;
