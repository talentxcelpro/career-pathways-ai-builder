import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Send, FileText, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/useFileUpload";
import { incrementJobApplications } from "@/utils/supabaseHelpers";

interface SimpleJobApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: string;
    title: string;
    company_name?: string;
    companies?: {
      name: string;
      logo_url?: string;
    } | null;
    posted_by?: string;
  };
}

interface ApplicationData {
  fullName: string;
  email: string;
  phoneNumber: string;
  currentSalary: string;
  expectedSalary: string;
  location: string;
  noticePeriod: string;
  resumeFile: File | null;
  coverLetter: string;
}

export default function SimpleJobApplicationDialog({ open, onOpenChange, job }: SimpleJobApplicationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'resumes',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });

  const [formData, setFormData] = useState<ApplicationData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    currentSalary: '',
    expectedSalary: '',
    location: '',
    noticePeriod: '',
    resumeFile: null,
    coverLetter: ''
  });

  useEffect(() => {
    if (open) {
      fetchUserData();
      checkExistingApplication();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      currentSalary: '',
      expectedSalary: '',
      location: '',
      noticePeriod: '',
      resumeFile: null,
      coverLetter: ''
    });
  };

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          fullName: profile.full_name || '',
          email: profile.email || user.email || '',
          phoneNumber: profile.phone || '',
          location: profile.location || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleInputChange = (key: keyof ApplicationData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    setFormData(prev => ({ ...prev, resumeFile: file }));
    toast.success('Resume uploaded successfully!');
  };

  const validateForm = (): boolean => {
    const required = [
      'fullName', 'email', 'phoneNumber', 'currentSalary', 
      'expectedSalary', 'location', 'noticePeriod'
    ];

    const missingFields = required.filter(field => !formData[field as keyof ApplicationData]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (!formData.resumeFile) {
      toast.error('Please attach your resume');
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (hasApplied) {
      toast.error('You have already applied to this job');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Double-check for existing application
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

      // Upload resume
      let resumeUrl = '';
      if (formData.resumeFile) {
        try {
          resumeUrl = await uploadFile(formData.resumeFile, undefined, 'resumes');
        } catch (uploadError) {
          console.error('Resume upload failed:', uploadError);
          toast.error('Failed to upload resume. Please try again.');
          return;
        }
      }

      // Prepare application data
      const applicationData = {
        user_id: user.id,
        job_id: job.id,
        resume_url: resumeUrl,
        status: 'applied',
        applied_at: new Date().toISOString(),
        application_data: {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          currentSalary: formData.currentSalary,
          expectedSalary: formData.expectedSalary,
          location: formData.location,
          noticePeriod: formData.noticePeriod,
          coverLetter: formData.coverLetter,
          submittedAt: new Date().toISOString(),
          jobTitle: job.title,
          companyName: job.companies?.name || job.company_name
        }
      };

      // Submit application
      const { error } = await supabase
        .from('job_applications')
        .insert(applicationData);

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already applied to this job');
          setHasApplied(true);
        } else {
          throw error;
        }
        return;
      }

      // Increment job application count
      try {
        await incrementJobApplications(job.id);
      } catch (incrementError) {
        console.error('Failed to increment application count:', incrementError);
      }

      // Send notification to job poster if available
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
          // Don't fail the application for this
        }
      }

      toast.success('Application submitted successfully! The job poster will be notified.');
      onOpenChange(false);
      setHasApplied(true);

    } catch (error: any) {
      console.error('Application submission error:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasApplied) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Application Submitted
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              You have already applied for this position. The employer will review your application and contact you if selected.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <p className="text-sm text-muted-foreground font-normal">
                at {job.companies?.name || job.company_name}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume" className="text-sm font-medium">
              Resume <span className="text-red-500">*</span>
            </Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('resume-upload')?.click()}
                className="w-full"
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {formData.resumeFile ? formData.resumeFile.name : 'Choose Resume File'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>
          </div>

          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSalary">Current Salary (₹LPA) <span className="text-red-500">*</span></Label>
              <Input
                id="currentSalary"
                value={formData.currentSalary}
                onChange={(e) => handleInputChange('currentSalary', e.target.value)}
                placeholder="e.g., 5.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedSalary">Expected Salary (₹LPA) <span className="text-red-500">*</span></Label>
              <Input
                id="expectedSalary"
                value={formData.expectedSalary}
                onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                placeholder="e.g., 8.0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="noticePeriod">Notice Period <span className="text-red-500">*</span></Label>
              <Select value={formData.noticePeriod} onValueChange={(value) => handleInputChange('noticePeriod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select notice period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="15_days">15 Days</SelectItem>
                  <SelectItem value="1_month">1 Month</SelectItem>
                  <SelectItem value="2_months">2 Months</SelectItem>
                  <SelectItem value="3_months">3 Months</SelectItem>
                  <SelectItem value="more_than_3_months">More than 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              value={formData.coverLetter}
              onChange={(e) => handleInputChange('coverLetter', e.target.value)}
              placeholder="Why are you interested in this position? (Optional)"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || uploading}
              className="flex-1"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}