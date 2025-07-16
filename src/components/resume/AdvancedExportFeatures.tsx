import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, FileText, Globe, Share2, QrCode, Link, 
  Monitor, Smartphone, Mail, Briefcase, Star, Award,
  CheckCircle, Clock, Zap, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  premium?: boolean;
  atsOptimized?: boolean;
}

interface AdvancedExportFeaturesProps {
  resumeData: any;
  resumeId: string;
  className?: string;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'pdf-standard',
    name: 'Standard PDF',
    description: 'Clean, professional PDF format',
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: 'pdf-ats',
    name: 'ATS-Optimized PDF',
    description: 'Optimized for Applicant Tracking Systems',
    icon: <CheckCircle className="h-4 w-4" />,
    atsOptimized: true
  },
  {
    id: 'portfolio-web',
    name: 'Interactive Portfolio',
    description: 'Modern web portfolio with animations',
    icon: <Globe className="h-4 w-4" />,
    premium: true
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Import',
    description: 'Format optimized for LinkedIn profile',
    icon: <Briefcase className="h-4 w-4" />
  },
  {
    id: 'plain-text',
    name: 'Plain Text',
    description: 'Simple text format for online forms',
    icon: <FileText className="h-4 w-4" />
  }
];

export const AdvancedExportFeatures: React.FC<AdvancedExportFeaturesProps> = ({
  resumeData,
  resumeId,
  className
}) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf-standard');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [shareableLink, setShareableLink] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  const handleExport = useCallback(async (format: string) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 20, 90));
      }, 300);

      // Mock export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setExportProgress(100);

      toast.success('Resume exported successfully!');
      
      // Generate download link
      const blob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-${format}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, []);

  const generateShareableLink = useCallback(async () => {
    const mockLink = `https://resume.ai/view/${resumeId}`;
    setShareableLink(mockLink);
    
    await navigator.clipboard.writeText(mockLink);
    toast.success('Shareable link copied to clipboard!');
  }, [resumeId]);

  const shareViaEmail = useCallback(() => {
    const subject = 'My Professional Resume';
    const body = `Please find my resume at: ${shareableLink}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }, [shareableLink]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Export Formats */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exportFormats.map((format) => (
              <Card 
                key={format.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 border hover:shadow-md",
                  selectedFormat === format.id 
                    ? "ring-2 ring-primary border-primary bg-primary/5" 
                    : "hover:border-primary/30"
                )}
                onClick={() => setSelectedFormat(format.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {format.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{format.name}</h4>
                        {format.premium && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Pro
                          </Badge>
                        )}
                        {format.atsOptimized && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            ATS
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Exporting resume...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={() => handleExport(selectedFormat)}
            disabled={isExporting}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
            size="lg"
          >
            {isExporting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Resume
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sharing Options */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share & Collaborate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              variant="outline"
              onClick={generateShareableLink}
              className="flex items-center justify-center gap-2"
            >
              <Link className="h-4 w-4" />
              Generate Link
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowQRCode(!showQRCode)}
              className="flex items-center justify-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
          </div>

          {shareableLink && (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Shareable Link:</p>
                <p className="text-xs text-muted-foreground break-all">{shareableLink}</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={shareViaEmail}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigator.share?.({ url: shareableLink })}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          )}

          {showQRCode && (
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                <QrCode className="h-16 w-16 text-primary" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Preview Modes */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Preview Modes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              Desktop
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              Mobile
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};