import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Share2, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeExportButtonProps {
  resumeData: any;
  template?: string;
  resumeId?: string;
}

export const ResumeExportButton: React.FC<ResumeExportButtonProps> = ({
  resumeData,
  template = 'modern',
  resumeId
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Create a new window with the resume preview
      const printWindow = window.open(`/resume-preview/${resumeId}?template=${template}&export=true`, '_blank');
      
      if (printWindow) {
        // Wait for the window to load and then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 1000);
        };
      }
      
      toast.success('Resume export initiated!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export resume. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateShareLink = () => {
    if (resumeId) {
      const shareUrl = `${window.location.origin}/resume-preview/${resumeId}?template=${template}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
      setShowShareDialog(true);
    }
  };

  const shareUrl = resumeId ? `${window.location.origin}/resume-preview/${resumeId}?template=${template}` : '';

  return (
    <>
      <div className="flex gap-2">
        <Button 
          onClick={handleExportPDF} 
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>
        
        <Button 
          onClick={handleGenerateShareLink}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Your Resume
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Public Resume Link
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <code className="flex-1 text-sm text-gray-800 break-all">
                  {shareUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success('Link copied!');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(shareUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Preview
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const subject = `Resume - ${resumeData.personalInfo?.fullName || 'Professional'}`;
                  const body = `Please find my resume here: ${shareUrl}`;
                  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                }}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Email
              </Button>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Template:</span>
                <Badge variant="secondary">{template}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-800">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};