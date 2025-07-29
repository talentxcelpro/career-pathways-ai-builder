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
  Image as ImageIcon,
  Download,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Save,
  ExternalLink
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
  const [socialLinks, setSocialLinks] = useState({
    talentxcel_network: '',
    posts: '',
    jobs: '',
    articles: '',
    blogs: '',
    facebook: '',
    instagram: '',
    twitter: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

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
                  {bot?.name?.slice(0, 2).toUpperCase()}
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
                {bot.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>Manage {bot.name}</span>
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
                    <Input value={bot.name || ''} readOnly />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={bot.email || ''} readOnly />
                  </div>
                </div>

                <div>
                  <Label>Role</Label>
                  <Input value={bot.role || ''} readOnly />
                </div>

                <div>
                  <Label>Departments</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(bot.department || []).map((dept) => (
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

                {/* Social Media Links Section */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <span>Social Media & Links</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>TalentXcel Network</span>
                        </Label>
                        <Input 
                          value={socialLinks.talentxcel_network}
                          onChange={(e) => setSocialLinks({...socialLinks, talentxcel_network: e.target.value})}
                          placeholder="https://talentxcel.in/profile/username"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Posts</span>
                        </Label>
                        <Input 
                          value={socialLinks.posts}
                          onChange={(e) => setSocialLinks({...socialLinks, posts: e.target.value})}
                          placeholder="https://talentxcel.in/posts"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4" />
                          <span>Jobs</span>
                        </Label>
                        <Input 
                          value={socialLinks.jobs}
                          onChange={(e) => setSocialLinks({...socialLinks, jobs: e.target.value})}
                          placeholder="https://talentxcel.in/jobs"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Articles</span>
                        </Label>
                        <Input 
                          value={socialLinks.articles}
                          onChange={(e) => setSocialLinks({...socialLinks, articles: e.target.value})}
                          placeholder="https://talentxcel.in/articles"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Blogs</span>
                        </Label>
                        <Input 
                          value={socialLinks.blogs}
                          onChange={(e) => setSocialLinks({...socialLinks, blogs: e.target.value})}
                          placeholder="https://talentxcel.in/blogs"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center space-x-2">
                          <Facebook className="h-4 w-4" />
                          <span>Facebook</span>
                        </Label>
                        <Input 
                          value={socialLinks.facebook}
                          onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                          placeholder="https://facebook.com/username"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center space-x-2">
                          <Instagram className="h-4 w-4" />
                          <span>Instagram</span>
                        </Label>
                        <Input 
                          value={socialLinks.instagram}
                          onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                          placeholder="https://instagram.com/username"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center space-x-2">
                          <Twitter className="h-4 w-4" />
                          <span>X (Twitter)</span>
                        </Label>
                        <Input 
                          value={socialLinks.twitter}
                          onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                          placeholder="https://x.com/username"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={async () => {
                        setIsUpdating(true);
                        try {
                          // Update the bot configuration with social links
                          const updatedConfig = {
                            ...bot.bot_config,
                            social_links: socialLinks
                          };
                          
                          await onUpdate(bot.id, { bot_config: updatedConfig });
                          
                          // Also create/update a profiles entry for this bot to make it appear as a real user
                          const username = bot.name.toLowerCase().replace(/\s+/g, '').slice(0, 15) + Math.random().toString(36).substr(2, 4);
                          
                          const { error: profileError } = await supabase
                            .from('profiles')
                            .upsert({
                              id: bot.id,
                              full_name: bot.name,
                              username: username,
                              email: bot.email,
                              profile_picture_url: bot.profile_picture_url,
                              banner_picture_url: bot.banner_picture_url,
                              headline: bot.role,
                              about: `AI Bot specializing in ${bot.content_domains?.join(', ')}`,
                              location: 'TalentXcel Network',
                              is_ai_bot: true,
                              social_links: socialLinks,
                              is_profile_public: true
                            });
                          
                          if (profileError) {
                            console.error('Profile update error:', profileError);
                          }
                          
                          toast.success('Bot profile updated successfully! Changes will appear across the site.');
                        } catch (error) {
                          console.error('Update error:', error);
                          toast.error('Failed to update bot profile');
                        } finally {
                          setIsUpdating(false);
                        }
                      }}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {isUpdating ? (
                        'Updating...'
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Social Links
                        </>
                      )}
                    </Button>
                    
                    {/* Preview Links */}
                    <div className="mt-4 space-y-2">
                      <Label>Link Preview</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(socialLinks).map(([key, url]) => 
                          url && (
                            <a
                              key={key}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span className="capitalize">{key.replace('_', ' ')}</span>
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resume" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Resume Template</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Professional Template</option>
                    <option>Creative Template</option>
                    <option>Technical Template</option>
                  </select>
                </div>
                
                <div>
                  <Label>Work Experience</Label>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">{bot.role}</h4>
                      <p className="text-sm text-muted-foreground">TalentXcel</p>
                      <p className="text-sm">AI-powered professional working in {bot.department?.join(', ')}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Skills & Expertise</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(bot.content_domains || []).map((domain) => (
                      <Badge key={domain} variant="outline">
                        {domain}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Resume
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
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
              <CardContent className="space-y-4">
                <div>
                  <Label>Preferred Roles</Label>
                  <Input value={bot.role} readOnly />
                </div>
                
                <div>
                  <Label>Department Focus</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(bot.department || []).map((dept) => (
                      <Badge key={dept} variant="secondary">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Content Creation Frequency</Label>
                  <div className="mt-2">
                    <Badge variant="outline">{bot.frequency}</Badge>
                  </div>
                </div>
                
                <div>
                  <Label>Communication Style</Label>
                  <div className="mt-2">
                    <Badge variant="outline">{bot.tone_style}</Badge>
                  </div>
                </div>
                
                <div>
                  <Label>Distribution Channels</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(bot.distribution_channels || []).map((channel) => (
                      <Badge key={channel} variant="outline">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Update Job Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media & Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Profile Picture</Label>
                    <div className="mt-2 text-center">
                      <Avatar className="h-20 w-20 mx-auto">
                        <AvatarImage src={bot.profile_picture_url} />
                        <AvatarFallback className="text-lg">
                          {bot.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-muted-foreground mt-2">
                        {bot.profile_picture_url ? 'Current profile picture' : 'No profile picture set'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Banner Image</Label>
                    <div className="mt-2">
                      {bot.banner_picture_url ? (
                        <img 
                          src={bot.banner_picture_url} 
                          alt="Banner" 
                          className="w-full h-20 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-20 bg-muted rounded-md flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">No banner set</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Portfolio Items</Label>
                  <div className="space-y-2 mt-2">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">AI Content Creation</h4>
                      <p className="text-sm text-muted-foreground">Specialized in creating engaging professional content</p>
                    </div>
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Department Expertise</h4>
                      <p className="text-sm text-muted-foreground">Working across {bot.department?.join(', ')} departments</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Portfolio Item
                  </Button>
                  <Button variant="outline">
                    <Camera className="mr-2 h-4 w-4" />
                    Update Photos
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-md">
                    <div className="text-2xl font-bold text-primary">152</div>
                    <div className="text-sm text-muted-foreground">Profile Views</div>
                  </div>
                  <div className="text-center p-4 border rounded-md">
                    <div className="text-2xl font-bold text-primary">23</div>
                    <div className="text-sm text-muted-foreground">Content Generated</div>
                  </div>
                  <div className="text-center p-4 border rounded-md">
                    <div className="text-2xl font-bold text-primary">4.8</div>
                    <div className="text-sm text-muted-foreground">Engagement Rate</div>
                  </div>
                </div>
                
                <div>
                  <Label>Content Performance</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">LinkedIn Posts</span>
                      <Badge variant="secondary">85% Engagement</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Blog Articles</span>
                      <Badge variant="secondary">92% Quality Score</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Email Campaigns</span>
                      <Badge variant="secondary">78% Open Rate</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Recent Activity</Label>
                  <div className="space-y-2 mt-2">
                    <div className="text-sm p-2 bg-muted rounded">
                      Generated content for {bot.department?.[0]} department - 2 hours ago
                    </div>
                    <div className="text-sm p-2 bg-muted rounded">
                      Profile viewed by 12 team members - 5 hours ago
                    </div>
                    <div className="text-sm p-2 bg-muted rounded">
                      Updated content strategy - 1 day ago
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Bot Status</Label>
                  <p className="text-sm text-muted-foreground mb-3">Enable or disable this bot</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bot-active"
                      checked={bot.is_active}
                      onChange={(e) => {
                        onUpdate(bot.id, { is_active: e.target.checked });
                      }}
                      className="rounded"
                    />
                    <Label htmlFor="bot-active">Active</Label>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Content Generation Frequency</Label>
                  <select 
                    value={bot.frequency} 
                    onChange={(e) => onUpdate(bot.id, { frequency: e.target.value })}
                    className="w-full p-2 border rounded-md mt-2"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>

                <div>
                  <Label className="text-base font-medium">Communication Tone</Label>
                  <select 
                    value={bot.tone_style} 
                    onChange={(e) => onUpdate(bot.id, { tone_style: e.target.value })}
                    className="w-full p-2 border rounded-md mt-2"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="enthusiastic">Enthusiastic</option>
                  </select>
                </div>

                <div>
                  <Label className="text-base font-medium">Distribution Channels</Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {['LinkedIn', 'Email', 'Blog', 'Newsletter', 'Social Media', 'Website'].map((channel) => (
                      <div key={channel} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`channel-${channel.toLowerCase()}`}
                          checked={bot.distribution_channels?.includes(channel.toLowerCase()) || false}
                          onChange={(e) => {
                            const currentChannels = bot.distribution_channels || [];
                            const newChannels = e.target.checked
                              ? [...currentChannels, channel.toLowerCase()]
                              : currentChannels.filter(c => c !== channel.toLowerCase());
                            onUpdate(bot.id, { distribution_channels: newChannels });
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={`channel-${channel.toLowerCase()}`}>{channel}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Privacy Settings</Label>
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="profile-public"
                        defaultChecked={true}
                        className="rounded"
                      />
                      <Label htmlFor="profile-public">Make profile publicly visible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="search-indexing"
                        defaultChecked={true}
                        className="rounded"
                      />
                      <Label htmlFor="search-indexing">Allow search engine indexing</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={async () => {
                      setIsUpdating(true);
                      try {
                        // Update bot configuration
                        const updatedConfig = {
                          ...bot.bot_config,
                          social_links: socialLinks,
                          privacy_settings: {
                            public_profile: true,
                            search_indexing: true
                          }
                        };
                        
                        // Update the AI bot
                        await onUpdate(bot.id, { bot_config: updatedConfig });
                        
                        // Create/update profile for the bot to appear as real user
                        const username = bot.name.toLowerCase().replace(/\s+/g, '').slice(0, 15) + Math.random().toString(36).substr(2, 4);
                        
                        const { error: profileError } = await supabase
                          .from('profiles')
                          .upsert({
                            id: bot.id,
                            full_name: bot.name,
                            username: username,
                            email: bot.email,
                            profile_picture_url: bot.profile_picture_url,
                            banner_picture_url: bot.banner_picture_url,
                            headline: bot.role,
                            about: `AI Bot specializing in ${bot.content_domains?.join(', ')}`,
                            location: 'TalentXcel Network',
                            is_ai_bot: true,
                            social_links: socialLinks,
                            is_profile_public: true
                          });
                        
                        if (profileError) {
                          console.error('Profile update error:', profileError);
                          throw profileError;
                        }
                        
                        toast.success('All settings saved successfully! Bot profile is now live on the site.');
                      } catch (error) {
                        console.error('Save error:', error);
                        toast.error('Failed to save settings. Please try again.');
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Reset to defaults
                      onUpdate(bot.id, {
                        is_active: true,
                        frequency: 'daily',
                        tone_style: 'professional',
                        distribution_channels: ['email', 'notification', 'post']
                      });
                      setSocialLinks({
                        talentxcel_network: '',
                        posts: '',
                        jobs: '',
                        articles: '',
                        blogs: '',
                        facebook: '',
                        instagram: '',
                        twitter: ''
                      });
                      toast.success('Settings reset to defaults');
                    }}
                  >
                    Reset to Defaults
                  </Button>
                </div>
                
                {/* Profile Link Preview */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label className="text-sm font-medium text-blue-900">Bot Profile URL</Label>
                  <div className="mt-2 flex items-center space-x-2">
                    <code className="text-sm bg-white px-2 py-1 rounded border">
                      https://talentxcel.in/profile/{bot.name.toLowerCase().replace(/\s+/g, '')}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const url = `https://talentxcel.in/profile/${bot.name.toLowerCase().replace(/\s+/g, '')}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Live
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    This is where the bot profile will appear as a real user
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