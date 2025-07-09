import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, Edit, Download, Eye, Settings, Wand2, 
  FileText, Star, Share2, Clock, BarChart3, 
  MessageSquare, RefreshCw, Save, History
} from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useResumeEnhancement } from "@/hooks/useResumeEnhancement";
import { ResumeEditor } from "./ResumeEditor";
import { ResumePreview } from "./ResumePreview";
import { TemplateSelector } from "./TemplateSelector";
import { ATSScoreChecker } from "./ATSScoreChecker";
import { VersionHistory } from "./VersionHistory";
import { AIAssistant } from "./AIAssistant";

interface ResumeWorkspaceProps {
  resumeId?: string;
  mode?: 'edit' | 'create' | 'view';
}

export const ResumeWorkspace = ({ resumeId, mode = 'edit' }: ResumeWorkspaceProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('editor');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { enhanceResumeText, isEnhancing } = useResumeEnhancement();

  // Fetch resume data
  const { data: resume, isLoading, error } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: async () => {
      if (!resumeId) return null;
      const { data, error } = await supabase
        .from('ai_resumes')
        .select('*, resume_templates(*)')
        .eq('id', resumeId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!resumeId
  });

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ['resume-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resume_templates')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (content: any) => {
      if (!resumeId) return;
      const { error } = await supabase
        .from('ai_resumes')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setLastSaved(new Date());
      setIsAutoSaving(false);
    }
  });

  // Enhanced save with AI improvements
  const enhancedSaveMutation = useMutation({
    mutationFn: async ({ content, enhancementType }: { content: any; enhancementType: string }) => {
      if (!resumeId) return;
      
      // Create a text representation of the resume for AI enhancement
      const resumeText = `
        Summary: ${content.personalInfo?.summary || ''}
        Experience: ${content.experience?.map((exp: any) => `${exp.title} at ${exp.company}: ${exp.description}`).join('\n') || ''}
        Skills: ${content.skills?.technical?.join(', ') || ''}
        Education: ${content.education?.map((edu: any) => `${edu.degree} from ${edu.school}`).join('\n') || ''}
      `;

      // Enhance with AI
      const enhancedSections = await enhanceResumeText(resumeText, { 
        sectionType: 'all',
        enhancementType: enhancementType as any
      });

      if (enhancedSections) {
        // Merge enhanced content back
        const enhancedContent = {
          ...content,
          personalInfo: {
            ...content.personalInfo,
            summary: enhancedSections.summary || content.personalInfo?.summary
          },
          experience: content.experience, // Keep original structure for now
          skills: content.skills,
          education: content.education
        };

        const { error } = await supabase
          .from('ai_resumes')
          .update({ 
            content: enhancedContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', resumeId);
        
        if (error) throw error;
        return enhancedContent;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      toast.success('Resume enhanced and saved successfully!');
    }
  });

  // Auto-save functionality
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const triggerAutoSave = (content: any) => {
      setIsAutoSaving(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        autoSaveMutation.mutate(content);
      }, 2000); // Auto-save after 2 seconds of inactivity
    };

    return () => clearTimeout(timeoutId);
  }, []);

  const handleContentChange = (content: any) => {
    // Trigger auto-save
    setIsAutoSaving(true);
    autoSaveMutation.mutate(content);
  };

  const handleEnhanceResume = (enhancementType: string) => {
    if (resume?.content) {
      enhancedSaveMutation.mutate({
        content: resume.content,
        enhancementType
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading resume workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Resume</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load the resume. Please try again.
            </p>
            <Button onClick={() => navigate('/resume')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/resume')}
              >
                ← Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {resume?.title || 'Untitled Resume'}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Template: {resume?.resume_templates?.name || 'None'}</span>
                  <span>•</span>
                  <span>ATS Score: {resume?.ats_score || 0}/100</span>
                  {lastSaved && (
                    <>
                      <span>•</span>
                      <span>Saved {lastSaved.toLocaleTimeString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isAutoSaving && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersionHistory(true)}
              >
                <History className="h-4 w-4 mr-2" />
                Versions
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIAssistant(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              
              <Button
                size="sm"
                onClick={() => handleEnhanceResume('professional')}
                disabled={isEnhancing}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="editor" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Editor</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger value="ats" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>ATS Score</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
              <div className="space-y-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Resume Content</CardTitle>
                    <CardDescription>
                      Edit your resume content. Changes are auto-saved.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-100px)] overflow-auto">
                    <ResumeEditor 
                      content={resume?.content || {}}
                      onChange={handleContentChange}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>
                      See how your resume looks in real-time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-100px)] overflow-auto">
                    <ResumePreview 
                      content={resume?.content || {}}
                      template={resume?.resume_templates}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardContent className="p-6">
                <ResumePreview 
                  content={resume?.content || {}}
                  template={resume?.resume_templates}
                  fullPage
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <TemplateSelector 
              templates={templates || []}
              currentTemplateId={resume?.template_id}
              onTemplateSelect={(templateId) => {
                if (resumeId) {
                  // Handle template_id as string for frontend templates
                  // The database template_id field can be null since we're using frontend templates
                  supabase
                    .from('ai_resumes')
                    .update({ template_id: null }) // Store null since we use frontend template IDs
                    .eq('id', resumeId)
                    .then(() => {
                      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
                      toast.success('Template updated successfully!');
                    });
                }
              }}
            />
          </TabsContent>

          <TabsContent value="ats">
            <ATSScoreChecker 
              resumeContent={resume?.content}
              currentScore={resume?.ats_score}
              onScoreUpdate={(score) => {
                if (resumeId) {
                  supabase
                    .from('ai_resumes')
                    .update({ ats_score: score })
                    .eq('id', resumeId);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export Resume</CardTitle>
                <CardDescription>
                  Download your resume in various formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-24 flex-col space-y-2">
                    <Download className="h-6 w-6" />
                    <span>Download PDF</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col space-y-2">
                    <FileText className="h-6 w-6" />
                    <span>Download DOCX</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col space-y-2">
                    <Share2 className="h-6 w-6" />
                    <span>Share Link</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Assistant Dialog */}
      <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
        <DialogContent className="max-w-2xl h-[600px]">
          <DialogHeader>
            <DialogTitle>AI Resume Assistant</DialogTitle>
          </DialogHeader>
          <AIAssistant 
            resumeContent={resume?.content}
            onSuggestionApply={(suggestion) => {
              // Apply AI suggestion to resume
              handleContentChange(suggestion);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-4xl h-[600px]">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>
          <VersionHistory 
            resumeId={resumeId}
            onVersionRestore={(content) => {
              handleContentChange(content);
              setShowVersionHistory(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};