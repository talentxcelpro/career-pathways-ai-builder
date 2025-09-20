
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
import { useEmailAutomation } from '@/hooks/useEmailAutomation';
import { ScrapedJobSuccessModal } from './application-form/ScrapedJobSuccessModal';
import { useCreateJobApplication } from '@/hooks/useJobApplications';

interface ComprehensiveJobApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobInfo;
}

export default function ComprehensiveJobApplicationForm({ open, onOpenChange, job }: ComprehensiveJobApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showScrapedJobSuccess, setShowScrapedJobSuccess] = useState(false);
  const { triggerApplicationConfirmationEmail } = useEmailAutomation();
  const createApplication = useCreateJobApplication();
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

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch resumes from both tables
      const [resumesData, aiResumesData] = await Promise.all([
        supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('is_primary', { ascending: false }),
        supabase
          .from('ai_resumes')
          .select('id, title, created_at, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
      ]);

      const allResumes = [];
      if (resumesData?.data) {
        allResumes.push(...resumesData.data);
      }
      if (aiResumesData?.data) {
        allResumes.push(...aiResumesData.data.map(resume => ({
          ...resume,
          file_url: `/resume/${resume.id}`, // Generated resume URL
          is_primary: false,
          is_active: true
        })));
      }

      setResumes(allResumes);

      // Auto-select first resume if available and none selected
      if (allResumes.length > 0 && !formData.selectedResumeId) {
        setFormData(prev => ({ 
          ...prev, 
          selectedResumeId: allResumes[0].id,
          resumeSource: 'existing'
        }));
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'coverLetter') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const error = validateFileUpload(file, 2 * 1024 * 1024, allowedTypes);
    
    if (error) {
      toast.error(error);
      return;
    }

    if (type === 'coverLetter') {
      setFormData(prev => ({ ...prev, coverLetter: file }));
      toast.success('Cover letter uploaded successfully!');
    }
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
    // Validate resume requirement first
    const hasResume = formData.resumeSource === 'existing' 
      ? !!formData.selectedResumeId && resumes.length > 0
      : !!formData.uploadedResume;

    if (!hasResume) {
      toast.error('Resume is required to apply. Please upload or select a resume.');
      setCurrentStep(1); // Go back to resume step
      return;
    }

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

        // Also save to user's resume library for future use
        try {
          await supabase
            .from('resumes')
            .insert({
              user_id: user.id,
              title: `Resume for ${job.title}`,
              file_url: publicUrl,
              file_name: formData.uploadedResume.name,
              file_size: formData.uploadedResume.size,
              file_type: formData.uploadedResume.type,
              is_active: true,
              is_primary: resumes.length === 0 // Make primary if it's the first resume
            });
        } catch (saveError) {
          console.error('Failed to save resume to library:', saveError);
          // Don't fail the application, just log the error
        }
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

      // Submit to enhanced_job_applications table for better data structure
      const enhancedApplicationData = {
        user_id: user.id,
        job_id: job.id,
        resume_url: resumeUrl,
        cover_letter_url: coverLetterUrl,
        status: 'applied',
        applied_at: new Date().toISOString(),
        current_role: formData.yearsOfExperience ? `${formData.yearsOfExperience} years experience` : 'Professional',
        current_ctc: parseFloat(formData.currentCTC) || null,
        expected_ctc: parseFloat(formData.expectedCTC) || null,
        notice_period: formData.noticePeriod,
        preferred_location: formData.location,
        additional_files: [],
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

      // Use the TXC-enabled application hook instead of direct insertion
      const applicationResult = await createApplication.mutateAsync({
        job_id: job.id,
        bot_id: job.posted_by,
        resume_url: resumeUrl,
        redirect_url: job.external_url,
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
      });

      // Also add to unified_candidates for CV database
      try {
        await supabase
          .from('unified_candidates')
          .upsert({
            id: user.id,
            name: formData.fullName,
            email: formData.email,
            phone: formData.phoneNumber,
            location: formData.location,
            title: formData.yearsOfExperience ? `${formData.yearsOfExperience} years experience` : 'Professional',
            resume_url: resumeUrl,
            source: 'application',
            skills: [],
            experience_years: parseInt(formData.yearsOfExperience) || 0,
            application_data: applicationData.application_data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });
      } catch (unifiedError) {
        console.error('Failed to add to unified candidates:', unifiedError);
        // Don't fail the application for this
      }

      
      // Application was successful - the hook already shows the success toast with TXC earning
      setHasApplied(true);
      
      // Check if this is a scraped job (has is_scraped flag or external_url)
      const isScrapedJob = (job.external_url && job.external_url.trim() !== '');
      
      if (isScrapedJob) {
        // Show scraped job success modal instead of regular toast
        setShowScrapedJobSuccess(true);
      } else {
        onOpenChange(false);
      }
      
      // Trigger application confirmation email
      try {
        await triggerApplicationConfirmationEmail(
          formData.email,
          formData.fullName,
          job.title,
          job.companies?.name || job.company_name || 'the company'
        );
      } catch (emailError) {
        console.error('Failed to send application confirmation email:', emailError);
        // Don't show error to user as application was successful
      }
      
      if (!isScrapedJob) {
        setCurrentStep(1);
      }
      
    } catch (error: any) {
      console.error('Application submission error:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user has already applied, show a message instead of the form
  if (hasApplied) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-6">
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
                <span>Application Status</span>
                {job.companies?.name && (
                  <p className="text-sm text-gray-600 font-normal">for {job.title}</p>
                )}
              </div>
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
            onFileUpload={handleFileUpload}
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

  const canProceedToNext = () => validateStep(currentStep, formData, resumes);

  const handleScrapedJobSuccessClose = (isOpen: boolean) => {
    setShowScrapedJobSuccess(isOpen);
    if (!isOpen) {
      onOpenChange(false);
      setCurrentStep(1);
    }
  };

  return (
    <>
      <ScrapedJobSuccessModal 
        open={showScrapedJobSuccess}
        onOpenChange={handleScrapedJobSuccessClose}
        job={job}
      />
      
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
    </>
  );
}
