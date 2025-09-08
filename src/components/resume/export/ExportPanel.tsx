import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Download, Settings, Palette, Type } from "lucide-react";
import { useResumeExport } from '@/hooks/useResumeExport';
import { useResumeDownloads } from '@/hooks/useResumeDownloads';
import { toast } from 'sonner';

interface ExportPanelProps {
  resumeData: any;
  resumeId: string;
}

const templates = [
  { id: 'modern', name: 'Modern', preview: '/templates/modern.png' },
  { id: 'classic', name: 'Classic', preview: '/templates/classic.png' },
  { id: 'minimal', name: 'Minimal', preview: '/templates/minimal.png' },
  { id: 'creative', name: 'Creative', preview: '/templates/creative.png' }
];

const colorSchemes = [
  { id: 'blue', name: 'Professional Blue', primary: '#3B82F6', secondary: '#1E40AF' },
  { id: 'green', name: 'Fresh Green', primary: '#10B981', secondary: '#059669' },
  { id: 'purple', name: 'Creative Purple', primary: '#8B5CF6', secondary: '#7C3AED' },
  { id: 'gray', name: 'Classic Gray', primary: '#6B7280', secondary: '#374151' }
];

export const ExportPanel = ({ resumeData, resumeId }: ExportPanelProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [selectedColorScheme, setSelectedColorScheme] = useState('blue');
  const [fontSize, setFontSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [includePhoto, setIncludePhoto] = useState(true);
  const [showBranding, setShowBranding] = useState(false);
  const [pageMargins, setPageMargins] = useState('normal');

  const { exportResume, isExporting, exportProgress } = useResumeExport();
  const { handleDownload, processing } = useResumeDownloads();

  const handleExport = async (format: 'pdf' | 'docx' | 'html') => {
    try {
      const settings = {
        format,
        template: selectedTemplate,
        colorScheme: selectedColorScheme,
        fontSize,
        fontFamily,
        showBranding,
        includePhoto,
        pageMargins: pageMargins as 'narrow' | 'normal' | 'wide',
        sectionOrder: ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications']
      };

      const result = await exportResume(resumeData, settings);
      
      if (result.success && result.downloadUrl) {
        // Record download for analytics
        await handleDownload(resumeId, () => {
          // Create download link
          const link = document.createElement('a');
          link.href = result.downloadUrl!;
          link.download = result.filename || `resume.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up blob URL
          setTimeout(() => URL.revokeObjectURL(result.downloadUrl!), 1000);
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const currentColorScheme = colorSchemes.find(scheme => scheme.id === selectedColorScheme);

  return (
    <div className="space-y-6">
      {/* Export Formats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Formats
          </CardTitle>
          <CardDescription>
            Download your resume in different formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating your resume...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleExport('pdf')}
              disabled={isExporting || processing}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              <FileText className="h-6 w-6 text-red-600" />
              <span>PDF</span>
              <span className="text-xs text-muted-foreground">Perfect for applications</span>
            </Button>
            
            <Button
              onClick={() => handleExport('docx')}
              disabled={isExporting || processing}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              <FileText className="h-6 w-6 text-blue-600" />
              <span>DOCX</span>
              <span className="text-xs text-muted-foreground">Editable document</span>
            </Button>
            
            <Button
              onClick={() => handleExport('html')}
              disabled={isExporting || processing}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              <FileText className="h-6 w-6 text-green-600" />
              <span>HTML</span>
              <span className="text-xs text-muted-foreground">Web format</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Template
          </CardTitle>
          <CardDescription>
            Choose a professional template for your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="aspect-[3/4] bg-muted rounded mb-2 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-center">{template.name}</h3>
                {selectedTemplate === template.id && (
                  <Badge className="absolute -top-2 -right-2">Selected</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Scheme
          </CardTitle>
          <CardDescription>
            Select colors that match your style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colorSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedColorScheme === scheme.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedColorScheme(scheme.id)}
              >
                <div className="flex gap-2 mb-2">
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: scheme.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: scheme.secondary }}
                  />
                </div>
                <h3 className="font-medium text-sm">{scheme.name}</h3>
                {selectedColorScheme === scheme.id && (
                  <Badge className="absolute -top-2 -right-2">Selected</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customization Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Customization
          </CardTitle>
          <CardDescription>
            Fine-tune your resume appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (14px)</SelectItem>
                  <SelectItem value="medium">Medium (16px)</SelectItem>
                  <SelectItem value="large">Large (18px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Page Margins</Label>
              <Select value={pageMargins} onValueChange={setPageMargins}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">Narrow</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Photo</Label>
                <p className="text-sm text-muted-foreground">
                  Show profile picture on resume
                </p>
              </div>
              <Switch checked={includePhoto} onCheckedChange={setIncludePhoto} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Branding</Label>
                <p className="text-sm text-muted-foreground">
                  Include TalentXcel branding
                </p>
              </div>
              <Switch checked={showBranding} onCheckedChange={setShowBranding} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            Preview how your resume will look with current settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="aspect-[3/4] border rounded-lg p-4 bg-white text-black overflow-hidden"
            style={{ 
              fontFamily: fontFamily,
              fontSize: fontSize === 'small' ? '12px' : fontSize === 'large' ? '14px' : '13px'
            }}
          >
            <div className="text-center mb-4">
              <h1 
                className="text-xl font-bold mb-1"
                style={{ color: currentColorScheme?.primary }}
              >
                {resumeData.personalInfo?.fullName || 'Your Name'}
              </h1>
              <p className="text-xs text-gray-600">
                {resumeData.personalInfo?.email} | {resumeData.personalInfo?.phone}
              </p>
            </div>
            
            {resumeData.personalInfo?.summary && (
              <div className="mb-3">
                <h2 
                  className="text-sm font-bold mb-1 border-b"
                  style={{ 
                    color: currentColorScheme?.primary,
                    borderColor: currentColorScheme?.primary 
                  }}
                >
                  Professional Summary
                </h2>
                <p className="text-xs leading-relaxed">
                  {resumeData.personalInfo.summary.substring(0, 150)}...
                </p>
              </div>
            )}
            
            <div className="text-center text-xs text-gray-500 mt-4">
              Preview with {templates.find(t => t.id === selectedTemplate)?.name} template
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};