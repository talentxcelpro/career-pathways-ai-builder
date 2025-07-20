
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Download, FileText, Image, Globe, Link2, 
  Settings, Crown, Zap, Palette, Type
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isPremium: boolean;
  fileExtension: string;
  features: string[];
}

interface ExportSettings {
  format: string;
  template: string;
  colorScheme: string;
  fontSize: number;
  fontFamily: string;
  pageMargins: string;
  includePhoto: boolean;
  optimizeForATS: boolean;
  customBranding: boolean;
}

interface ExportSystemProps {
  resumeData: any;
  selectedTemplate: string;
  onExport: (format: string, settings: ExportSettings) => Promise<void>;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'High-quality PDF perfect for printing and sharing',
    icon: <FileText className="w-5 h-5" />,
    isPremium: false,
    fileExtension: 'pdf',
    features: ['ATS Compatible', 'Print Ready', 'Universal Format', 'High Quality']
  },
  {
    id: 'docx',
    name: 'Word Document',
    description: 'Editable Microsoft Word format for easy customization',
    icon: <FileText className="w-5 h-5" />,
    isPremium: true,
    fileExtension: 'docx',
    features: ['Fully Editable', 'ATS Compatible', 'Recruiter Friendly', 'Easy Updates']
  },
  {
    id: 'png',
    name: 'Image (PNG)',
    description: 'High-resolution image for social media and portfolios',
    icon: <Image className="w-5 h-5" />,
    isPremium: false,
    fileExtension: 'png',
    features: ['Social Media Ready', 'High Resolution', 'Visual Impact', 'No Editing Needed']
  },
  {
    id: 'html',
    name: 'Web Portfolio',
    description: 'Interactive web version with live links and analytics',
    icon: <Globe className="w-5 h-5" />,
    isPremium: true,
    fileExtension: 'html',
    features: ['Interactive Links', 'Mobile Responsive', 'Analytics Tracking', 'SEO Optimized']
  }
];

const colorSchemes = [
  { id: 'professional-blue', name: 'Professional Blue', colors: ['#2563eb', '#1e40af', '#1e3a8a'] },
  { id: 'elegant-gray', name: 'Elegant Gray', colors: ['#374151', '#6b7280', '#9ca3af'] },
  { id: 'modern-green', name: 'Modern Green', colors: ['#059669', '#047857', '#065f46'] },
  { id: 'creative-purple', name: 'Creative Purple', colors: ['#7c3aed', '#6d28d9', '#5b21b6'] },
  { id: 'warm-orange', name: 'Warm Orange', colors: ['#ea580c', '#dc2626', '#b91c1c'] },
  { id: 'minimalist-black', name: 'Minimalist Black', colors: ['#111827', '#374151', '#6b7280'] }
];

const fontFamilies = [
  { id: 'inter', name: 'Inter (Modern)', preview: 'Professional and clean' },
  { id: 'roboto', name: 'Roboto (Friendly)', preview: 'Approachable and readable' },
  { id: 'times', name: 'Times New Roman (Classic)', preview: 'Traditional and formal' },
  { id: 'arial', name: 'Arial (Universal)', preview: 'Simple and compatible' },
  { id: 'georgia', name: 'Georgia (Elegant)', preview: 'Sophisticated serif' }
];

export const ExportSystem: React.FC<ExportSystemProps> = ({
  resumeData,
  selectedTemplate,
  onExport
}) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'pdf',
    template: selectedTemplate,
    colorScheme: 'professional-blue',
    fontSize: 11,
    fontFamily: 'inter',
    pageMargins: 'normal',
    includePhoto: true,
    optimizeForATS: true,
    customBranding: false
  });

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      const settings = { ...exportSettings, format };
      await onExport(format, settings);
      toast.success(`Resume exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export resume: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedFormatData = exportFormats.find(f => f.id === selectedFormat);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Export Your Resume</h2>
        <p className="text-muted-foreground">
          Choose your format and customize the final output
        </p>
      </div>

      {/* Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportFormats.map((format) => (
              <div
                key={format.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedFormat === format.id ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedFormat(format.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {format.icon}
                    <span className="font-medium">{format.name}</span>
                  </div>
                  {format.isPremium && (
                    <Badge className="bg-purple-500">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {format.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {format.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Customization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Scheme */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color Scheme
            </Label>
            <Select
              value={exportSettings.colorScheme}
              onValueChange={(value) => 
                setExportSettings(prev => ({ ...prev, colorScheme: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorSchemes.map((scheme) => (
                  <SelectItem key={scheme.id} value={scheme.id}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {scheme.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      {scheme.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Family */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Font Family
            </Label>
            <Select
              value={exportSettings.fontFamily}
              onValueChange={(value) => 
                setExportSettings(prev => ({ ...prev, fontFamily: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.id} value={font.id}>
                    <div>
                      <div className="font-medium">{font.name}</div>
                      <div className="text-xs text-muted-foreground">{font.preview}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <Label>Font Size: {exportSettings.fontSize}pt</Label>
            <Slider
              value={[exportSettings.fontSize]}
              onValueChange={([value]) => 
                setExportSettings(prev => ({ ...prev, fontSize: value }))
              }
              min={9}
              max={14}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small (9pt)</span>
              <span>Normal (11pt)</span>
              <span>Large (14pt)</span>
            </div>
          </div>

          {/* Page Margins */}
          <div className="space-y-3">
            <Label>Page Margins</Label>
            <Select
              value={exportSettings.pageMargins}
              onValueChange={(value) => 
                setExportSettings(prev => ({ ...prev, pageMargins: value }))
              }
            >
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

          {/* Toggle Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-photo">Include Profile Photo</Label>
                <p className="text-sm text-muted-foreground">Add your profile photo to the resume</p>
              </div>
              <Switch
                id="include-photo"
                checked={exportSettings.includePhoto}
                onCheckedChange={(checked) => 
                  setExportSettings(prev => ({ ...prev, includePhoto: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="optimize-ats">Optimize for ATS</Label>
                <p className="text-sm text-muted-foreground">Format for Applicant Tracking Systems</p>
              </div>
              <Switch
                id="optimize-ats"
                checked={exportSettings.optimizeForATS}
                onCheckedChange={(checked) => 
                  setExportSettings(prev => ({ ...prev, optimizeForATS: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="custom-branding">Custom Branding</Label>
                <p className="text-sm text-muted-foreground">Add your personal branding elements</p>
              </div>
              <Switch
                id="custom-branding"
                checked={exportSettings.customBranding}
                onCheckedChange={(checked) => 
                  setExportSettings(prev => ({ ...prev, customBranding: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Ready to Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Format Preview */}
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            {selectedFormatData?.icon}
            <div className="flex-1">
              <h3 className="font-medium">{selectedFormatData?.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedFormatData?.description}</p>
            </div>
            <Badge variant="outline">
              .{selectedFormatData?.fileExtension}
            </Badge>
          </div>

          {/* Export Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={() => handleExport(selectedFormat)}
              disabled={isExporting}
              size="lg"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : `Export as ${selectedFormat.toUpperCase()}`}
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              className="flex items-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              Generate Share Link
            </Button>
          </div>

          {/* Quick Export Options */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Quick Export</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {exportFormats.map((format) => (
                <Button 
                  key={format.id}
                  size="sm" 
                  variant="outline"
                  onClick={() => handleExport(format.id)}
                  disabled={isExporting}
                  className="flex items-center gap-1"
                >
                  {format.icon}
                  {format.fileExtension.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
