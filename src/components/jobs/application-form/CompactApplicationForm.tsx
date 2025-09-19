
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormData, JobInfo, Resume } from './types';
import { validateStep } from './validation';
import ResumeSelectionStep from './ResumeSelectionStep';
import JobRoleStep from './JobRoleStep';
import PersonalDetailsStep from './PersonalDetailsStep';
import DeclarationStep from './DeclarationStep';
import ProgressIndicator from './ProgressIndicator';
import NavigationButtons from './NavigationButtons';

interface CompactApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobInfo;
}

export default function CompactApplicationForm({ open, onOpenChange, job }: CompactApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    resumeSource: 'existing',
    selectedResumeId: '',
    uploadedResume: null,
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
    informationConfirmed: false,
    contactAuthorized: false
  });
  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    if (open) {
      fetchUserData();
      checkExistingApplication();
    }
  }, [open]);

  const checkExistingApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingApplication } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', job.id)
        .single();

      if (existingApplication) {
        setHasApplied(true);
        toast.info('You have already applied to this job');
      }
    } catch (error) {
      console.error('Error checking existing application:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileResult, resumesResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('resumes').select('*').eq('user_id', user.id).eq('is_active', true)
      ]);

      if (profileResult.data) {
        setFormData(prev => ({
          ...prev,
          fullName: profileResult.data.full_name || '',
          email: profileResult.data.email || '',
          phoneNumber: profileResult.data.phone || '',
          location: profileResult.data.location || '',
          linkedinProfile: profileResult.data.linkedin_url || '',
          portfolioWebsite: profileResult.data.portfolio_url || ''
        }));
      }

      if (resumesResult.data) {
        setResumes(resumesResult.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleInputChange = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'coverLetter') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = type === 'resume' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${type === 'resume' ? '5MB' : '2MB'}`);
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload PDF or DOC/DOCX files only');
      return;
    }

    if (type === 'resume') {
      handleInputChange('uploadedResume', file);
    } else {
      handleInputChange('coverLetter', file);
    }
    toast.success(`${type === 'resume' ? 'Resume' : 'Cover letter'} uploaded successfully!`);
  };

  const handleSubmit = async () => {
    if (!formData.informationConfirmed || !formData.contactAuthorized) {
      toast.error('Please confirm the declarations before submitting');
      return;
    }

    if (hasApplied) {
      toast.error('You have already applied to this job');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Double-check for existing application before inserting
      const { data: existingCheck } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', job.id)
        .single();

      if (existingCheck) {
        toast.error('You have already applied to this job');
        setHasApplied(true);
        return;
      }

      let resumeUrl = '';
      if (formData.resumeSource === 'upload' && formData.uploadedResume) {
        resumeUrl = 'uploaded_resume_url';
      } else if (formData.selectedResumeId) {
        const selectedResume = resumes.find(r => r.id === formData.selectedResumeId);
        resumeUrl = selectedResume?.file_url || '';
      }

      const cleanApplicationData = {
        resumeSource: formData.resumeSource,
        selectedResumeId: formData.selectedResumeId,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        preferredCallTime: formData.preferredCallTime,
        location: formData.location,
        currentCTC: formData.currentCTC,
        expectedCTC: formData.expectedCTC,
        noticePeriod: formData.noticePeriod,
        readyToRelocate: formData.readyToRelocate,
        remoteWorkPreference: formData.remoteWorkPreference,
        yearsOfExperience: formData.yearsOfExperience,
        linkedinProfile: formData.linkedinProfile,
        portfolioWebsite: formData.portfolioWebsite,
        informationConfirmed: formData.informationConfirmed,
        contactAuthorized: formData.contactAuthorized,
        uploadedResumeFileName: formData.uploadedResume?.name || null,
        coverLetterFileName: formData.coverLetter?.name || null
      };

      const { error } = await supabase.from('job_applications').insert({
        user_id: user.id,
        job_id: job.id,
        resume_url: resumeUrl,
        status: 'applied',
        application_data: cleanApplicationData
      });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('You have already applied to this job');
          setHasApplied(true);
        } else {
          throw error;
        }
        return;
      }

      toast.success('Application submitted successfully!');
      onOpenChange(false);
      setCurrentStep(1);
    } catch (error: any) {
      console.error('Application submission error:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user has already applied, show a message instead of the form
  if (hasApplied) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-3">
            <DialogTitle className="flex items-center gap-2 text-base">
              {job.companies?.logo_url && (
                <img src={job.companies.logo_url} alt={job.companies.name} className="w-5 h-5 rounded" />
              )}
              Application Status
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Already Applied</h3>
              <p className="text-sm text-gray-600 mt-1">
                You have already submitted an application for this position.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ResumeSelectionStep
            formData={formData}
            onUpdate={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
          />
        );
      case 2:
        return <JobRoleStep job={job} />;
      case 3:
        return (
          <PersonalDetailsStep
            formData={formData}
            onUpdate={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
          />
        );
      case 4:
        return (
          <DeclarationStep
            formData={formData}
            onUpdate={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
            onSubmit={() => {}}
            job={job}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            {job.companies?.logo_url && (
              <img src={job.companies.logo_url} alt={job.companies.name} className="w-5 h-5 rounded" />
            )}
            Apply for {job.title}
          </DialogTitle>
        </DialogHeader>

        <ProgressIndicator currentStep={currentStep} totalSteps={4} />

        {renderStep()}

        <NavigationButtons
          currentStep={currentStep}
          totalSteps={4}
          isSubmitting={isSubmitting}
          canSubmit={formData.informationConfirmed && formData.contactAuthorized}
          canProceedToNext={validateStep(currentStep, formData)}
          onPrevious={() => setCurrentStep(Math.max(1, currentStep - 1))}
          onNext={() => setCurrentStep(Math.min(4, currentStep + 1))}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
