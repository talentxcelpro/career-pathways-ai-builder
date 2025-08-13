import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Video } from 'lucide-react';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { toast } from 'sonner';

interface VideoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: 'reel' | 'podcast' | 'course' | 'employer' | 'college';
  onUploadComplete?: (data: any) => void;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  open,
  onOpenChange,
  category = 'reel',
  onUploadComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'users_only' | 'private'>('public');
  
  const { uploading, progress, uploadVideo } = useVideoUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      setFile(selectedFile);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast.error('Please provide a file and title');
      return;
    }

    try {
      const result = await uploadVideo(file, {
        title,
        description,
        category,
        tags,
        location: location || undefined,
        visibility,
        privacyStatus: 'unlisted'
      });

      onUploadComplete?.(result);
      onOpenChange(false);
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setTags([]);
      setLocation('');
      setVisibility('public');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Share Your {category === 'reel' ? 'Reel' : category === 'podcast' ? 'Podcast' : 'Video'}
            {category === 'reel' && <Badge variant="secondary">≤ 60s</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="video-upload"
              disabled={uploading}
            />
            <label
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : 'Select your video to share on TalentXcel'}
              </p>
              {category === 'reel' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum duration: 60 seconds
                </p>
              )}
            </label>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing your content...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`What's your ${category === 'reel' ? 'reel' : 'video'} about?`}
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={category === 'reel' ? 'Add a caption... (140 characters recommended)' : 'Describe your video'}
              maxLength={category === 'reel' ? 140 : undefined}
              disabled={uploading}
            />
            {category === 'reel' && (
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/140 characters
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                disabled={uploading}
              />
              <Button onClick={addTag} variant="outline" disabled={uploading}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Location */}
          {category === 'reel' && (
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                disabled={uploading}
              />
            </div>
          )}

          {/* Visibility */}
          <div>
            <label className="text-sm font-medium">Visibility</label>
            <Select value={visibility} onValueChange={(value) => setVisibility(value as 'public' | 'users_only' | 'private')} disabled={uploading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="users_only">Users Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || !title.trim() || uploading}
            >
              {uploading ? 'Publishing...' : `Share ${category === 'reel' ? 'Reel' : category === 'podcast' ? 'Podcast' : 'Video'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};