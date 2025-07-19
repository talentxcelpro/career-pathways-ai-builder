
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Download, Share2, BarChart3, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WhatsNextCardProps {
  resumeData?: any;
  resumeId?: string;
  onCheckAnother: () => void;
}

export const WhatsNextCard: React.FC<WhatsNextCardProps> = ({ 
  resumeData, 
  resumeId, 
  onCheckAnother 
}) => {
  const navigate = useNavigate();

  const handleEditCustomize = () => {
    if (resumeId) {
      navigate(`/resume-builder/edit/${resumeId}`);
    } else {
      navigate('/resume-builder/edit/new', { 
        state: { resumeData } 
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Implementation for PDF download
      console.log('Downloading PDF...');
      // You can integrate with jsPDF or html2canvas here
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleShareOnline = () => {
    if (resumeId) {
      navigate(`/resume-builder/share/${resumeId}`);
    } else {
      // Create a shareable link
      console.log('Creating shareable link...');
    }
  };

  const handleViewAnalytics = () => {
    if (resumeId) {
      navigate(`/resume-builder/analytics/${resumeId}`);
    } else {
      console.log('Analytics not available for uncreated resume');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="text-center text-xl text-blue-800">
          What's Next?
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Edit & Customize */}
          <Button 
            onClick={handleEditCustomize}
            className="h-16 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit3 className="h-5 w-5" />
            <span className="text-sm font-medium">Edit & Customize</span>
          </Button>

          {/* Download PDF */}
          <Button 
            onClick={handleDownloadPDF}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center gap-2 border-green-300 hover:bg-green-50"
          >
            <Download className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Download PDF</span>
          </Button>

          {/* Share Online */}
          <Button 
            onClick={handleShareOnline}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center gap-2 border-purple-300 hover:bg-purple-50"
          >
            <Share2 className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Share Online</span>
          </Button>

          {/* View Analytics */}
          <Button 
            onClick={handleViewAnalytics}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center gap-2 border-orange-300 hover:bg-orange-50"
          >
            <BarChart3 className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">View Analytics</span>
          </Button>
        </div>

        {/* Check Another Resume */}
        <div className="mt-6 pt-4 border-t border-blue-200">
          <Button 
            onClick={onCheckAnother}
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-2 border-blue-300 hover:bg-blue-50"
          >
            <Upload className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-700">Check Another Resume</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
