import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Download, 
  Share2, 
  Calendar, 
  User, 
  GraduationCap,
  Star,
  CheckCircle,
  Medal
} from 'lucide-react';

interface CertificateData {
  id: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  score: number;
  duration: number;
  instructorName: string;
  certificateNumber: string;
  skills: string[];
}

interface CertificateGeneratorProps {
  certificateData: CertificateData;
  onDownload?: () => void;
  onShare?: () => void;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  certificateData,
  onDownload,
  onShare
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    onDownload?.();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Certificate - ${certificateData.courseName}`,
        text: `I just completed ${certificateData.courseName} with a score of ${certificateData.score}%!`,
        url: window.location.href
      });
    } else {
      onShare?.();
    }
  };

  const getGradeLevel = (score: number) => {
    if (score >= 95) return { level: 'Outstanding', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (score >= 85) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 75) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { level: 'Satisfactory', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  };

  const grade = getGradeLevel(certificateData.score);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Certificate Preview */}
      <Card className="overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="h-8 w-8" />
            <CardTitle className="text-2xl">Certificate of Completion</CardTitle>
          </div>
          <div className="text-primary-foreground/80">
            TalentXcel Learning Platform
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div 
            ref={certificateRef}
            className="bg-gradient-to-br from-slate-50 to-white border-2 border-primary/20 rounded-lg p-8 text-center space-y-6"
          >
            {/* Header */}
            <div className="border-b border-primary/20 pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-primary">Certificate of Achievement</h1>
                  <p className="text-muted-foreground">Professional Learning Certification</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <div>
                <p className="text-lg text-muted-foreground mb-2">This is to certify that</p>
                <h2 className="text-4xl font-bold text-primary mb-4">{certificateData.studentName}</h2>
                <p className="text-lg text-muted-foreground">has successfully completed the course</p>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h3 className="text-2xl font-bold text-primary mb-2">{certificateData.courseName}</h3>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Instructor: {certificateData.instructorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Completed: {new Date(certificateData.completionDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{certificateData.score}%</div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                  <Badge className={`mt-1 ${grade.bg} ${grade.color}`}>
                    {grade.level}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{certificateData.duration}h</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="flex justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{certificateData.skills.length}</div>
                  <div className="text-sm text-muted-foreground">Skills Mastered</div>
                  <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Skills Demonstrated</h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {certificateData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-primary/20 pt-6 flex items-center justify-between">
                <div className="text-left">
                  <div className="font-semibold">TalentXcel Academy</div>
                  <div className="text-sm text-muted-foreground">Professional Learning Platform</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Certificate ID: {certificateData.certificateNumber}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Medal className="h-12 w-12 text-yellow-500" />
                  <div className="text-right">
                    <div className="font-semibold">Verified Achievement</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(certificateData.completionDate).getFullYear()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Share Your Achievement</h3>
              <p className="text-muted-foreground">Download or share your certificate to showcase your skills</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Certificate Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Certificate Number</div>
              <div className="font-mono">{certificateData.certificateNumber}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Issue Date</div>
              <div>{new Date(certificateData.completionDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Verification URL</div>
              <div className="text-blue-600 hover:underline cursor-pointer">
                talentxcel.com/verify/{certificateData.certificateNumber}
              </div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Blockchain Hash</div>
              <div className="font-mono text-xs">0x{Math.random().toString(16).substr(2, 16)}...</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Verified & Authenticated</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              This certificate has been cryptographically signed and is permanently recorded on the blockchain for verification.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add to LinkedIn */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Add to LinkedIn Profile</h3>
              <p className="text-muted-foreground">Showcase this achievement on your professional profile</p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificateData.courseName)}&organizationName=TalentXcel&issueYear=${new Date(certificateData.completionDate).getFullYear()}&issueMonth=${new Date(certificateData.completionDate).getMonth() + 1}&certUrl=${encodeURIComponent(window.location.href)}`;
                window.open(linkedinUrl, '_blank');
              }}
            >
              Add to LinkedIn
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};