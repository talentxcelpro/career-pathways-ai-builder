import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, User, MapPin, Phone, Mail, Briefcase, Clock, Globe, Linkedin, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FormData } from './types';
import { toast } from "sonner";

interface PersonalDetailsStepProps {
  formData: FormData;
  onUpdate: (data: Partial<FormData>) => void;
  isMobile?: boolean;
}

const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  formData,
  onUpdate,
  isMobile = false
}) => {
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        onUpdate({
          fullName: profile.full_name || formData.fullName,
          email: profile.email || user.email || formData.email,
          phoneNumber: profile.phone || formData.phoneNumber,
          location: profile.location || formData.location,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleInputChange = (key: keyof FormData, value: string) => {
    onUpdate({ [key]: value });
  };

  const handleCoverLetterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, Word document, or text file');
      return;
    }

    onUpdate({ coverLetter: file });
    toast.success('Cover letter uploaded successfully!');
  };

  return (
    <div className={`space-y-${isMobile ? '6' : '8'}`}>
      <div className="text-center">
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}>Personal & Professional Details</h3>
        <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
          Provide your information to complete your job application.
        </p>
      </div>

      {/* Personal Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-medium text-foreground">
          <User className="h-5 w-5 text-primary" />
          Personal Information
        </div>
        
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 gap-4'}`}>
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Enter your phone number"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredCallTime">Preferred Call Time</Label>
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

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location">
              Current Location <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State, Country"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-medium text-foreground">
          <Briefcase className="h-5 w-5 text-primary" />
          Professional Information
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentCTC">Current CTC (₹ LPA)</Label>
            <Input
              id="currentCTC"
              value={formData.currentCTC}
              onChange={(e) => handleInputChange('currentCTC', e.target.value)}
              placeholder="e.g., 5.5"
              type="number"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedCTC">Expected CTC (₹ LPA)</Label>
            <Input
              id="expectedCTC"
              value={formData.expectedCTC}
              onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
              placeholder="e.g., 8.0"
              type="number"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsOfExperience">Years of Experience</Label>
            <Select
              value={formData.yearsOfExperience}
              onValueChange={(value) => handleInputChange('yearsOfExperience', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fresher">Fresher</SelectItem>
                <SelectItem value="0-1">0-1 years</SelectItem>
                <SelectItem value="1-3">1-3 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="5-8">5-8 years</SelectItem>
                <SelectItem value="8-12">8-12 years</SelectItem>
                <SelectItem value="12+">12+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="noticePeriod">Notice Period</Label>
            <Select
              value={formData.noticePeriod}
              onValueChange={(value) => handleInputChange('noticePeriod', value)}
            >
              <SelectTrigger>
                <Clock className="mr-2 h-4 w-4" />
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

          <div className="space-y-2">
            <Label htmlFor="readyToRelocate">Ready to Relocate?</Label>
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

          <div className="space-y-2">
            <Label htmlFor="remoteWorkPreference">Remote Work Preference</Label>
            <Select
              value={formData.remoteWorkPreference}
              onValueChange={(value) => handleInputChange('remoteWorkPreference', value)}
            >
              <SelectTrigger>
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fully_remote">Fully Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="office_only">Office Only</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-medium text-foreground">
          <ExternalLink className="h-5 w-5 text-primary" />
          Additional Information
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="linkedinProfile"
                value={formData.linkedinProfile}
                onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                placeholder="https://linkedin.com/in/your-profile"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioWebsite">Portfolio/Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="portfolioWebsite"
                value={formData.portfolioWebsite}
                onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                placeholder="https://your-portfolio.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleCoverLetterUpload}
                className="hidden"
                id="cover-letter-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('cover-letter-upload')?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {formData.coverLetter 
                  ? formData.coverLetter.name 
                  : 'Upload Cover Letter (Optional)'
                }
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                PDF, DOC, DOCX, TXT (Max 5MB)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsStep;