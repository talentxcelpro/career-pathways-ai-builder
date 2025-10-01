import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Sparkles, Target, Palette, Download, Save, BarChart3 } from "lucide-react";
import { useResumeData } from "@/hooks/useResumeData";
import { useResumeBuilder } from "@/hooks/useResumeBuilder";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

const UnifiedResumeBuilder = () => {
  const { id } = useParams();
  const { resumeData, isLoading } = useResumeData();
  const { saveResume, exportResume, isSaving, hasChanges } = useResumeBuilder(resumeData || undefined);
  const [activeTab, setActiveTab] = useState("edit");
  const [atsScore] = useState(75);

  const handleSave = async () => {
    await saveResume();
    toast.success("Resume saved successfully!");
  };

  const handleExport = async (format: "pdf" | "docx") => {
    await exportResume(format);
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
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">ATS Score</span>
                  <BarChart3 className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">{atsScore}/100</div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${atsScore}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Good score! Click ATS tab for tips</p>
              </div>
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
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-6">Edit Your Resume</h3>
                <p className="text-muted-foreground mb-8">
                  Modify your resume content. Use the AI Enhance tab for intelligent suggestions.
                </p>
                
                {/* Placeholder for resume editor */}
                <div className="space-y-6">
                  <div className="p-8 border-2 border-dashed border-border rounded-lg text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Resume editor content will appear here</p>
                    <p className="text-sm text-muted-foreground mt-2">Section-by-section editing coming soon</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-6">AI Enhancement</h3>
                <p className="text-muted-foreground mb-8">
                  Get AI-powered suggestions to improve your resume impact and clarity.
                </p>
                
                <div className="grid gap-4">
                  <div className="p-6 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Enhance All Sections</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">AI will optimize your entire resume for impact</p>
                  </div>

                  <div className="p-6 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Generate Summary</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Create a compelling professional summary</p>
                  </div>

                  <div className="p-6 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Optimize for Job</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Tailor resume to a specific job description</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ats" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-6">ATS Optimization</h3>
                <p className="text-muted-foreground mb-8">
                  Your resume scores {atsScore}/100 for ATS compatibility.
                </p>

                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-green-500 bg-green-500/10 rounded-r">
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <span className="text-green-600">✓</span> Strong Keywords
                    </h4>
                    <p className="text-sm text-muted-foreground">Your resume uses relevant industry keywords</p>
                  </div>

                  <div className="p-4 border-l-4 border-yellow-500 bg-yellow-500/10 rounded-r">
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <span className="text-yellow-600">⚠</span> Add More Metrics
                    </h4>
                    <p className="text-sm text-muted-foreground">Include quantifiable achievements (e.g., "Increased sales by 30%")</p>
                  </div>

                  <div className="p-4 border-l-4 border-red-500 bg-red-500/10 rounded-r">
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <span className="text-red-600">✗</span> Format Issues
                    </h4>
                    <p className="text-sm text-muted-foreground">Avoid tables and graphics - use simple formatting</p>
                  </div>
                </div>
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
