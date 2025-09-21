import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Lock, Users, Globe, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export const PrivacySecurityControls: React.FC = () => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    contactInfo: false,
    workHistory: true,
    skills: true,
    achievements: false,
    recommendations: true,
    analytics: false,
    realTimeUpdates: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    dataEncryption: true,
    auditLogs: true,
    sessionTimeout: true,
    deviceTracking: false
  });

  const handlePrivacyChange = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSecurityChange = (key: keyof typeof securitySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Privacy Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-visibility">Public Profile Visibility</Label>
              <Switch
                id="profile-visibility"
                checked={privacySettings.profileVisibility}
                onCheckedChange={() => handlePrivacyChange('profileVisibility')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="contact-info">Share Contact Information</Label>
              <Switch
                id="contact-info"
                checked={privacySettings.contactInfo}
                onCheckedChange={() => handlePrivacyChange('contactInfo')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="work-history">Work History Visible</Label>
              <Switch
                id="work-history"
                checked={privacySettings.workHistory}
                onCheckedChange={() => handlePrivacyChange('workHistory')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="skills">Skills & Certifications</Label>
              <Switch
                id="skills"
                checked={privacySettings.skills}
                onCheckedChange={() => handlePrivacyChange('skills')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="achievements">Achievements Public</Label>
              <Switch
                id="achievements"
                checked={privacySettings.achievements}
                onCheckedChange={() => handlePrivacyChange('achievements')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <Switch
                id="two-factor"
                checked={securitySettings.twoFactorAuth}
                onCheckedChange={() => handleSecurityChange('twoFactorAuth')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="encryption">Data Encryption</Label>
              <Switch
                id="encryption"
                checked={securitySettings.dataEncryption}
                onCheckedChange={() => handleSecurityChange('dataEncryption')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="audit-logs">Audit Trail Logging</Label>
              <Switch
                id="audit-logs"
                checked={securitySettings.auditLogs}
                onCheckedChange={() => handleSecurityChange('auditLogs')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="session-timeout">Auto Session Timeout</Label>
              <Switch
                id="session-timeout"
                checked={securitySettings.sessionTimeout}
                onCheckedChange={() => handleSecurityChange('sessionTimeout')}
              />
            </div>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Lock className="h-4 w-4 mr-2" />
              Download My Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Privacy Report
            </Button>
            <Button variant="destructive" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};