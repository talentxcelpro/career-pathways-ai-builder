
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Users, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const EmployerSettings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    newApplications: true,
    interviewReminders: true,
    jobExpiry: true,
    teamActivity: false
  });

  const handleSave = () => {
    // Implement save functionality
    console.log('Settings saved');
  };

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
              <Input id="companyName" placeholder="Your Company Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://yourcompany.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input id="email" type="email" placeholder="hr@yourcompany.com" />
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
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EmployerSettings;
