import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Share2, Calendar, User, Clock } from 'lucide-react';
import { Certificate } from '@/hooks/useCertificates';

interface CertificateCardProps {
  certificate: Certificate;
  onDownload?: (certificate: Certificate) => void;
  onShare?: (certificate: Certificate) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ 
  certificate, 
  onDownload, 
  onShare 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-400">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {certificate.certificate_data.course_title || certificate.courses?.title}
              </h3>
              <Badge variant="secondary" className="mt-1">
                Certificate #{certificate.certificate_number}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{certificate.certificate_data.student_name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Issued: {formatDate(certificate.issued_at)}</span>
          </div>
          
          {certificate.certificate_data.instructor_name && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Instructor: {certificate.certificate_data.instructor_name}</span>
            </div>
          )}
          
          {certificate.courses?.duration_hours && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{certificate.courses.duration_hours} hours</span>
            </div>
          )}
        </div>

        {certificate.certificate_data.skills_acquired && 
         certificate.certificate_data.skills_acquired.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Skills Acquired:</h4>
            <div className="flex flex-wrap gap-1">
              {certificate.certificate_data.skills_acquired.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => onDownload?.(certificate)}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onShare?.(certificate)}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Completion Date: {formatDate(certificate.certificate_data.completion_date)}
        </div>
      </CardContent>
    </Card>
  );
};