import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Video, 
  FileText, 
  X, 
  Upload,
  Camera,
  Eye,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  name: string;
  size: number;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
  };
}

interface EnhancedMediaUploadProps {
  onMediaAdd: (media: MediaFile) => void;
  onMediaRemove: (mediaId: string) => void;
  mediaFiles: MediaFile[];
  maxFiles?: number;
  allowedTypes?: ('image' | 'video' | 'document')[];
}

export const EnhancedMediaUpload: React.FC<EnhancedMediaUploadProps> = ({
  onMediaAdd,
  onMediaRemove,
  mediaFiles,
  maxFiles = 10,
  allowedTypes = ['image', 'video', 'document']
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, uploading } = useFileUpload({
    bucket: 'post-media',
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      ...(allowedTypes.includes('image') ? ['image/*'] : []),
      ...(allowedTypes.includes('video') ? ['video/*'] : []),
      ...(allowedTypes.includes('document') ? [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ] : [])
    ]
  });

  // File analysis function
  const analyzeFile = async (file: File): Promise<MediaFile['metadata']> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            format: file.type.split('/')[1]
          });
        };
        img.onerror = () => resolve({ format: file.type.split('/')[1] });
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration,
            format: file.type.split('/')[1]
          });
        };
        video.onerror = () => resolve({ format: file.type.split('/')[1] });
        video.src = URL.createObjectURL(file);
      } else {
        resolve({ format: file.type });
      }
    });
  };

  const handleFiles = async (files: FileList) => {
    if (mediaFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `${Date.now()}-${i}`;
      
      try {
        setAnalyzing(fileId);
        
        // Determine file type
        let type: 'image' | 'video' | 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else type = 'document';

        if (!allowedTypes.includes(type)) {
          toast.error(`${type} files are not allowed`);
          continue;
        }

        // Analyze file metadata
        const metadata = await analyzeFile(file);
        
        // Upload file
        const uploadedUrl = await uploadFile(file);
        
        // Create media file object
        const mediaFile: MediaFile = {
          id: fileId,
          url: uploadedUrl,
          type,
          name: file.name,
          size: file.size,
          metadata
        };

        onMediaAdd(mediaFile);
        toast.success(`${file.name} uploaded successfully`);
        
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error('Upload error:', error);
      } finally {
        setAnalyzing(null);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-all duration-300 ${
        dragActive 
          ? 'border-primary bg-primary/5 scale-105' 
          : 'border-border hover:border-primary/50 hover:bg-muted/30'
      }`}>
        <CardContent className="p-6">
          <div
            className="flex flex-col items-center justify-center space-y-4 text-center cursor-pointer"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={`p-4 rounded-full transition-colors ${
              dragActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <Upload className={`h-8 w-8 ${dragActive ? 'animate-bounce' : ''}`} />
            </div>
            
            <div>
              <p className="text-lg font-medium">
                {dragActive ? 'Drop files here!' : 'Drop files here or click to upload'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports images, videos, and documents up to 100MB
              </p>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              {allowedTypes.map(type => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {getTypeIcon(type)}
                  {type}
                </Badge>
              ))}
            </div>

            {!dragActive && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={uploading || mediaFiles.length >= maxFiles}
                className="flex items-center gap-2 mt-2"
                variant="outline"
              >
                <Camera className="h-4 w-4" />
                Choose Files
              </Button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={[
                ...(allowedTypes.includes('image') ? ['image/*'] : []),
                ...(allowedTypes.includes('video') ? ['video/*'] : []),
                ...(allowedTypes.includes('document') ? [
                  '.pdf', '.doc', '.docx', '.txt'
                ] : [])
              ].join(',')}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Files List */}
      {mediaFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Uploaded Files ({mediaFiles.length}/{maxFiles})
          </h4>
          
          <div className="grid gap-3">
            {mediaFiles.map((media) => (
              <Card key={media.id} className="p-4">
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    {media.type === 'image' && (
                      <img
                        src={media.url}
                        alt={media.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    {media.type === 'video' && (
                      <video
                        src={media.url}
                        className="w-16 h-16 object-cover rounded-lg"
                        muted
                      />
                    )}
                    {media.type === 'document' && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 truncate">
                          {media.name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{formatFileSize(media.size)}</span>
                          {media.metadata?.width && media.metadata?.height && (
                            <span>{media.metadata.width}×{media.metadata.height}</span>
                          )}
                          {media.metadata?.duration && (
                            <span>{formatDuration(media.metadata.duration)}</span>
                          )}
                        </div>
                        
                        {/* Analysis Status */}
                        {analyzing === media.id ? (
                          <div className="flex items-center gap-2 mt-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600">Analyzing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Ready</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(media.url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = media.url;
                            a.download = media.name;
                            a.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMediaRemove(media.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};