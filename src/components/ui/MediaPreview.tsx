import React, { useState } from 'react';
import { getFileType, canPreview } from '@/utils/mediaHelpers';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText, Image, Video, Volume2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MediaPreviewProps {
  url: string;
  fileName?: string;
  className?: string;
  showControls?: boolean;
  maxWidth?: string;
  maxHeight?: string;
}

export function MediaPreview({ 
  url, 
  fileName = '', 
  className = '', 
  showControls = true,
  maxWidth = '100%',
  maxHeight = '400px'
}: MediaPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fileType = getFileType(fileName || url);
  
  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Get file icon based on type
  const getFileIcon = () => {
    switch (fileType) {
      case 'image': return <Image className="h-8 w-8" />;
      case 'video': return <Video className="h-8 w-8" />;
      case 'document': return <FileText className="h-8 w-8" />;
      case 'audio': return <Volume2 className="h-8 w-8" />;
      default: return <FileText className="h-8 w-8" />;
    }
  };

  // Render loading state
  if (isLoading && canPreview(fileName || url)) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`} 
           style={{ maxWidth, height: maxHeight }}>
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted rounded-lg p-4 ${className}`}
           style={{ maxWidth, maxHeight }}>
        {getFileIcon()}
        <span className="text-sm text-muted-foreground mt-2">
          {fileName || 'File'}
        </span>
        {showControls && (
          <Button variant="outline" size="sm" className="mt-2" asChild>
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        )}
      </div>
    );
  }

  // Render based on file type
  switch (fileType) {
    case 'image':
      return (
        <div className={`relative ${className}`}>
          <img
            src={url}
            alt={fileName || 'Image'}
            className="rounded-lg object-cover w-full"
            style={{ maxWidth, maxHeight }}
            onLoad={handleLoad}
            onError={handleError}
          />
          {showControls && (
            <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{fileName || 'Image Preview'}</DialogTitle>
                  </DialogHeader>
                  <img 
                    src={url} 
                    alt={fileName || 'Image'} 
                    className="max-w-full max-h-[80vh] object-contain mx-auto"
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      );

    case 'video':
      return (
        <div className={className}>
          <video
            controls
            className="rounded-lg w-full"
            style={{ maxWidth, maxHeight }}
            onLoadedData={handleLoad}
            onError={handleError}
          >
            <source src={url} />
            Your browser does not support the video tag.
          </video>
        </div>
      );

    case 'document':
      return (
        <div className={className}>
          <iframe
            src={url}
            className="rounded-lg border w-full"
            style={{ maxWidth, height: maxHeight }}
            onLoad={handleLoad}
            onError={handleError}
            title={fileName || 'Document'}
          />
          {showControls && (
            <div className="mt-2">
              <Button variant="outline" size="sm" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full
                </a>
              </Button>
            </div>
          )}
        </div>
      );

    case 'audio':
      return (
        <div className={`flex flex-col items-center space-y-4 p-4 bg-muted rounded-lg ${className}`}>
          <Volume2 className="h-12 w-12 text-muted-foreground" />
          <audio controls className="w-full max-w-md">
            <source src={url} />
            Your browser does not support the audio tag.
          </audio>
          {fileName && (
            <span className="text-sm text-muted-foreground">{fileName}</span>
          )}
        </div>
      );

    default:
      return (
        <div className={`flex flex-col items-center justify-center bg-muted rounded-lg p-4 ${className}`}
             style={{ maxWidth, maxHeight }}>
          {getFileIcon()}
          <span className="text-sm text-muted-foreground mt-2">
            {fileName || 'Unknown file type'}
          </span>
          {showControls && (
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <a href={url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          )}
        </div>
      );
  }
}

// Gallery component for multiple media items
interface MediaGalleryProps {
  items: Array<{
    url: string;
    fileName?: string;
    type?: string;
  }>;
  columns?: number;
  maxItemHeight?: string;
}

export function MediaGallery({ items, columns = 3, maxItemHeight = '200px' }: MediaGalleryProps) {
  if (!items.length) return null;

  return (
    <div 
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {items.map((item, index) => (
        <MediaPreview
          key={index}
          url={item.url}
          fileName={item.fileName}
          maxHeight={maxItemHeight}
          className="w-full"
        />
      ))}
    </div>
  );
}