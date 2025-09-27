import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CompanyImageUploadProps {
  logoUrl?: string;
  bannerUrl?: string;
  onLogoUpload: (url: string) => void;
  onBannerUpload: (url: string) => void;
  companyName?: string;
}

export const CompanyImageUpload: React.FC<CompanyImageUploadProps> = ({
  logoUrl,
  bannerUrl,
  onLogoUpload,
  onBannerUpload,
  companyName = "Company"
}) => {
  const { user } = useAuth();
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const uploadFile = async (
    file: File,
    bucket: string,
    folder: string,
    onSuccess: (url: string) => void,
    setUploading: (loading: boolean) => void
  ) => {
    if (!user) {
      toast.error('Please login to upload files');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload only JPEG, PNG, WebP, or SVG images');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onSuccess(publicUrl);
      toast.success(`${folder === 'logos' ? 'Logo' : 'Banner'} uploaded successfully!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${folder === 'logos' ? 'logo' : 'banner'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file, 'company-logos', 'logos', onLogoUpload, setLogoUploading);
    }
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file, 'company-logos', 'banners', onBannerUpload, setBannerUploading);
    }
  };

  const removeLogo = () => {
    onLogoUpload('');
  };

  const removeBanner = () => {
    onBannerUpload('');
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Banner Upload */}
        <div>
          <Label className="text-base font-semibold">Company Banner</Label>
          <p className="text-sm text-gray-500 mb-4">
            Upload a banner image for your company profile (recommended: 1200x300px)
          </p>
          
          <div className="relative">
            {bannerUrl ? (
              <div className="relative">
                <img
                  src={bannerUrl}
                  alt="Company banner"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeBanner}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                      id="banner-upload"
                      disabled={bannerUploading}
                    />
                    <Label htmlFor="banner-upload" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={bannerUploading}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {bannerUploading ? 'Uploading...' : 'Upload Banner'}
                        </span>
                      </Button>
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Drag and drop or click to upload<br/>
                    Max 5MB • JPG, PNG, WebP, SVG
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <Label className="text-base font-semibold">Company Logo</Label>
          <p className="text-sm text-gray-500 mb-4">
            Upload your company logo (recommended: square format, 200x200px minimum)
          </p>
          
          <div className="flex items-start space-x-6">
            {/* Logo Preview */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center relative">
                {logoUrl ? (
                  <>
                    <img
                      src={logoUrl}
                      alt="Company logo"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <Image className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-xs text-gray-400 mt-1">Logo</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={logoUploading}
              />
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  disabled={logoUploading}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {logoUploading ? 'Uploading...' : 'Upload Logo'}
                  </span>
                </Button>
              </Label>
              <div className="text-sm text-gray-500">
                <p>• Square format recommended</p>
                <p>• Minimum 200x200px</p>
                <p>• Max 5MB • JPG, PNG, WebP, SVG</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyImageUpload;