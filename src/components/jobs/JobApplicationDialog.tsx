import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  CalendarIcon, MapPin, Phone, Mail, DollarSign, Clock, 
  Upload, FileText, User, Briefcase, GraduationCap, 
  Building, Star, CheckCircle, AlertCircle, Send,
  Award, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Enhanced validation schema with all mandatory fields
const jobApplicationSchema = z.object({
  // Personal Information
  fullName: z.string()
    .trim()
    .min(2, { message: "Full name must be at least 2 characters" })
    .max(100, { message: "Full name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Full name can only contain letters and spaces" }),
  
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  
  phone: z.string()
    .trim()
    .regex(/^[\+]?[0-9\-\(\)\s]+$/, { message: "Invalid phone number format" })
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number must be less than 15 digits" }),
  
  alternatePhone: z.string()
    .trim()
    .regex(/^[\+]?[0-9\-\(\)\s]*$/, { message: "Invalid alternate phone format" })
    .optional(),

  // Location & Availability
  currentLocation: z.string()
    .trim()
    .min(2, { message: "Current location is required" })
    .max(100, { message: "Location must be less than 100 characters" }),
  
  preferredLocation: z.string()
    .trim()
    .min(2, { message: "Preferred location is required" })
    .max(100, { message: "Location must be less than 100 characters" }),
  
  willingToRelocate: z.enum(['yes', 'no', 'maybe'], {
    required_error: "Please specify willingness to relocate"
  }),

  // Salary & Compensation
  currentCTC: z.string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Enter valid CTC amount (e.g., 500000 or 5.5)" })
    .min(1, { message: "Current CTC is required" }),
  
  expectedCTC: z.string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Enter valid expected CTC amount" })
    .min(1, { message: "Expected CTC is required" }),
  
  ctcBreakdown: z.object({
    basic: z.string().optional(),
    hra: z.string().optional(),
    allowances: z.string().optional(),
    variablePay: z.string().optional()
  }).optional(),

  // Experience & Notice Period
  totalExperience: z.string()
    .trim()
    .regex(/^\d+(\.\d)?$/, { message: "Enter experience in years (e.g., 3.5)" })
    .min(1, { message: "Total experience is required" }),
  
  relevantExperience: z.string()
    .trim()
    .regex(/^\d+(\.\d)?$/, { message: "Enter relevant experience in years" })
    .min(1, { message: "Relevant experience is required" }),
  
  noticePeriod: z.enum(['immediate', '15-days', '30-days', '60-days', '90-days', 'negotiable'], {
    required_error: "Please specify notice period"
  }),
  
  currentlyServing: z.boolean().default(false),
  lastWorkingDay: z.date().optional(),

  // Availability & Joining
  availableForInterview: z.enum(['immediately', 'within-week', 'within-2weeks', 'specific-date'], {
    required_error: "Please specify interview availability"
  }),
  
  preferredInterviewTime: z.string().optional(),
  canJoinImmediately: z.boolean().default(false),
  earliestJoiningDate: z.date({
    required_error: "Earliest joining date is required"
  }),

  // Work Preferences
  workMode: z.enum(['remote', 'hybrid', 'office', 'any'], {
    required_error: "Please specify work mode preference"
  }),
  
  shiftPreference: z.enum(['day', 'night', 'rotational', 'flexible'], {
    required_error: "Please specify shift preference"
  }),

  // Skills & Portfolio
  primarySkills: z.string()
    .trim()
    .min(5, { message: "Please list your primary skills" })
    .max(500, { message: "Skills description too long" }),
  
  portfolioUrl: z.string()
    .url({ message: "Invalid portfolio URL" })
    .optional()
    .or(z.literal('')),
  
  githubUrl: z.string()
    .url({ message: "Invalid GitHub URL" })
    .optional()
    .or(z.literal('')),
  
  linkedinUrl: z.string()
    .url({ message: "Invalid LinkedIn URL" })
    .optional()
    .or(z.literal('')),

  // Cover Letter & Documents
  coverLetter: z.string()
    .trim()
    .min(50, { message: "Cover letter must be at least 50 characters" })
    .max(2000, { message: "Cover letter must be less than 2000 characters" }),
  
  resumeUploaded: z.boolean({
    required_error: "Resume upload is required"
  }).refine(val => val === true, { message: "Please upload your resume" }),

  // Additional Questions
  reasonForChange: z.string()
    .trim()
    .min(10, { message: "Please explain reason for job change" })
    .max(500, { message: "Reason too long" }),
  
  careerGoals: z.string()
    .trim()
    .min(20, { message: "Please describe your career goals" })
    .max(1000, { message: "Career goals too long" }),

  // Agreements
  termsAccepted: z.boolean()
    .refine(val => val === true, { message: "You must accept the terms and conditions" }),
  
  dataProcessingConsent: z.boolean()
    .refine(val => val === true, { message: "Data processing consent is required" }),
  
  communicationConsent: z.boolean().default(true)
});

