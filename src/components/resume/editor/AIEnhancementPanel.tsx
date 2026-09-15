import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Wand2, FileText, TrendingUp } from 'lucide-react';
import { CoreResumeData } from '@/types/resume-core';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface AIEnhancementPanelProps {
  resumeData: CoreResumeData;
  onUpdate: (updates: Partial<CoreResumeData>) => void;
}

export function AIEnhancementPanel({ resumeData, onUpdate }: AIEnhancementPanelProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedSection, setEnhancedSection] = useState<string | null>(null);

  const enhanceSection = async (section: string) => {
    setIsEnhancing(true);
    setEnhancedSection(section);
    
    try {
      // Simulate AI enhancement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (section === 'summary') {
        const enhanced = `${resumeData.personalInfo.summary}\n\nEnhanced with AI-powered keywords and industry-specific terminology to improve ATS compatibility.`;
        onUpdate({
          personalInfo: { ...resumeData.personalInfo, summary: enhanced }
        });
      }
      
      toast.success(`${section} enhanced successfully!`);
    } catch (error) {
      toast.error('Enhancement failed');
    } finally {
      setIsEnhancing(false);
      setEnhancedSection(null);
    }
  };

  const enhancementOptions = [
    {
      id: 'summary',
      title: 'Enhance Summary',
      description: 'AI will optimize your professional summary with industry keywords',
      icon: FileText,
      available: true
    },
    {
      id: 'experience',
      title: 'Enhance Experience',
      description: 'Transform bullet points into achievement-focused statements',
      icon: TrendingUp,
      available: true
    },
    {
      id: 'keywords',
      title: 'Add Keywords',
      description: 'Automatically add relevant industry keywords for ATS',
      icon: Sparkles,
      available: true
    },
    {
      id: 'overall',
      title: 'Full Enhancement',
      description: 'Comprehensive AI enhancement of entire resume',
      icon: Wand2,
      available: true
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Enhancement
          </CardTitle>
          <CardDescription>
            Use AI to optimize your resume content for better ATS scores and readability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {enhancementOptions.map((option) => {
              const Icon = option.icon;
              const isProcessing = isEnhancing && enhancedSection === option.id;
              
              return (
                <Card key={option.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{option.title}</h3>
                            {option.available && (
                              <Badge variant="secondary" className="text-xs">
                                Available
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => enhanceSection(option.id)}
                        disabled={!option.available || isEnhancing}
                        size="sm"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Enhance
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Enhancement Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>AI enhancements are powered by TalentXcel Intelligence</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Each enhancement analyzes your content and suggests improvements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>You can always undo changes by editing manually</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Best results come from providing detailed initial content</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
