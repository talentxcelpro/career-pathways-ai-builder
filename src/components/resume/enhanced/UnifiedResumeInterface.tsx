
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  User, FileText, Briefcase, GraduationCap, Code, 
  FolderOpen, Award, Trophy, Eye, Download, Save,
  Palette, Zap, BarChart3, Settings, ChevronLeft,
  ChevronRight, Layout, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Import all section components
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { ProfessionalSummarySection } from './sections/ProfessionalSummarySection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { SkillsSection } from './sections/SkillsSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { AwardsSection } from './sections/AwardsSection';
import { ResumeHeader } from './ResumeHeader';
import { LivePreviewRenderer } from '../upload/LivePreviewRenderer';
import { DraggableSection } from '../DraggableSection';

// Import types
import { EnhancedResumeData, PersonalInfo, ProfessionalSummary } from "@/types/enhanced-resume";
import { useResumeDataProcessor } from './ResumeDataProcessor';
import { exportToPDF, exportToDOCX } from '@/utils/exportResume';

interface UnifiedResumeInterfaceProps {
  mode: 'edit' | 'create';
  initialData?: any;
}

export const UnifiedResumeInterface: React.FC<UnifiedResumeInterfaceProps> = ({
  mode,
  initialData
}) => {
  const { processRawResumeData, getEmptyResumeData } = useResumeDataProcessor();
  
  // Initialize resume data
  const [resumeData, setResumeData] = useState<EnhancedResumeData>(() => {
    if (initialData) {
      return processRawResumeData(initialData);
    }
    return {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        linkedin: '',
        website: '',
        github: ''
      },
      professionalSummary: {
        content: '',
        keyHighlights: []
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      awards: [],
      sectionOrder: [
        'personalInfo',
        'professionalSummary', 
        'experience',
        'education',
        'skills',
        'projects',
        'certifications',
        'awards'
      ],
      selectedTemplate: 'modern',
      customization: {
        colorScheme: 'blue',
        fontFamily: 'Inter',
        fontSize: 14,
        spacing: 'normal'
      }
    };
  });

  // Auto-save functionality
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [previewCollapsed, setPreviewCollapsed] = useState(false);

  // Auto-save every 5 seconds if there are changes
  useEffect(() => {
    if (!hasChanges) return;

    const autoSaveTimer = setTimeout(async () => {
      await handleSave();
    }, 5000);

    return () => clearTimeout(autoSaveTimer);
  }, [resumeData, hasChanges]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Simulate save operation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastSaved(new Date());
      setHasChanges(false);
      toast.success('Resume saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  }, [resumeData]);

  const updateResumeData = useCallback((section: string, data: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
    setHasChanges(true);
  }, []);

  const handleExportPDF = useCallback(async () => {
    try {
      await exportToPDF('resume-preview', `${resumeData.personalInfo.fullName || 'resume'}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF');
    }
  }, [resumeData.personalInfo.fullName]);

  const handleExportDOCX = useCallback(async () => {
    try {
      await exportToDOCX(resumeData, `${resumeData.personalInfo.fullName || 'resume'}.docx`);
    } catch (error) {
      console.error('DOCX export failed:', error);
      toast.error('Failed to export DOCX');
    }
  }, [resumeData]);

  const calculateCompletionPercentage = useCallback(() => {
    let completed = 0;
    let total = 8;

    // Personal Info (required)
    if (resumeData.personalInfo.fullName && resumeData.personalInfo.email) completed++;
    
    // Professional Summary
    if (resumeData.professionalSummary.content) completed++;
    
    // Experience
    if (resumeData.experience.length > 0) completed++;
    
    // Education  
    if (resumeData.education.length > 0) completed++;
    
    // Skills
    if (resumeData.skills.length > 0) completed++;
    
    // Projects (optional but counts)
    if (resumeData.projects.length > 0) completed++;
    
    // Certifications (optional)
    if (resumeData.certifications.length > 0) completed++;
    
    // Awards (optional)
    if (resumeData.awards.length > 0) completed++;

    return Math.round((completed / total) * 100);
  }, [resumeData]);

  const sectionComponents = {
    personalInfo: (
      <PersonalInfoSection
        data={resumeData.personalInfo}
        onChange={(data) => updateResumeData('personalInfo', data)}
      />
    ),
    professionalSummary: (
      <ProfessionalSummarySection
        data={resumeData.professionalSummary}
        onChange={(data) => updateResumeData('professionalSummary', data)}
      />
    ),
    experience: (
      <ExperienceSection
        data={resumeData.experience}
        onChange={(data) => updateResumeData('experience', data)}
      />
    ),
    education: (
      <EducationSection
        data={resumeData.education}
        onChange={(data) => updateResumeData('education', data)}
      />
    ),
    skills: (
      <SkillsSection
        data={resumeData.skills}
        onChange={(data) => updateResumeData('skills', data)}
      />
    ),
    projects: (
      <ProjectsSection
        data={resumeData.projects}
        onChange={(data) => updateResumeData('projects', data)}
      />
    ),
    certifications: (
      <CertificationsSection
        data={resumeData.certifications}
        onChange={(data) => updateResumeData('certifications', data)}
      />
    ),
    awards: (
      <AwardsSection
        data={resumeData.awards}
        onChange={(data) => updateResumeData('awards', data)}
      />
    ),
  };

  const sectionItems = [
    { id: 'personalInfo', label: 'Personal Info', icon: User, required: true },
    { id: 'professionalSummary', label: 'Professional Summary', icon: FileText, required: false },
    { id: 'experience', label: 'Experience', icon: Briefcase, required: false },
    { id: 'education', label: 'Education', icon: GraduationCap, required: false },
    { id: 'skills', label: 'Skills', icon: Code, required: false },
    { id: 'projects', label: 'Projects', icon: FolderOpen, required: false },
    { id: 'certifications', label: 'Certifications', icon: Award, required: false },
    { id: 'awards', label: 'Awards', icon: Trophy, required: false },
  ];

  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="min-h-screen bg-gray-50/30">
      <ResumeHeader
        mode={mode}
        isSaving={isSaving}
        lastSaved={lastSaved}
        hasChanges={hasChanges}
        onSave={handleSave}
        resumeData={resumeData}
        onEnhancementApplied={(enhancedData) => {
          setResumeData(prev => ({ ...prev, ...enhancedData }));
          setHasChanges(true);
        }}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 relative">
          {/* Left Sidebar - Section Navigation */}
          <div className="w-80 space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Resume Sections</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {completionPercentage}% Complete
                </Badge>
              </div>
              
              <div className="space-y-2">
                {sectionItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  const hasData = (() => {
                    switch (item.id) {
                      case 'personalInfo':
                        return resumeData.personalInfo.fullName || resumeData.personalInfo.email;
                      case 'professionalSummary':
                        return resumeData.professionalSummary.content;
                      case 'experience':
                        return resumeData.experience.length > 0;
                      case 'education':
                        return resumeData.education.length > 0;
                      case 'skills':
                        return resumeData.skills.length > 0;
                      case 'projects':
                        return resumeData.projects.length > 0;
                      case 'certifications':
                        return resumeData.certifications.length > 0;
                      case 'awards':
                        return resumeData.awards.length > 0;
                      default:
                        return false;
                    }
                  })();

                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full justify-start gap-3 h-12",
                        isActive && "bg-primary text-primary-foreground",
                        !isActive && "hover:bg-slate-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                      {hasData && !isActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  className="w-full justify-start gap-3"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
                <Button
                  onClick={handleExportDOCX}
                  variant="outline"
                  className="w-full justify-start gap-3"
                >
                  <Download className="h-4 w-4" />
                  Export DOCX
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Enhance
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className={cn(
            "transition-all duration-300",
            previewCollapsed ? "flex-1" : "flex-1 max-w-2xl"
          )}>
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="pr-4">
                {sectionComponents[activeSection as keyof typeof sectionComponents]}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Live Preview */}
          <div className={cn(
            "transition-all duration-300 bg-white rounded-lg border shadow-sm",
            previewCollapsed ? "w-12" : "w-96"
          )}>
            <div className="flex items-center justify-between p-3 border-b">
              {!previewCollapsed && (
                <>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium text-sm">Live Preview</span>
                  </div>
                  <Button
                    onClick={() => setPreviewCollapsed(true)}
                    size="sm"
                    variant="ghost"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              {previewCollapsed && (
                <Button
                  onClick={() => setPreviewCollapsed(false)}
                  size="sm"
                  variant="ghost"
                  className="w-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {!previewCollapsed && (
              <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="p-4" id="resume-preview">
                  <LivePreviewRenderer previewData={resumeData} />
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
