import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Upload, 
  FileText, 
  ArrowLeft, 
  Send, 
  Briefcase, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface FormData {
  // Step 1: Resume Selection
  resumeSource: 'existing' | 'upload';
  selectedResumeId: string;
  uploadedResume: File | null;
  
  // Step 2: Job Role is pre-filled from job data
  
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

const MultiStepJobApplication = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
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

  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch user's resumes
  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ['user-resumes'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch user profile to pre-fill form
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
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
              location: profile.location || '',
              linkedinProfile: profile.linkedin_url || ''
            }));
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };

      fetchUserProfile();
    }
  }, [user]);

  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: async (applicationData: FormData) => {
      if (!user || !id) throw new Error('Missing required data');

      // Check if already applied
      const { data: existingApplication } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', id)
        .single();

      if (existingApplication) {
        throw new Error('You have already applied to this job');
      }

      // Upload resume if new file
      let resumeUrl = '';
      if (applicationData.resumeSource === 'upload' && applicationData.uploadedResume) {
        const fileName = `${user.id}/${Date.now()}_${applicationData.uploadedResume.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, applicationData.uploadedResume);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        
        resumeUrl = publicUrl;
      } else if (applicationData.resumeSource === 'existing' && applicationData.selectedResumeId) {
        const selectedResume = resumes?.find(r => r.id === applicationData.selectedResumeId);
        resumeUrl = selectedResume?.file_url || '';
      }

      // Upload cover letter if provided
      let coverLetterUrl = '';
      if (applicationData.coverLetter) {
        const fileName = `cover_letters/${user.id}/${Date.now()}_${applicationData.coverLetter.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, applicationData.coverLetter);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        
        coverLetterUrl = publicUrl;
      }

      // Submit application
      const { error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_id: id,
          resume_url: resumeUrl,
          status: 'applied',
          application_data: {
            fullName: applicationData.fullName,
            email: applicationData.email,
            phoneNumber: applicationData.phoneNumber,
            preferredCallTime: applicationData.preferredCallTime,
            location: applicationData.location,
            currentCTC: applicationData.currentCTC,
            expectedCTC: applicationData.expectedCTC,
            noticePeriod: applicationData.noticePeriod,
            readyToRelocate: applicationData.readyToRelocate,
            remoteWorkPreference: applicationData.remoteWorkPreference,
            yearsOfExperience: applicationData.yearsOfExperience,
            linkedinProfile: applicationData.linkedinProfile,
            portfolioWebsite: applicationData.portfolioWebsite,
            coverLetterUrl: coverLetterUrl,
            submittedAt: new Date().toISOString()
          }
        });

      if (error) throw error;

      // Update application count
      try {
        await supabase.rpc('increment', { 
          table_name: 'jobs',
          row_id: id,
          column_name: 'applications_count'
        });
      } catch (error) {
        console.log('Failed to increment application count:', error);
      }
    },
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      navigate('/my-applications');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit application');
      setIsSubmitting(false);
    }
  });

  const handleInputChange = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (key: keyof FormData, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange(key, file);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
         return (formData.resumeSource === 'existing' && !!formData.selectedResumeId) ||
                (formData.resumeSource === 'upload' && !!formData.uploadedResume);
      case 3:
         return !!formData.fullName && 
                !!formData.email && 
                !!formData.phoneNumber && 
                !!formData.location &&
                !!formData.currentCTC &&
                !!formData.expectedCTC &&
                !!formData.noticePeriod;
      case 4:
        return formData.informationConfirmed && formData.contactAuthorized;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('Please complete all required fields and confirmations');
      return;
    }

    setIsSubmitting(true);
    applyMutation.mutate(formData);
  };

  const getStepProgress = () => (currentStep / 4) * 100;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-4">You need to be logged in to apply for jobs</p>
        <Button onClick={() => navigate('/auth')}>Login / Sign Up</Button>
      </div>
    );
  }

  if (jobLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/jobs/${id}`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Job Details
            </Button>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={job.companies?.logo_url} alt={job.companies?.name} />
                    <AvatarFallback className="text-lg">
                      {job.companies?.name?.slice(0, 2).toUpperCase() || 'CO'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold mb-1">Apply for {job.title}</h1>
                    <p className="text-muted-foreground">{job.companies?.name || job.company_name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.employment_type}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Application Progress</span>
              <span className="text-sm text-muted-foreground">Step {currentStep} of 4</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Resume</span>
              <span>Job Role</span>
              <span>Details</span>
              <span>Submit</span>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Step 1: Select Your Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={formData.resumeSource}
                  onValueChange={(value: 'existing' | 'upload') => handleInputChange('resumeSource', value)}
                >
                  {resumes && resumes.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="existing" id="existing" />
                        <Label htmlFor="existing">Use existing resume</Label>
                      </div>
                      {formData.resumeSource === 'existing' && (
                        <div className="ml-6 space-y-2">
                          {resumes.map((resume) => (
                            <div key={resume.id} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={resume.id}
                                name="selectedResume"
                                value={resume.id}
                                checked={formData.selectedResumeId === resume.id}
                                onChange={(e) => handleInputChange('selectedResumeId', e.target.value)}
                                className="text-primary"
                              />
                              <Label htmlFor={resume.id} className="flex items-center gap-2 cursor-pointer">
                                <FileText className="h-4 w-4" />
                                <span>{resume.title}</span>
                                {resume.is_primary && (
                                  <Badge variant="secondary" className="text-xs">Primary</Badge>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upload" id="upload" />
                      <Label htmlFor="upload">Upload a new resume</Label>
                    </div>
                    {formData.resumeSource === 'upload' && (
                      <div className="ml-6">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload('uploadedResume', e)}
                          className="hidden"
                          id="resume-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('resume-upload')?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {formData.uploadedResume ? formData.uploadedResume.name : 'Choose File'}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supported formats: PDF, DOC, DOCX (Max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Step 2: Job Role Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">You're applying for:</h3>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">{job.title}</p>
                    <p className="text-muted-foreground">{job.companies?.name || job.company_name}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.skills_required?.slice(0, 6).map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <p className="text-sm">Job details confirmed. Click next to proceed.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Step 3: Personal & Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="callTime">Preferred Call Time</Label>
                    <Select
                      value={formData.preferredCallTime}
                      onValueChange={(value) => handleInputChange('preferredCallTime', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                        <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                        <SelectItem value="anytime">Anytime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Current Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Select
                      value={formData.yearsOfExperience}
                      onValueChange={(value) => handleInputChange('yearsOfExperience', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-6">3-6 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currentCTC">Current CTC *</Label>
                    <Input
                      id="currentCTC"
                      value={formData.currentCTC}
                      onChange={(e) => handleInputChange('currentCTC', e.target.value)}
                      placeholder="e.g., 12 LPA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedCTC">Expected CTC *</Label>
                    <Input
                      id="expectedCTC"
                      value={formData.expectedCTC}
                      onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
                      placeholder="e.g., 15 LPA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="noticePeriod">Notice Period *</Label>
                    <Select
                      value={formData.noticePeriod}
                      onValueChange={(value) => handleInputChange('noticePeriod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select notice period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="15-days">15 days</SelectItem>
                        <SelectItem value="1-month">1 month</SelectItem>
                        <SelectItem value="2-months">2 months</SelectItem>
                        <SelectItem value="3-months">3 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="relocate">Ready to Relocate?</Label>
                    <Select
                      value={formData.readyToRelocate}
                      onValueChange={(value) => handleInputChange('readyToRelocate', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="depends">Depends on location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="remote">Remote Work Preference</Label>
                    <Select
                      value={formData.remoteWorkPreference}
                      onValueChange={(value) => handleInputChange('remoteWorkPreference', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote-only">Remote only</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="office-only">Office only</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedinProfile}
                      onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <Label htmlFor="portfolio">Portfolio Website</Label>
                    <Input
                      id="portfolio"
                      value={formData.portfolioWebsite}
                      onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload('coverLetter', e)}
                    className="hidden"
                    id="cover-letter-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('cover-letter-upload')?.click()}
                    className="w-full mt-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {formData.coverLetter ? formData.coverLetter.name : 'Upload Cover Letter'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Step 4: Review & Submit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4">Application Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Position:</strong> {job.title}
                    </div>
                    <div>
                      <strong>Company:</strong> {job.companies?.name || job.company_name}
                    </div>
                    <div>
                      <strong>Name:</strong> {formData.fullName}
                    </div>
                    <div>
                      <strong>Email:</strong> {formData.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> {formData.phoneNumber}
                    </div>
                    <div>
                      <strong>Expected CTC:</strong> {formData.expectedCTC}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="confirmed"
                      checked={formData.informationConfirmed}
                      onCheckedChange={(checked) => handleInputChange('informationConfirmed', checked as boolean)}
                    />
                    <Label htmlFor="confirmed" className="text-sm">
                      I confirm that all the information provided is accurate and complete.
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="authorized"
                      checked={formData.contactAuthorized}
                      onCheckedChange={(checked) => handleInputChange('contactAuthorized', checked as boolean)}
                    />
                    <Label htmlFor="authorized" className="text-sm">
                      I authorize {job.companies?.name || job.company_name} to contact me regarding this application.
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !validateStep(4)}
                className="px-8"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepJobApplication;