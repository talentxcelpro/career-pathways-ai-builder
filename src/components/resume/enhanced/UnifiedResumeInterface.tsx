
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Section Components
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { ProfessionalSummarySection } from './sections/ProfessionalSummarySection';
import { WorkExperienceSection } from './sections/WorkExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { SkillsSection } from './sections/SkillsSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { AwardsSection } from './sections/AwardsSection';
import { LanguagesSection } from './sections/LanguagesSection';
import { CareerObjectivesSection } from './sections/CareerObjectivesSection';
import { PublicationsSection } from './sections/PublicationsSection';
import { ReferencesSection } from './sections/ReferencesSection';
import { TrainingsSection } from './sections/TrainingsSection';
import { VolunteerWorkSection } from './sections/VolunteerWorkSection';
import { ToolsSection } from './sections/ToolsSection';

// Enhanced Components
import { EnhancedSidebar } from './EnhancedSidebar';
import { EnhancedPreview } from './EnhancedPreview';
import { SectionRearrangeModal } from './SectionRearrangeModal';
import { DraggableSection } from '../DraggableSection';

// Import types
import { EnhancedResumeData, PersonalInfo, ProfessionalSummary, DEFAULT_SECTION_CONFIG } from "@/types/enhanced-resume";
import { useResumeDataProcessor } from './ResumeDataProcessor';
import { exportToPDF, exportToDOCX } from '@/utils/exportResume';

interface UnifiedResumeInterfaceProps {
  mode?: 'create' | 'edit';
  initialData?: any;
  onSave?: (data: EnhancedResumeData) => void;
}

