import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Phone, MapPin, Briefcase, User, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ComprehensiveJobApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: string;
    title: string;
    companies?: {
      name: string;
      logo_url?: string;
    } | null;
    skills_required?: string[];
  };
}

interface FormData {
  // Step 1: Resume Selection
  resumeSource: 'existing' | 'upload';
  selectedResumeId: string;
  uploadedResume: File | null;
  
  // Step 2: Job Role (pre-filled)
  
  // Step 3: Personal & Professional Details
  fullName: string;
  email: string;
  phoneNumber: string;
  preferredCallTime: string;
  location: string;
  currentCTC: string;
  expectedCTC: string;
  noticePeriod: string;
  readyToRelocate: string;
  remoteWorkPreference: string;
  yearsOfExperience: string;
  linkedinProfile: string;
  portfolioWebsite: string;
  coverLetter: File | null;
  
  // Step 4: Declaration
  informationConfirmed: boolean;
  contactAuthorized: boolean;
}

export default function ComprehensiveJobApplicationForm({ open, onOpenChange, job }: ComprehensiveJobApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumes, setResumes] = useState<any[]>([]);
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    setFormData(prev => ({ ...prev, uploadedResume: file }));
    toast.success('Resume uploaded successfully!');
  };

  const handleCoverLetterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Cover letter size must be less than 2MB');
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

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Step 1: Select Resume
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={formData.resumeSource}
          onValueChange={(value: 'existing' | 'upload') => handleInputChange('resumeSource', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existing" id="existing" />
            <Label htmlFor="existing">Use Existing Resume</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upload" id="upload" />
            <Label htmlFor="upload">Upload New Resume</Label>
          </div>
        </RadioGroup>

        {formData.resumeSource === 'existing' && (
          <div className="space-y-3">
            {resumes.length > 0 ? (
              <RadioGroup
                value={formData.selectedResumeId}
                onValueChange={(value) => handleInputChange('selectedResumeId', value)}
              >
                {resumes.map((resume) => (
                  <div key={resume.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value={resume.id} id={resume.id} />
                    <Label htmlFor={resume.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>{resume.title}</span>
                        {resume.is_primary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="text-center text-gray-500 py-4">No resumes found. Please upload a new resume.</p>
            )}
          </div>
        )}

        {formData.resumeSource === 'upload' && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 font-medium">
                {formData.uploadedResume ? (
                  <span className="text-green-600 flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {formData.uploadedResume.name}
                  </span>
                ) : (
                  'Upload Resume (PDF, DOCX, max 5MB)'
                )}
              </p>
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Step 2: Job Role
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Applying For:</Label>
            <Input value={job.title} disabled className="mt-2 bg-gray-50" />
          </div>
          {job.companies && (
            <div>
              <Label>Company:</Label>
              <Input value={job.companies.name} disabled className="mt-2 bg-gray-50" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Step 3: Personal & Professional Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="preferredCallTime">Preferred Time for Call</Label>
            <Select value={formData.preferredCallTime} onValueChange={(value) => handleInputChange('preferredCallTime', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select preferred time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9am-11am">9:00 AM - 11:00 AM</SelectItem>
                <SelectItem value="11am-1pm">11:00 AM - 1:00 PM</SelectItem>
                <SelectItem value="1pm-3pm">1:00 PM - 3:00 PM</SelectItem>
                <SelectItem value="3pm-5pm">3:00 PM - 5:00 PM</SelectItem>
                <SelectItem value="5pm-7pm">5:00 PM - 7:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Location (City/State) *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Mumbai, Maharashtra"
              required
            />
          </div>
          <div>
            <Label htmlFor="currentCTC">Current CTC (₹/LPA)</Label>
            <Input
              id="currentCTC"
              type="number"
              value={formData.currentCTC}
              onChange={(e) => handleInputChange('currentCTC', e.target.value)}
              placeholder="e.g., 5.0"
            />
          </div>
          <div>
            <Label htmlFor="expectedCTC">Expected CTC (₹/LPA) *</Label>
            <Input
              id="expectedCTC"
              type="number"
              value={formData.expectedCTC}
              onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
              placeholder="e.g., 7.0"
              required
            />
          </div>
          <div>
            <Label htmlFor="noticePeriod">Notice Period *</Label>
            <Select value={formData.noticePeriod} onValueChange={(value) => handleInputChange('noticePeriod', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select notice period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="15days">15 Days</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="60days">60 Days</SelectItem>
                <SelectItem value="90days">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
            <Select value={formData.yearsOfExperience} onValueChange={(value) => handleInputChange('yearsOfExperience', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1">0-1 years</SelectItem>
                <SelectItem value="1-3">1-3 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="5-8">5-8 years</SelectItem>
                <SelectItem value="8+">8+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Ready to Relocate? *</Label>
            <RadioGroup
              value={formData.readyToRelocate}
              onValueChange={(value) => handleInputChange('readyToRelocate', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="relocate-yes" />
                <Label htmlFor="relocate-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="relocate-no" />
                <Label htmlFor="relocate-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Remote Work Preference *</Label>
            <RadioGroup
              value={formData.remoteWorkPreference}
              onValueChange={(value) => handleInputChange('remoteWorkPreference', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="remote-yes" />
                <Label htmlFor="remote-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="remote-no" />
                <Label htmlFor="remote-no">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hybrid" id="remote-hybrid" />
                <Label htmlFor="remote-hybrid">Hybrid</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedinProfile">LinkedIn Profile (Optional)</Label>
            <Input
              id="linkedinProfile"
              type="url"
              value={formData.linkedinProfile}
              onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div>
            <Label htmlFor="portfolioWebsite">Portfolio / Website (Optional)</Label>
            <Input
              id="portfolioWebsite"
              type="url"
              value={formData.portfolioWebsite}
              onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="coverLetter">Upload Cover Letter (Optional)</Label>
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleCoverLetterUpload}
              className="hidden"
              id="cover-letter-upload"
            />
            <label htmlFor="cover-letter-upload" className="cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {formData.coverLetter ? (
                  <span className="text-green-600 flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {formData.coverLetter.name}
                  </span>
                ) : (
                  'Upload Cover Letter (PDF, DOCX, max 2MB)'
                )}
              </p>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 4: Declaration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="information-confirmed"
            checked={formData.informationConfirmed}
            onCheckedChange={(checked) => handleInputChange('informationConfirmed', checked)}
          />
          <Label htmlFor="information-confirmed">
            I confirm that the above information is true to the best of my knowledge.
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="contact-authorized"
            checked={formData.contactAuthorized}
            onCheckedChange={(checked) => handleInputChange('contactAuthorized', checked)}
          />
          <Label htmlFor="contact-authorized">
            I authorize the company to contact me for job-related communication.
          </Label>
        </div>
      </CardContent>
    </Card>
  );

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.resumeSource === 'existing' ? formData.selectedResumeId : formData.uploadedResume;
      case 2:
        return true;
      case 3:
        return formData.fullName && formData.email && formData.phoneNumber && formData.location && 
               formData.expectedCTC && formData.noticePeriod && formData.readyToRelocate && 
               formData.remoteWorkPreference && formData.yearsOfExperience;
      case 4:
        return formData.informationConfirmed && formData.contactAuthorized;
      default:
        return false;
    }
  };

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
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
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
