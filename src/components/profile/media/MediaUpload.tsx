
import { Button } from "@/components/ui/button";
import { Camera, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaUploadProps {
  type: 'photo' | 'video';
  onUpload: () => void;
}

export const MediaUpload = ({ type, onUpload }: MediaUploadProps) => {
  const { toast } = useToast();

  const handleUpload = () => {
    toast({
      title: `${type === 'photo' ? 'Photo' : 'Video'} Uploaded`,
      description: `Your ${type === 'photo' ? 'profile photo' : 'video resume'} has been updated successfully.`,
    });
    onUpload();
  };

  const config = {
    photo: {
      icon: Camera,
      title: "Profile Photo",
      description: "Upload a professional headshot. JPG or PNG format, max 5MB.",
      placeholder: "AJ"
    },
    video: {
      icon: Video,
      title: "Video Resume",
      description: "Record a 60-90 second video introduction. MP4 format, max 50MB.",
      placeholder: null
    }
  };

  const Icon = config[type].icon;

  return (
    <div className="text-center">
      {type === 'photo' ? (
        <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          {config[type].placeholder}
        </div>
      ) : (
        <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      
      <h3 className="font-medium mb-2">{config[type].title}</h3>
      <p className="text-sm text-gray-600 mb-4">{config[type].description}</p>
      <Button onClick={handleUpload} variant="outline">
        <Icon className="h-4 w-4 mr-2" />
        Upload {type === 'photo' ? 'Photo' : 'Video'}
      </Button>
    </div>
  );
};