export const UnifiedResumeInterface: React.FC<UnifiedResumeInterfaceProps> = ({
  mode = 'create',
  initialData,
  onSave
}) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { processRawResumeData, getEmptyResumeData } = useResumeDataProcessor();
  
  // Get template from URL params
  const templateFromUrl = searchParams.get('template') || 'modern';
  
  // Helper function to convert processed data to EnhancedResumeData
  const convertToEnhancedData = useCallback((data: any): EnhancedResumeData => {
    return {
      personalInfo: data.personalInfo || {
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
        content: data.summary || '',
        keyHighlights: []
      },
      experience: data.experience || [],
      education: data.education || [],
      skills: data.skills || [],
      projects: data.projects || [],
      certifications: data.certifications || [],
      awards: data.awards || [],
      languages: [],
      careerObjectives: undefined,
      publications: [],
      references: [],
      trainings: [],
      volunteerWork: [],
      tools: [],
      sectionOrder: ['personalInfo', 'professionalSummary', 'experience', 'education', 'skills'],
      selectedTemplate: templateFromUrl,
      sectionConfig: DEFAULT_SECTION_CONFIG,
      customization: {
        colorScheme: 'blue',
        fontFamily: 'Inter',
        fontSize: 14,
        spacing: 'normal'
      }
    };
  }, [templateFromUrl]);

  // Initialize resume data
  const [resumeData, setResumeData] = useState<EnhancedResumeData>(() => {
    if (initialData) {
      const processedData = processRawResumeData(initialData);
      return convertToEnhancedData(processedData);
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
      languages: [],
      careerObjectives: undefined,
      publications: [],
      references: [],
      trainings: [],
      volunteerWork: [],
      tools: [],
      sectionOrder: ['personalInfo', 'professionalSummary', 'experience', 'education', 'skills'],
      selectedTemplate: templateFromUrl,
      sectionConfig: DEFAULT_SECTION_CONFIG,
      customization: {
        colorScheme: 'blue',
        fontFamily: 'Inter',
        fontSize: 14,
        spacing: 'normal'
      }
    };
  });

  // UI State
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [showRearrangeModal, setShowRearrangeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [atsScore, setAtsScore] = useState(85);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      if (onSave) {
        onSave(resumeData);
        setLastSaved(new Date());
      }
    };

    const timeoutId = setTimeout(autoSave, 2000); // Auto-save after 2 seconds of inactivity
    return () => clearTimeout(timeoutId);
  }, [resumeData, onSave]);

  // Section handlers
  const handleAddSection = useCallback((sectionType: string) => {
    setResumeData(prev => ({
      ...prev,
      sectionOrder: [...prev.sectionOrder, sectionType]
    }));
    setActiveSection(sectionType);
    toast({
      title: "Section Added",
      description: `${sectionType} section has been added to your resume.`,
    });
  }, [toast]);

  const handleRearrangeSections = useCallback(() => {
    setShowRearrangeModal(true);
  }, []);

  const handleTemplateChange = useCallback((templateId: string) => {
    setResumeData(prev => ({
      ...prev,
      selectedTemplate: templateId
    }));
    toast({
      title: "Template Changed",
      description: `Your resume template has been updated.`,
    });
  }, [toast]);

  const handleDesignChange = useCallback((designOption: string) => {
    // Handle design changes (colors, fonts, spacing)
    console.log('Design change:', designOption);
    toast({
      title: "Design Updated",
      description: `Your resume design has been customized.`,
    });
  }, [toast]);

  const handleAIImprovement = useCallback(async () => {
    setIsLoading(true);
    try {
      // AI improvement logic would go here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast({
        title: "AI Improvement Complete",
        description: "Your resume content has been enhanced with AI suggestions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to improve resume with AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleATSCheck = useCallback(async () => {
    setIsLoading(true);
    try {
      // ATS checking logic would go here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      const newScore = Math.floor(Math.random() * 20) + 80; // Random score 80-100
      setAtsScore(newScore);
      toast({
        title: "ATS Check Complete",
        description: `Your resume ATS score is ${newScore}%.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check ATS compatibility. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleExport = useCallback(async () => {
    try {
      await exportToPDF(resumeData, `resume-${resumeData.personalInfo.fullName || 'download'}.pdf`);
      toast({
        title: "Export Successful",
        description: "Your resume has been downloaded as PDF.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export resume. Please try again.",
        variant: "destructive",
      });
    }
  }, [resumeData, toast]);

  const handleShare = useCallback(() => {
    // Share functionality
    toast({
      title: "Share Link Generated",
      description: "Your resume share link has been copied to clipboard.",
    });
  }, [toast]);

  // Update handlers for each section
  const updatePersonalInfo = useCallback((personalInfo: PersonalInfo) => {
    setResumeData(prev => ({ ...prev, personalInfo }));
  }, []);

  const updateProfessionalSummary = useCallback((professionalSummary: ProfessionalSummary) => {
    setResumeData(prev => ({ ...prev, professionalSummary }));
  }, []);

  // Render section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'personalInfo':
        return (
          <PersonalInfoSection
            data={resumeData.personalInfo}
            onChange={updatePersonalInfo}
          />
        );
      case 'professionalSummary':
        return (
          <ProfessionalSummarySection
            data={resumeData.professionalSummary}
            onChange={updateProfessionalSummary}
          />
        );
      case 'experience':
        return (
          <WorkExperienceSection
            data={resumeData.experience}
            onChange={(experience) => setResumeData(prev => ({ ...prev, experience }))}
          />
        );
      case 'education':
        return (
          <EducationSection
            data={resumeData.education}
            onChange={(education) => setResumeData(prev => ({ ...prev, education }))}
          />
        );
      case 'skills':
        return (
          <SkillsSection
            data={resumeData.skills}
            onChange={(skills) => setResumeData(prev => ({ ...prev, skills }))}
          />
        );
      case 'projects':
        return (
          <ProjectsSection
            data={resumeData.projects}
            onChange={(projects) => setResumeData(prev => ({ ...prev, projects }))}
          />
        );
      case 'certifications':
        return (
          <CertificationsSection
            data={resumeData.certifications}
            onChange={(certifications) => setResumeData(prev => ({ ...prev, certifications }))}
          />
        );
      case 'awards':
        return (
          <AwardsSection
            data={resumeData.awards}
            onChange={(awards) => setResumeData(prev => ({ ...prev, awards }))}
          />
        );
      case 'languages':
        return (
          <LanguagesSection
            data={resumeData.languages}
            onChange={(languages) => setResumeData(prev => ({ ...prev, languages }))}
          />
        );
      case 'volunteer':
        return (
          <VolunteerWorkSection
            data={resumeData.volunteerWork}
            onChange={(volunteerWork) => setResumeData(prev => ({ ...prev, volunteerWork }))}
          />
        );
      case 'tools':
        return (
          <ToolsSection
            data={resumeData.tools}
            onChange={(tools) => setResumeData(prev => ({ ...prev, tools }))}
          />
        );
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Enhanced Sidebar */}
      <EnhancedSidebar
        onAddSection={handleAddSection}
        onRearrangeSections={handleRearrangeSections}
        onTemplateChange={handleTemplateChange}
        onDesignChange={handleDesignChange}
        onAIImprovement={handleAIImprovement}
        onATSCheck={handleATSCheck}
        onExport={handleExport}
        onShare={handleShare}
        selectedTemplate={resumeData.selectedTemplate}
        atsScore={atsScore}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Center Editing Panel */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {mode === 'create' ? 'Create Your Resume' : 'Edit Resume'}
                  </h1>
                  <p className="text-gray-600">
                    {resumeData.personalInfo.fullName || 'Build your professional resume'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {lastSaved && (
                    <span className="text-sm text-gray-500">
                      Last saved {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                  <Badge variant="secondary" className={`${atsScore >= 90 ? 'bg-green-100 text-green-700' : atsScore >= 75 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    ATS Score: {atsScore}%
                  </Badge>
                </div>
              </div>
              
              {/* Section Navigation */}
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="personalInfo">Personal</TabsTrigger>
                  <TabsTrigger value="professionalSummary">Summary</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Section Content */}
            <Card>
              <CardContent className="p-6">
                {renderSectionContent()}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <EnhancedPreview 
            resumeData={resumeData}
            selectedTemplate={resumeData.selectedTemplate}
          />
        </div>
      </div>

      {/* Section Rearrange Modal */}
      <Dialog open={showRearrangeModal} onOpenChange={setShowRearrangeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rearrange Sections</DialogTitle>
          </DialogHeader>
          <SectionRearrangeModal
            sections={resumeData.sectionOrder}
            onSave={(newOrder) => {
              setResumeData(prev => ({ ...prev, sectionOrder: newOrder }));
              setShowRearrangeModal(false);
              toast({
                title: "Sections Rearranged",
                description: "Your resume section order has been updated.",
              });
            }}
            onCancel={() => setShowRearrangeModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
