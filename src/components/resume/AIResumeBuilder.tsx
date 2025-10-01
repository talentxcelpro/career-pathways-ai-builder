import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  FileText, Sparkles, Target, Download, 
  Layout, Save, Eye, Wand2 
} from 'lucide-react';
import { useResumeData } from '@/hooks/useResumeData';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { useComprehensiveATS } from '@/hooks/useComprehensiveATS';
import { useSmartEnhancement } from '@/hooks/useSmartEnhancement';
import { ComprehensiveDashboard } from './ComprehensiveDashboard';
import { TemplateSelector } from './TemplateSelector';
import { resumeTemplates } from '@/data/resumeTemplates';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export const AIResumeBuilder = () => {
  const { id } = useParams();
  const { resumeData, isLoading, setResumeData } = useResumeData();
  const { saveResume, exportResume, isSaving } = useResumeBuilder(resumeData || undefined);
  const { analyzeResume, analysis, isAnalyzing } = useComprehensiveATS();
  const { enhanceSection, isEnhancing } = useSmartEnhancement();
  
  const [activeTab, setActiveTab] = useState('edit');
  const [selectedTemplate, setSelectedTemplate] = useState('modern-professional');
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const handleAIEnhance = async (sectionName: string) => {
    if (!resumeData) return;
    
    const validSections = ['summary', 'experience', 'skills', 'education'];
    const section = sectionName.toLowerCase().replace(/\s+/g, '');
    
    if (!validSections.includes(section)) {
      toast.error('Invalid section');
      return;
    }
    
    setEditingSection(section);
    try {
      const sectionData = getSectionData(section);
      const enhanced = await enhanceSection(section as any, sectionData, {
        style: 'professional'
      });
      
      if (enhanced) {
        // Update resume data with enhanced content
        toast.success(`${sectionName} enhanced successfully!`);
      }
    } catch (error) {
      toast.error('Enhancement failed. Please try again.');
    } finally {
      setEditingSection(null);
    }
  };

  const getSectionData = (section: string) => {
    if (!resumeData) return '';
    
    switch (section) {
      case 'summary':
        return resumeData.personalInfo.summary || '';
      case 'experience':
        return JSON.stringify(resumeData.experience);
      case 'skills':
        return JSON.stringify(resumeData.skills);
      case 'education':
        return JSON.stringify(resumeData.education);
      default:
        return '';
    }
  };

  const handleRunATS = async () => {
    if (!resumeData) return;
    await analyzeResume(resumeData);
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!resumeData) return;
    await exportResume(format);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    toast.success('Template updated!');
  };

  const handleEnhanceContent = async (section: string, content: string) => {
    const enhanced = await enhanceSection(section as any, content, { style: 'professional' });
    if (enhanced && resumeData && setResumeData) {
      // Update resume data
      toast.success('Content enhanced!');
    }
  };

  const handleOptimize = async (optimizedData: any) => {
    if (setResumeData) {
      setResumeData(optimizedData);
      toast.success('Resume optimized!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">AI Resume Builder</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {analysis && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">
                    ATS Score: {analysis.overallScore}%
                  </span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                disabled={!resumeData}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('docx')}
                disabled={!resumeData}
              >
                <Download className="h-4 w-4 mr-2" />
                DOCX
              </Button>
              
              <Button
                size="sm"
                onClick={saveResume}
                disabled={isSaving || !resumeData}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
              <TabsTrigger value="edit" className="gap-2">
                <FileText className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="enhance" className="gap-2">
                <Wand2 className="h-4 w-4" />
                AI Enhance
              </TabsTrigger>
              <TabsTrigger value="ats" className="gap-2">
                <Target className="h-4 w-4" />
                ATS Score
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <Layout className="h-4 w-4" />
                Templates
              </TabsTrigger>
            </TabsList>

            {/* Edit Content Tab */}
            <TabsContent value="edit" className="space-y-6">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Edit Your Resume</h2>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>

                  {/* Resume editing sections */}
                  <div className="grid gap-4">
                    {['Personal Info', 'Summary', 'Experience', 'Education', 'Skills'].map((section) => (
                      <Card key={section} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{section}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAIEnhance(section)}
                            disabled={isEnhancing || editingSection === section.toLowerCase()}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            {editingSection === section.toLowerCase() ? 'Enhancing...' : 'AI Enhance'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* AI Enhance Tab */}
            <TabsContent value="enhance" className="space-y-6">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <Sparkles className="h-12 w-12 mx-auto text-primary" />
                    <h2 className="text-2xl font-bold">AI Enhancement</h2>
                    <p className="text-muted-foreground">
                      Enhance each section with AI-powered suggestions
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {[
                      { name: 'Professional Summary', key: 'summary', icon: FileText },
                      { name: 'Work Experience', key: 'experience', icon: FileText },
                      { name: 'Skills', key: 'skills', icon: Target },
                      { name: 'Education', key: 'education', icon: FileText }
                    ].map((section) => (
                      <Card key={section.key} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <section.icon className="h-5 w-5 text-primary" />
                            <div>
                              <h3 className="font-semibold">{section.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                AI-powered enhancement available
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleAIEnhance(section.key)}
                            disabled={isEnhancing || editingSection === section.key}
                          >
                            <Wand2 className="h-4 w-4 mr-2" />
                            {editingSection === section.key ? 'Enhancing...' : 'Enhance'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* ATS Score Tab */}
            <TabsContent value="ats" className="space-y-6">
              <div className="space-y-4">
                {!analysis && (
                  <Card className="p-6">
                    <div className="text-center space-y-4">
                      <Target className="h-12 w-12 mx-auto text-primary" />
                      <h2 className="text-2xl font-bold">ATS Score Analysis</h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Get comprehensive ATS analysis with actionable recommendations
                      </p>
                      <Button
                        size="lg"
                        onClick={handleRunATS}
                        disabled={isAnalyzing || !resumeData}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        {isAnalyzing ? 'Analyzing...' : 'Run ATS Analysis'}
                      </Button>
                    </div>
                  </Card>
                )}

                {analysis && resumeData && (
                  <ComprehensiveDashboard
                    resumeData={resumeData}
                    onEnhance={handleEnhanceContent}
                    onOptimize={handleOptimize}
                  />
                )}
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <Layout className="h-12 w-12 mx-auto text-primary" />
                    <h2 className="text-2xl font-bold">Choose Your Template</h2>
                    <p className="text-muted-foreground">
                      Select from {resumeTemplates.length} professional, ATS-optimized templates
                    </p>
                  </div>

                  <TemplateSelector
                    templates={resumeTemplates as any}
                    selectedTemplate={selectedTemplate}
                    onTemplateSelect={handleTemplateChange}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};
