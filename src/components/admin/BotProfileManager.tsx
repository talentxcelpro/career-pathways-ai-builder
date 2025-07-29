import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Upload, 
  User, 
  FileText, 
  Settings, 
  BarChart3, 
  Briefcase, 
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import type { AIBot } from '@/hooks/useBotManagement';

interface BotProfileManagerProps {
  bot: AIBot | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (botId: string, updates: Partial<AIBot>) => void;
}

export const BotProfileManager: React.FC<BotProfileManagerProps> = ({
  bot,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const uploadFile = async (file: File, type: 'profile' | 'banner') => {
    if (!bot) return null;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${bot.id}/${type}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('bot-profiles')
        .upload(fileName, file, {
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('bot-profiles')
        .getPublicUrl(fileName);

      // Update the bot profile
      const updateField = type === 'profile' ? 'profile_picture_url' : 'banner_picture_url';
      await onUpdate(bot.id, { [updateField]: publicUrl });
      
      toast.success(`${type === 'profile' ? 'Profile picture' : 'Banner'} updated successfully`);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const ProfileImageUpload = ({ type }: { type: 'profile' | 'banner' }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        uploadFile(file, type);
      }
    }, [type]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
      },
      maxFiles: 1,
      disabled: isUploading
    });

    const currentImage = type === 'profile' ? bot?.profile_picture_url : bot?.banner_picture_url;

    return (
      <div className="space-y-4">
        <Label>{type === 'profile' ? 'Profile Picture' : 'Banner Image'}</Label>
        
        {currentImage && (
          <div className="relative">
            {type === 'profile' ? (
              <Avatar className="h-24 w-24">
                <AvatarImage src={currentImage} />
                <AvatarFallback>
                  {bot?.full_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                <img 
                  src={currentImage} 
                  alt="Banner" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            {type === 'profile' ? (
              <Camera className="h-8 w-8 text-muted-foreground" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {isUploading 
                ? 'Uploading...' 
                : isDragActive 
                ? `Drop the ${type} image here` 
                : `Click or drag to upload ${type} image`
              }
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!bot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={bot.profile_picture_url} />
              <AvatarFallback>
                {bot.full_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>Manage {bot.full_name}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Resume</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-1">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center space-x-1">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-1">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileImageUpload type="profile" />
                  <ProfileImageUpload type="banner" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={bot.full_name} readOnly />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={bot.email} readOnly />
                  </div>
                </div>

                <div>
                  <Label>Role</Label>
                  <Input value={bot.role || ''} readOnly />
                </div>

                <div>
                  <Label>Departments</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(bot.departments || []).map((dept) => (
                      <Badge key={dept} variant="secondary">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Content Domains</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(bot.content_domains || []).map((domain) => (
                      <Badge key={domain} variant="outline">
                        {domain}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resume" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Resume Builder</h3>
                  <p className="text-muted-foreground mb-4">
                    Create and manage AI-generated resumes for this bot
                  </p>
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Create Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Job Preferences</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure job preferences and requirements for this bot
                  </p>
                  <Button>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Set Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media & Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Portfolio Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload and manage portfolio items, certificates, and media
                  </p>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Media
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    View profile views, engagement metrics, and performance data
                  </p>
                  <Button>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Bot Status</Label>
                  <div className="mt-2">
                    <Badge variant={bot.is_ai_bot ? 'default' : 'secondary'}>
                      {bot.is_ai_bot ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Content Generation Frequency</Label>
                  <div className="mt-2">
                    <Badge variant="outline">{bot.content_frequency}</Badge>
                  </div>
                </div>

                <div>
                  <Label>Bot Tone</Label>
                  <div className="mt-2">
                    <Badge variant="outline">{bot.bot_tone}</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Privacy Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure visibility and privacy settings for this bot profile
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};