import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Image, Type, Upload } from 'lucide-react';
import { useStoryCreation } from '@/hooks/useStoryCreation';
import { TextStoryCreator } from '@/components/mobile/TextStoryCreator';

interface StoryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

export const StoryCreationModal: React.FC<StoryCreationModalProps> = ({
  isOpen,
  onClose,
  onStoryCreated,
}) => {
  const { isLoading, createPhotoStory, createGalleryStory } = useStoryCreation();
  const [showTextCreator, setShowTextCreator] = useState(false);

  const handleCameraStory = async () => {
    const success = await createPhotoStory();
    if (success) {
      onStoryCreated();
      onClose();
    }
  };

  const handleGalleryStory = async () => {
    const success = await createGalleryStory();
    if (success) {
      onStoryCreated();
      onClose();
    }
  };

  const handleTextStoryCreated = () => {
    setShowTextCreator(false);
    onStoryCreated();
    onClose();
  };

  if (showTextCreator) {
    return (
      <TextStoryCreator
        onClose={() => setShowTextCreator(false)}
        onStoryCreated={handleTextStoryCreated}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Story</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="camera">
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <Image className="h-4 w-4 mr-2" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="text">
              <Type className="h-4 w-4 mr-2" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            <div className="text-center py-8">
              <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Take a Photo</h3>
              <p className="text-muted-foreground mb-4">
                Capture a moment and share it with your network
              </p>
              <Button onClick={handleCameraStory} disabled={isLoading} size="lg">
                {isLoading ? 'Opening Camera...' : 'Open Camera'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <div className="text-center py-8">
              <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Choose from Gallery</h3>
              <p className="text-muted-foreground mb-4">
                Select a photo from your device's gallery
              </p>
              <Button onClick={handleGalleryStory} disabled={isLoading} size="lg">
                {isLoading ? 'Uploading...' : 'Choose Photo'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="text-center py-8">
              <Type className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Create Text Story</h3>
              <p className="text-muted-foreground mb-4">
                Share your thoughts with beautiful backgrounds and fonts
              </p>
              <Button onClick={() => setShowTextCreator(true)} size="lg">
                Create Text Story
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};