import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

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
  const [currentStep, setCurrentStep] = useState<'upload' | 'details'>('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'video/*': ['.mp4', '.mov'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        setVideoFile(acceptedFiles[0]);
        setCurrentStep('details');
      }
    }
  });

  const handleUpload = async () => {
    if (!videoFile || !caption.trim()) {
      toast.error('Please provide a video and caption');
      return;
    }

    setIsUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Reel uploaded successfully!');
      onUploadSuccess();
      setCurrentStep('upload');
      setVideoFile(null);
      setCaption('');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <DialogTitle>Create Reel</DialogTitle>
            <div className="w-10" />
          </div>
        </DialogHeader>

        {currentStep === 'upload' && (
          <Card {...getRootProps()} className="border-2 border-dashed cursor-pointer p-8">
            <input {...getInputProps()} />
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Upload Video</h3>
              <p className="text-muted-foreground">
                {isDragActive ? 'Drop here...' : 'Drag & drop or tap to browse'}
              </p>
            </div>
          </Card>
        )}

        {currentStep === 'details' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Caption</label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's happening in your reel?"
                className="min-h-[100px]"
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !caption.trim()}
              className="w-full"
            >
              {isUploading ? 'Publishing...' : 'Publish Reel'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};