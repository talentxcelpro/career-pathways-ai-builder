import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Download, 
  Share2, 
  CheckCircle, 
  Star,
  Trophy,
  Calendar,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CertificateData {
  id: string;
  courseName: string;
  completionDate: string;
  score: number;
  modules: string[];
  skills: string[];
  issueDate: string;
}

export const EmploymentBridgeCertificate: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  // Mock completion data - replace with real data from your progress system
  const completionData = {
    totalModules: 5,
    completedModules: 5,
    overallScore: 87,
    timeSpent: '18 hours',
    skillsAcquired: [
      'Resume Writing',
      'Interview Skills',
      'Professional Communication',
      'Networking',
      'Workplace Etiquette'
    ],
    moduleScores: [
      { name: 'Career Readiness', score: 92 },
      { name: 'Soft Skills', score: 85 },
      { name: 'Interview Prep', score: 89 },
      { name: 'Job Search', score: 84 },
      { name: 'Workplace Adaptation', score: 88 }
    ]
  };

  const isEligibleForCertificate = completionData.completedModules === completionData.totalModules && 
                                   completionData.overallScore >= 70;

  const handleGenerateCertificate = async () => {
    if (!isEligibleForCertificate) return;

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Call the certificate generation function
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: {
          courseId: 'employment-bridge',
          userId: user.id,
          userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
          courseName: 'Employment Bridge Certification Program'
        }
      });

      if (error) throw error;

      setCertificate({
        id: data.certificate.id,
        courseName: 'Employment Bridge Certification Program',
        completionDate: new Date().toISOString(),
        score: completionData.overallScore,
        modules: completionData.moduleScores.map(m => m.name),
        skills: completionData.skillsAcquired,
        issueDate: new Date().toISOString()
      });

      toast.success('Certificate generated successfully!');
    } catch (error) {
      console.error('Certificate generation failed:', error);
      toast.error('Failed to generate certificate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCertificate = () => {
    // Implementation for downloading certificate
    toast.success('Certificate download started');
  };

  const handleShareCertificate = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Employment Bridge Certificate',
        text: 'I just completed the Employment Bridge Certification Program!',
        url: window.location.href
      });
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success('Certificate link copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Certification Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {completionData.completedModules}/{completionData.totalModules}
              </div>
              <div className="text-sm text-muted-foreground">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completionData.overallScore}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {completionData.timeSpent}
              </div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {completionData.skillsAcquired.length}
              </div>
              <div className="text-sm text-muted-foreground">Skills</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Certification Progress</span>
              <span>{(completionData.completedModules / completionData.totalModules) * 100}%</span>
            </div>
            <Progress value={(completionData.completedModules / completionData.totalModules) * 100} className="h-3" />
          </div>

          {isEligibleForCertificate && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Congratulations! You're eligible for certification.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Module Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completionData.moduleScores.map((module, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">{module.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50">
                    {module.score}%
                  </Badge>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(module.score / 20) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills Acquired */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Acquired</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {completionData.skillsAcquired.map((skill, index) => (
              <Badge key={index} variant="secondary" className="bg-primary/10">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Generation */}
      {isEligibleForCertificate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Generate Your Certificate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You've successfully completed all modules of the Employment Bridge program. 
              Generate your official certificate to showcase your achievement.
            </p>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateCertificate}
                disabled={isGenerating || !!certificate}
                className="flex items-center gap-2"
              >
                <Award className="h-4 w-4" />
                {isGenerating ? 'Generating...' : certificate ? 'Certificate Generated' : 'Generate Certificate'}
              </Button>
              
              {certificate && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadCertificate}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleShareCertificate}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Preview */}
      {certificate && (
        <Card>
          <CardHeader>
            <CardTitle>Your Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <Award className="h-16 w-16 text-yellow-600 mx-auto" />
                <h2 className="text-2xl font-bold">Certificate of Completion</h2>
                <p className="text-lg">Employment Bridge Certification Program</p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(certificate.completionDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Score: {certificate.score}%
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    ID: {certificate.id.slice(-8)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};