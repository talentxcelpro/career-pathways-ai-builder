import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useResumeExport } from '@/hooks/useResumeExport';
import { 
  Download, 
  FileText, 
  File, 
  Globe, 
  Share2,
  Settings,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import type { ResumeData } from '../preview/ResumePreview';

interface ExportOptionsProps {
  resumeData: ResumeData;
  selectedTemplate: string;
  resumeId?: string;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  resumeData,
  selectedTemplate,
  resumeId
}) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'html'>('pdf');
  const [fontSize, setFontSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('inter');
  const [colorScheme, setColorScheme] = useState('blue');
  const [showBranding, setShowBranding] = useState(false);
  const [includePhoto, setIncludePhoto] = useState(false);
  const [pageMargins, setPageMargins] = useState<'narrow' | 'normal' | 'wide'>('normal');
  const [publicSlug, setPublicSlug] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const {
    exportResume,
    isExporting,
    exportProgress,
    generatePublicLink,
    revokePublicLink,
    previewResume
  } = useResumeExport();

  const handleExport = async () => {
    if (!resumeData.profile.name) {
      toast.error('Please add your name before exporting');
      return;
    }

    const settings = {
      format: exportFormat,
      template: selectedTemplate,
      colorScheme,
      fontSize,
      fontFamily,
      showBranding,
      includePhoto,
      pageMargins,
      sectionOrder: ['profile', 'summary', 'experience', 'education', 'skills', 'projects']
    };

    const result = await exportResume(resumeData, settings);
    
    if (result.success && result.downloadUrl && result.filename) {
      // Create download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      setTimeout(() => {
        URL.revokeObjectURL(result.downloadUrl!);
      }, 1000);
    }
  };

  const handleGeneratePublicLink = async () => {
    if (!resumeId) {
      toast.error('Please save your resume first to generate a public link');
      return;
    }

    const publicUrl = await generatePublicLink(resumeId, publicSlug);
    if (publicUrl) {
      setIsPublic(true);
      navigator.clipboard.writeText(publicUrl);
      toast.success('Public link generated and copied to clipboard!');
    }
  };

  const handleRevokePublicLink = async () => {
    if (!resumeId) return;
    
    const success = await revokePublicLink(resumeId);
    if (success) {
      setIsPublic(false);
      setPublicSlug('');
    }
  };

  const formatOptions = [
    {
      value: 'pdf',
      label: 'PDF Document',
      icon: FileText,
      description: 'Perfect for applications and printing',
      recommended: true
    },
    {
      value: 'docx',
      label: 'Word Document',
      icon: File,
      description: 'Editable format for further customization',
      recommended: false
    },
    {
      value: 'html',
      label: 'Web Page',
      icon: Globe,
      description: 'For online portfolios and sharing',
      recommended: false
    }
  ];

  const selectedFormatOption = formatOptions.find(option => option.value === exportFormat);

  return (
    <div className="space-y-6">
      {/* Export Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {formatOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    exportFormat === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setExportFormat(option.value as 'pdf' | 'docx' | 'html')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{option.label}</span>
                          {option.recommended && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      exportFormat === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {exportFormat === option.value && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Export Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Typography</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="font-family">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter (Modern)</SelectItem>
                    <SelectItem value="roboto">Roboto (Clean)</SelectItem>
                    <SelectItem value="times">Times New Roman (Traditional)</SelectItem>
                    <SelectItem value="arial">Arial (Classic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="font-size">Font Size</Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (10pt)</SelectItem>
                    <SelectItem value="medium">Medium (11pt)</SelectItem>
                    <SelectItem value="large">Large (12pt)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-4">
            <h4 className="font-medium">Color Scheme</h4>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'blue', color: 'bg-blue-500', name: 'Blue' },
                { value: 'green', color: 'bg-green-500', name: 'Green' },
                { value: 'purple', color: 'bg-purple-500', name: 'Purple' },
                { value: 'gray', color: 'bg-gray-500', name: 'Gray' }
              ].map((color) => (
                <div
                  key={color.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    colorScheme === color.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setColorScheme(color.value)}
                >
                  <div className={`w-6 h-6 ${color.color} rounded mx-auto mb-1`} />
                  <div className="text-xs text-center">{color.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Layout</h4>
            <div>
              <Label htmlFor="margins">Page Margins</Label>
              <Select value={pageMargins} onValueChange={(value: 'narrow' | 'normal' | 'wide') => setPageMargins(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">Narrow (0.5 inch)</SelectItem>
                  <SelectItem value="normal">Normal (0.75 inch)</SelectItem>
                  <SelectItem value="wide">Wide (1 inch)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <h4 className="font-medium">Additional Options</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="branding">Include TalentXcel Branding</Label>
                  <p className="text-xs text-gray-600">Add subtle branding to your resume</p>
                </div>
                <Switch
                  id="branding"
                  checked={showBranding}
                  onCheckedChange={setShowBranding}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="photo">Include Profile Photo</Label>
                  <p className="text-xs text-gray-600">Add photo placeholder (upload your own later)</p>
                </div>
                <Switch
                  id="photo"
                  checked={includePhoto}
                  onCheckedChange={setIncludePhoto}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Progress */}
      {isExporting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating {selectedFormatOption?.label}...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleExport}
            disabled={isExporting || !resumeData.profile.name}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating {selectedFormatOption?.label}...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download {selectedFormatOption?.label}
              </>
            )}
          </Button>
          
          {!resumeData.profile.name && (
            <div className="flex items-center gap-2 mt-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              Please add your name to enable export
            </div>
          )}
        </CardContent>
      </Card>

      {/* Public Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Public Sharing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Generate a public link to share your resume online with potential employers.
          </p>
          
          {!isPublic ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="slug">Custom URL (optional)</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    talentxcel.in/resume/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    value={publicSlug}
                    onChange={(e) => setPublicSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="my-resume"
                  />
                </div>
              </div>
              <Button
                onClick={handleGeneratePublicLink}
                disabled={!resumeId}
                variant="outline"
                className="w-full"
              >
                <Globe className="h-4 w-4 mr-2" />
                Generate Public Link
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Public link is active</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Page
                </Button>
                <Button 
                  onClick={handleRevokePublicLink}
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Revoke Access
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};