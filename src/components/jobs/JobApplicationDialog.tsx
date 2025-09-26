import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, Send, Star, Clock, Award, MapPin, DollarSign, 
  Building2, Phone, Mail, User, FileText, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface JobApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  onApply: (applicationData: any) => void;
}

interface Resume {
  id: string;
  title: string;
  file_url: string;
  is_primary: boolean;
}

export const JobApplicationDialog: React.FC<JobApplicationDialogProps> = ({
  isOpen,
  onClose,
  job,
  onApply
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Resume Selection
    resumeSource: 'existing', // 'existing' or 'upload'
    selectedResumeId: '',
    
    // Personal Information
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    
    // Professional Information
    currentCompany: '',
    currentRole: '',
    currentCTC: '',
    expectedCTC: '',
    yearsOfExperience: '',
    noticePeriod: '',
    readyToRelocate: '',
    
    // Cover Letter
    coverLetter: '',
    
    // Professional Links
    linkedinProfile: '',
    portfolioWebsite: '',
  });

  // Load user profile and resumes
  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          fullName: profile.full_name || '',
          email: profile.email || user.email || '',
          phoneNumber: profile.phone || '',
          location: profile.location || '',
          currentCompany: profile.current_company || '',
          currentRole: profile.current_role || '',
          currentCTC: profile.current_ctc || '',
          expectedCTC: profile.expected_ctc || '',
          yearsOfExperience: profile.years_of_experience || '',
          noticePeriod: profile.notice_period || '',
          readyToRelocate: profile.ready_to_relocate || '',
          linkedinProfile: profile.linkedin_url || '',
          portfolioWebsite: profile.portfolio_url || '',
        }));
      }

      // Load resumes
      const { data: resumesData } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (resumesData) {
        setResumes(resumesData);
        // Auto-select primary resume
        const primaryResume = resumesData.find(r => r.is_primary);
        if (primaryResume) {
          setFormData(prev => ({ ...prev, selectedResumeId: primaryResume.id }));
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or DOC file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (formData.resumeSource === 'existing') {
          return formData.selectedResumeId !== '';
        } else {
          return selectedFile !== null;
        }
      case 2:
        return formData.fullName && formData.email && formData.phoneNumber && formData.location;
      case 3:
        return formData.expectedCTC && formData.noticePeriod && formData.readyToRelocate && formData.yearsOfExperience;
      case 4:
        return formData.coverLetter.length > 50;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      let resumeUrl = '';
      
      if (formData.resumeSource === 'existing') {
        const selectedResume = resumes.find(r => r.id === formData.selectedResumeId);
        resumeUrl = selectedResume?.file_url || '';
      } else if (selectedFile) {
        // Upload new resume
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const fileName = `${user.id}/${Date.now()}_${selectedFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        resumeUrl = publicUrl;
      }

      const applicationData = {
        ...formData,
        resumeUrl,
        jobId: job.id,
        appliedAt: new Date().toISOString()
      };

      onApply(applicationData);
      toast.success('Application submitted successfully! +10 TXC coins earned');
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setFormData({
      resumeSource: 'existing',
      selectedResumeId: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      location: '',
      currentCompany: '',
      currentRole: '',
      currentCTC: '',
      expectedCTC: '',
      yearsOfExperience: '',
      noticePeriod: '',
      readyToRelocate: '',
      coverLetter: '',
      linkedinProfile: '',
      portfolioWebsite: '',
    });
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary undisclosed';
    if (min && max) {
      return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
    }
    return `₹${((min || max) / 100000).toFixed(1)}L`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Apply for {job?.title}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            {job?.companies?.name || job?.company_name} • {job?.location}
          </div>
        </DialogHeader>

        {/* Job Quick Info */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">{job?.title}</h3>
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <Award className="h-3 w-3 mr-1" />
              +10 TXC Reward
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>{formatSalary(job?.salary_min, job?.salary_max)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>{job?.employment_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span>{job?.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span>Apply Now</span>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 ${currentStep > step ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Resume Selection */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Step 1: Select Your Resume</h3>
              
              <RadioGroup value={formData.resumeSource} onValueChange={(value) => handleInputChange('resumeSource', value)}>
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
                <div className="mt-4">
                  {resumes.length > 0 ? (
                    <div className="space-y-2">
                      {resumes.map((resume) => (
                        <div
                          key={resume.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            formData.selectedResumeId === resume.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleInputChange('selectedResumeId', resume.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="font-medium">{resume.title}</span>
                              {resume.is_primary && (
                                <Badge variant="secondary" className="text-xs">Primary</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No resumes found. Please upload a new one.</p>
                  )}
                </div>
              )}

              {formData.resumeSource === 'upload' && (
                <div className="mt-4">
                  <Label htmlFor="resume-upload">Upload Resume</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      {selectedFile ? (
                        <p className="text-sm text-green-600 font-medium">{selectedFile.name}</p>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600">
                            Drag & drop your resume here, or <span className="text-primary">browse</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Step 2: Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Current Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Mumbai, Maharashtra"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                  <Input
                    id="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <Label htmlFor="portfolioWebsite">Portfolio Website</Label>
                  <Input
                    id="portfolioWebsite"
                    value={formData.portfolioWebsite}
                    onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Professional Information */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Step 3: Professional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentCompany">Current Company</Label>
                  <Input
                    id="currentCompany"
                    value={formData.currentCompany}
                    onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <Label htmlFor="currentRole">Current Role</Label>
                  <Input
                    id="currentRole"
                    value={formData.currentRole}
                    onChange={(e) => handleInputChange('currentRole', e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                  <Select value={formData.yearsOfExperience} onValueChange={(value) => handleInputChange('yearsOfExperience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 Years</SelectItem>
                      <SelectItem value="1-3">1-3 Years</SelectItem>
                      <SelectItem value="3-5">3-5 Years</SelectItem>
                      <SelectItem value="5-7">5-7 Years</SelectItem>
                      <SelectItem value="7-10">7-10 Years</SelectItem>
                      <SelectItem value="10+">10+ Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currentCTC">Current CTC (LPA)</Label>
                  <Input
                    id="currentCTC"
                    value={formData.currentCTC}
                    onChange={(e) => handleInputChange('currentCTC', e.target.value)}
                    placeholder="e.g., 12"
                  />
                </div>
                <div>
                  <Label htmlFor="expectedCTC">Expected CTC (LPA) *</Label>
                  <Input
                    id="expectedCTC"
                    value={formData.expectedCTC}
                    onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
                    placeholder="e.g., 15"
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
                      <SelectItem value="15-days">15 Days</SelectItem>
                      <SelectItem value="30-days">30 Days</SelectItem>
                      <SelectItem value="45-days">45 Days</SelectItem>
                      <SelectItem value="60-days">60 Days</SelectItem>
                      <SelectItem value="90-days">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="readyToRelocate">Ready to Relocate? *</Label>
                  <Select value={formData.readyToRelocate} onValueChange={(value) => handleInputChange('readyToRelocate', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="depends">Depends on opportunity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Cover Letter */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Step 4: Cover Letter</h3>
              
              <div>
                <Label htmlFor="coverLetter">Why are you interested in this role? *</Label>
                <Textarea
                  id="coverLetter"
                  value={formData.coverLetter}
                  onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                  placeholder="Tell us why you're the perfect fit for this role. Highlight your relevant experience, skills, and what excites you about this opportunity..."
                  rows={6}
                  className="mt-2"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 50 characters ({formData.coverLetter.length}/50)
                </p>
              </div>

              {/* Application Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <h4 className="font-medium mb-3">Application Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Resume:</span>
                    <span className="font-medium">
                      {formData.resumeSource === 'existing' 
                        ? resumes.find(r => r.id === formData.selectedResumeId)?.title || 'Selected'
                        : selectedFile?.name || 'Uploaded'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="font-medium">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span className="font-medium">{formData.yearsOfExperience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected CTC:</span>
                    <span className="font-medium">₹{formData.expectedCTC} LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Notice Period:</span>
                    <span className="font-medium">{formData.noticePeriod}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              Previous
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !validateStep(4)}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};