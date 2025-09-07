
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResumeSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    includeBranding: false,
    defaultTemplate: 'modern-professional',
    autoSave: true,
    atsOptimization: true,
    publicSharing: false,
    sectionOrder: 'default'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save settings');
        return;
      }

      // Store settings in user preferences or create a new table for settings
      const { error } = await supabase
        .from('profiles')
        .update({
          resume_settings: settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/resume')}
              className="flex items-center mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Settings</h1>
              <p className="text-gray-600">Configure your resume preferences and defaults</p>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure default behaviors and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto Save</h3>
                  <p className="text-sm text-gray-600">Automatically save changes as you edit</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">ATS Optimization</h3>
                  <p className="text-sm text-gray-600">Enable automatic ATS-friendly formatting</p>
                </div>
                <Switch
                  checked={settings.atsOptimization}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, atsOptimization: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Public Sharing</h3>
                  <p className="text-sm text-gray-600">Allow resumes to be shared via public links</p>
                </div>
                <Switch
                  checked={settings.publicSharing}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, publicSharing: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Template Preferences</CardTitle>
              <CardDescription>Set your default template and styling options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Template
                </label>
                <Select
                  value={settings.defaultTemplate}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, defaultTemplate: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern-professional">Modern Professional</SelectItem>
                    <SelectItem value="executive-classic">Executive Classic</SelectItem>
                    <SelectItem value="creative-designer">Creative Designer</SelectItem>
                    <SelectItem value="minimal-clean">Minimal Clean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Order
                </label>
                <Select
                  value={settings.sectionOrder}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, sectionOrder: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Order</SelectItem>
                    <SelectItem value="experience-first">Experience First</SelectItem>
                    <SelectItem value="skills-first">Skills First</SelectItem>
                    <SelectItem value="education-first">Education First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Export Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
              <CardDescription>Configure default export options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Include Branding</h3>
                  <p className="text-sm text-gray-600">Add platform branding to exported resumes</p>
                </div>
                <Switch
                  checked={settings.includeBranding}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeBranding: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeSettings;
