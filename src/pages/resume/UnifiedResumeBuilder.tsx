import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Sparkles, Target, Palette, Download, Save, BarChart3 } from "lucide-react";
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

const UnifiedResumeBuilder = () => {
  const { id } = useParams();
  const { resumeData, isLoading } = useResumeData();
  const { saveResume, isSaving, hasChanges } = useResumeBuilder(resumeData || undefined);
  const [activeTab, setActiveTab] = useState("edit");
  const [atsScore, setAtsScore] = useState(75);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysisResult | undefined>();
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [localData, setLocalData] = useState(resumeData);
  const [jobDescription, setJobDescription] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Sync local data with resume data
  useEffect(() => {
    if (resumeData) {
      setLocalData(resumeData);
    }
  }, [resumeData]);

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
    setLocalData((prev: any) => ({
      ...prev,
      personalInfo: { ...prev?.personalInfo, [field]: value }
    }));
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
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-lg">Resume Builder</h2>
            <p className="text-xs text-muted-foreground mt-1">AI-Powered Editor</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-1 gap-2 p-4 bg-transparent">
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
          </Tabs>
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
            <TabsContent value="edit" className="mt-0">
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
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-6">Choose Template</h3>
                <p className="text-muted-foreground mb-8">
                  Select a professional template for your resume.
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  {["Modern", "Professional", "Creative"].map((template) => (
                    <div key={template} className="border border-border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors">
                      <div className="aspect-[3/4] bg-muted rounded mb-3 flex items-center justify-center">
                        <span className="text-muted-foreground">{template}</span>
                      </div>
                      <h4 className="font-semibold text-center">{template}</h4>
                    </div>
                  ))}
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

        {/* Right Panel - Live Preview */}
        <aside className="w-96 border-l border-border bg-muted/20 p-6 overflow-auto">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Live Preview</h3>
            <p className="text-xs text-muted-foreground">See changes in real-time</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8 aspect-[8.5/11]">
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold">{resumeData?.personalInfo?.fullName || "Your Name"}</h1>
                <p className="text-sm text-gray-600">{resumeData?.personalInfo?.email || "your.email@example.com"}</p>
                <p className="text-sm text-gray-600">{resumeData?.personalInfo?.phone || "(123) 456-7890"}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-900">Professional Summary</h2>
                <p className="text-sm text-gray-700">Your professional summary will appear here...</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-900">Experience</h2>
                <div className="text-sm text-gray-700">
                  <p className="font-medium">Job Title</p>
                  <p className="text-gray-600">Company Name • Date Range</p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Achievement or responsibility</li>
                    <li>Achievement or responsibility</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-900">Education</h2>
                <div className="text-sm text-gray-700">
                  <p className="font-medium">Degree</p>
                  <p className="text-gray-600">University Name • Graduation Year</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-900">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Skill 1</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Skill 2</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Skill 3</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default UnifiedResumeBuilder;
