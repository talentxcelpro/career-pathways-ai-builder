import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useResumeExport, ExportSettings } from '@/hooks/useResumeExport';
import { resumeTemplates, getTemplatesByCategory, type ResumeTemplate } from '@/data/resumeTemplates';
import { 
  Download, 
  FileText, 
  FileImage, 
  Globe, 
  Palette, 
  Settings, 
  Eye, 
  Share, 
  Crown,
  Copy,
  ExternalLink,
  Lock,
  Unlock
} from 'lucide-react';
import { toast } from 'sonner';

interface ResumeExportSettingsProps {
  resumeData: any;
  resumeId?: string;
  currentSettings?: Partial<ExportSettings>;
  onSettingsChange?: (settings: ExportSettings) => void;
}

const defaultSettings: ExportSettings = {
  format: 'pdf',
  template: 'modern-tech',
  colorScheme: 'blue',
  fontSize: '14px',
  fontFamily: 'Inter',
  showBranding: true,
  includePhoto: false,
  pageMargins: 'normal',
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'awards']
};

export const ResumeExportSettings: React.FC<ResumeExportSettingsProps> = ({
  resumeData,
  resumeId,
  currentSettings,
  onSettingsChange
}) => {
  const { 
    exportResume, 
    isExporting, 
    exportProgress,
    saveResumeSettings,
    generatePublicLink,
    revokePublicLink,
    previewResume
  } = useResumeExport();

  const [settings, setSettings] = useState<ExportSettings>({
    ...defaultSettings,
    ...currentSettings
  });
  
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | undefined>(
    resumeTemplates.find(t => t.id === settings.template)
  );

  const updateSettings = (newSettings: Partial<ExportSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    onSettingsChange?.(updated);
  };

  const handleTemplateChange = (templateId: string) => {
    const template = resumeTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      updateSettings({ 
        template: templateId,
        colorScheme: template.colorSchemes[0].id 
      });
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'html') => {
    const exportSettings = { ...settings, format };
    const result = await exportResume(resumeData, exportSettings);
    
    if (result.success && result.downloadUrl) {
      // Trigger download
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename || `resume.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      setTimeout(() => {
        URL.revokeObjectURL(result.downloadUrl!);
      }, 1000);
    }
  };

  const handleGeneratePublicLink = async () => {
    if (!resumeId) {
      toast.error('Resume must be saved before generating public link');
      return;
    }

    setIsGeneratingLink(true);
    const url = await generatePublicLink(resumeId);
    if (url) {
      setPublicUrl(url);
    }
    setIsGeneratingLink(false);
  };

  const handleRevokePublicLink = async () => {
    if (!resumeId) return;
    
    const success = await revokePublicLink(resumeId);
    if (success) {
      setPublicUrl('');
    }
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success('Public link copied to clipboard!');
  };

  const handlePreview = async () => {
    const previewContent = await previewResume(resumeData, settings);
    if (previewContent) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(previewContent);
        newWindow.document.close();
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Resume Export & Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="template" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="customization">Style</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="sharing">Share</TabsTrigger>
            </TabsList>

            {/* Template Selection */}
            <TabsContent value="template" className="space-y-4">
              <div>
                <Label className="text-base font-medium">Choose Template</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a professional template that matches your industry and style
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resumeTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all ${
                      settings.template === template.id 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleTemplateChange(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-[3/4] bg-muted rounded-lg mb-3 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{template.name}</h3>
                          {template.isPremium && (
                            <Badge variant="secondary" className="text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              Pro
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <div className="flex gap-1 flex-wrap">
                          {template.features.slice(0, 2).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedTemplate && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Color Schemes</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedTemplate.colorSchemes.map((scheme) => (
                        <div
                          key={scheme.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            settings.colorScheme === scheme.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => updateSettings({ colorScheme: scheme.id })}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: scheme.primary }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: scheme.accent }}
                            />
                            <span className="text-sm font-medium">{scheme.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Customization */}
            <TabsContent value="customization" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Select value={settings.fontSize} onValueChange={(value) => updateSettings({ fontSize: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12px">Small (12px)</SelectItem>
                        <SelectItem value="14px">Medium (14px)</SelectItem>
                        <SelectItem value="16px">Large (16px)</SelectItem>
                        <SelectItem value="18px">Extra Large (18px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select value={settings.fontFamily} onValueChange={(value) => updateSettings({ fontFamily: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter (Modern)</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman (Classic)</SelectItem>
                        <SelectItem value="Arial">Arial (Clean)</SelectItem>
                        <SelectItem value="Calibri">Calibri (Professional)</SelectItem>
                        <SelectItem value="Georgia">Georgia (Elegant)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pageMargins">Page Margins</Label>
                    <Select value={settings.pageMargins} onValueChange={(value: any) => updateSettings({ pageMargins: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="narrow">Narrow (0.5")</SelectItem>
                        <SelectItem value="normal">Normal (0.75")</SelectItem>
                        <SelectItem value="wide">Wide (1")</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showBranding">Show Branding</Label>
                      <p className="text-sm text-muted-foreground">Include "Created with" footer</p>
                    </div>
                    <Switch
                      id="showBranding"
                      checked={settings.showBranding}
                      onCheckedChange={(checked) => updateSettings({ showBranding: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="includePhoto">Include Photo</Label>
                      <p className="text-sm text-muted-foreground">Add profile picture to resume</p>
                    </div>
                    <Switch
                      id="includePhoto"
                      checked={settings.includePhoto}
                      onCheckedChange={(checked) => updateSettings({ includePhoto: checked })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Export Options */}
            <TabsContent value="export" className="space-y-4">
              {isExporting && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Exporting Resume...</span>
                        <span className="text-sm text-muted-foreground">{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleExport('pdf')}>
                  <CardContent className="p-6 text-center">
                    <FileImage className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-medium mb-2">Export as PDF</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Perfect for printing and most applications
                    </p>
                    <Button size="sm" disabled={isExporting}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleExport('docx')}>
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-medium mb-2">Export as DOCX</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Editable Word document format
                    </p>
                    <Button size="sm" disabled={isExporting}>
                      <Download className="h-4 w-4 mr-2" />
                      Download DOCX
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handlePreview}>
                  <CardContent className="p-6 text-center">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-medium mb-2">Live Preview</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Preview your resume in browser
                    </p>
                    <Button size="sm" variant="secondary">
                      <Eye className="h-4 w-4 mr-2" />
                      Open Preview
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sharing Options */}
            <TabsContent value="sharing" className="space-y-4">
              <div>
                <Label className="text-base font-medium">Public Sharing</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a public link to share your resume online
                </p>
              </div>

              {!publicUrl ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">Create Public Link</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Share your resume with a public URL that anyone can view
                    </p>
                    <Button 
                      onClick={handleGeneratePublicLink}
                      disabled={isGeneratingLink || !resumeId}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      {isGeneratingLink ? 'Generating...' : 'Generate Public Link'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Unlock className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Public Link Active</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={handleRevokePublicLink}
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <Input 
                          value={publicUrl} 
                          readOnly 
                          className="bg-background"
                        />
                        <Button size="sm" onClick={copyPublicLink}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => window.open(publicUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Anyone with this link can view your resume. Revoke the link to make it private again.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              <div>
                <Label className="text-base font-medium">Save Settings</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Save your current template and customization preferences
                </p>
                <Button 
                  onClick={() => resumeId && saveResumeSettings(resumeId, { 
                    template: settings.template,
                    customization: {
                      fontSize: settings.fontSize,
                      fontFamily: settings.fontFamily,
                      showBranding: settings.showBranding,
                      includePhoto: settings.includePhoto,
                      pageMargins: settings.pageMargins,
                      sectionOrder: settings.sectionOrder
                    }
                  })}
                  disabled={!resumeId}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};