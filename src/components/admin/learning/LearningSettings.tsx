import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, CreditCard, Globe, Bell } from 'lucide-react';

export const LearningSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Learning Platform Settings</h2>
          <p className="text-muted-foreground">Configure platform behavior and features</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Settings className="h-8 w-8 text-primary mb-2" />
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Platform-wide configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input id="platform-name" defaultValue="TalentXcel Learning Hub" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-enrollment">Max Enrollments per User</Label>
              <Input id="max-enrollment" type="number" defaultValue="10" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-enroll">Auto-enrollment for free courses</Label>
              <Switch id="auto-enroll" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="course-reviews">Enable course reviews</Label>
              <Switch id="course-reviews" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CreditCard className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Configure payment and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Input id="currency" defaultValue="INR" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission">Platform Commission (%)</Label>
              <Input id="commission" type="number" defaultValue="10" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="refunds">Enable refunds</Label>
              <Switch id="refunds" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="subscriptions">Enable subscriptions</Label>
              <Switch id="subscriptions" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Globe className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Localization</CardTitle>
            <CardDescription>Language and regional settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-language">Default Language</Label>
              <Input id="default-language" defaultValue="English" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Default Timezone</Label>
              <Input id="timezone" defaultValue="Asia/Kolkata" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="multi-language">Multi-language support</Label>
              <Switch id="multi-language" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="rtl-support">RTL language support</Label>
              <Switch id="rtl-support" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Bell className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email notifications</Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push notifications</Label>
              <Switch id="push-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="course-reminders">Course progress reminders</Label>
              <Switch id="course-reminders" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="marketing-emails">Marketing emails</Label>
              <Switch id="marketing-emails" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gamification Settings</CardTitle>
          <CardDescription>Configure badges, points, and achievements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-badges">Enable badges</Label>
              <Switch id="enable-badges" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-points">Enable points system</Label>
              <Switch id="enable-points" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="leaderboards">Enable leaderboards</Label>
              <Switch id="leaderboards" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="achievements">Enable achievements</Label>
              <Switch id="achievements" defaultChecked />
            </div>
          </div>
          <div className="pt-4">
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};