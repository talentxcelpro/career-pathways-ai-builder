import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAIResumeEnhancements } from '@/hooks/useAIResumeEnhancements';
import { Sparkles, Target, Wand2, BarChart3, ChevronRight, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIEnhancementPanelProps {
  resumeData: any;
  onContentUpdate?: (section: string, content: any) => void;
}

const toneOptions = [
  { value: 'professional', label: 'Professional', description: 'Formal, business-appropriate language' },
  { value: 'conversational', label: 'Conversational', description: 'Approachable yet professional' },
  { value: 'executive', label: 'Executive', description: 'Authoritative, leadership-focused' },
  { value: 'technical', label: 'Technical', description: 'Precise, technology-focused' },
  { value: 'creative', label: 'Creative', description: 'Engaging, innovation-focused' },
  { value: 'academic', label: 'Academic', description: 'Scholarly, research-focused' },
  { value: 'sales', label: 'Sales', description: 'Results-driven, persuasive' },
  { value: 'startup', label: 'Startup', description: 'Dynamic, growth-oriented' }
];

export const AIEnhancementPanel: React.FC<AIEnhancementPanelProps> = ({
  resumeData,
  onContentUpdate
}) => {
  const { 
    generateSmartTitles, 
    isGeneratingTitles,
    adjustTone,
    isAdjustingTone,
    optimizeKeywords,
    isOptimizingKeywords
  } = useAIResumeEnhancements();

  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [jobDescription, setJobDescription] = useState('');
  const [sectionToAdjust, setSectionToAdjust] = useState('summary');
  
  const [titles, setTitles] = useState<any[]>([]);
  const [keywordAnalysis, setKeywordAnalysis] = useState<any>(null);
  const [toneAdjustment, setToneAdjustment] = useState<any>(null);

  const handleGenerateTitles = async () => {
    const result = await generateSmartTitles(resumeData, targetRole, industry, experience);
    if (result) {
      setTitles(result.titles);
    }
  };

  const handleToneAdjustment = async () => {
    const sectionContent = getSectionContent(sectionToAdjust);
    if (!sectionContent) {
      toast.error('No content found for the selected section');
      return;
    }

    const result = await adjustTone(sectionContent, selectedTone, sectionToAdjust);
    if (result) {
      setToneAdjustment(result);
    }
  };

  const handleKeywordOptimization = async () => {
    const result = await optimizeKeywords(resumeData, jobDescription, targetRole, industry);
    if (result) {
      setKeywordAnalysis(result);
    }
  };

  const getSectionContent = (section: string): string => {
    switch (section) {
      case 'summary':
        return resumeData?.personalInfo?.summary || '';
      case 'experience':
        return resumeData?.experience?.map((exp: any) => exp.description).join('\n') || '';
      case 'skills':
        return JSON.stringify(resumeData?.skills || {});
      default:
        return '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const applyToneAdjustment = () => {
    if (toneAdjustment && onContentUpdate) {
      onContentUpdate(sectionToAdjust, toneAdjustment.adjustedContent);
      toast.success('Content updated with new tone!');
      setToneAdjustment(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Smart Title Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Resume Titles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="targetRole">Target Role</Label>
              <Input
                id="targetRole"
                placeholder="Software Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="Technology"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                placeholder="5+ years"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleGenerateTitles}
            disabled={isGeneratingTitles}
            className="w-full"
          >
            {isGeneratingTitles ? 'Generating...' : 'Generate Smart Titles'}
          </Button>

          {titles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Generated Titles:</h4>
              {titles.map((title, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{title.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">ATS: {title.atsScore}%</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(title.title)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{title.reasoning}</p>
                  <div className="flex gap-1 flex-wrap">
                    {title.keywords.map((keyword: string, kidx: number) => (
                      <Badge key={kidx} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tone Adjustment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Tone Adjustment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sectionToAdjust">Section</Label>
              <Select value={sectionToAdjust} onValueChange={setSectionToAdjust}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Professional Summary</SelectItem>
                  <SelectItem value="experience">Work Experience</SelectItem>
                  <SelectItem value="skills">Skills</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tone">Target Tone</Label>
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      <div>
                        <div className="font-medium">{tone.label}</div>
                        <div className="text-xs text-muted-foreground">{tone.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleToneAdjustment}
            disabled={isAdjustingTone}
            className="w-full"
          >
            {isAdjustingTone ? 'Adjusting Tone...' : 'Adjust Tone'}
          </Button>

          {toneAdjustment && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Tone-Adjusted Content</h4>
                <div className="flex items-center gap-2">
                  <Badge>Impact: {toneAdjustment.impactScore}%</Badge>
                  <Button size="sm" onClick={applyToneAdjustment}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Apply Changes
                  </Button>
                </div>
              </div>
              <div className="bg-background p-3 rounded border">
                <p className="text-sm">{toneAdjustment.adjustedContent}</p>
              </div>
              {toneAdjustment.changes.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Key Changes:</h5>
                  {toneAdjustment.changes.slice(0, 3).map((change: any, index: number) => (
                    <div key={index} className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 line-through">{change.original}</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-green-600">{change.adjusted}</span>
                      </div>
                      <p className="text-muted-foreground">{change.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keyword Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            ATS Keyword Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="jobDescription">Job Description (Optional)</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description here for targeted optimization..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleKeywordOptimization}
            disabled={isOptimizingKeywords}
            className="w-full"
          >
            {isOptimizingKeywords ? 'Analyzing Keywords...' : 'Optimize for ATS'}
          </Button>

          {keywordAnalysis && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{keywordAnalysis.atsScore}%</div>
                  <div className="text-sm text-muted-foreground">ATS Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {keywordAnalysis.keywordAnalysis.matched.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Matched Keywords</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {keywordAnalysis.keywordAnalysis.missing.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Missing Keywords</div>
                </div>
              </div>

              {keywordAnalysis.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Top Recommendations:</h4>
                  {keywordAnalysis.recommendations.slice(0, 5).map((rec: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{rec.keyword}</span>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.suggestion}</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Add to:</strong> {rec.section} • <strong>Integration:</strong> {rec.naturalIntegration}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {keywordAnalysis.improvementTips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Improvement Tips:</h4>
                  <ul className="space-y-1">
                    {keywordAnalysis.improvementTips.map((tip: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <BarChart3 className="h-4 w-4 mt-0.5 text-primary" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};