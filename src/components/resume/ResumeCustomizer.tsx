
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Palette, Type, Layout, FileText, Target, Zap } from 'lucide-react';

interface CustomizationSettings {
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: number;
  };
  layout: {
    multiPage: boolean;
    sections: string[];
    spacing: number;
  };
  atsOptimization: {
    enabled: boolean;
    score: number;
  };
}

interface ResumeCustomizerProps {
  settings: CustomizationSettings;
  onSettingsChange: (settings: CustomizationSettings) => void;
  industry?: string;
}

export const ResumeCustomizer: React.FC<ResumeCustomizerProps> = ({
  settings,
  onSettingsChange,
  industry
}) => {
  const [activeTab, setActiveTab] = useState('colors');

  const colorSchemes = [
    { name: 'Professional Blue', primary: '#3B82F6', secondary: '#1F2937', accent: '#6B7280' },
    { name: 'Executive Gray', primary: '#374151', secondary: '#111827', accent: '#9CA3AF' },
    { name: 'Creative Purple', primary: '#8B5CF6', secondary: '#5B21B6', accent: '#A78BFA' },
    { name: 'Tech Green', primary: '#10B981', secondary: '#065F46', accent: '#6EE7B7' },
    { name: 'Finance Navy', primary: '#1E40AF', secondary: '#1E3A8A', accent: '#60A5FA' },
    { name: 'Healthcare Teal', primary: '#0D9488', secondary: '#134E4A', accent: '#5EEAD4' }
  ];

  const fontPairs = [
    { name: 'Classic', heading: 'Georgia', body: 'Times New Roman' },
    { name: 'Modern', heading: 'Helvetica', body: 'Arial' },
    { name: 'Professional', heading: 'Calibri', body: 'Calibri' },
    { name: 'Clean', heading: 'Roboto', body: 'Open Sans' },
    { name: 'Executive', heading: 'Playfair Display', body: 'Source Sans Pro' },
    { name: 'Tech', heading: 'Inter', body: 'Source Code Pro' }
  ];

  const sectionOptions = [
    'Professional Summary',
    'Work Experience',
    'Education',
    'Skills',
    'Certifications',
    'Projects',
    'Awards',
    'Publications',
    'Volunteer Work',
    'Languages',
    'References'
  ];

  const industryRecommendations = {
    'Healthcare': ['Certifications', 'Clinical Experience', 'Continuing Education'],
    'Finance': ['Certifications', 'Deal Experience', 'Financial Modeling'],
    'Technology': ['Projects', 'Technical Skills', 'Open Source Contributions'],
    'Creative': ['Portfolio', 'Awards', 'Creative Projects'],
    'Academic': ['Publications', 'Research', 'Teaching Experience']
  };

  const updateColorScheme = (scheme: typeof colorSchemes[0]) => {
    onSettingsChange({
      ...settings,
      colorScheme: {
        primary: scheme.primary,
        secondary: scheme.secondary,
        accent: scheme.accent
      }
    });
  };

  const updateTypography = (field: keyof CustomizationSettings['typography'], value: any) => {
    onSettingsChange({
      ...settings,
      typography: {
        ...settings.typography,
        [field]: value
      }
    });
  };

  const updateLayout = (field: keyof CustomizationSettings['layout'], value: any) => {
    onSettingsChange({
      ...settings,
      layout: {
        ...settings.layout,
        [field]: value
      }
    });
  };

  const calculateATSScore = () => {
    let score = 70; // Base score
    
    // Font choices
    if (['Arial', 'Calibri', 'Times New Roman'].includes(settings.typography.bodyFont)) {
      score += 10;
    }
    
    // Color contrast
    if (settings.colorScheme.primary === '#3B82F6' || settings.colorScheme.primary === '#374151') {
      score += 10;
    }
    
    // Section organization
    if (settings.layout.sections.includes('Professional Summary')) score += 5;
    if (settings.layout.sections.includes('Work Experience')) score += 5;
    
    return Math.min(score, 100);
  };

  const atsScore = calculateATSScore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Resume Customization
        </CardTitle>
        <CardDescription>
          Customize your resume appearance and optimization settings
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors" className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-1">
              <Type className="h-3 w-3" />
              Fonts
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-1">
              <Layout className="h-3 w-3" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="ats" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              ATS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-6">
            <div>
              <Label className="text-base font-medium">Color Schemes</Label>
              <p className="text-sm text-gray-600 mb-4">Choose a professional color palette</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {colorSchemes.map((scheme) => (
                  <div
                    key={scheme.name}
                    onClick={() => updateColorScheme(scheme)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      settings.colorScheme.primary === scheme.primary ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{scheme.name}</span>
                      {settings.colorScheme.primary === scheme.primary && (
                        <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: scheme.primary }}
                      />
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: scheme.secondary }}
                      />
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: scheme.accent }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Font Selection</Label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fontPairs.map((pair) => (
                  <div
                    key={pair.name}
                    onClick={() => {
                      updateTypography('headingFont', pair.heading);
                      updateTypography('bodyFont', pair.body);
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      settings.typography.headingFont === pair.heading ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{pair.name}</span>
                      {settings.typography.headingFont === pair.heading && (
                        <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div style={{ fontFamily: pair.heading }}>Heading: {pair.heading}</div>
                      <div style={{ fontFamily: pair.body }}>Body: {pair.body}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Font Size: {settings.typography.fontSize}pt</Label>
                <Slider
                  value={[settings.typography.fontSize]}
                  onValueChange={(value) => updateTypography('fontSize', value[0])}
                  min={10}
                  max={16}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Multi-page Resume</Label>
                  <p className="text-sm text-gray-600">Allow content to span multiple pages</p>
                </div>
                <Switch
                  checked={settings.layout.multiPage}
                  onCheckedChange={(checked) => updateLayout('multiPage', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Spacing: {settings.layout.spacing}</Label>
                <Slider
                  value={[settings.layout.spacing]}
                  onValueChange={(value) => updateLayout('spacing', value[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-base font-medium">Resume Sections</Label>
                <p className="text-sm text-gray-600 mb-3">Select sections to include in your resume</p>
                
                {industry && industryRecommendations[industry as keyof typeof industryRecommendations] && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Recommended for {industry}:
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {industryRecommendations[industry as keyof typeof industryRecommendations].map((section) => (
                        <Badge key={section} variant="outline" className="text-xs">
                          {section}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {sectionOptions.map((section) => (
                    <label key={section} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={settings.layout.sections.includes(section)}
                        onChange={(e) => {
                          const sections = e.target.checked
                            ? [...settings.layout.sections, section]
                            : settings.layout.sections.filter(s => s !== section);
                          updateLayout('sections', sections);
                        }}
                        className="rounded"
                      />
                      <span>{section}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ats" className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-medium">ATS Optimization Score</Label>
                  <Badge className={`text-lg px-3 py-1 ${
                    atsScore >= 90 ? 'bg-green-100 text-green-800' :
                    atsScore >= 80 ? 'bg-blue-100 text-blue-800' :
                    atsScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {atsScore}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Your resume's compatibility with Applicant Tracking Systems
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Optimization Recommendations:</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      ['Arial', 'Calibri', 'Times New Roman'].includes(settings.typography.bodyFont) 
                        ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span>Use ATS-friendly fonts (Arial, Calibri, Times New Roman)</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      settings.layout.sections.includes('Professional Summary') ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span>Include a Professional Summary section</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      settings.layout.sections.includes('Work Experience') ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span>Include Work Experience section</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      !settings.layout.multiPage ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span>Single-page format is preferred by most ATS systems</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto ATS Optimization</Label>
                  <p className="text-sm text-gray-600">Automatically optimize for ATS compatibility</p>
                </div>
                <Switch
                  checked={settings.atsOptimization.enabled}
                  onCheckedChange={(checked) => onSettingsChange({
                    ...settings,
                    atsOptimization: { ...settings.atsOptimization, enabled: checked }
                  })}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
