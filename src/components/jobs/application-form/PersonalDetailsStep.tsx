
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CheckCircle, User } from "lucide-react";
import { FormData } from './types';

interface PersonalDetailsStepProps {
  formData: FormData;
  onInputChange: (key: keyof FormData, value: any) => void;
  onCoverLetterUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PersonalDetailsStep({ 
  formData, 
  onInputChange, 
  onCoverLetterUpload 
}: PersonalDetailsStepProps) {
  return (
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
              onChange={(e) => onInputChange('fullName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => onInputChange('phoneNumber', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="preferredCallTime">Preferred Time for Call</Label>
            <Select value={formData.preferredCallTime} onValueChange={(value) => onInputChange('preferredCallTime', value)}>
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
              onChange={(e) => onInputChange('location', e.target.value)}
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
              onChange={(e) => onInputChange('currentCTC', e.target.value)}
              placeholder="e.g., 5.0"
            />
          </div>
          <div>
            <Label htmlFor="expectedCTC">Expected CTC (₹/LPA) *</Label>
            <Input
              id="expectedCTC"
              type="number"
              value={formData.expectedCTC}
              onChange={(e) => onInputChange('expectedCTC', e.target.value)}
              placeholder="e.g., 7.0"
              required
            />
          </div>
          <div>
            <Label htmlFor="noticePeriod">Notice Period *</Label>
            <Select value={formData.noticePeriod} onValueChange={(value) => onInputChange('noticePeriod', value)}>
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
            <Select value={formData.yearsOfExperience} onValueChange={(value) => onInputChange('yearsOfExperience', value)}>
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
              onValueChange={(value) => onInputChange('readyToRelocate', value)}
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
              onValueChange={(value) => onInputChange('remoteWorkPreference', value)}
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
              onChange={(e) => onInputChange('linkedinProfile', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div>
            <Label htmlFor="portfolioWebsite">Portfolio / Website (Optional)</Label>
            <Input
              id="portfolioWebsite"
              type="url"
              value={formData.portfolioWebsite}
              onChange={(e) => onInputChange('portfolioWebsite', e.target.value)}
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
              onChange={onCoverLetterUpload}
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
}
