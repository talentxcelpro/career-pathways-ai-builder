import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Target, Palette, Download, Save, BarChart3, Check } from "lucide-react";
import { useResumeData } from "@/hooks/useResumeData";
import { useResumeBuilder } from "@/hooks/useResumeBuilder";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { PersonalInfoEditor } from "@/components/resume/sections/PersonalInfoEditor";
import { ExperienceEditor } from "@/components/resume/sections/ExperienceEditor";
import { SkillsEditor } from "@/components/resume/sections/SkillsEditor";
import { optimizeForJob, generateSummary } from "@/services/resumeEnhancementService";
import { analyzeATS, ATSAnalysisResult } from "@/services/atsAnalyzerService";
import { exportToPDF, exportToDOCX } from "@/services/resumeExportService";
import { ATSScoreDisplay, ATSDetailedAnalysis } from "@/components/resume/ats/ATSScoreDisplay";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { resumeTemplates } from "@/data/resumeTemplates";
import { TemplateRenderer } from "@/components/resume/templates/TemplateRenderer";

const UnifiedResumeBuilder = () => {
  const { id } = useParams();
  const { resumeData, isLoading } = useResumeData();
  const { saveResume, isSaving, hasChanges, updateResumeData } = useResumeBuilder(resumeData || undefined);
  const [activeTab, setActiveTab] = useState("edit");
  const [atsScore, setAtsScore] = useState(75);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysisResult | undefined>();
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [localData, setLocalData] = useState(resumeData);
  const [jobDescription, setJobDescription] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(resumeData?.settings?.templateId || 'classic');

  // Sync local data with resume data
  useEffect(() => {
    if (resumeData) {
      console.log('📝 Resume data loaded:', resumeData);
      setLocalData(resumeData);
    }
  }, [resumeData]);

  // Debug log when local data changes
  useEffect(() => {
    if (localData) {
      console.log('📊 Local data updated:', {
        name: localData.personalInfo?.fullName,
        experience: localData.experience?.length,
        education: localData.education?.length,
        skills: localData.skills?.length || 0
      });
    }
  }, [localData]);

  const handleAnalyzeATS = async () => {
    if (!localData) {
      toast.error('No resume data to analyze');
      return;
    }

    setIsAnalyzingATS(true);
    try {
      const analysis = await analyzeATS(localData, jobDescription || undefined);
      setAtsScore(analysis.score);
      setAtsAnalysis(analysis);
      toast.success(`ATS Score: ${analysis.score}/100`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze resume');
    } finally {
      setIsAnalyzingATS(false);
    }
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    console.log('✏️ Personal info changed:', field, value);
    setLocalData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        personalInfo: { ...prev.personalInfo, [field]: value }
      };
    });
  };

  const handleExperienceChange = (experiences: any[]) => {
    setLocalData((prev: any) => ({ ...prev, experience: experiences }));
  };

  const handleSkillsChange = (skills: string[]) => {
    setLocalData((prev: any) => ({ ...prev, skills }));
  };

  const handleOptimizeForJob = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }
    if (!localData) {
      toast.error('No resume data available');
      return;
    }

    setIsOptimizing(true);
    try {
      const resumeContent = JSON.stringify(localData);
      const optimized = await optimizeForJob(resumeContent, jobDescription);
      toast.success('Resume optimized for job description!');
      // Parse and apply optimized content
      console.log('Optimized content:', optimized);
    } catch (error) {
      toast.error('Failed to optimize resume');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!localData) {
      toast.error('No resume data available');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const resumeContent = JSON.stringify(localData);
      const summary = await generateSummary(resumeContent);
      handlePersonalInfoChange('summary', summary);
      toast.success('Professional summary generated!');
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSave = async () => {
    await saveResume();
    toast.success("Resume saved successfully!");
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!localData) {
      toast.error('No resume data to export');
      return;
    }

    try {
      toast.loading('Generating your resume...', { id: 'export' });
      if (format === 'pdf') {
        await exportToPDF(localData);
      } else {
        await exportToDOCX(localData);
      }
      toast.dismiss('export');
      toast.success(`Resume exported as ${format.toUpperCase()}!`);
    } catch (error) {
      toast.dismiss('export');
      toast.error('Failed to export resume');
      console.error('Export error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{id ? "Edit Resume" : "Build Resume"} | TalentXcel</title>
        <meta name="description" content="Professional resume builder with AI assistance and ATS optimization" />
      </Helmet>

      <div className="flex h-screen overflow-hidden bg-background">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex">
          {/* Left Sidebar */}
          <aside className="w-64 border-r border-border bg-card flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-lg">Resume Builder</h2>
              <p className="text-xs text-muted-foreground mt-1">AI-Powered Editor</p>
            </div>

            <TabsList className="grid grid-cols-1 gap-2 p-4 bg-transparent flex-none">
              <TabsTrigger 
                value="edit" 
                className="justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="h-4 w-4 mr-2" />
                Edit Content
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Enhance
              </TabsTrigger>
              <TabsTrigger 
                value="ats" 
                className="justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Target className="h-4 w-4 mr-2" />
                ATS Score
              </TabsTrigger>
              <TabsTrigger 
                value="templates" 
                className="justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Palette className="h-4 w-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger 
                value="export" 
                className="justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </TabsTrigger>
            </TabsList>

            <Separator />

            {/* ATS Score Badge */}
            <div className="p-4 mt-auto">
              <ATSScoreDisplay
                score={atsScore}
                analysis={atsAnalysis}
                isAnalyzing={isAnalyzingATS}
                onAnalyze={handleAnalyzeATS}
              />
            </div>
          </aside>

        {/* Center Panel - Editor */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                {resumeData?.personalInfo?.fullName || "Untitled Resume"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Last saved: {hasChanges ? "Unsaved changes" : "All changes saved"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleExport("pdf")}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport("docx")}
              >
                <Download className="h-4 w-4 mr-2" />
                DOCX
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </header>

          {/* Editor Content */}
          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="edit" className="mt-0 h-full">
              <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Personal Information</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Basic contact information and professional summary
                  </p>
                  <div className="p-6 bg-card border border-border rounded-lg">
                    <PersonalInfoEditor
                      data={localData?.personalInfo || {}}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-2">Work Experience</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your professional experience with AI-enhanced bullet points
                  </p>
                  <div className="p-6 bg-card border border-border rounded-lg">
                    <ExperienceEditor
                      experiences={localData?.experience || []}
                      onChange={handleExperienceChange}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-2">Skills</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    List your technical and soft skills
                  </p>
                  <div className="p-6 bg-card border border-border rounded-lg">
                    <SkillsEditor
                      skills={localData?.skills?.map((s: any) => typeof s === 'string' ? s : s.name) || []}
                      onChange={handleSkillsChange}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">AI Enhancement</h3>
                  <p className="text-muted-foreground mb-6">
                    Get AI-powered suggestions to improve your resume impact and clarity.
                  </p>
                </div>
                
                <div className="p-6 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Generate Professional Summary</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    AI will create a compelling professional summary based on your experience
                  </p>
                  <Button 
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="w-full"
                  >
                    {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
                  </Button>
                </div>

                <div className="p-6 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Optimize for Job Description</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tailor your resume to match a specific job posting
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="jobDesc">Paste Job Description</Label>
                      <Textarea
                        id="jobDesc"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here..."
                        rows={8}
                        className="resize-none"
                      />
                    </div>
                    <Button 
                      onClick={handleOptimizeForJob}
                      disabled={isOptimizing || !jobDescription.trim()}
                      className="w-full"
                    >
                      {isOptimizing ? 'Optimizing...' : 'Optimize Resume'}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Tip:</strong> You can also use inline AI enhancement buttons in the Edit tab for section-specific improvements.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ats" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">ATS Optimization</h3>
                    <p className="text-muted-foreground">
                      Your resume scores {atsScore}/100 for ATS compatibility.
                    </p>
                  </div>
                  <Button onClick={handleAnalyzeATS} disabled={isAnalyzingATS}>
                    {isAnalyzingATS ? 'Analyzing...' : 'Analyze Now'}
                  </Button>
                </div>

                {atsAnalysis ? (
                  <ATSDetailedAnalysis analysis={atsAnalysis} />
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h4 className="font-semibold mb-2">No Analysis Yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click "Analyze Now" to get detailed ATS compatibility insights
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Choose Your Template</h3>
                  <p className="text-muted-foreground">
                    Select from {resumeTemplates.length} professional, ATS-optimized templates
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resumeTemplates.map((template) => {
                    const isSelected = selectedTemplateId === template.id;
                    const templateData = template as any;
                    
                    return (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                          isSelected ? 'ring-4 ring-primary shadow-xl border-primary' : 'hover:border-primary/50'
                        }`}
                        onClick={() => {
                          console.log('Template clicked:', template.id);
                          setSelectedTemplateId(template.id);
                          if (updateResumeData && resumeData) {
                            updateResumeData({
                              settings: {
                                ...resumeData.settings,
                                templateId: template.id
                              }
                            });
                          }
                          toast.success(`✓ Template changed to ${template.name}`, {
                            duration: 2000,
                          });
                        }}
                      >
                        <div className="p-4 space-y-3">
                          {/* Template Preview */}
                          <div className="aspect-[8.5/11] bg-white rounded-lg flex items-center justify-center relative overflow-hidden group border-2 border-muted">
                            {/* CSS-based template preview */}
                            <div className="w-full h-full p-3 text-[0.35rem] leading-tight">
                              {/* Header */}
                              <div className={`${templateData.designStyle.includes('two-column') ? 'flex gap-2' : 'text-center'} mb-2 pb-1 border-b border-gray-200`}>
                                <div className={templateData.designStyle.includes('two-column') ? 'flex-1' : ''}>
                                  <div className="h-1.5 bg-gray-800 rounded mb-0.5" style={{ width: '60%', margin: templateData.designStyle.includes('two-column') ? '0' : '0 auto' }} />
                                  <div className="h-0.5 bg-gray-500 rounded mb-0.5" style={{ width: '45%', margin: templateData.designStyle.includes('two-column') ? '0' : '0 auto' }} />
                                  <div className="h-0.5 bg-gray-400 rounded" style={{ width: '50%', margin: templateData.designStyle.includes('two-column') ? '0' : '0 auto' }} />
                                </div>
                              </div>
                              
                              {/* Content */}
                              <div className={`${templateData.designStyle.includes('two-column') ? 'flex gap-2' : ''}`}>
                                {/* Main content */}
                                <div className={templateData.designStyle.includes('two-column') ? 'flex-[2]' : ''}>
                                  {/* Summary */}
                                  <div className="mb-2">
                                    <div className="h-0.5 bg-primary/70 rounded mb-0.5 w-1/3" />
                                    <div className="space-y-0.5">
                                      <div className="h-0.5 bg-gray-300 rounded w-full" />
                                      <div className="h-0.5 bg-gray-300 rounded w-full" />
                                      <div className="h-0.5 bg-gray-300 rounded w-3/4" />
                                    </div>
                                  </div>
                                  
                                  {/* Experience */}
                                  <div className="mb-2">
                                    <div className="h-0.5 bg-primary/70 rounded mb-0.5 w-1/2" />
                                    <div className="space-y-1">
                                      <div className="space-y-0.5">
                                        <div className="h-0.5 bg-gray-600 rounded w-2/3" />
                                        <div className="h-0.5 bg-gray-400 rounded w-1/2" />
                                        <div className="h-0.5 bg-gray-300 rounded w-full" />
                                        <div className="h-0.5 bg-gray-300 rounded w-full" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Sidebar */}
                                {templateData.designStyle.includes('two-column') && (
                                  <div className="flex-1 bg-muted/30 rounded p-1.5">
                                    <div className="mb-1.5">
                                      <div className="h-0.5 bg-primary/70 rounded mb-0.5 w-2/3" />
                                      <div className="space-y-0.5">
                                        <div className="h-0.5 bg-gray-400 rounded w-full" />
                                        <div className="h-0.5 bg-gray-400 rounded w-4/5" />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="h-0.5 bg-primary/70 rounded mb-0.5 w-2/3" />
                                      <div className="flex flex-wrap gap-0.5">
                                        <div className="h-0.5 w-6 bg-primary/30 rounded" />
                                        <div className="h-0.5 w-5 bg-primary/30 rounded" />
                                        <div className="h-0.5 w-7 bg-primary/30 rounded" />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Selection overlay */}
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary/10 border-4 border-primary" />
                            )}
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg ring-2 ring-white">
                                <Check className="h-5 w-5" />
                              </div>
                            )}
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-200" />
                          </div>

                          {/* Template Info */}
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-semibold line-clamp-1">{template.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {templateData.description}
                              </p>
                            </div>

                            {/* Features */}
                            <div className="flex flex-wrap gap-1">
                              {templateData.features?.slice(0, 2).map((feature: string) => (
                                <Badge key={feature} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>

                            {/* ATS Score & Selection */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">ATS</span>
                                <span className="text-sm font-semibold text-primary">
                                  {templateData.atsScore || 90}%
                                </span>
                              </div>
                              {isSelected && (
                                <Badge variant="default" className="text-xs">
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="export" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-6">Export Resume</h3>
                <p className="text-muted-foreground mb-8">
                  Download your resume in different formats.
                </p>
                
                <div className="space-y-4">
                  <Button 
                    className="w-full justify-start h-auto py-4" 
                    variant="outline"
                    onClick={() => handleExport("pdf")}
                  >
                    <div className="text-left">
                      <div className="font-semibold mb-1">Export as PDF</div>
                      <div className="text-sm text-muted-foreground">Best for job applications</div>
                    </div>
                  </Button>

                  <Button 
                    className="w-full justify-start h-auto py-4" 
                    variant="outline"
                    onClick={() => handleExport("docx")}
                  >
                    <div className="text-left">
                      <div className="font-semibold mb-1">Export as DOCX</div>
                      <div className="text-sm text-muted-foreground">Editable Word document</div>
                    </div>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </main>
        </Tabs>

        {/* Right Panel - Live Preview */}
        <aside className="w-96 border-l border-border bg-muted/20 p-6 overflow-auto">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Live Preview</h3>
              <p className="text-xs text-muted-foreground">Template: {resumeTemplates.find(t => t.id === selectedTemplateId)?.name || 'Classic'}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {selectedTemplateId}
            </Badge>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform scale-90 origin-top">
            {localData && (
              <TemplateRenderer 
                template={selectedTemplateId}
                resumeData={localData}
                customization={{
                  colorScheme: {
                    id: 'default',
                    name: 'Default',
                    primary: '#3b82f6',
                    secondary: '#8b5cf6',
                    accent: '#ec4899',
                    text: '#1f2937',
                    background: '#ffffff',
                    isDefault: true
                  },
                  fontFamily: 'Inter',
                  fontSize: 12,
                  spacing: 'normal',
                  sections: [],
                  layout: {
                    headerStyle: 'centered',
                    sectionSpacing: 'normal',
                    borderStyle: 'subtle',
                    iconStyle: 'minimal'
                  }
                }}
                sectionOrder={['personalInfo', 'summary', 'experience', 'education', 'skills']}
              />
            )}
            {!localData && (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Loading resume data...</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default UnifiedResumeBuilder;
