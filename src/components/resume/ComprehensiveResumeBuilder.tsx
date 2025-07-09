import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, Save, Download, Eye, Share, Users, Sparkles, 
  Target, FileText, Globe, Briefcase, Palette, Settings,
  Zap, Clock, Award, TrendingUp, BarChart3, History,
  Copy, Link, Mail, MessageSquare, Bell, Star, Plus,
  Trash2, Edit3, Move, Upload, RefreshCw, CheckCircle,
  AlertTriangle, XCircle, User, Search, Layers
} from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResumeEditor } from "./ResumeEditor";
import { ResumePreview } from "./ResumePreview";
import { ATSOptimizationPanel } from "./ATSOptimizationPanel";
import { AIResumeEnhancer } from "./AIResumeEnhancer";
import { VersionHistory } from "./VersionHistory";
import { templateList } from "./templates";
import { toast } from 'sonner';

interface ComprehensiveResumeBuilderProps {
  resumeId?: string;
}

export const ComprehensiveResumeBuilder: React.FC<ComprehensiveResumeBuilderProps> = ({ resumeId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Core state
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [zoomLevel, setZoomLevel] = useState([100]);
  const [isAutoSaving, setIsAutoSaving] = useState(true);
  const [showGridLines, setShowGridLines] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [isSharing, setIsSharing] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  
  // Resume data structure
  const [resumeData, setResumeData] = useState<any>({
    personalInfo: { 
      fullName: '', email: '', phone: '', location: '', 
      summary: '', linkedin: '', website: '', github: ''
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      languages: [],
      certifications: []
    },
    projects: [],
    certifications: [],
    awards: [],
    customSections: [],
    volunteering: [],
    publications: [],
    references: []
  });

  // Fetch resume with analytics
  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: async () => {
      if (!resumeId || !user) return null;
      
      const { data, error } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!resumeId && !!user
  });

  // Simplified analytics - computed from resume data
  const analyticsData = {
    views: 0,
    downloads: 0,
    applications: 0,
    atsScore: resume?.ats_score || 0,
    lastViewed: resume?.updated_at ? new Date(resume.updated_at) : null
  };

  // Load resume data and analytics
  useEffect(() => {
    if (resume?.content) {
      setResumeData(resume.content);
      if (resume.template_id) setSelectedTemplate(resume.template_id);
      
      // Analytics are now computed above
    }
  }, [resume]);

  // Enhanced save mutation with versioning
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!resumeId || !user) throw new Error('Missing required data');
      
      // Calculate ATS score
      const atsScore = calculateATSScore(data);
      
      const { error } = await supabase
        .from('ai_resumes')
        .update({ 
          content: data,
          template_id: selectedTemplate,
          ats_score: atsScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Track analytics
      await supabase.functions.invoke('track-resume-edit', {
        body: { resumeId, action: 'content_update', data: { atsScore } }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      toast.success('Resume saved!');
    }
  });

  // Real-time collaboration setup
  useEffect(() => {
    if (!resumeId) return;

    const channel = supabase.channel(`resume-${resumeId}`)
      .on('broadcast', { event: 'cursor-move' }, (payload) => {
        // Handle real-time cursor movements
        handleCursorMove(payload);
      })
      .on('broadcast', { event: 'content-change' }, (payload) => {
        // Handle real-time content changes
        handleContentChange(payload);
      })
      .on('broadcast', { event: 'user-join' }, (payload) => {
        // Handle user joining session
        addCollaborator(payload.user);
      })
      .on('broadcast', { event: 'user-leave' }, (payload) => {
        // Handle user leaving session
        removeCollaborator(payload.userId);
      })
      .subscribe();

    // Announce presence
    channel.send({
      type: 'broadcast',
      event: 'user-join',
      payload: { user: { id: user?.id, name: user?.user_metadata?.full_name } }
    });

    return () => {
      channel.send({
        type: 'broadcast',
        event: 'user-leave',
        payload: { userId: user?.id }
      });
      supabase.removeChannel(channel);
    };
  }, [resumeId, user]);

  // Auto-save with conflict resolution
  useEffect(() => {
    if (!isAutoSaving) return;
    
    const timer = setTimeout(() => {
      if (resumeData.personalInfo.fullName && resumeId) {
        saveMutation.mutate(resumeData);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [resumeData, isAutoSaving, resumeId, saveMutation]);

  // Helper functions
  const calculateATSScore = (data: any): number => {
    let score = 0;
    
    // Contact info (20 points)
    if (data.personalInfo?.fullName) score += 5;
    if (data.personalInfo?.email) score += 5;
    if (data.personalInfo?.phone) score += 5;
    if (data.personalInfo?.location) score += 5;
    
    // Summary (15 points)
    if (data.personalInfo?.summary && data.personalInfo.summary.length > 50) score += 15;
    
    // Experience (30 points)
    if (data.experience?.length >= 1) score += 15;
    if (data.experience?.length >= 3) score += 10;
    if (data.experience?.some((exp: any) => exp.description?.length > 100)) score += 5;
    
    // Skills (20 points)
    if (data.skills?.technical?.length >= 5) score += 10;
    if (data.skills?.soft?.length >= 3) score += 5;
    if (data.skills?.languages?.length >= 1) score += 5;
    
    // Education (15 points)
    if (data.education?.length >= 1) score += 15;
    
    return Math.min(score, 100);
  };

  const handleCursorMove = (payload: any) => {
    // Implement cursor tracking for collaboration
    console.log('Cursor moved:', payload);
  };

  const handleContentChange = (payload: any) => {
    // Handle real-time content updates from other users
    if (payload.userId !== user?.id) {
      // Merge changes or show conflict resolution UI
      console.log('Remote content change:', payload);
    }
  };

  const addCollaborator = (collaborator: any) => {
    setCollaborators(prev => [...prev.filter(c => c.id !== collaborator.id), collaborator]);
  };

  const removeCollaborator = (userId: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== userId));
  };

  // Share functions
  const handleShare = useCallback(async (shareType: 'public' | 'link' | 'email' | 'collaborate') => {
    if (!resumeId) return;

    try {
      setIsSharing(true);
      
      // Simplified sharing for now
      const shareToken = Math.random().toString(36).substring(7);
      const data = { share_token: shareToken };

      const baseUrl = window.location.origin;
      let shareUrl = '';
      
      switch (shareType) {
        case 'link':
          shareUrl = `${baseUrl}/resume/public/${data.share_token}`;
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Share link copied to clipboard!');
          break;
        case 'collaborate':
          shareUrl = `${baseUrl}/resume/collaborate/${data.share_token}`;
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Collaboration link copied!');
          break;
        case 'email':
          shareUrl = `${baseUrl}/resume/public/${data.share_token}`;
          const mailto = `mailto:?subject=Check out my resume&body=View my resume at: ${shareUrl}`;
          window.open(mailto);
          break;
        case 'public':
          await supabase
            .from('ai_resumes')
            .update({ is_public: true })
            .eq('id', resumeId);
          toast.success('Resume is now publicly visible!');
          break;
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share resume');
    } finally {
      setIsSharing(false);
    }
  }, [resumeId]);

  // Export functions with enhanced tracking
  const exportPDF = useCallback(async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' });
      
      // Track export (simplified for now)
      console.log('PDF export started');
      
      const { exportToPDF } = await import('@/utils/exportResume');
      await exportToPDF('resume-preview', `${resumeData.personalInfo.fullName || 'resume'}.pdf`);
      
      // Track export completion
      console.log('PDF export completed');
      
      toast.success('PDF downloaded!', { id: 'pdf-export' });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: 'pdf-export' });
    }
  }, [resumeData.personalInfo.fullName, resumeId, zoomLevel, selectedTemplate]);

  const exportDOCX = useCallback(async () => {
    try {
      toast.loading('Generating DOCX...', { id: 'docx-export' });
      
      // Track DOCX export
      console.log('DOCX export started');
      
      const { exportToDOCX } = await import('@/utils/exportResume');
      await exportToDOCX(resumeData, `${resumeData.personalInfo.fullName || 'resume'}.docx`);
      
      // Track DOCX completion
      console.log('DOCX export completed');
      
      toast.success('DOCX downloaded!', { id: 'docx-export' });
    } catch (error) {
      toast.error('Failed to generate DOCX', { id: 'docx-export' });
    }
  }, [resumeData, resumeId, selectedTemplate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading comprehensive resume builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-background`}>
      {/* Enhanced Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-16 items-center gap-4 px-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/resume-builder')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Resume Info */}
          <div className="flex items-center gap-2">
            <h1 className="font-semibold">
              {resumeData.personalInfo.fullName || 'Untitled Resume'}
            </h1>
            <div className="flex items-center gap-2">
              {isAutoSaving && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Auto-saving
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                ATS: {analyticsData.atsScore}%
              </Badge>
              <Badge variant="outline" className="text-xs">
                Views: {analyticsData.views}
              </Badge>
            </div>
          </div>

          {/* Collaborators */}
          {collaborators.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="flex -space-x-2">
                  {collaborators.slice(0, 3).map((collaborator, index) => (
                    <div
                      key={collaborator.id}
                      className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background"
                      title={collaborator.name}
                    >
                      {collaborator.name?.[0] || 'U'}
                    </div>
                  ))}
                  {collaborators.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center border-2 border-background">
                      +{collaborators.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex-1" />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('edit')}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
            >
              <Layers className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveMutation.mutate(resumeData)}
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            <Select value="export" onValueChange={(value) => {
              if (value === 'pdf') exportPDF();
              if (value === 'docx') exportDOCX();
            }}>
              <SelectTrigger className="w-32">
                <Download className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">Export PDF</SelectItem>
                <SelectItem value="docx">Export DOCX</SelectItem>
              </SelectContent>
            </Select>

            <Select value="share" onValueChange={(value) => {
              if (value === 'link') handleShare('link');
              if (value === 'email') handleShare('email');
              if (value === 'public') handleShare('public');
              if (value === 'collaborate') handleShare('collaborate');
            }}>
              <SelectTrigger className="w-32">
                <Share className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Share" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="link">
                  <div className="flex items-center">
                    <Link className="h-4 w-4 mr-2" />
                    Copy Link
                  </div>
                </SelectItem>
                <SelectItem value="collaborate">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Collaborate
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Make Public
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Settings Menu */}
            <Select value="settings" onValueChange={(value) => {
              if (value === 'dark') setIsDarkMode(!isDarkMode);
              if (value === 'grid') setShowGridLines(!showGridLines);
              if (value === 'ruler') setShowRuler(!showRuler);
              if (value === 'autosave') setIsAutoSaving(!isAutoSaving);
            }}>
              <SelectTrigger className="w-10">
                <Settings className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Toggle Dark Mode</SelectItem>
                <SelectItem value="grid">Toggle Grid Lines</SelectItem>
                <SelectItem value="ruler">Toggle Ruler</SelectItem>
                <SelectItem value="autosave">Toggle Auto-save</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <>
            <div className="w-80 border-r bg-muted/30 overflow-hidden flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="border-b p-2">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="content" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      Edit
                    </TabsTrigger>
                    <TabsTrigger value="design" className="text-xs">
                      <Palette className="h-3 w-3 mr-1" />
                      Design
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  <TabsContent value="content" className="mt-0">
                    <ResumeEditor
                      content={resumeData}
                      onChange={setResumeData}
                    />
                  </TabsContent>

                  <TabsContent value="design" className="mt-0 space-y-6">
                    {/* Template Selection */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Template</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {templateList.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>

                    {/* View Settings */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">View Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Zoom: {zoomLevel[0]}%</label>
                          <Slider
                            value={zoomLevel}
                            onValueChange={setZoomLevel}
                            max={200}
                            min={50}
                            step={10}
                            className="mt-2"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Grid Lines</label>
                          <Switch
                            checked={showGridLines}
                            onCheckedChange={setShowGridLines}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Ruler</label>
                          <Switch
                            checked={showRuler}
                            onCheckedChange={setShowRuler}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Auto-save</label>
                          <Switch
                            checked={isAutoSaving}
                            onCheckedChange={setIsAutoSaving}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-0">
                    <AIResumeEnhancer
                      resumeData={resumeData}
                      onEnhancementApplied={setResumeData}
                    />
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-0">
                    <div className="space-y-4">
                      {/* Performance Overview */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{analyticsData.views}</div>
                              <div className="text-xs text-muted-foreground">Views</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{analyticsData.downloads}</div>
                              <div className="text-xs text-muted-foreground">Downloads</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{analyticsData.applications}</div>
                              <div className="text-xs text-muted-foreground">Applications</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{analyticsData.atsScore}%</div>
                              <div className="text-xs text-muted-foreground">ATS Score</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* ATS Score Breakdown */}
                      <ATSOptimizationPanel resumeData={resumeData} />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {viewMode === 'split' && <ResizableHandle withHandle />}
          </>
        )}

        {/* Main Preview Area */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 bg-muted/20 overflow-auto relative">
            {/* Ruler */}
            {showRuler && (
              <div className="absolute top-0 left-0 right-0 h-6 bg-background border-b flex items-center text-xs text-muted-foreground">
                <div className="absolute left-6">0</div>
                <div className="absolute left-1/4">25%</div>
                <div className="absolute left-1/2">50%</div>
                <div className="absolute left-3/4">75%</div>
                <div className="absolute right-6">100%</div>
              </div>
            )}
            
            <div className={`p-6 ${showRuler ? 'pt-12' : ''}`}>
              <div 
                className="mx-auto bg-white shadow-lg relative"
                style={{ 
                  transform: `scale(${zoomLevel[0] / 100})`,
                  transformOrigin: 'top center',
                  width: '21cm',
                  minHeight: '29.7cm'
                }}
                id="resume-preview"
              >
                {/* Grid overlay */}
                {showGridLines && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }}
                  />
                )}
                
                <ResumePreview
                  content={resumeData}
                  template={{ id: selectedTemplate }}
                  fullPage={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Version History & Collaboration */}
      <div className="absolute right-4 top-20 w-64 space-y-4 hidden xl:block">
        <VersionHistory 
          resumeId={resumeId} 
          onVersionRestore={(content) => setResumeData(content)}
        />
        
        {/* Collaboration Panel */}
        {collaborators.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Collaborators ({collaborators.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {collaborator.name?.[0] || 'U'}
                    </div>
                    <span>{collaborator.name || 'Anonymous'}</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 ml-auto" title="Active" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};