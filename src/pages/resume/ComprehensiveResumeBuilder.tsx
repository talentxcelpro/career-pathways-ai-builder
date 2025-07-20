import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TemplateSelector } from '@/components/resume/templates/TemplateSelector';
import { PersonalInfoSection } from '@/components/resume/sections/PersonalInfoSection';
import { ExperienceSection } from '@/components/resume/sections/ExperienceSection';
import { EducationSection } from '@/components/resume/sections/EducationSection';
import { SkillsSection } from '@/components/resume/sections/SkillsSection';
import { AutoSaveIndicator } from '@/components/resume/AutoSaveIndicator';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAdvancedAIFeatures } from '@/hooks/useAdvancedAIFeatures';
import { ATSScoreCard } from '@/components/resume/enhanced/ATSScoreCard';
import { EnhancedResumeData, PersonalInfo, Experience, Education, Skill } from '@/types/enhanced-resume';
import { ArrowLeft, ArrowRight, Download, Eye, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const ComprehensiveResumeBuilder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState<EnhancedResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    } as PersonalInfo,
    professionalSummary: { content: '', keyHighlights: [] },
    experience: [] as Experience[],
    education: [] as Education[],
    skills: [] as Skill[],
    projects: [],
    certifications: [],
    awards: [],
    sectionOrder: ['personalInfo', 'professionalSummary', 'experience', 'education', 'skills'],
    selectedTemplate: 'modern-tech',
    customization: {
      colorScheme: 'blue',
      fontFamily: 'Inter',
      fontSize: 14,
      spacing: 'normal'
    }
  });

  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const { performAdvancedATSAnalysis, isAnalyzing } = useAdvancedAIFeatures();

  const steps = [
    { id: 'template', title: 'Choose Template', description: 'Select a professional template' },
    { id: 'personal', title: 'Personal Info', description: 'Add your contact information' },
    { id: 'experience', title: 'Experience', description: 'Add your work history' },
    { id: 'education', title: 'Education', description: 'Add your educational background' },
    { id: 'skills', title: 'Skills', description: 'List your key skills' },
    { id: 'review', title: 'Review & Download', description: 'Preview and export your resume' }
  ];

  const calculateProgress = () => {
    const totalSteps = steps.length;
    return Math.round(((currentStep + 1) / totalSteps) * 100);
  };

  const saveResume = async (data: EnhancedResumeData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Resume saved:', data);
  };

  const { saveStatus, lastSaved } = useAutoSave({
    data: resumeData,
    onSave: saveResume,
    delay: 30000
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setResumeData(prev => ({
      ...prev,
      selectedTemplate: templateId
    }));
  };

  const handleTemplatePreview = (templateId: string) => {
    console.log('Preview template:', templateId);
    toast.info('Template preview feature coming soon!');
  };

  const performATSAnalysis = async () => {
    try {
      const analysis = await performAdvancedATSAnalysis(resumeData);
      setAtsAnalysis(analysis);
    } catch (error) {
      console.error('ATS analysis failed:', error);
      toast.error('Failed to analyze resume for ATS compatibility');
    }
  };

  useEffect(() => {
    if (currentStep === steps.length - 1 && resumeData.experience.length > 0) {
      performATSAnalysis();
    }
  }, [currentStep, resumeData]);

  const handleDownload = () => {
    toast.success('Resume download started!');
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'template':
        return (
          <TemplateSelector
            selectedTemplate={resumeData.selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
            onPreview={handleTemplatePreview}
          />
        );
      
      case 'personal':
        return (
          <PersonalInfoSection
            data={resumeData.personalInfo}
            onChange={(data) => setResumeData(prev => ({ ...prev, personalInfo: data }))}
          />
        );
      
      case 'experience':
        return (
          <ExperienceSection
            data={resumeData.experience}
            onChange={(data) => setResumeData(prev => ({ ...prev, experience: data }))}
          />
        );
      
      case 'education':
        return (
          <EducationSection
            data={resumeData.education}
            onChange={(data) => setResumeData(prev => ({ ...prev, education: data }))}
          />
        );
      
      case 'skills':
        return (
          <SkillsSection
            data={resumeData.skills}
            onChange={(data) => setResumeData(prev => ({ ...prev, skills: data }))}
          />
        );
      
      case 'review':
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Resume Preview</h3>
                <div className="bg-muted aspect-[8.5/11] rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Resume preview will appear here</p>
                </div>
              </CardContent>
            </Card>
            
            {atsAnalysis && (
              <ATSScoreCard
                score={atsAnalysis.overallScore}
                overallScore={atsAnalysis.overallScore}
                suggestions={atsAnalysis.suggestions || []}
                onOptimize={performATSAnalysis}
                isOptimizing={isAnalyzing}
              />
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/resume')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Resume Builder</h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                {currentStep === steps.length - 1 && (
                  <Button onClick={handleDownload} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{calculateProgress()}% Complete</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {renderStepContent()}
          
          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveResumeBuilder;
