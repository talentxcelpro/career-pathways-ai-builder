import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  Bell, 
  Palette, 
  Key, 
  Shield, 
  Building2, 
  Upload, 
  Save,
  UserPlus,
  Edit3,
  Trash2,
  Crown,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface CompanySettingsProps {
  company: any;
  userRole: string;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({ company, userRole }) => {
  const [settingsTab, setSettingsTab] = useState('profile');
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Get company settings with proper fallback
  const { data: companySettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['company-settings', company?.id],
    queryFn: async () => {
      if (!company) return null;

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', company.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      // If no settings exist, create default settings
      if (!data) {
        const defaultSettings = {
          company_id: company.id,
          notification_preferences: {
            new_applications: true,
            post_engagement: true,
            follower_milestones: true,
            weekly_reports: true
          },
          branding_settings: {},
          integration_keys: {},
          ai_settings: {
            auto_insights: true,
            content_suggestions: true,
            candidate_screening: false
          },
          privacy_settings: {
            public_metrics: false,
            show_team: true,
            analytics_sharing: false
          }
        };

        const { data: newSettings, error: insertError } = await supabase
          .from('company_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        return newSettings;
      }
      
      return data;
    },
    enabled: !!company
  });

  // Get team members with proper query
  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ['company-team-members', company?.id],
    queryFn: async () => {
      if (!company) return [];

      // Get team members first
      const { data: members, error: membersError } = await supabase
        .from('company_team_members')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true);

      if (membersError) throw membersError;

      // Get profiles for each member
      const memberIds = members?.map(m => m.user_id) || [];
      if (memberIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', memberIds);

      if (profilesError) throw profilesError;

      // Combine the data
      return members?.map(member => ({
        ...member,
        profile: profiles?.find(p => p.id === member.user_id) || { full_name: 'Unknown', email: 'unknown@email.com' }
      })) || [];
    },
    enabled: !!company
  });

  // Update company profile mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (updates: any) => {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', company.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-companies-dashboard'] });
      toast.success('Company profile updated successfully');
      setIsUpdating(false);
    },
    onError: (error) => {
      toast.error('Failed to update company profile');
      console.error('Update error:', error);
      setIsUpdating(false);
    }
  });

  // Update company settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('company_settings')
        .update(updates)
        .eq('company_id', company.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast.success('Settings updated successfully');
      setIsUpdating(false);
    },
    onError: (error) => {
      toast.error('Failed to update settings');
      console.error('Settings update error:', error);
      setIsUpdating(false);
    }
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    if (!companySettings?.notification_preferences) return;
    
    // Ensure notification_preferences is an object
    const currentPrefs = typeof companySettings.notification_preferences === 'object' 
      ? companySettings.notification_preferences as { [key: string]: boolean }
      : {};
    
    const updatedPrefs = {
      ...currentPrefs,
      [key]: value
    };

    updateSettingsMutation.mutate({
      notification_preferences: updatedPrefs
    });
  };

  const handleSettingsUpdate = (section: string, updates: any) => {
    updateSettingsMutation.mutate({
      [section]: updates
    });
  };

  return (
    <div className="space-y-4">
      {/* Settings Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-foreground">Company Settings</h3>
          <p className="text-sm text-muted-foreground">Manage your company profile, team, and preferences</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1 text-xs">
          <Crown className="h-2 w-2" />
          {userRole?.toUpperCase()}
        </Badge>
      </div>

      {/* Settings Tabs */}
      <Tabs value={settingsTab} onValueChange={setSettingsTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-card shadow-sm border">
          <TabsTrigger value="profile" className="flex items-center gap-1 text-xs py-1 px-2">
            <Building2 className="h-2 w-2" />
            <span className="text-xs">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-1 text-xs py-1 px-2">
            <Users className="h-2 w-2" />
            <span className="text-xs">Team</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs py-1 px-2">
            <Bell className="h-2 w-2" />
            <span className="text-xs">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-1 text-xs py-1 px-2">
            <Palette className="h-2 w-2" />
            <span className="text-xs">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1 text-xs py-1 px-2">
            <Key className="h-2 w-2" />
            <span className="text-xs">Integrations</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1">
                <Building2 className="h-3 w-3 text-primary" />
                Company Information
              </CardTitle>
              <CardDescription className="text-xs">Update your company's basic information and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="company-name" className="text-xs text-muted-foreground">Company Name</Label>
                  <Input 
                    id="company-name" 
                    defaultValue={company?.name}
                    className="text-xs h-8"
                    disabled={isUpdating}
                    onBlur={(e) => {
                      if (e.target.value !== company?.name) {
                        updateCompanyMutation.mutate({ name: e.target.value });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="industry" className="text-xs text-muted-foreground">Industry</Label>
                  <Input 
                    id="industry" 
                    defaultValue={company?.industry}
                    className="text-xs h-8"
                    disabled={isUpdating}
                    onBlur={(e) => {
                      if (e.target.value !== company?.industry) {
                        updateCompanyMutation.mutate({ industry: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-xs text-muted-foreground">Company Description</Label>
                <Textarea 
                  id="description" 
                  defaultValue={company?.description}
                  rows={2}
                  className="text-xs"
                  disabled={isUpdating}
                  onBlur={(e) => {
                    if (e.target.value !== company?.description) {
                      updateCompanyMutation.mutate({ description: e.target.value });
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="website" className="text-xs text-muted-foreground">Website</Label>
                  <Input 
                    id="website" 
                    defaultValue={company?.website}
                    type="url"
                    className="text-xs h-8"
                    disabled={isUpdating}
                    onBlur={(e) => {
                      if (e.target.value !== company?.website) {
                        updateCompanyMutation.mutate({ website: e.target.value });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-xs text-muted-foreground">Location</Label>
                  <Input 
                    id="location" 
                    defaultValue={company?.location}
                    className="text-xs h-8"
                    disabled={isUpdating}
                    onBlur={(e) => {
                      if (e.target.value !== company?.location) {
                        updateCompanyMutation.mutate({ location: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button size="sm" disabled={isUpdating} className="h-7 px-3">
                  <Save className="h-2 w-2 mr-1" />
                  <span className="text-xs">{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management Tab */}
        <TabsContent value="team">
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Users className="h-3 w-3 text-primary" />
                      Team Members
                    </CardTitle>
                    <CardDescription className="text-xs">Manage your company team and permissions</CardDescription>
                  </div>
                  <Button size="sm" className="h-7 px-2">
                    <UserPlus className="h-2 w-2 mr-1" />
                    <span className="text-xs">Invite Member</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {teamLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse h-12 bg-muted rounded-lg"></div>
                    ))}
                  </div>
                ) : teamMembers && teamMembers.length > 0 ? (
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <UserCheck className="h-2 w-2 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-xs text-foreground">{member.profile?.full_name || 'Unknown User'}</h4>
                            <p className="text-xs text-muted-foreground">{member.profile?.email || 'No email'}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="secondary" className="text-xs h-4 px-1">
                                {member.role}
                              </Badge>
                              {member.role === 'owner' && (
                                <Crown className="h-2 w-2 text-yellow-500" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                            <Edit3 className="h-2 w-2" />
                          </Button>
                          {member.role !== 'owner' && (
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Trash2 className="h-2 w-2" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <h3 className="text-sm font-medium text-foreground mb-1">No Team Members</h3>
                    <p className="text-xs text-muted-foreground mb-3">Invite team members to help manage your company</p>
                    <Button size="sm" className="h-7 px-3">
                      <UserPlus className="h-2 w-2 mr-1" />
                      <span className="text-xs">Invite First Member</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Bell className="h-3 w-3 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-xs">Configure how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-xs font-medium text-foreground">New Applications</Label>
                    <p className="text-xs text-muted-foreground">Get notified when someone applies to your jobs</p>
                  </div>
                  <Switch 
                    checked={(() => {
                      const prefs = companySettings?.notification_preferences;
                      if (typeof prefs === 'object' && prefs !== null) {
                        return (prefs as any).new_applications || false;
                      }
                      return false;
                    })()}
                    onCheckedChange={(checked) => handleNotificationChange('new_applications', checked)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-xs font-medium text-foreground">Post Engagement</Label>
                    <p className="text-xs text-muted-foreground">Get notified when people interact with your posts</p>
                  </div>
                  <Switch 
                    checked={(() => {
                      const prefs = companySettings?.notification_preferences;
                      if (typeof prefs === 'object' && prefs !== null) {
                        return (prefs as any).post_engagement || false;
                      }
                      return false;
                    })()}
                    onCheckedChange={(checked) => handleNotificationChange('post_engagement', checked)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-xs font-medium text-foreground">Follower Milestones</Label>
                    <p className="text-xs text-muted-foreground">Get notified when you reach follower milestones</p>
                  </div>
                  <Switch 
                    checked={(() => {
                      const prefs = companySettings?.notification_preferences;
                      if (typeof prefs === 'object' && prefs !== null) {
                        return (prefs as any).follower_milestones || false;
                      }
                      return false;
                    })()}
                    onCheckedChange={(checked) => handleNotificationChange('follower_milestones', checked)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-xs font-medium text-foreground">Weekly Reports</Label>
                    <p className="text-xs text-muted-foreground">Receive weekly performance and analytics reports</p>
                  </div>
                  <Switch 
                    checked={(() => {
                      const prefs = companySettings?.notification_preferences;
                      if (typeof prefs === 'object' && prefs !== null) {
                        return (prefs as any).weekly_reports || false;
                      }
                      return false;
                    })()}
                    onCheckedChange={(checked) => handleNotificationChange('weekly_reports', checked)}
                    disabled={isUpdating}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Palette className="h-3 w-3 text-primary" />
                  Brand Customization
                </CardTitle>
                <CardDescription className="text-xs">Customize your company's visual identity and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-foreground">Company Logo</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center border border-border">
                      {company?.logo_url ? (
                        <img src={company.logo_url} alt="Company logo" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="h-7 px-2">
                      <Upload className="h-2 w-2 mr-1" />
                      <span className="text-xs">Upload Logo</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-foreground">Cover Image</Label>
                  <div className="mt-2">
                    <div className="w-full h-16 bg-muted rounded-lg flex items-center justify-center border border-border">
                      {company?.cover_image_url ? (
                        <img src={company.cover_image_url} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-xs text-muted-foreground">No cover image uploaded</span>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="mt-2 h-7 px-2">
                      <Upload className="h-2 w-2 mr-1" />
                      <span className="text-xs">Upload Cover</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="brand-color" className="text-xs font-medium text-foreground">Brand Color</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input 
                      id="brand-color" 
                      type="color" 
                      className="w-12 h-7"
                      defaultValue="#3b82f6"
                    />
                    <span className="text-xs text-muted-foreground">#3b82f6</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Key className="h-3 w-3 text-primary" />
                  Integrations & API Keys
                </CardTitle>
                <CardDescription className="text-xs">Connect with external services and manage API access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Key className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-sm font-medium text-foreground mb-1">Integrations Coming Soon</h3>
                  <p className="text-xs text-muted-foreground">Connect with ATS, CRM, and other hiring tools</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Shield className="h-3 w-3 text-primary" />
                  TalentXcel Services
                </CardTitle>
                <CardDescription className="text-xs">Premium features and advanced analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="font-medium text-xs text-foreground">AI-Powered Candidate Screening</h4>
                      <p className="text-xs text-muted-foreground">Automatically screen and rank candidates</p>
                    </div>
                    <Badge variant="secondary" className="text-xs h-4 px-1">Coming Soon</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="font-medium text-xs text-foreground">Advanced Analytics</h4>
                      <p className="text-xs text-muted-foreground">Deep insights into your hiring performance</p>
                    </div>
                    <Badge variant="secondary" className="text-xs h-4 px-1">Coming Soon</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="font-medium text-xs text-foreground">Custom Integrations</h4>
                      <p className="text-xs text-muted-foreground">Connect with your existing HR tools</p>
                    </div>
                    <Badge variant="secondary" className="text-xs h-4 px-1">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};