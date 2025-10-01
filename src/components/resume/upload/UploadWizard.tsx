
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ArrowRight, ArrowLeft, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast, toast } from "@/hooks/use-toast";
import { WelcomeStep } from './WelcomeStep';
import { FileUploadStep } from './FileUploadStep';
import { TemplateSelectionStep } from './TemplateSelectionStep';
import { ProcessingStep } from './ProcessingStep';
import { SuccessStep } from './SuccessStep';

interface UploadWizardProps {
  onComplete?: (data: any) => void;
}

export const UploadWizard: React.FC<UploadWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [resumeData, setResumeData] = useState<any>(null);
  const navigate = useNavigate();

  const steps = [
    { id: 'welcome', title: 'Welcome', component: WelcomeStep },
    { id: 'upload', title: 'Upload', component: FileUploadStep },
    { id: 'template', title: 'Template', component: TemplateSelectionStep },
    { id: 'processing', title: 'Processing', component: ProcessingStep },
    { id: 'success', title: 'Complete', component: SuccessStep }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    handleNext();
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    handleNext();
  };

  const handleProcessingComplete = async (data: any) => {
    const content = (data && (data as any).enhancedContent) ? (data as any).enhancedContent : data;
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) {
        const title = content?.personalInfo?.fullName
          ? `${content.personalInfo.fullName}'s Resume`
          : 'My Resume';

        const { data: inserted, error } = await supabase
          .from('ai_resumes')
          .insert({
            user_id: auth.user.id,
            title,
            content: content,
            is_primary: false,
            ats_score: typeof (data as any)?.enhancementScore?.atsCompatibility === 'number'
              ? Math.round((data as any).enhancementScore.atsCompatibility)
              : 0,
          })
          .select('id')
          .single();

        if (error) throw error;
        const newId = (inserted as any)?.id as string | undefined;
        if (newId) {
          toast({ title: 'Resume ready', description: 'Opening advanced editor...' });
          navigate(`/resume/build/${newId}`);
          return;
        }
      } else {
        toast({ title: 'Start editing', description: 'Sign in to save your work.' });
        navigate('/resume/build', { state: { resumeData: content } });
        return;
      }
    } catch (e) {
      console.error('Auto-save failed:', e);
      toast({ title: 'Saved locally', description: 'Auto-save failed, continuing...' });
      setResumeData(content);
      handleNext();
    }
  };

  const handleComplete = () => {
    onComplete?.(resumeData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index < currentStep
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === currentStep
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h1>
            <Progress value={progress} className="w-full max-w-md mx-auto" />
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {currentStep === 0 && (
              <WelcomeStep
                onNext={handleNext}
                canGoNext={true}
              />
            )}
            {currentStep === 1 && (
              <FileUploadStep
                onNext={handleNext}
                onBack={handleBack}
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                canGoBack={currentStep > 0}
                canGoNext={!!uploadedFile}
              />
            )}
            {currentStep === 2 && (
              <TemplateSelectionStep
                onNext={handleNext}
                onBack={handleBack}
                onTemplateSelect={handleTemplateSelect}
                selectedTemplate={selectedTemplate}
                canGoBack={currentStep > 0}
                canGoNext={!!selectedTemplate}
              />
            )}
            {currentStep === 3 && (
              <ProcessingStep
                onProcessingComplete={handleProcessingComplete}
                uploadedFile={uploadedFile}
                selectedTemplate={selectedTemplate}
              />
            )}
            {currentStep === 4 && (
              <SuccessStep
                onComplete={handleComplete}
                resumeData={resumeData}
              />
            )}
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Your data is protected and secure. We never share your information.</p>
        </div>
      </div>
    </div>
  );
};
