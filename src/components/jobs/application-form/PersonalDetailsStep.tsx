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
    <div className={`space-y-${isMobile ? '3' : '8'}`}>
      {!isMobile && (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Personal & Professional Details</h3>
          <p className="text-muted-foreground">
            Provide your information to complete your job application.
          </p>
        </div>
      )}

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

        <div className={`space-y-${isMobile ? '1' : '2'}`}>
          <Label htmlFor="phoneNumber" className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="Phone number"
            className={`${isMobile ? 'h-8 text-xs' : 'pl-10'}`}
          />
        </div>

        <div className={`space-y-${isMobile ? '1' : '2'}`}>
          <Label htmlFor="location" className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
            Location <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="City, State"
            className={`${isMobile ? 'h-8 text-xs' : 'pl-10'}`}
          />
        </div>
        </div>
      </div>

      {/* Experience Information */}
      {!isMobile && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-lg font-medium text-foreground">
            <Briefcase className="h-5 w-5 text-primary" />
            Experience
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Experience</Label>
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
              <Label htmlFor="currentCTC">Current CTC</Label>
              <Input
                id="currentCTC"
                value={formData.currentCTC}
                onChange={(e) => handleInputChange('currentCTC', e.target.value)}
                placeholder="e.g., 6.0 LPA"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedCTC">Expected CTC <span className="text-destructive">*</span></Label>
              <Input
                id="expectedCTC"
                value={formData.expectedCTC}
                onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
                placeholder="e.g., 8.0 LPA"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="noticePeriod">How soon can you join? <span className="text-destructive">*</span></Label>
              <Select
                value={formData.noticePeriod}
                onValueChange={(value) => handleInputChange('noticePeriod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Notice period" />
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
          </div>
        </div>
      )}
      
      {isMobile && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="yearsOfExperience" className="text-xs font-medium">
              Experience
            </Label>
            <Select
              value={formData.yearsOfExperience}
              onValueChange={(value) => handleInputChange('yearsOfExperience', value)}
            >
              <SelectTrigger className="h-8 text-xs">
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
          
          <div className="space-y-1">
            <Label htmlFor="currentCTC" className="text-xs font-medium">
              Current CTC
            </Label>
            <Input
              id="currentCTC"
              value={formData.currentCTC}
              onChange={(e) => handleInputChange('currentCTC', e.target.value)}
              placeholder="e.g., 6.0 LPA"
              className="h-8 text-xs"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="expectedCTC" className="text-xs font-medium">
              Expected CTC <span className="text-destructive">*</span>
            </Label>
            <Input
              id="expectedCTC"
              value={formData.expectedCTC}
              onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
              placeholder="e.g., 8.0 LPA"
              className="h-8 text-xs"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="noticePeriod" className="text-xs font-medium">
              How soon can you join? <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.noticePeriod}
              onValueChange={(value) => handleInputChange('noticePeriod', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Notice period" />
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
        </div>
      )}
    </div>
  );
};

export default PersonalDetailsStep;