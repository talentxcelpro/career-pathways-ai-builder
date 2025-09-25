import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  Award, 
  Calendar, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface CertificateViewerProps {
  certificateId: string;
  courseName: string;
  studentName: string;
  completionDate: Date;
  instructorName?: string;
  certificateCode: string;
  skills?: string[];
  verified?: boolean;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({
  certificateId,
  courseName,
  studentName,
  completionDate,
  instructorName,
  certificateCode,
  skills = [],
  verified = true
}) => {
  const handleDownload = () => {
    // In a real implementation, this would generate and download a PDF
    toast.success('Certificate download started');
  };

  const handleShare = () => {
    const url = `${window.location.origin}/certificates/${certificateId}`;
    navigator.clipboard.writeText(url);
    toast.success('Certificate link copied to clipboard');
  };

  const handleVerify = () => {
    // In a real implementation, this would open a verification page
    window.open(`/certificates/verify/${certificateCode}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <CardContent className="p-8 text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex justify-center">
              <Award className="h-16 w-16 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Certificate of Completion
            </h1>
            <p className="text-muted-foreground">
              This certifies that
            </p>
          </div>

          {/* Student Name */}
          <div className="py-4">
            <h2 className="text-3xl font-bold text-primary border-b-2 border-primary/20 pb-2 inline-block">
              {studentName}
            </h2>
          </div>

          {/* Course Details */}
          <div className="space-y-3">
            <p className="text-muted-foreground">
              has successfully completed the course
            </p>
            <h3 className="text-xl font-semibold text-foreground">
              {courseName}
            </h3>
            {instructorName && (
              <p className="text-sm text-muted-foreground">
                Instructor: {instructorName}
              </p>
            )}
          </div>

          {/* Skills Learned */}
          {skills.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Skills Demonstrated:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Date and Verification */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Completed on {completionDate.toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              {verified && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Verified Certificate</span>
                </>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground">
              Certificate ID: {certificateCode}
            </div>
          </div>

          {/* TalentXcel Branding */}
          <div className="pt-6 border-t">
            <div className="text-sm font-medium text-foreground">TalentXcel</div>
            <div className="text-xs text-muted-foreground">Professional Learning Platform</div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleDownload} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        
        <Button onClick={handleShare} variant="outline" className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Share Certificate
        </Button>
        
        <Button onClick={handleVerify} variant="outline">
          <ExternalLink className="h-4 w-4 mr-2" />
          Verify
        </Button>
      </div>

      {/* Verification Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-foreground">Certificate Verification</h4>
              <p className="text-sm text-muted-foreground">
                This certificate can be verified using the certificate ID. 
                Anyone can verify the authenticity of this certificate on our verification page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};