import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Download, FileText, Image, Share2, Link, 
  Settings, Crown, Zap, Globe, Smartphone
} from 'lucide-react';
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface ExportOptionsProps {
  resumeData: EnhancedResumeData;
  onExport: (format: string) => Promise<void>;
}

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isPremium: boolean;
  fileExtension: string;
  features: string[];
}

const exportFormats: ExportFormat[] = [
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'High-quality PDF perfect for printing and email',
    icon: <FileText className="w-5 h-5" />,
    isPremium: false,
    fileExtension: 'pdf',
    features: ['ATS Compatible', 'Print Ready', 'Universal Format']
  },
  {
    id: 'docx',
    name: 'Word Document',
    description: 'Editable Microsoft Word format',
    icon: <FileText className="w-5 h-5" />,
    isPremium: true,
    fileExtension: 'docx',
    features: ['Fully Editable', 'ATS Compatible', 'Recruiter Friendly']
  },
  {
    id: 'png',
    name: 'Image (PNG)',
    description: 'High-resolution image for social media',
    icon: <Image className="w-5 h-5" />,
    isPremium: false,
    fileExtension: 'png',
    features: ['Social Media Ready', 'High Resolution', 'Visual Impact']
  },
  {
    id: 'html',
    name: 'Web Page',
    description: 'Interactive web version with analytics',
    icon: <Globe className="w-5 h-5" />,
    isPremium: true,
    fileExtension: 'html',
    features: ['Interactive', 'Mobile Responsive', 'Analytics Tracking']
  }
];

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  resumeData,
  onExport
}) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [exportSettings, setExportSettings] = useState({
    includePhoto: true,
    optimizeForATS: true,
    includeAnalytics: false,
    customWatermark: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedFormatData = exportFormats.find(f => f.id === selectedFormat);

  return (
    <div className="space-y-6">
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
                  selectedFormat === format.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedFormat(format.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {format.icon}
                    <span className="font-medium">{format.name}</span>
                  </div>
                  {format.isPremium && (
                    <Badge className="bg-yellow-500">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{format.description}</p>
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

      {/* Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Export Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="include-photo">Include Profile Photo</Label>
              <p className="text-sm text-gray-600">Add your profile photo to the resume</p>
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
              <p className="text-sm text-gray-600">Format for Applicant Tracking Systems</p>
            </div>
            <Switch
              id="optimize-ats"
              checked={exportSettings.optimizeForATS}
              onCheckedChange={(checked) => 
                setExportSettings(prev => ({ ...prev, optimizeForATS: checked }))
              }
            />
          </div>

          {selectedFormat === 'html' && (
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-analytics">Include Analytics</Label>
                <p className="text-sm text-gray-600">Track views and engagement</p>
              </div>
              <Switch
                id="include-analytics"
                checked={exportSettings.includeAnalytics}
                onCheckedChange={(checked) => 
                  setExportSettings(prev => ({ ...prev, includeAnalytics: checked }))
                }
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="custom-watermark">Custom Watermark</Label>
              <p className="text-sm text-gray-600">Add your personal branding</p>
            </div>
            <Switch
              id="custom-watermark"
              checked={exportSettings.customWatermark}
              onCheckedChange={(checked) => 
                setExportSettings(prev => ({ ...prev, customWatermark: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Export & Share
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            {selectedFormatData?.icon}
            <div className="flex-1">
              <h3 className="font-medium">{selectedFormatData?.name}</h3>
              <p className="text-sm text-gray-600">{selectedFormatData?.description}</p>
            </div>
            <Badge variant="outline">
              .{selectedFormatData?.fileExtension}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={() => handleExport(selectedFormat)}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Download'}
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Link
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Copy URL
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile Preview
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleExport('pdf')}
              >
                Quick PDF
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleExport('docx')}
              >
                Quick Word
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};