type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;

interface JobApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
  onApplicationSubmit?: () => void;
}

export const JobApplicationDialog: React.FC<JobApplicationDialogProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  companyName,
  onApplicationSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [txcEarned, setTxcEarned] = useState(0);

  const totalSteps = 6;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset
  } = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    mode: 'onChange',
    defaultValues: {
      willingToRelocate: undefined,
      noticePeriod: undefined,
      availableForInterview: undefined,
      workMode: undefined,
      shiftPreference: undefined,
      currentlyServing: false,
      canJoinImmediately: false,
      resumeUploaded: false,
      termsAccepted: false,
      dataProcessingConsent: false,
      communicationConsent: true
    }
  });

  const stepTitles = [
    "Personal Information",
    "Location & Salary",
    "Experience & Notice",
    "Availability & Preferences", 
    "Skills & Portfolio",
    "Final Details & Submit"
  ];

  const handleNextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      // Award TXC for completing steps
      setTxcEarned(prev => prev + 2);
    } else {
      toast.error('Please fill all required fields correctly before proceeding');
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): (keyof JobApplicationFormData)[] => {
    switch (step) {
      case 1:
        return ['fullName', 'email', 'phone'];
      case 2:
        return ['currentLocation', 'preferredLocation', 'willingToRelocate', 'currentCTC', 'expectedCTC'];
      case 3:
        return ['totalExperience', 'relevantExperience', 'noticePeriod', 'earliestJoiningDate'];
      case 4:
        return ['availableForInterview', 'workMode', 'shiftPreference'];
      case 5:
        return ['primarySkills', 'coverLetter', 'resumeUploaded'];
      case 6:
        return ['reasonForChange', 'careerGoals', 'termsAccepted', 'dataProcessingConsent'];
      default:
        return [];
    }
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Resume file size must be less than 5MB');
        return;
      }
      
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast.error('Resume must be a PDF or Word document');
        return;
      }
      
      setResumeFile(file);
      setValue('resumeUploaded', true);
      setTxcEarned(prev => prev + 5); // Bonus for uploading resume
      toast.success('Resume uploaded successfully! +5 TXC earned');
    }
  };

  const onSubmit = async (data: JobApplicationFormData) => {
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to apply for jobs');
        return;
      }

      // Upload resume to storage if available
      let resumeUrl = '';
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${user.id}/${jobId}/resume.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile, { upsert: true });
        
        if (uploadError) {
          console.error('Resume upload error:', uploadError);
          toast.error('Failed to upload resume');
          return;
        }
        
        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        
        resumeUrl = urlData.publicUrl;
      }

      // Submit application to database
      const applicationData = {
        job_id: jobId,
        user_id: user.id,
        personal_info: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          alternatePhone: data.alternatePhone
        },
        location_info: {
          currentLocation: data.currentLocation,
          preferredLocation: data.preferredLocation,
          willingToRelocate: data.willingToRelocate
        },
        compensation: {
          currentCTC: parseFloat(data.currentCTC),
          expectedCTC: parseFloat(data.expectedCTC),
          ctcBreakdown: data.ctcBreakdown
        },
        experience: {
          totalExperience: parseFloat(data.totalExperience),
          relevantExperience: parseFloat(data.relevantExperience),
          noticePeriod: data.noticePeriod,
          currentlyServing: data.currentlyServing,
          lastWorkingDay: data.lastWorkingDay
        },
        availability: {
          availableForInterview: data.availableForInterview,
          preferredInterviewTime: data.preferredInterviewTime,
          canJoinImmediately: data.canJoinImmediately,
          earliestJoiningDate: data.earliestJoiningDate
        },
        preferences: {
          workMode: data.workMode,
          shiftPreference: data.shiftPreference
        },
        skills_portfolio: {
          primarySkills: data.primarySkills,
          portfolioUrl: data.portfolioUrl,
          githubUrl: data.githubUrl,
          linkedinUrl: data.linkedinUrl
        },
        additional_info: {
          coverLetter: data.coverLetter,
          reasonForChange: data.reasonForChange,
          careerGoals: data.careerGoals
        },
        resume_url: resumeUrl,
        applied_at: new Date().toISOString(),
        application_status: 'submitted'
      };

      const { error: insertError } = await supabase
        .from('job_applications')
        .insert(applicationData);

      if (insertError) {
        console.error('Application submission error:', insertError);
        toast.error('Failed to submit application. Please try again.');
        return;
      }

      // Award completion TXC coins
      setTxcEarned(prev => prev + 20);
      
      toast.success(`Application submitted successfully! +${txcEarned + 20} TXC earned total!`);
      
      // Reset form and close dialog
      reset();
      setCurrentStep(1);
      setResumeFile(null);
      setTxcEarned(0);
      onClose();
      
      if (onApplicationSubmit) {
        onApplicationSubmit();
      }
      
    } catch (error) {
      console.error('Unexpected error during application submission:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Enter your full name"
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="your.email@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+91 98765 43210"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternatePhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Alternate Phone
                </Label>
                <Input
                  id="alternatePhone"
                  {...register('alternatePhone')}
                  placeholder="+91 87654 32109 (optional)"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentLocation" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Current Location *
                </Label>
                <Input
                  id="currentLocation"
                  {...register('currentLocation')}
                  placeholder="e.g., Bangalore, Karnataka"
                  className={errors.currentLocation ? 'border-red-500' : ''}
                />
                {errors.currentLocation && (
                  <p className="text-red-500 text-sm">{errors.currentLocation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredLocation" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Preferred Work Location *
                </Label>
                <Input
                  id="preferredLocation"
                  {...register('preferredLocation')}
                  placeholder="e.g., Mumbai, Delhi, Remote"
                  className={errors.preferredLocation ? 'border-red-500' : ''}
                />
                {errors.preferredLocation && (
                  <p className="text-red-500 text-sm">{errors.preferredLocation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Willing to Relocate? *
                </Label>
                <RadioGroup
                  value={watch('willingToRelocate')}
                  onValueChange={(value) => setValue('willingToRelocate', value as any)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="relocate-yes" />
                    <Label htmlFor="relocate-yes">Yes, willing to relocate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="relocate-no" />
                    <Label htmlFor="relocate-no">No, prefer current location</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maybe" id="relocate-maybe" />
                    <Label htmlFor="relocate-maybe">Open to discussion</Label>
                  </div>
                </RadioGroup>
                {errors.willingToRelocate && (
                  <p className="text-red-500 text-sm">{errors.willingToRelocate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentCTC" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Current CTC (in INR) *
                </Label>
                <Input
                  id="currentCTC"
                  {...register('currentCTC')}
                  placeholder="e.g., 500000 or 5.5 (for 5.5 LPA)"
                  className={errors.currentCTC ? 'border-red-500' : ''}
                />
                {errors.currentCTC && (
                  <p className="text-red-500 text-sm">{errors.currentCTC.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedCTC" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Expected CTC (in INR) *
                </Label>
                <Input
                  id="expectedCTC"
                  {...register('expectedCTC')}
                  placeholder="e.g., 700000 or 7.0 (for 7.0 LPA)"
                  className={errors.expectedCTC ? 'border-red-500' : ''}
                />
                {errors.expectedCTC && (
                  <p className="text-red-500 text-sm">{errors.expectedCTC.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalExperience" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Total Experience (Years) *
                </Label>
                <Input
                  id="totalExperience"
                  {...register('totalExperience')}
                  placeholder="e.g., 3.5"
                  className={errors.totalExperience ? 'border-red-500' : ''}
                />
                {errors.totalExperience && (
                  <p className="text-red-500 text-sm">{errors.totalExperience.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="relevantExperience" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Relevant Experience (Years) *
                </Label>
                <Input
                  id="relevantExperience"
                  {...register('relevantExperience')}
                  placeholder="e.g., 2.5"
                  className={errors.relevantExperience ? 'border-red-500' : ''}
                />
                {errors.relevantExperience && (
                  <p className="text-red-500 text-sm">{errors.relevantExperience.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Notice Period *
                </Label>
                <Select
                  value={watch('noticePeriod')}
                  onValueChange={(value) => setValue('noticePeriod', value as any)}
                >
                  <SelectTrigger className={errors.noticePeriod ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your notice period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (Available now)</SelectItem>
                    <SelectItem value="15-days">15 Days</SelectItem>
                    <SelectItem value="30-days">30 Days</SelectItem>
                    <SelectItem value="60-days">60 Days</SelectItem>
                    <SelectItem value="90-days">90 Days</SelectItem>
                    <SelectItem value="negotiable">Negotiable</SelectItem>
                  </SelectContent>
                </Select>
                {errors.noticePeriod && (
                  <p className="text-red-500 text-sm">{errors.noticePeriod.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Earliest Joining Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch('earliestJoiningDate') && "text-muted-foreground",
                        errors.earliestJoiningDate && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('earliestJoiningDate') ? (
                        format(watch('earliestJoiningDate'), "PPP")
                      ) : (
                        <span>Pick earliest joining date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watch('earliestJoiningDate')}
                      onSelect={(date) => setValue('earliestJoiningDate', date!)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {errors.earliestJoiningDate && (
                  <p className="text-red-500 text-sm">{errors.earliestJoiningDate.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Interview Availability *
                </Label>
                <Select
                  value={watch('availableForInterview')}
                  onValueChange={(value) => setValue('availableForInterview', value as any)}
                >
                  <SelectTrigger className={errors.availableForInterview ? 'border-red-500' : ''}>
                    <SelectValue placeholder="When can you interview?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">Immediately</SelectItem>
                    <SelectItem value="within-week">Within a week</SelectItem>
                    <SelectItem value="within-2weeks">Within 2 weeks</SelectItem>
                    <SelectItem value="specific-date">Specific date</SelectItem>
                  </SelectContent>
                </Select>
                {errors.availableForInterview && (
                  <p className="text-red-500 text-sm">{errors.availableForInterview.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Work Mode Preference *
                </Label>
                <Select
                  value={watch('workMode')}
                  onValueChange={(value) => setValue('workMode', value as any)}
                >
                  <SelectTrigger className={errors.workMode ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote only</SelectItem>
                    <SelectItem value="hybrid">Hybrid (2-3 days office)</SelectItem>
                    <SelectItem value="office">Office only</SelectItem>
                    <SelectItem value="any">Any/Flexible</SelectItem>
                  </SelectContent>
                </Select>
                {errors.workMode && (
                  <p className="text-red-500 text-sm">{errors.workMode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Shift Preference *
                </Label>
                <Select
                  value={watch('shiftPreference')}
                  onValueChange={(value) => setValue('shiftPreference', value as any)}
                >
                  <SelectTrigger className={errors.shiftPreference ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select shift preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day shift (9 AM - 6 PM)</SelectItem>
                    <SelectItem value="night">Night shift (6 PM - 3 AM)</SelectItem>
                    <SelectItem value="rotational">Rotational shifts</SelectItem>
                    <SelectItem value="flexible">Flexible hours</SelectItem>
                  </SelectContent>
                </Select>
                {errors.shiftPreference && (
                  <p className="text-red-500 text-sm">{errors.shiftPreference.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredInterviewTime">
                  Preferred Interview Time
                </Label>
                <Input
                  id="preferredInterviewTime"
                  {...register('preferredInterviewTime')}
                  placeholder="e.g., Weekdays after 6 PM"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primarySkills" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Primary Skills *
                </Label>
                <Textarea
                  id="primarySkills"
                  {...register('primarySkills')}
                  placeholder="List your key technical skills, programming languages, frameworks, tools, etc."
                  rows={3}
                  className={errors.primarySkills ? 'border-red-500' : ''}
                />
                {errors.primarySkills && (
                  <p className="text-red-500 text-sm">{errors.primarySkills.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    {...register('portfolioUrl')}
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub Profile</Label>
                  <Input
                    id="githubUrl"
                    {...register('githubUrl')}
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                  <Input
                    id="linkedinUrl"
                    {...register('linkedinUrl')}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Resume Upload *
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor="resume"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {resumeFile ? (
                      <>
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <span className="text-green-600 font-medium">{resumeFile.name}</span>
                        <span className="text-sm text-gray-500">Click to replace</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400" />
                        <span className="text-gray-600">Upload your resume</span>
                        <span className="text-sm text-gray-500">PDF, DOC, or DOCX (max 5MB)</span>
                      </>
                    )}
                  </Label>
                </div>
                {errors.resumeUploaded && (
                  <p className="text-red-500 text-sm">{errors.resumeUploaded.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetter" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Cover Letter *
                </Label>
                <Textarea
                  id="coverLetter"
                  {...register('coverLetter')}
                  placeholder="Write a compelling cover letter explaining why you're the perfect fit for this role..."
                  rows={5}
                  className={errors.coverLetter ? 'border-red-500' : ''}
                />
                <div className="text-sm text-gray-500">
                  {watch('coverLetter')?.length || 0}/2000 characters
                </div>
                {errors.coverLetter && (
                  <p className="text-red-500 text-sm">{errors.coverLetter.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reasonForChange">
                  Reason for Job Change *
                </Label>
                <Textarea
                  id="reasonForChange"
                  {...register('reasonForChange')}
                  placeholder="What's motivating your job search? Be honest and professional..."
                  rows={3}
                  className={errors.reasonForChange ? 'border-red-500' : ''}
                />
                {errors.reasonForChange && (
                  <p className="text-red-500 text-sm">{errors.reasonForChange.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="careerGoals">
                  Career Goals & Aspirations *
                </Label>
                <Textarea
                  id="careerGoals"
                  {...register('careerGoals')}
                  placeholder="Where do you see yourself in the next 2-3 years? What are your career aspirations?"
                  rows={4}
                  className={errors.careerGoals ? 'border-red-500' : ''}
                />
                {errors.careerGoals && (
                  <p className="text-red-500 text-sm">{errors.careerGoals.message}</p>
                )}
              </div>

              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Required Agreements</h4>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="termsAccepted"
                    checked={watch('termsAccepted')}
                    onCheckedChange={(checked) => setValue('termsAccepted', !!checked)}
                    className={errors.termsAccepted ? 'border-red-500' : ''}
                  />
                  <Label htmlFor="termsAccepted" className="text-sm leading-6">
                    I accept the{' '}
                    <a href="/terms" className="text-blue-600 underline" target="_blank">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-600 underline" target="_blank">
                      Privacy Policy
                    </a>
                    *
                  </Label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-red-500 text-sm">{errors.termsAccepted.message}</p>
                )}

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="dataProcessingConsent"
                    checked={watch('dataProcessingConsent')}
                    onCheckedChange={(checked) => setValue('dataProcessingConsent', !!checked)}
                    className={errors.dataProcessingConsent ? 'border-red-500' : ''}
                  />
                  <Label htmlFor="dataProcessingConsent" className="text-sm leading-6">
                    I consent to the processing of my personal data for recruitment purposes *
                  </Label>
                </div>
                {errors.dataProcessingConsent && (
                  <p className="text-red-500 text-sm">{errors.dataProcessingConsent.message}</p>
                )}

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="communicationConsent"
                    checked={watch('communicationConsent')}
                    onCheckedChange={(checked) => setValue('communicationConsent', !!checked)}
                  />
                  <Label htmlFor="communicationConsent" className="text-sm leading-6">
                    I agree to receive updates about my application and relevant job opportunities
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Apply for {jobTitle}</h2>
              <p className="text-sm text-gray-600">{companyName}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-gray-500">{stepTitles[currentStep - 1]}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* TXC Earning Indicator */}
          {txcEarned > 0 && (
            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-3 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  TXC Earned: +{txcEarned} coins
                </span>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};