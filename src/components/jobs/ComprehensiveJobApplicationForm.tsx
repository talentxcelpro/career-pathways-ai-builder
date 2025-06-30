
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ResumeSelectionStep from './application-form/ResumeSelectionStep';
import JobRoleStep from './application-form/JobRoleStep';
import PersonalDetailsStep from './application-form/PersonalDetailsStep';
import DeclarationStep from './application-form/DeclarationStep';
import { FormData, JobInfo, Resume } from './application-form/types';
import { validateStep, validateFileUpload } from './application-form/validation';

interface ComprehensiveJobApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobInfo;
}

export default function ComprehensiveJobApplicationForm({ open, onOpenChange, job }: ComprehensiveJobApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    if (open) {
      fetchUserData();
    }
  }, [open]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch resumes
      const { data: resumesData } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (resumesData) {
        setResumes(resumesData);
      }

      // Pre-fill form with profile data
      if (profile) {
        setFormData(prev => ({
          ...prev,
          fullName: profile.full_name || '',
          email: profile.email || '',
          phoneNumber: profile.phone || '',
          location: profile.location || '',
          linkedinProfile: profile.linkedin_url || '',
          portfolioWebsite: profile.portfolio_url || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const error = validateFileUpload(file, 5 * 1024 * 1024, allowedTypes);
    
    if (error) {
      toast.error(error);
      return;
    }

    setFormData(prev => ({ ...prev, uploadedResume: file }));
    toast.success('Resume uploaded successfully!');
  };

  const handleCoverLetterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const error = validateFileUpload(file, 2 * 1024 * 1024, allowedTypes);
    
    if (error) {
      toast.error(error);
      return;
    }

    setFormData(prev => ({ ...prev, coverLetter: file }));
    toast.success('Cover letter uploaded successfully!');
  };

  const handleInputChange = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.informationConfirmed || !formData.contactAuthorized) {
      toast.error('Please confirm the declarations before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload resume if new one was provided
      let resumeUrl = '';
      if (formData.resumeSource === 'upload' && formData.uploadedResume) {
        const fileName = `${user.id}/${job.id}/${Date.now()}_${formData.uploadedResume.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, formData.uploadedResume);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        
        resumeUrl = publicUrl;
      } else if (formData.resumeSource === 'existing' && formData.selectedResumeId) {
        const selectedResume = resumes.find(r => r.id === formData.selectedResumeId);
        resumeUrl = selectedResume?.file_url || '';
      }

      // Upload cover letter if provided
      let coverLetterUrl = '';
      if (formData.coverLetter) {
        const fileName = `${user.id}/${job.id}/cover_letter_${Date.now()}_${formData.coverLetter.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, formData.coverLetter);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        
        coverLetterUrl = publicUrl;
      }

      // Submit comprehensive application
      const applicationData = {
        user_id: user.id,
        job_id: job.id,
        resume_url: resumeUrl,
        cover_letter: coverLetterUrl ? 'Uploaded separately' : null,
        status: 'applied',
        applied_at: new Date().toISOString(),
        application_data: {
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
          coverLetterUrl: coverLetterUrl
        }
      };

      const { error } = await supabase
        .from('job_applications')
        .insert(applicationData);

      if (error) throw error;

      toast.success('Application submitted successfully!');
      onOpenChange(false);
      setCurrentStep(1);
      
    } catch (error: any) {
      console.error('Application submission error:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ResumeSelectionStep
            formData={formData}
            resumes={resumes}
            onInputChange={handleInputChange}
            onResumeUpload={handleResumeUpload}
          />
        );
      case 2:
        return <JobRoleStep job={job} />;
      case 3:
        return (
          <PersonalDetailsStep
            formData={formData}
            onInputChange={handleInputChange}
            onCoverLetterUpload={handleCoverLetterUpload}
          />
        );
      case 4:
        return (
          <DeclarationStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      default:
        return null;
    }
  };

  const canProceedToNext = () => validateStep(currentStep, formData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {job.companies?.logo_url && (
              <img 
                src={job.companies.logo_url} 
                alt={job.companies.name}
                className="w-8 h-8 rounded"
              />
            )}
            <div>
              <span>Apply for {job.title}</span>
              {job.companies?.name && (
                <p className="text-sm text-gray-600 font-normal">at {job.companies.name}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-12 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <div className="flex space-x-3">
            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceedToNext()}
              >
                Next
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => toast.success('Draft saved!')}
                >
                  Save as Draft
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceedToNext()}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
