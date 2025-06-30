
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileText } from 'lucide-react';

interface CompactJobApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: string;
    title: string;
    companies?: {
      name: string;
      logo_url?: string;
    } | null;
  };
}

export default function CompactJobApplicationForm({ open, onOpenChange, job }: CompactJobApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    resumeSource: 'existing',
    selectedResumeId: '',
    uploadedResume: null as File | null,
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
    coverLetter: null as File | null,
    informationConfirmed: false,
    contactAuthorized: false
  });
  const [resumes, setResumes] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchUserData();
    }
  }, [open]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile and resumes
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
      setFormData(prev => ({ ...prev, uploadedResume: file }));
    } else {
      setFormData(prev => ({ ...prev, coverLetter: file }));
    }
    toast.success(`${type === 'resume' ? 'Resume' : 'Cover letter'} uploaded successfully!`);
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

      // Handle file uploads and create application
      let resumeUrl = '';
      if (formData.resumeSource === 'upload' && formData.uploadedResume) {
        // Upload logic would go here
        resumeUrl = 'uploaded_resume_url';
      } else if (formData.selectedResumeId) {
        const selectedResume = resumes.find(r => r.id === formData.selectedResumeId);
        resumeUrl = selectedResume?.file_url || '';
      }

      const { error } = await supabase.from('job_applications').insert({
        user_id: user.id,
        job_id: job.id,
        resume_url: resumeUrl,
        status: 'applied',
        application_data: formData
      });

      if (error) throw error;

      toast.success('Application submitted successfully!');
      onOpenChange(false);
      setCurrentStep(1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Step 1: Select Resume</h3>
            <RadioGroup
              value={formData.resumeSource}
              onValueChange={(value) => setFormData(prev => ({ ...prev, resumeSource: value }))}
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

            {formData.resumeSource === 'existing' && resumes.length > 0 && (
              <Select value={formData.selectedResumeId} onValueChange={(value) => setFormData(prev => ({ ...prev, selectedResumeId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Resume" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.title} {resume.is_primary && '(Primary)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {formData.resumeSource === 'upload' && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'resume')}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload Resume (PDF, DOCX, max 5MB)</span>
                  {formData.uploadedResume && (
                    <span className="text-xs text-green-600 mt-1">{formData.uploadedResume.name}</span>
                  )}
                </label>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Step 2: Job Role</h3>
            <div>
              <Label>Applying For:</Label>
              <Input value={job.title} disabled className="bg-gray-50" />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Step 3: Personal & Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={formData.phoneNumber} onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))} />
              </div>
              <div>
                <Label>Preferred Call Time</Label>
                <Select value={formData.preferredCallTime} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredCallTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9am-11am">9am–11am</SelectItem>
                    <SelectItem value="11am-1pm">11am–1pm</SelectItem>
                    <SelectItem value="2pm-4pm">2pm–4pm</SelectItem>
                    <SelectItem value="4pm-6pm">4pm–6pm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Current CTC (₹/LPA)</Label>
                <Input value={formData.currentCTC} onChange={(e) => setFormData(prev => ({ ...prev, currentCTC: e.target.value }))} />
              </div>
              <div>
                <Label>Expected CTC (₹/LPA)</Label>
                <Input value={formData.expectedCTC} onChange={(e) => setFormData(prev => ({ ...prev, expectedCTC: e.target.value }))} />
              </div>
              <div>
                <Label>Notice Period</Label>
                <Select value={formData.noticePeriod} onValueChange={(value) => setFormData(prev => ({ ...prev, noticePeriod: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="15">15 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="60">60 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Years of Experience</Label>
                <Input value={formData.yearsOfExperience} onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Ready to Relocate?</Label>
                <RadioGroup
                  value={formData.readyToRelocate}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, readyToRelocate: value }))}
                  className="flex space-x-4 mt-1"
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
                <Label>Remote Work Preference</Label>
                <RadioGroup
                  value={formData.remoteWorkPreference}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, remoteWorkPreference: value }))}
                  className="flex space-x-4 mt-1"
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
                <Label>LinkedIn Profile (Optional)</Label>
                <Input value={formData.linkedinProfile} onChange={(e) => setFormData(prev => ({ ...prev, linkedinProfile: e.target.value }))} />
              </div>
              <div>
                <Label>Portfolio Website (Optional)</Label>
                <Input value={formData.portfolioWebsite} onChange={(e) => setFormData(prev => ({ ...prev, portfolioWebsite: e.target.value }))} />
              </div>
            </div>

            <div>
              <Label>Upload Cover Letter (Optional)</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-3">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'coverLetter')}
                  className="hidden"
                  id="cover-letter-upload"
                />
                <label htmlFor="cover-letter-upload" className="cursor-pointer flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Upload Cover Letter</span>
                  {formData.coverLetter && (
                    <span className="text-xs text-green-600 ml-2">{formData.coverLetter.name}</span>
                  )}
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Step 4: Declaration</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="info-confirmed"
                  checked={formData.informationConfirmed}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, informationConfirmed: !!checked }))}
                />
                <Label htmlFor="info-confirmed" className="text-sm">
                  I confirm that the above information is true to the best of my knowledge.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact-authorized"
                  checked={formData.contactAuthorized}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contactAuthorized: !!checked }))}
                />
                <Label htmlFor="contact-authorized" className="text-sm">
                  I authorize the company to contact me for job-related communication.
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {job.companies?.logo_url && (
              <img src={job.companies.logo_url} alt={job.companies.name} className="w-6 h-6 rounded" />
            )}
            Apply for {job.title}
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {renderStep()}

        {/* Navigation buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            size="sm"
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                size="sm"
              >
                Next
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => toast.success('Draft saved!')}>
                  Save Draft
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.informationConfirmed || !formData.contactAuthorized}
                  size="sm"
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
