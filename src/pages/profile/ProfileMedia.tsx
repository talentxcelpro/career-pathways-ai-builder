
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { ProfilePhotoUpload } from "@/components/profile/media/ProfilePhotoUpload";
import { VideoResumeUpload } from "@/components/profile/media/VideoResumeUpload";
import { PortfolioForm } from "@/components/profile/media/PortfolioForm";
import { PortfolioGrid } from "@/components/profile/media/PortfolioGrid";
import { useFileUpload } from "@/hooks/useFileUpload";
import { MediaPreview, MediaGallery } from "@/components/ui/MediaPreview";
import { MEDIA_PATHS } from "@/utils/mediaHelpers";

const ProfileMedia = () => {
  const { toast } = useToast();
  const { uploadWithMetadata, uploading } = useFileUpload({
    bucket: 'media',
    maxSize: 50 * 1024 * 1024, // 50MB for videos
    allowedTypes: ['image/jpeg', 'image/png', 'video/mp4', 'video/webm']
  });
  
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioItems] = useState([]);

  const [portfolioFormData, setPortfolioFormData] = useState({
    title: '',
    description: '',
    projectUrl: '',
    type: 'project'
  });

  const handleMediaUpload = async (file: File, type: 'photo' | 'video') => {
    try {
      const bucketKey = type === 'photo' ? MEDIA_PATHS.USER_MEDIA : MEDIA_PATHS.POST_MEDIA;
      const fileUrl = await uploadWithMetadata(file, bucketKey, {
        module: 'profile',
        category: type === 'photo' ? 'avatar' : 'video-resume',
        description: `User ${type === 'photo' ? 'profile photo' : 'video resume'}`
      });
      
      toast({
        title: `${type === 'photo' ? 'Photo' : 'Video'} Uploaded`,
        description: `Your ${type === 'photo' ? 'profile photo' : 'video resume'} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${type}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handlePortfolioSubmit = () => {
    toast({
      title: "Portfolio Item Added",
      description: "Your project has been added to your portfolio.",
    });
    setPortfolioFormData({ title: '', description: '', projectUrl: '', type: 'project' });
    setShowPortfolioForm(false);
  };

  return (
    <ProfileLayout 
      title="Media & Portfolio" 
      description="Showcase your work with photos, videos, and project portfolio"
    >
      <div className="space-y-6">
        {/* Media Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Profile Media</CardTitle>
              <CardDescription>Upload your professional photo and video resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfilePhotoUpload onUploadSuccess={(url) => console.log('Photo uploaded:', url)} />
              <VideoResumeUpload onUploadSuccess={(url) => console.log('Video uploaded:', url)} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Media Guidelines</CardTitle>
              <CardDescription>Tips for professional media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm">Profile Photo</h4>
                  <p className="text-xs text-gray-600">Professional headshot, good lighting, neutral background</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Video Resume</h4>
                  <p className="text-xs text-gray-600">60-90 seconds, clear audio, introduce yourself professionally</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">File Formats</h4>
                  <p className="text-xs text-gray-600">Photos: JPG, PNG | Videos: MP4, WebM (max 50MB)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Project Portfolio</CardTitle>
                <CardDescription>Showcase your best work and projects</CardDescription>
              </div>
              <Button 
                onClick={() => setShowPortfolioForm(true)}
                disabled={uploading}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                {uploading ? 'Processing...' : 'Add Project'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showPortfolioForm && (
              <PortfolioForm
                formData={portfolioFormData}
                setFormData={setPortfolioFormData}
                onSubmit={handlePortfolioSubmit}
                onCancel={() => setShowPortfolioForm(false)}
              />
            )}
            
            <PortfolioGrid items={portfolioItems} />
          </CardContent>
        </Card>

        {/* Portfolio Tips */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Portfolio Best Practices</CardTitle>
            <CardDescription>Make your work stand out</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Quality over Quantity</h4>
                  <p className="text-sm text-gray-600">Show 3-5 of your best projects rather than everything you've worked on.</p>
                </div>
                <div>
                  <h4 className="font-medium">Tell the Story</h4>
                  <p className="text-sm text-gray-600">Explain the problem, your solution, and the impact of your work.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Include Live Links</h4>
                  <p className="text-sm text-gray-600">Provide working demos or GitHub repositories when possible.</p>
                </div>
                <div>
                  <h4 className="font-medium">Use Relevant Tags</h4>
                  <p className="text-sm text-gray-600">Tag projects with technologies and skills used for better discoverability.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  );
};

export default ProfileMedia;
