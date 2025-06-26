import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, Shield, Bell, Eye, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { useCurrency } from '@/contexts/CurrencyContext';
import ProfileLayout from "@/components/profile/ProfileLayout";

const ProfileSettings = () => {
  const { toast } = useToast();
  const { currency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    // Privacy Settings
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessaging: true,
    
    // Notification Settings
    emailNotifications: true,
    jobAlerts: true,
    messageNotifications: true,
    connectionRequests: true,
    weeklyDigest: true,
    
    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    
    // Account Settings
    language: "en",
    timezone: "America/Los_Angeles",
    currency: currency
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Settings Updated",
        description: "Your account settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion Requested",
      description: "You will receive a confirmation email to complete account deletion.",
      variant: "destructive",
    });
  };

  return (
    <ProfileLayout 
      title="Account Settings" 
      description="Manage your privacy, security, and notification preferences"
    >
      <div className="space-y-6">
        {/* Privacy Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Privacy Settings
            </CardTitle>
            <CardDescription>Control who can see your information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Profile Visibility</label>
              <Select 
                value={settings.profileVisibility} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, profileVisibility: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can view</SelectItem>
                  <SelectItem value="connections">Connections Only</SelectItem>
                  <SelectItem value="private">Private - Only me</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Show Email Address</h4>
                  <p className="text-sm text-gray-600">Allow others to see your email address</p>
                </div>
                <Switch
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showEmail: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Show Phone Number</h4>
                  <p className="text-sm text-gray-600">Allow others to see your phone number</p>
                </div>
                <Switch
                  checked={settings.showPhone}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPhone: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Allow Direct Messages</h4>
                  <p className="text-sm text-gray-600">Let other users send you messages</p>
                </div>
                <Switch
                  checked={settings.allowMessaging}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowMessaging: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive general notifications via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Job Alerts</h4>
                <p className="text-sm text-gray-600">Get notified about matching job opportunities</p>
              </div>
              <Switch
                checked={settings.jobAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, jobAlerts: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Message Notifications</h4>
                <p className="text-sm text-gray-600">Get notified when you receive messages</p>
              </div>
              <Switch
                checked={settings.messageNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, messageNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Connection Requests</h4>
                <p className="text-sm text-gray-600">Get notified about new connection requests</p>
              </div>
              <Switch
                checked={settings.connectionRequests}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, connectionRequests: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weekly Digest</h4>
                <p className="text-sm text-gray-600">Receive a weekly summary of your activity</p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyDigest: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription>Protect your account with security features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Login Alerts</h4>
                <p className="text-sm text-gray-600">Get notified of new login attempts</p>
              </div>
              <Switch
                checked={settings.loginAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, loginAlerts: checked }))}
              />
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-4">Change Password</h4>
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="Current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
                <Button onClick={handlePasswordChange} variant="outline">
                  Update Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Preferences */}
        <Card className="border-0 shadow-lg">
          <CardTitle>Account Preferences</CardTitle>
          <CardDescription>Customize your account settings</CardDescription>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select 
                  value={settings.language} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Timezone</label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Preferred Currency</label>
                <CurrencySelector />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-0 shadow-lg border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-900">Delete Account</h4>
                <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isLoading} className="px-8">
            {isLoading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfileSettings;
