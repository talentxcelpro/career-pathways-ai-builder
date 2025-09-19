import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ArrowRight, ArrowLeft, User, Briefcase, FileText, Shield } from "lucide-react";
import { FormData, JobInfo, Resume } from './types';
import ResumeSelectionStep from './ResumeSelectionStep';
import PersonalDetailsStep from './PersonalDetailsStep';
import DeclarationStep from './DeclarationStep';

interface ApplicationFormWizardProps {
  job: JobInfo;
  onComplete?: (data: FormData) => void;
  onCancel?: () => void;
  isMobile?: boolean;
}

export const ApplicationFormWizard: React.FC<ApplicationFormWizardProps> = ({ 
  job, 
  onComplete, 
  onCancel,
  isMobile = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    // Step 1: Resume Selection
    resumeSource: 'existing',
    selectedResumeId: '',
    uploadedResume: null,
    
    // Step 3: Personal & Professional Details
    fullName: '',
    email: '',
    phoneNumber: '',
    preferredCallTime: '',
    location: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '',
    readyToRelocate: '',
    remoteWorkPreference: '',
    yearsOfExperience: '',
    linkedinProfile: '',
    portfolioWebsite: '',
    coverLetter: null,
    
    // Step 4: Declaration
    informationConfirmed: false,
    contactAuthorized: false,
  });

  const steps = [
    { 
      id: 'resume', 
      title: 'Resume', 
      description: 'Select or upload your resume',
      icon: FileText 
    },
    { 
      id: 'role', 
      title: 'Job Role', 
      description: 'Review position details',
      icon: Briefcase 
    },
    { 
      id: 'details', 
      title: 'Personal Details', 
      description: 'Provide your information',
      icon: User 
    },
    { 
      id: 'declaration', 
      title: 'Declaration', 
      description: 'Confirm and submit',
      icon: Shield 
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

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

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleComplete = () => {
    onComplete?.(formData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Resume step
        return formData.resumeSource === 'existing' 
          ? !!formData.selectedResumeId 
          : !!formData.uploadedResume;
      case 1: // Job role step (always can proceed)
        return true;
      case 2: // Personal details step
        return !!(formData.fullName && formData.email && formData.phoneNumber);
      case 3: // Declaration step
        return formData.informationConfirmed && formData.contactAuthorized;
      default:
        return false;
    }
  };

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5 mobile-optimized">
        {/* Mobile Progress Header */}
        <div className="flex-shrink-0 px-4 py-3 safe-top">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-8 h-1 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {currentStep + 1}/{steps.length}
            </span>
          </div>
          
          <div className="text-center">
            <h1 className="text-lg font-bold text-foreground mb-1 line-clamp-2">
              {job.title}
            </h1>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              at {job.companies?.name || job.company_name}
            </p>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                {steps[currentStep].title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Step Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              {currentStep === 0 && (
                <ResumeSelectionStep
                  formData={formData}
                  onUpdate={updateFormData}
                  isMobile={true}
                />
              )}
              
              {currentStep === 1 && (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {job.companies?.name || job.company_name}
                    </p>
                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Required Skills:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {job.skills_required.slice(0, 6).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills_required.length > 6 && (
                            <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded-full text-xs">
                              +{job.skills_required.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Review the details and proceed to provide your information.
                  </p>
                </div>
              )}
              
              {currentStep === 2 && (
                <PersonalDetailsStep
                  formData={formData}
                  onUpdate={updateFormData}
                  isMobile={true}
                />
              )}
              
              {currentStep === 3 && (
                <DeclarationStep
                  formData={formData}
                  onUpdate={updateFormData}
                  onSubmit={handleComplete}
                  job={job}
                  isMobile={true}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mobile Navigation */}
        <div className="flex-shrink-0 p-4 safe-bottom bg-background/95 backdrop-blur-sm border-t">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onCancel : handleBack}
              className="flex-1 touch-target"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button
              onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
              disabled={!canProceed()}
              className="flex-1 touch-target"
              size="lg"
            >
              {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      index < currentStep
                        ? 'bg-primary border-primary text-primary-foreground'
                        : index === currentStep
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-muted text-muted-foreground'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-20 h-0.5 mx-3 transition-colors ${
                        index < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Apply for {job.title}
            </h1>
            <p className="text-muted-foreground mb-4">
              at {job.companies?.name || job.company_name}
            </p>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {steps[currentStep].title}
              </h2>
              <p className="text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>
            <Progress value={progress} className="w-full max-w-md mx-auto mt-4" />
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {currentStep === 0 && (
              <ResumeSelectionStep
                formData={formData}
                onUpdate={updateFormData}
              />
            )}
            
            {currentStep === 1 && (
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{job.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {job.companies?.name || job.company_name}
                  </p>
                  {job.skills_required && job.skills_required.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium">Required Skills:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {job.skills_required.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Please review the job details above and proceed to provide your information.
                </p>
              </div>
            )}
            
            {currentStep === 2 && (
              <PersonalDetailsStep
                formData={formData}
                onUpdate={updateFormData}
              />
            )}
            
            {currentStep === 3 && (
              <DeclarationStep
                formData={formData}
                onUpdate={updateFormData}
                onSubmit={handleComplete}
                job={job}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handleBack}
            className="min-w-[120px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
            disabled={!canProceed()}
            className="min-w-[120px]"
          >
            {currentStep === steps.length - 1 ? 'Submit Application' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Privacy Notice */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Your data is protected and secure. We never share your information without consent.</p>
        </div>
      </div>
    </div>
  );
};