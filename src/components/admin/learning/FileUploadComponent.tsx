import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/useFileUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Video, FileText, Image, Music } from 'lucide-react';

interface FileUploadComponentProps {
  courseId?: string;
  onUploadComplete?: (file: any) => void;
}

export const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  courseId,
  onUploadComplete
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { uploadFile, uploading, progress } = useFileUpload({
    bucket: 'course-media',
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'audio/mp3', 'audio/wav', 'audio/ogg'
    ]
  });

  const getFileTypeFromMime = (mimeType: string): string => {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return Image;
      case 'audio': return Music;
      default: return FileText;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) setTitle(file.name.split('.')[0]);
      const detectedType = getFileTypeFromMime(file.type);
      setFileType(detectedType);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title || !fileType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const fileUrl = await uploadFile(selectedFile, fileName, 'course-media');

      // Save to database
      const { data, error } = await supabase
        .from('course_multimedia')
        .insert({
          course_id: courseId,
          title,
          description,
          file_type: fileType,
          file_url: fileUrl,
          file_size: selectedFile.size,
          upload_status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('File uploaded successfully!');
      onUploadComplete?.(data);
      
      // Reset form
      setTitle('');
      setDescription('');
      setFileType('');
      setSelectedFile(null);
      
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    }
  };

  const FileIcon = selectedFile ? getFileIcon(fileType) : Upload;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Course Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Select File</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
            accept="video/*,audio/*,image/*,.pdf,.doc,.docx"
            className="mt-1"
          />
          {selectedFile && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <FileIcon className="h-4 w-4" />
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter content title"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter content description"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="file-type">Content Type *</Label>
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || !title || !fileType || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Content'}
        </Button>
      </CardContent>
    </Card>
  );
};