import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Globe, Eye, Code, Palette } from 'lucide-react';
import { EditorResume } from '@/types/editor-resume';

interface PortfolioWebsiteBuilderProps {
  resumeData?: EditorResume;
  onSave?: (websiteData: any) => void;
}

export const PortfolioWebsiteBuilder: React.FC<PortfolioWebsiteBuilderProps> = ({
  resumeData,
  onSave
}) => {
  const [websiteConfig, setWebsiteConfig] = useState({
    title: resumeData?.personalInfo?.fullName || 'My Portfolio',
    subdomain: '',
    theme: 'modern',
    showContact: true,
    showProjects: true,
    showExperience: true,
    showSkills: true,
    customCSS: '',
    analytics: false
  });

  const [previewMode, setPreviewMode] = useState(false);

  const themes = [
    { id: 'modern', name: 'Modern', color: 'bg-blue-500' },
    { id: 'minimal', name: 'Minimal', color: 'bg-gray-500' },
    { id: 'creative', name: 'Creative', color: 'bg-purple-500' },
    { id: 'professional', name: 'Professional', color: 'bg-slate-700' }
  ];

  const handleSave = () => {
    if (!websiteConfig.subdomain.trim()) {
      toast.error('Please enter a subdomain');
      return;
    }

    const websiteData = {
      ...websiteConfig,
      resumeData,
      createdAt: new Date().toISOString(),
      url: `https://${websiteConfig.subdomain}.talentxcel.com`
    };

    if (onSave) {
      onSave(websiteData);
    }
    
    toast.success('Portfolio website configuration saved!');
  };

  const generateSubdomain = () => {
    const name = resumeData?.personalInfo?.fullName?.toLowerCase().replace(/\s+/g, '') || 'portfolio';
    const random = Math.random().toString(36).substring(2, 6);
    setWebsiteConfig(prev => ({
      ...prev,
      subdomain: `${name}-${random}`
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Portfolio Website Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Website Title</Label>
                <Input
                  id="title"
                  value={websiteConfig.title}
                  onChange={(e) => setWebsiteConfig(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex gap-2">
                  <Input
                    id="subdomain"
                    value={websiteConfig.subdomain}
                    onChange={(e) => setWebsiteConfig(prev => ({ ...prev, subdomain: e.target.value }))}
                    placeholder="your-name"
                  />
                  <Button onClick={generateSubdomain} variant="outline">
                    Generate
                  </Button>
                </div>
                {websiteConfig.subdomain && (
                  <p className="text-sm text-muted-foreground">
                    Your site will be: https://{websiteConfig.subdomain}.talentxcel.com
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Selection
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    websiteConfig.theme === theme.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setWebsiteConfig(prev => ({ ...prev, theme: theme.id }))}
                >
                  <div className={`w-full h-16 rounded mb-2 ${theme.color}`} />
                  <p className="text-sm font-medium">{theme.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Content Sections</h3>
            <div className="space-y-3">
              {[
                { key: 'showContact', label: 'Contact Information' },
                { key: 'showProjects', label: 'Projects Portfolio' },
                { key: 'showExperience', label: 'Work Experience' },
                { key: 'showSkills', label: 'Skills & Expertise' }
              ].map((section) => (
                <div key={section.key} className="flex items-center justify-between">
                  <Label htmlFor={section.key}>{section.label}</Label>
                  <Switch
                    id={section.key}
                    checked={websiteConfig[section.key as keyof typeof websiteConfig] as boolean}
                    onCheckedChange={(checked) => 
                      setWebsiteConfig(prev => ({ ...prev, [section.key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="customCSS">Custom CSS</Label>
              <Textarea
                id="customCSS"
                value={websiteConfig.customCSS}
                onChange={(e) => setWebsiteConfig(prev => ({ ...prev, customCSS: e.target.value }))}
                placeholder="/* Add your custom CSS here */"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="analytics">Enable Analytics</Label>
              <Switch
                id="analytics"
                checked={websiteConfig.analytics}
                onCheckedChange={(checked) => 
                  setWebsiteConfig(prev => ({ ...prev, analytics: checked }))
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={() => setPreviewMode(!previewMode)} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Code className="h-4 w-4 mr-2" />
              Save & Deploy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Mode */}
      {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle>Website Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-background min-h-[400px]">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">{websiteConfig.title}</h1>
                <p className="text-muted-foreground">
                  This is a preview of your portfolio website
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Theme: {websiteConfig.theme}</Badge>
                  <Badge variant="secondary">
                    Sections: {Object.entries(websiteConfig).filter(([key, value]) => 
                      key.startsWith('show') && value
                    ).length}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Full preview will be available after deployment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};