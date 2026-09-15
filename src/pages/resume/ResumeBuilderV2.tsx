import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Save, 
  Download, 
  Eye, 
  FileText, 
  Smartphone, 
  Monitor,
  Palette,
  Zap,
  Users,
  BarChart3,
  Brain,
  Link2
} from 'lucide-react';
import { ResumeEditor } from '@/components/resume/editor/ResumeEditor';
import { ResumePreview } from '@/components/resume/preview/ResumePreview';
import { AIEnhancer } from '@/components/resume/ai/AIEnhancer';
import { ExportOptions } from '@/components/resume/export/ExportOptions';
import { CollaborationPanel } from '@/components/resume/collaboration/CollaborationPanel';
import { AnalyticsDashboard } from '@/components/resume/analytics/AnalyticsDashboard';
import { CareerIntelligence } from '@/components/resume/career/CareerIntelligence';
import { IntegrationHub } from '@/components/resume/integrations/IntegrationHub';
import type { ResumeData } from '@/components/resume/preview/ResumePreview';

const defaultResumeData: ResumeData = {
  profile: {
    name: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: ''
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: []
};

const ResumeBuilderV2: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'split' | 'preview-only'>('split');
  const [activePanel, setActivePanel] = useState<'editor' | 'ai' | 'export'>('editor');
  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);
  const [collaborationOpen, setCollaborationOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [careerOpen, setCareerOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load resume data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('resume-builder-v2-data');
    if (savedData) {
      try {
        setResumeData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved resume data:', error);
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('resume-builder-v2-data', JSON.stringify(resumeData));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [resumeData]);

  const handleDataChange = useCallback((newData: ResumeData) => {
    setResumeData(newData);
  }, []);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your resume.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const title = resumeData.profile.name 
        ? `${resumeData.profile.name}'s Resume`
        : 'My Resume';

      const { data: savedResume, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title,
          content: resumeData,
          template_id: selectedTemplate,
          is_primary: false,
          ats_score: 85 // Default score, can be calculated later
        })
        .select()
        .single();

      if (error) throw error;

      setSavedResumeId(savedResume.id);
      toast({
        title: "Resume Saved",
        description: "Your resume has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    // TODO: Implement PDF/DOCX download
    toast({
      title: "Download Coming Soon",
      description: "PDF download feature is being implemented.",
    });
  };

  const templates = [
    { id: 'modern', name: 'Modern', description: 'Clean and professional' },
    { id: 'creative', name: 'Creative', description: 'Bold and colorful' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' },
    { id: 'executive', name: 'Executive', description: 'Traditional and formal' }
  ];

  const isDataEmpty = !resumeData.profile.name && 
                    !resumeData.summary && 
                    resumeData.experience.length === 0 &&
                    resumeData.education.length === 0 &&
                    (!resumeData.skills || resumeData.skills.length === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Helmet>
        <title>Resume Builder V2 - Real-time Preview | TalentXcel</title>
        <meta name="description" content="Build your professional resume with real-time preview, multiple templates, and instant feedback." />
        <link rel="canonical" href="https://talentxcel.in/resume/builder" />
      </Helmet>

      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Resume Builder V2</h1>
                <p className="text-sm text-gray-600">Real-time preview & professional templates</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Template Selector */}
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex border rounded">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="rounded-r-none"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="rounded-l-none"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>

              {/* Preview Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(previewMode === 'split' ? 'preview-only' : 'split')}
              >
                <Eye className="h-4 w-4 mr-1" />
                {previewMode === 'split' ? 'Preview Only' : 'Split View'}
              </Button>

              {/* Panel Selector */}
              <div className="flex border rounded">
                <Button
                  variant={activePanel === 'editor' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel('editor')}
                  className="rounded-r-none text-xs"
                >
                  Editor
                </Button>
                <Button
                  variant={activePanel === 'ai' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel('ai')}
                  className="rounded-none text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  AI
                </Button>
                <Button
                  variant={activePanel === 'export' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel('export')}
                  className="rounded-l-none text-xs"
                >
                  Export
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !user}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                
                <Button 
                  onClick={() => setCollaborationOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <Users className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={() => setAnalyticsOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={() => setCareerOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <Brain className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={() => setIntegrationsOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Start Banner for Empty Resume */}
        {isDataEmpty && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Zap className="h-5 w-5" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Start with your personal information in the Profile tab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Add your work experience and education</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Watch your resume come to life in real-time!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor/AI/Export Panel */}
          {previewMode === 'split' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {activePanel === 'editor' && 'Resume Editor'}
                  {activePanel === 'ai' && 'AI Enhancement'}
                  {activePanel === 'export' && 'Export Options'}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {activePanel === 'editor' && 'Auto-saves every second'}
                  {activePanel === 'ai' && 'AI-powered optimization'}
                  {activePanel === 'export' && 'Multiple formats available'}
                </Badge>
              </div>
              
              <Card className="h-[800px] overflow-hidden">
                <CardContent className="p-0 h-full">
                  <div className="h-full overflow-y-auto">
                    {activePanel === 'editor' && (
                      <ResumeEditor
                        data={resumeData}
                        onChange={handleDataChange}
                        className="p-6"
                      />
                    )}
                    {activePanel === 'ai' && (
                      <div className="p-6">
                        <AIEnhancer
                          resumeData={resumeData}
                          onDataChange={handleDataChange}
                          resumeId={savedResumeId}
                        />
                      </div>
                    )}
                    {activePanel === 'export' && (
                      <div className="p-6">
                        <ExportOptions
                          resumeData={resumeData}
                          selectedTemplate={selectedTemplate}
                          resumeId={savedResumeId}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preview Panel */}
          <div className={`space-y-4 ${previewMode === 'preview-only' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {selectedTemplate} template
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ATS Score: 85%
                </Badge>
              </div>
            </div>
            
            <Card className={`h-[800px] overflow-hidden ${viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
              <CardContent className="p-0 h-full">
                <div className="h-full overflow-y-auto">
                  <ResumePreview
                    data={resumeData}
                    template={selectedTemplate}
                    className="h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Template Gallery */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Template Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-3 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-sm">{template.name}</h3>
                  <p className="text-xs text-gray-600">{template.description}</p>
                  {selectedTemplate === template.id && (
                    <Badge className="mt-2" size="sm">Selected</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips & Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">💡 Pro Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Use action verbs like "achieved," "implemented," and "led" to make your experience more impactful.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">🎯 ATS Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Include relevant keywords from job descriptions to improve your ATS compatibility score.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📱 Mobile Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Your resume is optimized for viewing on all devices. Toggle between desktop and mobile preview.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Phase 3 Modals */}
      <CollaborationPanel
        resumeId={savedResumeId || 'new'}
        isOpen={collaborationOpen}
        onClose={() => setCollaborationOpen(false)}
      />

      <AnalyticsDashboard
        resumeId={savedResumeId || 'new'}
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
      />

      <CareerIntelligence
        resumeData={resumeData}
        isOpen={careerOpen}
        onClose={() => setCareerOpen(false)}
      />

      <IntegrationHub
        isOpen={integrationsOpen}
        onClose={() => setIntegrationsOpen(false)}
      />
    </div>
  );
};

export default ResumeBuilderV2;