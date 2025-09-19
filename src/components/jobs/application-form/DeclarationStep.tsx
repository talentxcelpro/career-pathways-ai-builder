import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Send, FileText, User, Briefcase, CheckCircle, AlertCircle } from "lucide-react";
import { FormData, JobInfo } from './types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/useFileUpload";

interface DeclarationStepProps {
  formData: FormData;
  onUpdate: (data: Partial<FormData>) => void;
  onSubmit: () => void;
  job: JobInfo;
  isMobile?: boolean;
}

const DeclarationStep: React.FC<DeclarationStepProps> = ({
  formData,
  onUpdate,
  onSubmit,
  job,
  isMobile = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadFile } = useFileUpload({
    bucket: 'resumes',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });

  const handleSubmit = async () => {
    if (!formData.informationConfirmed || !formData.contactAuthorized) {
      toast.error('Please confirm all declarations before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check for existing application
      const { data: existingApplication } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', job.id)
        .single();

      if (existingApplication) {
        toast.error('You have already applied to this job');
        return;
      }

      // Upload resume if needed
      let resumeUrl = '';
      if (formData.resumeSource === 'upload' && formData.uploadedResume) {
        resumeUrl = await uploadFile(formData.uploadedResume, undefined, 'resumes');
      } else if (formData.resumeSource === 'existing' && formData.selectedResumeId) {
        // Get existing resume URL
        const { data: resumeData } = await supabase
          .from('ai_resumes')
          .select('file_url')
          .eq('id', formData.selectedResumeId)
          .single();
        
        resumeUrl = resumeData?.file_url || '';
      }

      // Upload cover letter if provided
      let coverLetterUrl = '';
      if (formData.coverLetter) {
        const { uploadFile: uploadCoverLetter } = useFileUpload({
          bucket: 'cover-letters',
          maxSize: 5 * 1024 * 1024,
          allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
        });
        coverLetterUrl = await uploadCoverLetter(formData.coverLetter, undefined, 'cover-letters');
      }

      // Prepare application data
      const applicationData = {
        user_id: user.id,
        job_id: job.id,
        resume_url: resumeUrl,
        cover_letter_url: coverLetterUrl,
        status: 'applied',
        applied_at: new Date().toISOString(),
        application_data: {
          // Personal Information
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          preferredCallTime: formData.preferredCallTime,
          location: formData.location,
          
          // Professional Information
          currentCTC: formData.currentCTC,
          expectedCTC: formData.expectedCTC,
          noticePeriod: formData.noticePeriod,
          readyToRelocate: formData.readyToRelocate,
          remoteWorkPreference: formData.remoteWorkPreference,
          yearsOfExperience: formData.yearsOfExperience,
          
          // Additional Information
          linkedinProfile: formData.linkedinProfile,
          portfolioWebsite: formData.portfolioWebsite,
          
          // Job Information
          jobTitle: job.title,
          companyName: job.companies?.name || job.company_name,
          
          // Metadata
          submittedAt: new Date().toISOString(),
          resumeSource: formData.resumeSource,
          selectedResumeId: formData.selectedResumeId,
          
          // Declarations
          informationConfirmed: formData.informationConfirmed,
          contactAuthorized: formData.contactAuthorized
        }
      };

      // Submit application
      const { error } = await supabase
        .from('job_applications')
        .insert(applicationData);

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already applied to this job');
        } else {
          throw error;
        }
        return;
      }

      // Send notification to job poster
      if (job.posted_by) {
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: job.posted_by,
              type: 'job_application',
              title: 'New Job Application',
              message: `${formData.fullName} applied for ${job.title}`,
              data: {
                job_id: job.id,
                applicant_name: formData.fullName,
                applicant_email: formData.email,
                job_title: job.title
              }
            });
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError);
        }
      }

      toast.success('Application submitted successfully! The employer will be notified.');
      onSubmit();

    } catch (error: any) {
      console.error('Application submission error:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-${isMobile ? '6' : '8'}`}>
      <div className="text-center">
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}>Review & Submit Application</h3>
        <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
          Please review your information and confirm the declarations below.
        </p>
      </div>

      {/* Application Summary */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Application Summary
          </h4>
          
          <div className="space-y-4">
            {/* Job Details */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Position</span>
              </div>
              <div className="ml-6">
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-muted-foreground">
                  at {job.companies?.name || job.company_name}
                </p>
              </div>
            </div>

            <Separator />

            {/* Personal Details */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Personal Information</span>
              </div>
              <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>Name:</strong> {formData.fullName}</div>
                <div><strong>Email:</strong> {formData.email}</div>
                <div><strong>Phone:</strong> {formData.phoneNumber}</div>
                <div><strong>Location:</strong> {formData.location}</div>
              </div>
            </div>

            <Separator />

            {/* Professional Details */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Professional Information</span>
              </div>
              <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {formData.yearsOfExperience && (
                  <div><strong>Experience:</strong> {formData.yearsOfExperience}</div>
                )}
                {formData.currentCTC && (
                  <div><strong>Current CTC:</strong> ₹{formData.currentCTC} LPA</div>
                )}
                {formData.expectedCTC && (
                  <div><strong>Expected CTC:</strong> ₹{formData.expectedCTC} LPA</div>
                )}
                {formData.noticePeriod && (
                  <div><strong>Notice Period:</strong> {formData.noticePeriod.replace('_', ' ')}</div>
                )}
              </div>
            </div>

            {/* Resume & Documents */}
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Documents</span>
              </div>
              <div className="ml-6 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Resume: {
                    formData.resumeSource === 'upload' && formData.uploadedResume
                      ? formData.uploadedResume.name
                      : 'Existing resume selected'
                  }</span>
                </div>
                {formData.coverLetter && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Cover Letter: {formData.coverLetter.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Declarations */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Declarations
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="information-confirmed"
                checked={formData.informationConfirmed}
                onCheckedChange={(checked) => 
                  onUpdate({ informationConfirmed: checked as boolean })
                }
                className="mt-1"
              />
              <div className="space-y-1">
                <label
                  htmlFor="information-confirmed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Information Accuracy
                </label>
                <p className="text-sm text-muted-foreground">
                  I confirm that all the information provided in this application is true, 
                  complete, and accurate to the best of my knowledge. I understand that any 
                  false or misleading information may result in the rejection of my application 
                  or termination of employment if discovered later.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="contact-authorized"
                checked={formData.contactAuthorized}
                onCheckedChange={(checked) => 
                  onUpdate({ contactAuthorized: checked as boolean })
                }
                className="mt-1"
              />
              <div className="space-y-1">
                <label
                  htmlFor="contact-authorized"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Authorization to Contact
                </label>
                <p className="text-sm text-muted-foreground">
                  I authorize the employer to contact me via the phone number and email 
                  address provided. I also consent to the processing of my personal data 
                  for recruitment purposes in accordance with applicable data protection laws.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={
            isSubmitting || 
            !formData.informationConfirmed || 
            !formData.contactAuthorized
          }
          size="lg"
          className={isMobile ? "w-full touch-target" : "min-w-[200px]"}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Application
            </>
          )}
        </Button>
      </div>

      {/* Privacy Notice */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Privacy & Data Protection</p>
            <p className="text-muted-foreground">
              Your personal information will be processed in accordance with our Privacy Policy. 
              We will only use your data for recruitment purposes and will not share it with 
              third parties without your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeclarationStep;