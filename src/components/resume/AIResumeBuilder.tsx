import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useResumeData } from '@/hooks/useResumeData';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { useATSAnalysis } from '@/hooks/useATSAnalysis';
import { toast } from 'sonner';
import { Edit, Sparkles, Target, FileText, Download, Save } from 'lucide-react';
import { ResumeEditorPanel } from './editor/ResumeEditorPanel';
import { AIEnhancementPanel } from './editor/AIEnhancementPanel';
import { ATSScorePanel } from './editor/ATSScorePanel';
import { TemplateGalleryPanel } from './editor/TemplateGalleryPanel';
import { TemplateRenderer } from './templates/TemplateRenderer';
import { Card } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';

export function AIResumeBuilder() {
  const { resumeData, setResumeData, isLoading, isNewResume } = useResumeData();
  const { updateResumeData, saveResume, exportResume, isSaving, hasChanges } = useResumeBuilder(resumeData || undefined);
  const { analysis, isAnalyzing, analyzeResume } = useATSAnalysis();
  const [activeTab, setActiveTab] = useState('edit');

  const handleSave = async () => {
    await saveResume();
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    await exportResume(format);
  };

  const handleTemplateChange = (templateId: string) => {
    updateResumeData({
      settings: {
        ...resumeData!.settings,
        templateId
      }
    });
    toast.success('Template changed successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your resume...</p>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">No Resume Found</h2>
          <p className="text-muted-foreground">Unable to load resume data</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI Resume Builder | Edit, Enhance & Optimize Your Resume</title>
        <meta name="description" content="Build ATS-optimized resumes with AI-powered editing, templates, and instant ATS scoring." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{resumeData.metadata.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {isNewResume ? 'New Resume' : 'Editing Resume'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('docx')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  DOCX
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Editor/Tools */}
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </TabsTrigger>
                  <TabsTrigger value="enhance" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">AI Enhance</span>
                  </TabsTrigger>
                  <TabsTrigger value="ats" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="hidden sm:inline">ATS Score</span>
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Templates</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="mt-6">
                  <ResumeEditorPanel
                    resumeData={resumeData}
                    onUpdate={updateResumeData}
                  />
                </TabsContent>

                <TabsContent value="enhance" className="mt-6">
                  <AIEnhancementPanel
                    resumeData={resumeData}
                    onUpdate={updateResumeData}
                  />
                </TabsContent>

                <TabsContent value="ats" className="mt-6">
                  <ATSScorePanel
                    resumeData={resumeData}
                    analysis={analysis}
                    isAnalyzing={isAnalyzing}
                    onAnalyze={analyzeResume}
                  />
                </TabsContent>

                <TabsContent value="templates" className="mt-6">
                  <TemplateGalleryPanel
                    currentTemplateId={resumeData.settings.templateId}
                    onTemplateSelect={handleTemplateChange}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Live Preview */}
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
              <Card className="p-6 h-full overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const elem = document.getElementById('resume-preview');
                        if (elem) {
                          const scale = elem.style.transform.includes('scale(0.8)') ? 1 : 0.8;
                          elem.style.transform = `scale(${scale})`;
                          elem.style.transformOrigin = 'top center';
                        }
                      }}
                    >
                      Zoom
                    </Button>
                  </div>
                </div>
                <div id="resume-preview" className="transition-transform duration-200">
                  <TemplateRenderer
                    resumeData={resumeData}
                    templateId={resumeData.settings.templateId}
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
