import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { MediaPreview, MediaGallery } from '@/components/ui/MediaPreview';
import { useFileUpload } from '@/hooks/useFileUpload';
import { MEDIA_PATHS } from '@/utils/mediaHelpers';
import { toast } from 'sonner';

export function MediaShowcase() {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    url: string;
    fileName: string;
    type: string;
  }>>([]);

  const { uploadWithMetadata, uploading } = useFileUpload();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const newFiles = [];
      
      for (const file of files) {
        // Determine the appropriate bucket based on file type
        let bucketKey: string = MEDIA_PATHS.POST_MEDIA;
        const fileType = file.type.split('/')[0];
        
        if (fileType === 'image') {
          bucketKey = MEDIA_PATHS.POST_MEDIA;
        } else if (file.type === 'application/pdf') {
          bucketKey = MEDIA_PATHS.DOCUMENTS;
        } else if (fileType === 'video') {
          bucketKey = MEDIA_PATHS.POST_MEDIA;
        }

        const url = await uploadWithMetadata(file, bucketKey, {
          module: 'showcase',
          category: 'demo',
          description: `Demo upload of ${file.name}`,
          tags: ['demo', 'showcase', fileType]
        });

        newFiles.push({
          url,
          fileName: file.name,
          type: fileType
        });
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`Uploaded ${newFiles.length} file(s) successfully!`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>TalentXcel Media System Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Upload files to test the new unified media system with clean URLs and automatic preview support.
            </p>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Files'}
              </Button>
              
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,video/*,application/pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Uploaded Media Preview</h3>
              <MediaGallery 
                items={uploadedFiles}
                columns={2}
                maxItemHeight="250px"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media URL Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Clean Media URLs Structure:</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>• User Media: <code>/media-handler/user-media/user123/avatar.jpg</code></div>
                <div>• Post Media: <code>/media-handler/post-media/user123/post-image.jpg</code></div>
                <div>• Documents: <code>/media-handler/documents/user123/resume.pdf</code></div>
                <div>• Company Assets: <code>/media-handler/company-assets/company123/logo.png</code></div>
                <div>• Portfolio: <code>/media-handler/portfolio/user123/project-screenshot.png</code></div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ Features Implemented:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Global media handler edge function</li>
                <li>• Automatic MIME type detection</li>
                <li>• Clean, SEO-friendly URLs</li>
                <li>• Preview support for images, videos, and PDFs</li>
                <li>• Organized bucket structure</li>
                <li>• Metadata tracking for all uploads</li>
                <li>• Backward compatibility with existing URLs</li>
                <li>• Enhanced upload hook with metadata support</li>
                <li>• Reusable preview components</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}