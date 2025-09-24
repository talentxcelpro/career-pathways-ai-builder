import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Play, Pause, Volume2, VolumeX, Sparkles } from "lucide-react";
import { linkifyText, extractHashtags, extractMentions } from "@/utils/textUtils";

interface ReelsUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const ReelsUploadModal: React.FC<ReelsUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid File",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Video file must be less than 100MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    try {
      // Upload video to Supabase storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName);

      // Create post with video
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          content: description,
          media_urls: [urlData.publicUrl],
          post_type: 'video',
          author_id: user.id,
          user_id: user.id,
          tags: extractHashtags(description),
          visibility: 'public',
          is_public: true
        });

      if (postError) throw postError;

      // Process mentions (optional - for notifications)
      const mentions = extractMentions(description);
      if (mentions.length > 0) {
        // You can add mention notification logic here
        console.log('Mentions found:', mentions);
      }

      toast({
        title: "Reel Uploaded!",
        description: "Your video has been shared successfully",
      });

      onUploadSuccess();
      onClose();
      resetForm();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload your reel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setVideoPreview('');
    setTitle('');
    setDescription('');
    setIsPlaying(false);
    setIsMuted(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Auto-detect content for better engagement
  const renderDescriptionPreview = () => {
    if (!description) return null;
    
    const processedContent = linkifyText(description);
    return (
      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Preview:</p>
        <div className="text-sm">{processedContent}</div>
      </div>
    );
  };

  const suggestHashtags = () => {
    const careerTags = [
      '#CareerGrowth', '#ProfessionalDevelopment', '#Leadership', 
      '#Innovation', '#Teamwork', '#Success', '#Motivation',
      '#Skills', '#Learning', '#Networking', '#Business', '#Tech'
    ];
    
    return careerTags.slice(0, 6);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Create Reel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload your video</p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Choose Video
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Max size: 100MB • Formats: MP4, MOV, AVI
              </p>
            </div>
          ) : (
            /* Video Preview */
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                src={videoPreview}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Controls */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
              </div>

              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => {
                    setSelectedFile(null);
                    setVideoPreview('');
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {selectedFile && (
            <>
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Title (Optional)</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your reel a catchy title..."
                  maxLength={100}
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                  <span className="text-gray-500 text-xs ml-2">
                    Use @mentions and #hashtags
                  </span>
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share your professional insights... Use @username to mention someone and #hashtags to increase reach"
                  rows={4}
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500">
                  {description.length}/500
                </div>
                {renderDescriptionPreview()}
              </div>

              {/* Suggested Hashtags */}
              <div>
                <label className="block text-sm font-medium mb-2">Suggested Tags</label>
                <div className="flex flex-wrap gap-2">
                  {suggestHashtags().map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-purple-50"
                      onClick={() => {
                        if (!description.includes(tag)) {
                          setDescription(prev => prev + (prev ? ' ' : '') + tag);
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Upload Button */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !description.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isUploading ? 'Uploading...' : 'Share Reel'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};