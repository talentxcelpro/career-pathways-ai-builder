
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ApplicantResumeDownloadProps {
  resumeUrl?: string;
  applicantName: string;
  applicationId: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export const ApplicantResumeDownload: React.FC<ApplicantResumeDownloadProps> = ({
  resumeUrl,
  applicantName,
  applicationId,
  size = "sm",
  variant = "ghost"
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!resumeUrl) {
      toast.error('No resume available for download');
      return;
    }

    setDownloading(true);
    
    try {
      // Create a temporary download link
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${applicantName.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Resume downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download resume');
    } finally {
      setDownloading(false);
    }
  };

  const handleView = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
  };

  if (!resumeUrl) {
    return (
      <Button variant="ghost" size={size} disabled>
        <Download className="h-4 w-4" />
        No Resume
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={handleDownload}
        disabled={downloading}
      >
        <Download className="h-4 w-4" />
        {downloading ? 'Downloading...' : 'Download'}
      </Button>
      <Button
        variant="ghost"
        size={size}
        onClick={handleView}
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
};
