import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Eye, 
  Settings,
  FileText,
  Download,
  Sparkles,
  Layout,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { 
  EnhancedResumeData, 
  DEFAULT_SECTION_CONFIG, 
  ResumeSection,
  SECTION_METADATA 
} from "@/types/enhanced-resume";
import { SectionManager } from "./SectionManager";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { ProfessionalSummarySection } from "./sections/ProfessionalSummarySection";
import { WorkExperienceSection } from "./sections/WorkExperienceSection";
import { SkillsSection } from "./sections/SkillsSection";
import { EducationSection } from "./sections/EducationSection";
import { CertificationsSection } from "./sections/CertificationsSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { AwardsSection } from "./sections/AwardsSection";
import { VolunteerWorkSection } from "./sections/VolunteerWorkSection";
import { ToolsSection } from "./sections/ToolsSection";
import { TrainingsSection } from "./sections/TrainingsSection";
import { CareerObjectivesSection } from "./sections/CareerObjectivesSection";
import { ReferencesSection } from "./sections/ReferencesSection";
import { ResumePreview } from "../ResumePreview";

interface EnhancedResumeBuilderProps {
  resumeId?: string;
  mode?: 'create' | 'edit';
}

export const EnhancedResumeBuilder: React.FC<EnhancedResumeBuilderProps> = ({
  resumeId,
  mode = 'edit'
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentTab, setCurrentTab] = useState<'build' | 'manage' | 'enhance' | 'preview'>('build');
  const [resumeData, setResumeData] = useState<EnhancedResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      github: ''
    },
    professionalSummary: {
      content: '',
      keyHighlights: []
    },
    workExperience: [],
    skills: [],
    education: [],
    certifications: [],
    projects: [],
    languages: [],
    volunteerWork: [],
    awards: [],
    trainings: [],
    tools: { development: [], design: [], analytics: [], productivity: [], other: [] },
    publications: [],
    patents: [],
    openSource: [],
    academicProjects: [],
    researchInterests: { areas: [] },
    speakingEngagements: [],
    portfolioLinks: [],
    references: [],
    sectionConfig: DEFAULT_SECTION_CONFIG
  });

  const [isSaving, setIsSaving] = useState(false);

  // Fetch resume data
  const { data: resume, isLoading } = useQuery({
    queryKey: ['enhanced-resume', resumeId],
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
    enabled: !!resumeId && !!user && mode === 'edit'
  });

  // Load resume data when fetched
  useEffect(() => {
    if (resume?.content && typeof resume.content === 'object') {
      // Merge fetched data with default structure
      const contentData = resume.content as any;
      const loadedData = {
        ...resumeData,
        ...contentData,
        sectionConfig: contentData.sectionConfig || DEFAULT_SECTION_CONFIG
      };
      setResumeData(loadedData);
    }
  }, [resume]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: EnhancedResumeData) => {
      if (!resumeId || !user) throw new Error('Missing required data');
      
      const { error } = await supabase
        .from('ai_resumes')
        .update({ 
          content: data as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-resume', resumeId] });
      toast.success('Resume saved successfully!');
    },
    onError: (error) => {
      console.error('Save failed:', error);
      toast.error('Failed to save resume');
    }
  });

  // Auto-save functionality
  useEffect(() => {
    if (!resumeData.personalInfo.fullName || !resumeId) return;
    
    const timer = setTimeout(() => {
      saveMutation.mutate(resumeData);
    }, 3000);

    return () => clearTimeout(timer);
  }, [resumeData, resumeId]);

  // Manual save
  const handleSave = useCallback(async () => {
    if (!resumeData.personalInfo.fullName.trim()) {
      toast.error('Please add your name before saving');
      return;
    }

    setIsSaving(true);
    try {
      await saveMutation.mutateAsync(resumeData);
    } finally {
      setIsSaving(false);
    }
  }, [resumeData, saveMutation]);

  // Update resume data
  const updateResumeData = useCallback((updates: Partial<EnhancedResumeData>) => {
    setResumeData(prev => ({ ...prev, ...updates }));
  }, []);

  // Get enabled sections in order
  const enabledSections = resumeData.sectionConfig
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const enabledSectionTypes = enabledSections.map(s => s.type);
    let completedSections = 0;

    enabledSectionTypes.forEach(type => {
      switch (type) {
        case 'personalInfo':
          if (resumeData.personalInfo.fullName && resumeData.personalInfo.email) completedSections++;
          break;
        case 'professionalSummary':
          if (resumeData.professionalSummary.content.length > 50) completedSections++;
          break;
        case 'workExperience':
          if (resumeData.workExperience.length > 0) completedSections++;
          break;
        case 'skills':
          if (resumeData.skills?.length > 0) completedSections++;
          break;
        case 'education':
          if (resumeData.education.length > 0) completedSections++;
          break;
        case 'projects':
          if (resumeData.projects.length > 0) completedSections++;
          break;
        default:
          // For other sections, check if they have any content
          const sectionData = resumeData[type as keyof EnhancedResumeData];
          if (Array.isArray(sectionData) && sectionData.length > 0) completedSections++;
          else if (typeof sectionData === 'object' && sectionData && Object.keys(sectionData).length > 0) completedSections++;
      }
    });

    return Math.round((completedSections / enabledSections.length) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Enhanced Resume Builder</h1>
            <p className="text-muted-foreground">
              Create a comprehensive, ATS-optimized resume with 21 customizable sections
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant={completionPercentage >= 80 ? 'default' : completionPercentage >= 50 ? 'secondary' : 'destructive'}
              className="px-3 py-1"
            >
              {completionPercentage}% Complete
            </Badge>
            
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="build" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Build
                </TabsTrigger>
                <TabsTrigger value="manage" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Sections
                </TabsTrigger>
                <TabsTrigger value="enhance" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Enhance
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="build" className="space-y-6">
                {/* Render enabled sections in order */}
                {enabledSections.map((section) => {
                  const metadata = SECTION_METADATA[section.type];
                  
                  switch (section.type) {
                    case 'personalInfo':
                      return (
                        <PersonalInfoSection
                          key={section.id}
                          data={resumeData.personalInfo}
                          onChange={(data) => updateResumeData({ personalInfo: data })}
                        />
                      );
                    
                    case 'professionalSummary':
                      return (
                        <ProfessionalSummarySection
                          key={section.id}
                          data={resumeData.professionalSummary}
                          onChange={(data) => updateResumeData({ professionalSummary: data })}
                        />
                      );
                    
                    case 'workExperience':
                      return (
                        <WorkExperienceSection
                          key={section.id}
                          data={resumeData.workExperience}
                          onChange={(data) => updateResumeData({ workExperience: data })}
                        />
                      );
                    
                    case 'skills':
                      return (
                        <SkillsSection
                          key={section.id}
                          data={resumeData.skills}
                          onChange={(data) => updateResumeData({ skills: data })}
                        />
                      );
                    
                    default:
                      return (
                        <Card key={section.id}>
                          <CardHeader>
                            <CardTitle>{metadata.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">
                              Section editor for {metadata.title} coming soon...
                            </p>
                          </CardContent>
                        </Card>
                      );
                  }
                })}
              </TabsContent>

              <TabsContent value="manage">
                <SectionManager
                  resumeData={resumeData}
                  onUpdateData={updateResumeData}
                  onClose={() => {}}
                />
              </TabsContent>

              <TabsContent value="enhance">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI Enhancement Suite
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      AI-powered enhancement tools coming soon...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardContent className="p-0">
                    <div id="resume-preview-full">
                      <ResumePreview
                        content={resumeData}
                        template={{ css_config: { primaryColor: '#2563eb' } }}
                        fullPage={true}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span>{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300" 
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{enabledSections.length}</div>
                      <div className="text-xs text-muted-foreground">Sections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{resumeData.workExperience.length}</div>
                      <div className="text-xs text-muted-foreground">Experience</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mini Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div 
                    className="transform scale-[0.3] origin-top-left overflow-hidden border rounded"
                    style={{ width: '333%', height: '400px' }}
                  >
                    <ResumePreview
                      content={resumeData}
                      template={{ css_config: { primaryColor: '#2563eb' } }}
                      fullPage={false}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};