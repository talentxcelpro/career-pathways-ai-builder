
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { toast } from "sonner";

interface AIResumeEnhancerProps {
  resumeData: any;
  onEnhancementApplied: (enhancedData: any) => void;
}

export const AIResumeEnhancer: React.FC<AIResumeEnhancerProps> = ({
  resumeData,
  onEnhancementApplied
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [enhancements, setEnhancements] = useState<any[]>([]);
  const { analyzeResume, isLoading } = useAI();

  const handleAnalyze = async () => {
    try {
      const analysis = await analyzeResume(resumeData);
      
      // Mock enhancements based on analysis
      const mockEnhancements = [
        {
          id: 1,
          type: 'summary',
          title: 'Professional Summary Enhancement',
          description: 'Make your summary more impactful with action verbs and quantifiable achievements',
          original: resumeData.personalInfo?.summary || '',
          enhanced: `Dynamic ${resumeData.personalInfo?.fullName || 'professional'} with proven track record of delivering exceptional results in fast-paced environments. Demonstrated expertise in cross-functional collaboration and strategic problem-solving.`,
          confidence: 85,
          impact: 'high'
        },
        {
          id: 2,
          type: 'experience',
          title: 'Experience Bullet Points',
          description: 'Transform responsibilities into achievement-focused bullet points',
          original: 'Worked on various projects',
          enhanced: '• Led 3 cross-functional projects resulting in 25% efficiency improvement\n• Implemented new processes that reduced operational costs by $50K annually\n• Mentored 5 junior team members, improving team productivity by 30%',
          confidence: 90,
          impact: 'high'
        },
        {
          id: 3,
          type: 'keywords',
          title: 'ATS Keyword Optimization',
          description: 'Add industry-relevant keywords to improve ATS compatibility',
          original: 'Technical skills section',
          enhanced: 'Added 12 industry-specific keywords including: project management, stakeholder engagement, data analysis, process optimization',
          confidence: 78,
          impact: 'medium'
        }
      ];
      
      setEnhancements(mockEnhancements);
    } catch (error) {
      console.error('Enhancement analysis failed:', error);
      toast.error('Failed to analyze resume. Please try again.');
    }
  };

  const applyEnhancement = (enhancement: any) => {
    let updatedData = { ...resumeData };
    
    switch (enhancement.type) {
      case 'summary':
        updatedData.personalInfo = {
          ...updatedData.personalInfo,
          summary: enhancement.enhanced
        };
        break;
      case 'experience':
        // Mock applying to first experience entry
        if (updatedData.experience && updatedData.experience.length > 0) {
          updatedData.experience[0].description = enhancement.enhanced;
        }
        break;
      default:
        break;
    }
    
    onEnhancementApplied(updatedData);
    toast.success('Enhancement applied successfully!');
  };

  const applyAllEnhancements = () => {
    enhancements.forEach(enhancement => {
      applyEnhancement(enhancement);
    });
    setIsOpen(false);
    toast.success('All enhancements applied!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Enhance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI Resume Enhancement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {enhancements.length === 0 ? (
            <div className="text-center py-8">
              <Button 
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze & Enhance Resume
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Enhancement Suggestions</h3>
                  <p className="text-sm text-gray-600">
                    Found {enhancements.length} improvements to make your resume stronger
                  </p>
                </div>
                <Button onClick={applyAllEnhancements} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Apply All
                </Button>
              </div>

              <div className="space-y-4">
                {enhancements.map((enhancement) => (
                  <Card key={enhancement.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{enhancement.title}</CardTitle>
                          <Badge variant={enhancement.impact === 'high' ? 'default' : 'secondary'}>
                            {enhancement.confidence}% confidence
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => applyEnhancement(enhancement)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Apply
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">{enhancement.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-orange-500" />
                            Before
                          </h4>
                          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                            {enhancement.original || 'No content'}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            After
                          </h4>
                          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm whitespace-pre-line">
                            {enhancement.enhanced}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
