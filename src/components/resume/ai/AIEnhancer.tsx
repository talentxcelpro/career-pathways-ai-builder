import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSectionEnhancer } from '@/hooks/useSectionEnhancer';
import { useJobTargeting } from '@/hooks/useJobTargeting';
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Copy,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import type { ResumeData } from '../preview/ResumePreview';

interface AIEnhancerProps {
  resumeData: ResumeData;
  onDataChange: (data: ResumeData) => void;
  resumeId?: string;
}

export const AIEnhancer: React.FC<AIEnhancerProps> = ({
  resumeData,
  onDataChange,
  resumeId
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [originalText, setOriginalText] = useState('');
  
  const { isLoading: isEnhancing, enhanceSection } = useSectionEnhancer();
  const { isAnalyzing, result: jobMatchResult, analyze } = useJobTargeting(resumeData);

  const handleEnhanceSection = async (section: string, text: string) => {
    setSelectedSection(section);
    setOriginalText(text);
    
    const enhanced = await enhanceSection({
      section,
      text,
      targetRole: jobDescription ? extractJobTitle(jobDescription) : undefined,
      atsJson: { ats: resumeData }
    });
    
    setEnhancedText(enhanced);
  };

  const extractJobTitle = (jd: string) => {
    // Simple extraction - look for common patterns
    const lines = jd.split('\n');
    const titleLine = lines.find(line => 
      line.toLowerCase().includes('title:') || 
      line.toLowerCase().includes('position:') ||
      line.toLowerCase().includes('role:')
    );
    return titleLine ? titleLine.split(':')[1]?.trim() : 'Professional';
  };

  const applyEnhancement = () => {
    if (!selectedSection || !enhancedText) return;

    const newData = { ...resumeData };
    if (selectedSection === 'summary') {
      newData.summary = enhancedText;
    }
    // Handle other sections as needed
    
    onDataChange(newData);
    setEnhancedText('');
    setSelectedSection('');
    toast.success('Enhancement applied successfully!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const atsScore = calculateATSScore(resumeData);

  return (
    <div className="space-y-6">
      {/* ATS Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            ATS Compatibility Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Score</span>
                <span className="font-medium">{atsScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    atsScore >= 80 ? 'bg-green-500' : 
                    atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${atsScore}%` }}
                />
              </div>
            </div>
            <Badge variant={atsScore >= 80 ? 'default' : atsScore >= 60 ? 'secondary' : 'destructive'}>
              {atsScore >= 80 ? 'Excellent' : atsScore >= 60 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Contact Information</span>
              </div>
              <div className="flex items-center gap-2">
                {resumeData.experience.length > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span>Work Experience</span>
              </div>
              <div className="flex items-center gap-2">
                {resumeData.skills && resumeData.skills.length > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span>Skills Section</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {resumeData.education.length > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span>Education</span>
              </div>
              <div className="flex items-center gap-2">
                {resumeData.summary ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span>Professional Summary</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Formatting</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Targeting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Job Targeting Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Paste Job Description (Optional)
            </label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description you're targeting to get personalized recommendations..."
              rows={4}
              className="mb-3"
            />
            <Button 
              onClick={() => analyze(jobDescription)}
              disabled={!jobDescription.trim() || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Job Match'}
            </Button>
          </div>

          {jobMatchResult && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Match Score</span>
                <Badge variant={jobMatchResult.matchScore >= 70 ? 'default' : 'secondary'}>
                  {jobMatchResult.matchScore}%
                </Badge>
              </div>
              
              {jobMatchResult.missing.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {jobMatchResult.missing.slice(0, 10).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {jobMatchResult.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    {jobMatchResult.recommendations.slice(0, 3).map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Content Enhancement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Content Enhancement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleEnhanceSection('summary', resumeData.summary || '')}
              disabled={isEnhancing}
              className="justify-start"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Enhance Summary
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const latestExp = resumeData.experience[0];
                if (latestExp) {
                  const text = latestExp.bullets?.join('. ') || '';
                  handleEnhanceSection('experience', text);
                }
              }}
              disabled={isEnhancing || resumeData.experience.length === 0}
              className="justify-start"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Enhance Experience
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const skillsText = resumeData.skills?.join(', ') || '';
                handleEnhanceSection('skills', skillsText);
              }}
              disabled={isEnhancing || !resumeData.skills?.length}
              className="justify-start"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Optimize Skills
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const projectText = resumeData.projects?.[0]?.description || '';
                handleEnhanceSection('projects', projectText);
              }}
              disabled={isEnhancing || !resumeData.projects?.length}
              className="justify-start"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Improve Projects
            </Button>
          </div>

          {enhancedText && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Enhanced Content</h4>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(enhancedText)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEnhancedText('');
                      setSelectedSection('');
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-xs text-gray-500 mb-1">Original</div>
                  <div className="text-sm">{originalText || 'No content'}</div>
                </div>
                
                <div className="flex justify-center">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="text-xs text-blue-600 mb-1">Enhanced</div>
                  <div className="text-sm">{enhancedText}</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={applyEnhancement} className="flex-1">
                  Apply Enhancement
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEnhancedText('');
                    setSelectedSection('');
                  }}
                >
                  Discard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Quantify achievements:</strong> Include numbers, percentages, and metrics to make your impact measurable.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Use action verbs:</strong> Start bullet points with strong action words like "achieved," "led," "implemented."
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Include keywords:</strong> Use industry-specific terms from job descriptions to improve ATS compatibility.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Show progression:</strong> Highlight career growth and increasing responsibilities over time.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to calculate ATS score
function calculateATSScore(resumeData: ResumeData): number {
  let score = 0;
  const maxScore = 100;

  // Contact information (25 points)
  if (resumeData.profile.name) score += 5;
  if (resumeData.profile.email) score += 5;
  if (resumeData.profile.phone) score += 5;
  if (resumeData.profile.location) score += 5;
  if (resumeData.profile.linkedin) score += 5;

  // Professional summary (15 points)
  if (resumeData.summary && resumeData.summary.length > 50) score += 15;

  // Experience (30 points)
  if (resumeData.experience.length > 0) {
    score += 15;
    // Check for detailed experience
    const hasDetailedExp = resumeData.experience.some(exp => 
      exp.bullets && exp.bullets.length > 0 && exp.bullets.some(bullet => bullet.length > 30)
    );
    if (hasDetailedExp) score += 15;
  }

  // Education (10 points)
  if (resumeData.education.length > 0) score += 10;

  // Skills (15 points)
  if (resumeData.skills && resumeData.skills.length >= 5) score += 15;

  // Additional sections (5 points)
  if (resumeData.projects && resumeData.projects.length > 0) score += 2.5;
  if (resumeData.certifications && resumeData.certifications.length > 0) score += 2.5;

  return Math.round(score);
}