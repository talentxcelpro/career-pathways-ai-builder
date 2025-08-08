
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Sparkles, 
  Target, 
  BarChart3, 
  Download, 
  Share2,
  Wand2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { useResumeAnalytics } from '@/hooks/useResumeAnalytics';
import { useAdvancedAIFeatures } from '@/hooks/useAdvancedAIFeatures';
import { useAIService } from '@/hooks/useAIService';
import { useRealTimeATS } from '@/hooks/useRealTimeATS';
import { useSmartSuggestions } from '@/hooks/useSmartSuggestions';
import { toast } from 'sonner';
import { ResumeEditor } from './ResumeEditor';
import { AIInsightsPanel } from './AIInsightsPanel';
import { RealTimeATSScore } from './RealTimeATSScore';
import { SmartSuggestionsPanel } from './SmartSuggestionsPanel';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ATSOptimizationPanel } from '@/components/resume/ATSOptimizationPanel';
import { useResumeDownloads } from '@/hooks/useResumeDownloads';
import { exportResumeToDocx } from '@/utils/docxExport';
import type { ResumeJSON } from '@/hooks/useResumeParser';
import { RazorpayScript } from '@/components/RazorpayScript';

interface UnifiedResumeInterfaceProps {
  mode: 'edit' | 'create';
  initialData: EnhancedResumeData;
  onDataChange: (data: EnhancedResumeData) => void;
}

