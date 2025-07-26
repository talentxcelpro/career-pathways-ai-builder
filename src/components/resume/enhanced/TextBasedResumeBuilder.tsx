import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, Loader2, Copy, ArrowRight } from 'lucide-react';
import { useAIResumeProcessor } from '@/hooks/useAIResumeProcessor';
import { NetworkErrorFallback } from '@/components/resume/enhanced/NetworkErrorFallback';
import { toast } from 'sonner';

interface TextBasedResumeBuilderProps {
  onDataExtracted?: (data: any) => void;
  onManualEntry?: () => void;
}

export const TextBasedResumeBuilder: React.FC<TextBasedResumeBuilderProps> = ({
  onDataExtracted,
  onManualEntry
}) => {
  const [resumeText, setResumeText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { parseTextContent } = useAIResumeProcessor();

  const processText = async () => {
    if (!resumeText.trim()) {
      toast.error('Please enter your resume text');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('Processing resume text...');
      const result = await parseTextContent(resumeText);
      
      if (result.success) {
        toast.success('Resume text processed successfully!');
        onDataExtracted?.(result.extractedData);
      } else {
        throw new Error(result.error || 'Failed to process text');
      }
    } catch (err: any) {
      console.error('Text processing error:', err);
      setError(err.message || 'Failed to process resume text');
      toast.error('Failed to process resume text');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    processText();
  };

  const sampleResume = `John Doe
Software Engineer
john.doe@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years developing web applications using React, Node.js, and cloud technologies. Proven track record of delivering scalable solutions and leading cross-functional teams.

EXPERIENCE
Senior Software Engineer | Tech Corp | 2021 - Present
• Led development of customer-facing web application serving 100K+ users
• Implemented microservices architecture reducing system latency by 40%
• Mentored 3 junior developers and conducted technical interviews

Software Engineer | StartupXYZ | 2019 - 2021
• Developed responsive web applications using React and TypeScript
• Collaborated with design team to implement pixel-perfect UI components
• Optimized database queries resulting in 25% performance improvement

EDUCATION
Bachelor of Computer Science | University of Technology | 2019
• Relevant coursework: Data Structures, Algorithms, Software Engineering
• GPA: 3.8/4.0

SKILLS
Technical: JavaScript, TypeScript, React, Node.js, Python, AWS, Docker
Soft Skills: Team Leadership, Problem Solving, Communication`;

  if (error) {
    return (
      <NetworkErrorFallback 
        onRetry={handleRetry}
        onManualEntry={onManualEntry}
      />
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Paste Your Resume Text
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Copy and paste your resume content below and let AI structure it for you
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Resume Content</label>
            <Button
              onClick={() => setResumeText(sampleResume)}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Use Sample
            </Button>
          </div>
          
          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here... Include your name, contact info, experience, education, skills, etc."
            className="min-h-[300px] resize-none"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                {resumeText.split(' ').filter(word => word.length > 0).length} words
              </Badge>
              <Badge variant="outline" className="text-xs">
                {resumeText.length} characters
              </Badge>
            </div>
            
            <Button
              onClick={processText}
              disabled={isProcessing || !resumeText.trim()}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Process with AI
            </Button>
          </div>
        </div>

        {onManualEntry && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Prefer step-by-step guidance?</p>
                <p className="text-xs text-muted-foreground">
                  Build your resume section by section with AI assistance
                </p>
              </div>
              <Button onClick={onManualEntry} variant="outline" size="sm">
                Manual Builder
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2">💡 Tips for Better Results</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Include all sections: contact info, summary, experience, education, skills</li>
            <li>• Use clear section headers (EXPERIENCE, EDUCATION, SKILLS, etc.)</li>
            <li>• Include dates, company names, and job titles</li>
            <li>• Add quantified achievements when possible</li>
            <li>• Keep formatting simple - plain text works best</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};