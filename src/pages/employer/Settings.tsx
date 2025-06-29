
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Users, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const EmployerSettings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    website: '',
    description: ''
  });

  const [notifications, setNotifications] = useState({
    newApplications: true,
    interviewReminders: true,
    jobExpiry: true,
    teamActivity: false
  });

  // Fetch company settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's company
      const { data: teamMember } = await supabase
        .from('company_team_members')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!teamMember) throw new Error('No company found');

      // Get company details
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', teamMember.company_id)
        .single();

      return {
        company: company,
        companyId: teamMember.company_id
      };
    }
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (settings?.company) {
      setCompanyInfo({
        name: settings.company.name || '',
        website: settings.company.website || '',
        description: settings.company.description || ''
      });
    }
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!settings?.companyId) throw new Error('No company found');

      // Update company info
      const { error: companyError } = await supabase
        .from('companies')
        .update({
          name: companyInfo.name,
          website: companyInfo.website,
          description: companyInfo.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.companyId);

      if (companyError) throw companyError;
    },
    onSuccess: () => {
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
    },
    onError: (error: any) => {
      toast.error('Failed to save settings: ' + error.message);
    }
  });

  const handleSave = () => {
    saveSettingsMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/employer')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your account preferences and notifications</p>
        </div>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Basic company details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                placeholder="Your Company Name"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website" 
                placeholder="https://yourcompany.com"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Input 
              id="description" 
              placeholder="Brief description of your company"
              value={companyInfo.description}
              onChange={(e) => setCompanyInfo(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="newApps">New Applications</Label>
              <p className="text-sm text-gray-600">Get notified when someone applies to your jobs</p>
            </div>
            <Switch 
              id="newApps"
              checked={notifications.newApplications}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newApplications: checked }))}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="interviews">Interview Reminders</Label>
              <p className="text-sm text-gray-600">Reminders for upcoming interviews</p>
            </div>
            <Switch 
              id="interviews"
              checked={notifications.interviewReminders}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, interviewReminders: checked }))}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="jobExpiry">Job Expiry Alerts</Label>
              <p className="text-sm text-gray-600">Alerts when your job posts are about to expire</p>
            </div>
            <Switch 
              id="jobExpiry"
              checked={notifications.jobExpiry}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, jobExpiry: checked }))}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="teamActivity">Team Activity</Label>
              <p className="text-sm text-gray-600">Updates on team member activities</p>
            </div>
            <Switch 
              id="teamActivity"
              checked={notifications.teamActivity}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, teamActivity: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>Manage your privacy and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" placeholder="Enter current password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" placeholder="Enter new password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
          </div>
          <Button variant="outline" className="w-full">
            Update Password
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => navigate('/employer')}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={saveSettingsMutation.isPending}
        >
          {saveSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default EmployerSettings;
