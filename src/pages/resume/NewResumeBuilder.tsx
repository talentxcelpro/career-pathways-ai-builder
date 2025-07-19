
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResumeUploader } from '@/components/resume/ResumeUploader';
import { TemplateSelector } from '@/components/resume/TemplateSelector';
import { ResumeEditor } from '@/components/resume/ResumeEditor';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Resume, ResumeTemplate, ExtractionResult } from '@/types/resume';

const MOCK_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Clean, contemporary design perfect for corporate roles',
    preview: '/api/placeholder/300/400',
    category: 'modern',
    atsOptimized: true
  },
  {
    id: 'classic-traditional',
    name: 'Classic Traditional',
    description: 'Timeless format preferred by traditional industries',
    preview: '/api/placeholder/300/400',
    category: 'classic',
    atsOptimized: true
  },
  {
    id: 'tech-focused',
    name: 'Tech Focused',
    description: 'Optimized for software engineers and tech professionals',
    preview: '/api/placeholder/300/400',
    category: 'technical',
    atsOptimized: true
  }
];

const EMPTY_RESUME: Resume = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: ''
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  selectedTemplate: 'modern-professional'
};

type Step = 'upload' | 'template' | 'edit' | 'preview';

export const NewResumeBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [resume, setResume] = useState<Resume>(EMPTY_RESUME);
  const [isSaving, setIsSaving] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [recommendedTemplate, setRecommendedTemplate] = useState<string>('modern-professional');

  const steps: { id: Step; title: string; description: string }[] = [
    { id: 'upload', title: 'Upload Resume', description: 'Upload your existing resume' },
    { id: 'template', title: 'Choose Template', description: 'Select a professional template' },
    { id: 'edit', title: 'Edit Content', description: 'Review and edit your information' },
    { id: 'preview', title: 'Preview & Save', description: 'Final review and save' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleExtractionComplete = (result: ExtractionResult) => {
    setExtractionResult(result);
    
    if (result.success && result.resume) {
      setResume(result.resume);
      // AI template recommendation based on extracted content
      if (result.resume.experience.some(exp => exp.title.toLowerCase().includes('engineer'))) {
        setRecommendedTemplate('tech-focused');
      } else if (result.resume.experience.length > 10) {
        setRecommendedTemplate('classic-traditional');
      }
      setCurrentStep('template');
    } else {
      toast.error('Failed to extract resume. Please try again or start from scratch.');
      // Allow user to continue with empty resume
      setCurrentStep('template');
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setResume(prev => ({ ...prev, selectedTemplate: templateId }));
    setCurrentStep('edit');
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save your resume');
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: resume.personalInfo.fullName ? `${resume.personalInfo.fullName}'s Resume` : 'Untitled Resume',
          content: resume as any,
          ats_score: 85, // Default ATS score, will be calculated properly later
          template_id: null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Resume saved successfully!');
      navigate(`/resume/edit/${data.id}`);
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save resume. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'upload':
        return extractionResult !== null;
      case 'template':
        return resume.selectedTemplate !== '';
      case 'edit':
        return resume.personalInfo.fullName && resume.personalInfo.email;
      default:
        return true;
    }
  };

  const handleNext = () => {
    const stepOrder: Step[] = ['upload', 'template', 'edit', 'preview'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: Step[] = ['upload', 'template', 'edit', 'preview'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Professional Resume</h1>
          <p className="text-muted-foreground">
            Build a standout resume in minutes with our AI-powered builder
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 font-medium
                  ${currentStepIndex >= index 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background text-muted-foreground border-muted-foreground/30'
                  }
                `}>
                  {index + 1}
                </div>
                <div className="ml-3 flex-1">
                  <p className={`font-medium ${currentStepIndex >= index ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-4 ${currentStepIndex > index ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="max-w-6xl mx-auto mb-8">
          {currentStep === 'upload' && (
            <ResumeUploader onExtractionComplete={handleExtractionComplete} />
          )}

          {currentStep === 'template' && (
            <TemplateSelector
              templates={MOCK_TEMPLATES}
              selectedTemplate={resume.selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              recommendedTemplate={recommendedTemplate}
            />
          )}

          {currentStep === 'edit' && (
            <div className="max-w-4xl mx-auto">
              <ResumeEditor resume={resume} onChange={setResume} />
            </div>
          )}

          {currentStep === 'preview' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Resume Preview</h2>
              <p className="text-muted-foreground mb-8">
                Your resume is ready! Review the final version below.
              </p>
              {/* Preview component would go here */}
              <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                <p className="text-gray-500">Resume preview will be rendered here</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={currentStep === 'upload'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            {currentStep === 'preview' ? (
              <>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Resume'}
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canGoNext()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewResumeBuilder;
