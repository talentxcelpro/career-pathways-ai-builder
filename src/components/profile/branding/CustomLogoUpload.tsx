import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Crown } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFeatureGating } from '@/hooks/useFeatureGating';

interface CustomLogoUploadProps {
  currentLogoUrl?: string;
  onUploadSuccess?: (url: string) => void;
  profileId: string;
}

export const CustomLogoUpload: React.FC<CustomLogoUploadProps> = ({
  currentLogoUrl,
  onUploadSuccess,
  profileId
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { checkFeatureAccess } = useFeatureGating();

  const { uploadFile } = useFileUpload({
    bucket: 'avatars',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/*']
  });

  const handleLogoUpload = async (file: File) => {
    if (!checkFeatureAccess('Custom branding')) {
      return;
    }

    setUploading(true);
    try {
      const uploadedUrl = await uploadFile(file);
      
      const { error } = await supabase
        .from('profiles')
        .update({ custom_logo_url: uploadedUrl })
        .eq('id', profileId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Custom logo uploaded successfully!",
      });
      
      onUploadSuccess?.(uploadedUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload custom logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!checkFeatureAccess('Custom branding')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ custom_logo_url: null })
        .eq('id', profileId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Custom logo removed successfully!",
      });
      
      onUploadSuccess?.('');
    } catch (error) {
      console.error('Remove error:', error);
      toast({
        title: "Error",
        description: "Failed to remove custom logo",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Custom Logo
        </CardTitle>
        <CardDescription>
          Upload your personal brand logo (Elite feature)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentLogoUrl ? (
          <div className="relative group">
            <img 
              src={currentLogoUrl} 
              alt="Custom logo"
              className="w-32 h-32 object-contain border rounded-lg bg-white shadow-sm"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemoveLogo}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mt-2">
              No custom logo uploaded
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleLogoUpload(file);
              };
              input.click();
            }}
            disabled={uploading}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Logo'}
          </Button>
          
          {currentLogoUrl && (
            <Button
              variant="ghost"
              onClick={handleRemoveLogo}
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>• Maximum file size: 5MB</p>
          <p>• Supported formats: PNG, JPG, SVG</p>
          <p>• Recommended size: 200x200px</p>
        </div>
      </CardContent>
    </Card>
  );
};