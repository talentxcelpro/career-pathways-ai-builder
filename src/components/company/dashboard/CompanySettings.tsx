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

  // Get company settings
  const { data: companySettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['company-settings', company?.id],
    queryFn: async () => {
      if (!company) return null;

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', company.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        return null;
      }

      // If no settings exist, create default ones
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

        const { data: newSettings } = await supabase
          .from('company_settings')
          .insert(defaultSettings)
          .select()
          .single();

        return newSettings || defaultSettings;
      }

      return data;
    },
    enabled: !!company
  });

  // Get team members
  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ['company-team-members', company?.id],
    queryFn: async () => {
      if (!company) return [];

      const { data, error } = await supabase
        .from('company_team_members')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('role', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!company
  });

  // Update company settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const { error } = await supabase
        .from('company_settings')
        .upsert({
          company_id: company.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['company-settings', company?.id] });
    },
    onError: (error: any) => {
      toast.error('Failed to update settings: ' + error.message);
    }
  });

  // Update company profile mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', company.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Company profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user-companies-dashboard'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update company profile: ' + error.message);
    }
  });

  const handleSettingsUpdate = (settingType: string, newValue: any) => {
    const currentSettings = companySettings || {};
    const updatedSettings = {
      ...currentSettings,
      [settingType]: newValue
    };
    updateSettingsMutation.mutate(updatedSettings);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'recruiter': return 'bg-blue-100 text-blue-800';
      case 'hiring_manager': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'recruiter': return <UserPlus className="h-4 w-4" />;
      case 'hiring_manager': return <UserCheck className="h-4 w-4" />;
      case 'viewer': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const canManageSettings = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Company Settings</h3>
          <p className="text-gray-600">Manage your company profile, team, and preferences</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          {getRoleIcon(userRole)}
          {userRole?.toUpperCase()}
        </Badge>
      </div>

      {/* Settings Tabs */}
      <Tabs value={settingsTab} onValueChange={setSettingsTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
          <TabsTrigger value="profile">
            <Building2 className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Key className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Update your company information and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    defaultValue={company?.name}
                    disabled={!canManageSettings}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry" 
                    defaultValue={company?.industry}
                    disabled={!canManageSettings}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    defaultValue={company?.website}
                    disabled={!canManageSettings}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    defaultValue={company?.location}
                    disabled={!canManageSettings}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea 
                  id="description" 
                  defaultValue={company?.description}
                  rows={4}
                  disabled={!canManageSettings}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Company Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {company?.logo_url ? (
                        <img src={company.logo_url} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Building2 className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <Button variant="outline" disabled={!canManageSettings}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Cover Image</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-24 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {company?.cover_image_url ? (
                        <img src={company.cover_image_url} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Upload className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <Button variant="outline" disabled={!canManageSettings}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Cover
                    </Button>
                  </div>
                </div>
              </div>

              {canManageSettings && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => updateCompanyMutation.mutate({
                      name: (document.getElementById('company-name') as HTMLInputElement)?.value,
                      industry: (document.getElementById('industry') as HTMLInputElement)?.value,
                      website: (document.getElementById('website') as HTMLInputElement)?.value,
                      location: (document.getElementById('location') as HTMLInputElement)?.value,
                      description: (document.getElementById('description') as HTMLTextAreaElement)?.value,
                    })}
                    disabled={updateCompanyMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your company team access and permissions</CardDescription>
                </div>
                {canManageSettings && (
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {teamLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : teamMembers && teamMembers.length > 0 ? (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{member.profiles?.full_name}</h4>
                          <p className="text-sm text-gray-600">{member.profiles?.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getRoleColor(member.role)}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1">{member.role.replace('_', ' ').toUpperCase()}</span>
                        </Badge>
                        {canManageSettings && member.role !== 'owner' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Team Members</h3>
                  <p className="text-gray-600 mb-4">Invite team members to collaborate on hiring</p>
                  {canManageSettings && (
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite First Member
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-applications">New Applications</Label>
                    <p className="text-sm text-gray-600">Notify when new applications are received</p>
                  </div>
                  <Switch 
                    id="new-applications"
                    checked={companySettings?.notification_preferences?.new_applications ?? true}
                    onCheckedChange={(checked) => 
                      handleSettingsUpdate('notification_preferences', {
                        ...companySettings?.notification_preferences,
                        new_applications: checked
                      })
                    }
                    disabled={!canManageSettings}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="post-engagement">Post Engagement</Label>
                    <p className="text-sm text-gray-600">Notify about likes, comments, and shares</p>
                  </div>
                  <Switch 
                    id="post-engagement"
                    checked={companySettings?.notification_preferences?.post_engagement ?? true}
                    onCheckedChange={(checked) => 
                      handleSettingsUpdate('notification_preferences', {
                        ...companySettings?.notification_preferences,
                        post_engagement: checked
                      })
                    }
                    disabled={!canManageSettings}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="follower-milestones">Follower Milestones</Label>
                    <p className="text-sm text-gray-600">Notify about follower growth milestones</p>
                  </div>
                  <Switch 
                    id="follower-milestones"
                    checked={companySettings?.notification_preferences?.follower_milestones ?? true}
                    onCheckedChange={(checked) => 
                      handleSettingsUpdate('notification_preferences', {
                        ...companySettings?.notification_preferences,
                        follower_milestones: checked
                      })
                    }
                    disabled={!canManageSettings}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <p className="text-sm text-gray-600">Receive weekly performance summaries</p>
                  </div>
                  <Switch 
                    id="weekly-reports"
                    checked={companySettings?.notification_preferences?.weekly_reports ?? true}
                    onCheckedChange={(checked) => 
                      handleSettingsUpdate('notification_preferences', {
                        ...companySettings?.notification_preferences,
                        weekly_reports: checked
                      })
                    }
                    disabled={!canManageSettings}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Appearance</CardTitle>
              <CardDescription>Customize your company's visual identity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Branding Settings Coming Soon</h3>
                <p className="text-gray-600">Customize colors, themes, and visual elements</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations & API Keys</CardTitle>
              <CardDescription>Connect with external services and manage API access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Key className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Integrations Coming Soon</h3>
                <p className="text-gray-600">Connect with ATS, CRM, and other hiring tools</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};