export const UnifiedResumeInterface: React.FC<UnifiedResumeInterfaceProps> = ({
  mode,
  initialData,
  onDataChange
}) => {
  const normalize = (d: any): EnhancedResumeData => ({
    personalInfo: {
      fullName: d?.personalInfo?.fullName || '',
      email: d?.personalInfo?.email || '',
      phone: d?.personalInfo?.phone || '',
      location: d?.personalInfo?.location || '',
      summary: d?.personalInfo?.summary || ''
    },
    professionalSummary: d?.professionalSummary || { content: '', keyHighlights: [] },
    experience: Array.isArray(d?.experience) ? d.experience : [],
    education: Array.isArray(d?.education) ? d.education : [],
    skills: Array.isArray(d?.skills) ? d.skills : [],
    projects: Array.isArray(d?.projects) ? d.projects : [],
    certifications: Array.isArray(d?.certifications) ? d.certifications : [],
    awards: Array.isArray(d?.awards) ? d.awards : [],
    languages: Array.isArray(d?.languages) ? d.languages : [],
    publications: Array.isArray(d?.publications) ? d.publications : [],
    references: Array.isArray(d?.references) ? d.references : [],
    volunteerWork: Array.isArray(d?.volunteerWork) ? d.volunteerWork : [],
    trainings: Array.isArray(d?.trainings) ? d.trainings : [],
    tools: d?.tools || { development: [], design: [], analytics: [], productivity: [], other: [] },
    careerObjectives: d?.careerObjectives || { statement: '', goals: [] },
    sectionOrder: d?.sectionOrder || ['personalInfo', 'professionalSummary', 'experience', 'education', 'skills'],
    selectedTemplate: d?.selectedTemplate || 'modern',
    customization: d?.customization || { colorScheme: 'blue', fontFamily: 'Inter', fontSize: 14, spacing: 'normal' }
  });

  const [activeTab, setActiveTab] = useState('editor');
  const [resumeData, setResumeData] = useState<EnhancedResumeData>(normalize(initialData));
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [jobDescription, setJobDescription] = useState<string>('');
  
  const { 
    overallScore, 
    atsScore, 
    suggestions, 
    refreshAnalysis 
  } = useResumeAnalytics(resumeData);
  
  const {
    performAdvancedATSAnalysis,
    optimizeForSpecificJob,
    isAnalyzing
  } = useAdvancedAIFeatures();
  
  const { enhanceResume, isProcessing } = useAIService();
  
  // Real-time ATS analysis
  const { 
    atsAnalysis, 
    jobAnalysis, 
    isAnalyzing: isRealTimeAnalyzing 
  } = useRealTimeATS(resumeData, jobDescription);
  
  // Smart suggestions
  const {
    suggestions: smartSuggestions,
    isGenerating: isGeneratingSuggestions,
    getComprehensiveSuggestions,
    applySuggestion
  } = useSmartSuggestions();

  useEffect(() => {
    setResumeData(normalize(initialData));
  }, [initialData]);

  useEffect(() => {
    onDataChange(resumeData);
  }, [resumeData, onDataChange]);

  useEffect(() => {
    refreshAnalysis();
  }, [resumeData, refreshAnalysis]);

  const handleDataChange = (newData: EnhancedResumeData) => {
    setResumeData(newData);
  };

  const handleAIEnhancement = async (sectionType?: string) => {
    try {
      setIsOptimizing(true);
      const result = await enhanceResume(resumeData, {
        sectionType: sectionType as any,
        enhancementType: 'professional'
      });

      if (result.success) {
        const enhancedData = { ...resumeData, ...result.data };
        setResumeData(enhancedData);
        toast.success(`${sectionType ? sectionType.charAt(0).toUpperCase() + sectionType.slice(1) : 'Resume'} enhanced successfully!`);
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error('Failed to enhance resume');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleATSOptimization = async () => {
    try {
      const analysis = await performAdvancedATSAnalysis(resumeData);
      if (analysis) {
        toast.success('ATS analysis completed! Check the insights panel for recommendations.');
        setActiveTab('insights');
      }
    } catch (error) {
      console.error('ATS analysis failed:', error);
      toast.error('Failed to perform ATS analysis');
    }
  };

  const handleGenerateSmartSuggestions = async () => {
    try {
      await getComprehensiveSuggestions(resumeData, {
        targetRole: jobAnalysis?.role,
        industry: jobAnalysis?.industry,
        jobDescription
      });
      setActiveTab('suggestions');
      toast.success('Smart suggestions generated!');
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      toast.error('Failed to generate suggestions');
    }
  };

  const handleApplySmartSuggestion = (suggestion: any) => {
    const updatedData = applySuggestion(suggestion, resumeData);
    setResumeData(updatedData);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // AI credits gating
  const [aiCreditsUsed, setAiCreditsUsed] = useState(0);
  const freeAICalls = 3;
  const ensureCredits = () => {
    if (aiCreditsUsed >= freeAICalls) {
      toast.error('Free AI limit reached. Upgrade to Pro to continue.');
      return false;
    }
    return true;
  };

  // Bullet rewriter state
  const [bulletOriginal, setBulletOriginal] = useState('');
  const [bulletTone, setBulletTone] = useState<'conservative' | 'bold'>('conservative');
  const [bulletImproved, setBulletImproved] = useState('');
  const [isRewritingBullet, setIsRewritingBullet] = useState(false);

  const rewriteBullet = async () => {
    if (!ensureCredits() || !bulletOriginal.trim()) return;
    setIsRewritingBullet(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-enhancer', {
        body: {
          sectionType: 'experience',
          content: { description: bulletOriginal },
          personalInfo: resumeData.personalInfo,
        }
      });
      if (error || !data?.success) throw new Error(data?.error || 'Rewrite failed');
      const improved = data.enhancedContent?.description || data.enhancedContent?.enhanced || data.enhancedContent || '';
      setBulletImproved(improved);
      setAiCreditsUsed((c) => c + 1);
      toast.success('Bullet rewritten');
    } catch (e) {
      console.error(e);
      toast.error('Failed to rewrite bullet');
    } finally {
      setIsRewritingBullet(false);
    }
  };

  // Cover letter state
  const [isCoverOpen, setCoverOpen] = useState(false);
  const [coverJD, setCoverJD] = useState('');
  const [coverTone, setCoverTone] = useState<'professional' | 'bold' | 'conservative'>('professional');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  const generateCover = async () => {
    if (!ensureCredits() || !coverJD.trim()) return;
    setIsGeneratingCover(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-enhancer', {
        body: {
          action: 'cover_letter',
          resumeData,
          jobDescription: coverJD,
          tone: coverTone,
        }
      });
      if (error || !data?.success) throw new Error(data?.error || 'Generation failed');
      setCoverLetter(data.coverLetter || '');
      setAiCreditsUsed((c) => c + 1);
      toast.success('Cover letter generated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate cover letter');
    } finally {
      setIsGeneratingCover(false);
    }
  };
  const { handleDownload, processing } = useResumeDownloads(0);

  const toResumeJSON = (d: EnhancedResumeData): ResumeJSON => ({
    profile: {
      name: d.personalInfo.fullName,
      email: d.personalInfo.email,
      phone: d.personalInfo.phone,
      location: d.personalInfo.location
    },
    summary: d.personalInfo.summary || d.professionalSummary?.content || '',
    experience: Array.isArray(d.experience)
      ? d.experience.map((exp: any) => ({
          title: exp.title || exp.position || '',
          company: exp.company || exp.employer || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          bullets: Array.isArray(exp.achievements)
            ? exp.achievements.filter(Boolean)
            : (exp.description ? [String(exp.description)] : [])
        }))
      : [],
    education: Array.isArray(d.education)
      ? d.education.map((ed: any) => ({
          school: ed.institution || ed.school || '',
          degree: ed.degree || '',
          year: ed.year || ed.graduationYear || ''
        }))
      : [],
    skills: (Array.isArray(d.skills) ? d.skills : [])
      .map((s: any) => (typeof s === 'string' ? s : (s?.name || s?.title || s?.skill || s?.keyword)))
      .filter(Boolean)
  });

  const startExport = async () => {
    const resumeId = 'editor';
    await handleDownload(resumeId, async () => {
      await exportResumeToDocx(toResumeJSON(resumeData), 'resume.docx');
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <RazorpayScript />
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {mode === 'create' ? 'Create Resume' : 'Edit Resume'}
              </h1>
              <p className="text-muted-foreground">
                AI-powered resume builder with real-time optimization
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Score Indicators */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className={`text-lg font-bold ${getScoreColor(atsAnalysis?.overallScore || overallScore)}`}>
                    {atsAnalysis?.overallScore || overallScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">Overall</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getScoreColor(atsScore)}`}>
                    {atsScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">ATS Score</div>
                </div>
                {atsAnalysis && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    atsAnalysis.trafficLight === 'green' ? 'bg-green-100 text-green-800' :
                    atsAnalysis.trafficLight === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {atsAnalysis.trafficLight.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleATSOptimization}
                  disabled={isAnalyzing}
                >
                  <Target className="h-4 w-4 mr-1" />
                  ATS Check
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAIEnhancement()}
                  disabled={isOptimizing || isProcessing}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI Enhance
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateSmartSuggestions}
                  disabled={isGeneratingSuggestions}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Smart Tips
                </Button>
                <Button variant="outline" size="sm" onClick={startExport} disabled={processing}>
                  <Download className="h-4 w-4 mr-1" />
                  {processing ? 'Preparing...' : 'Export'}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="ats" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Real-time ATS
              {atsAnalysis && (
                <div className={`w-2 h-2 rounded-full ml-1 ${
                  atsAnalysis.trafficLight === 'green' ? 'bg-green-500' :
                  atsAnalysis.trafficLight === 'yellow' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Smart Tips
              {smartSuggestions.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {smartSuggestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              AI Insights
              {suggestions.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {suggestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="optimize" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              AI Tools
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="editor" className="mt-0">
              <ResumeEditor
                data={resumeData}
                onChange={handleDataChange}
                onEnhanceSection={handleAIEnhancement}
                isEnhancing={isOptimizing || isProcessing}
              />
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <AIInsightsPanel
                suggestions={suggestions}
                resumeData={resumeData}
                onApplySuggestion={(suggestion) => {
                  // Handle applying suggestions
                  toast.success('Suggestion applied!');
                }}
              />
            </TabsContent>

            <TabsContent value="ats" className="mt-0">
              <RealTimeATSScore
                analysis={atsAnalysis}
                isAnalyzing={isRealTimeAnalyzing}
                onOptimize={handleATSOptimization}
              />
              <div className="mt-6">
                <ATSOptimizationPanel resumeData={resumeData} />
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="mt-0">
              <SmartSuggestionsPanel
                suggestions={smartSuggestions}
                isGenerating={isGeneratingSuggestions}
                onApplySuggestion={handleApplySmartSuggestion}
                onGenerateMore={handleGenerateSmartSuggestions}
              />
            </TabsContent>

            <TabsContent value="optimize" className="mt-0">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI Enhancement Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => handleAIEnhancement('summary')}
                        disabled={isOptimizing}
                      >
                        <div className="text-left">
                          <div className="font-medium">Enhance Summary</div>
                          <div className="text-sm text-muted-foreground">
                            Improve your professional summary
                          </div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => handleAIEnhancement('experience')}
                        disabled={isOptimizing}
                      >
                        <div className="text-left">
                          <div className="font-medium">Enhance Experience</div>
                          <div className="text-sm text-muted-foreground">
                            Strengthen job descriptions
                          </div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => handleAIEnhancement('skills')}
                        disabled={isOptimizing}
                      >
                        <div className="text-left">
                          <div className="font-medium">Optimize Skills</div>
                          <div className="text-sm text-muted-foreground">
                            Add relevant skills
                          </div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={handleATSOptimization}
                        disabled={isAnalyzing}
                      >
                        <div className="text-left">
                          <div className="font-medium">ATS Optimization</div>
                          <div className="text-sm text-muted-foreground">
                            Improve ATS compatibility
                          </div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5" />
                      Rewrite a Bullet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Paste an existing bullet you want to improve..."
                        value={bulletOriginal}
                        onChange={(e) => setBulletOriginal(e.target.value)}
                      />
                      <div className="flex items-center gap-3">
                        <Button size="sm" onClick={rewriteBullet} disabled={isRewritingBullet}>
                          <Sparkles className="h-4 w-4 mr-1" />
                          {isRewritingBullet ? 'Rewriting...' : 'Rewrite'}
                        </Button>
                      </div>
                      {bulletImproved && (
                        <div className="rounded-md border p-3">
                          <div className="text-sm text-muted-foreground mb-1">Improved</div>
                          <div className="text-sm whitespace-pre-wrap">{bulletImproved}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Generate Cover Letter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Button size="sm" variant="secondary" onClick={() => setCoverOpen(true)}>
                        <FileText className="h-4 w-4 mr-1" />
                        Open Cover Letter Builder
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Indicators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Resume Completion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Completion</span>
                          <span>{overallScore}%</span>
                        </div>
                        <Progress value={overallScore} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>ATS Compatibility</span>
                          <span>{atsScore}%</span>
                        </div>
                        <Progress value={atsScore} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
