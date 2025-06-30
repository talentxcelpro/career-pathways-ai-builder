
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, FileText } from "lucide-react";
import { FormData } from './types';

interface PersonalDetailsStepProps {
  formData: FormData;
  onInputChange: (key: keyof FormData, value: any) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, type: 'coverLetter') => void;
}

export default function PersonalDetailsStep({ formData, onInputChange, onFileUpload }: PersonalDetailsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Step 3: Personal & Professional Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Full Name</Label>
            <Input 
              value={formData.fullName} 
              onChange={(e) => onInputChange('fullName', e.target.value)} 
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Email</Label>
            <Input 
              type="email" 
              value={formData.email} 
              onChange={(e) => onInputChange('email', e.target.value)} 
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Phone</Label>
            <Input 
              value={formData.phoneNumber} 
              onChange={(e) => onInputChange('phoneNumber', e.target.value)} 
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Preferred Call Time</Label>
            <Select value={formData.preferredCallTime} onValueChange={(value) => onInputChange('preferredCallTime', value)}>
              <SelectTrigger className="h-9 mt-1">
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
            <Label className="text-sm">Location</Label>
            <Input 
              value={formData.location} 
              onChange={(e) => onInputChange('location', e.target.value)} 
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Years of Experience</Label>
            <Input 
              value={formData.yearsOfExperience} 
              onChange={(e) => onInputChange('yearsOfExperience', e.target.value)} 
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Current CTC (₹/LPA)</Label>
            <Input 
              value={formData.currentCTC} 
              onChange={(e) => onInputChange('currentCTC', e.target.value)} 
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Expected CTC (₹/LPA)</Label>
            <Input 
              value={formData.expectedCTC} 
              onChange={(e) => onInputChange('expectedCTC', e.target.value)} 
              className="h-9 mt-1"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-sm">Notice Period</Label>
            <Select value={formData.noticePeriod} onValueChange={(value) => onInputChange('noticePeriod', value)}>
              <SelectTrigger className="h-9 mt-1">
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
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-sm">Ready to Relocate?</Label>
            <RadioGroup
              value={formData.readyToRelocate}
              onValueChange={(value) => onInputChange('readyToRelocate', value)}
              className="flex space-x-4 mt-1"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="yes" id="relocate-yes" />
                <Label htmlFor="relocate-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="no" id="relocate-no" />
                <Label htmlFor="relocate-no" className="text-sm">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm">Remote Work Preference</Label>
            <RadioGroup
              value={formData.remoteWorkPreference}
              onValueChange={(value) => onInputChange('remoteWorkPreference', value)}
              className="flex space-x-4 mt-1"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="yes" id="remote-yes" />
                <Label htmlFor="remote-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="no" id="remote-no" />
                <Label htmlFor="remote-no" className="text-sm">No</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="hybrid" id="remote-hybrid" />
                <Label htmlFor="remote-hybrid" className="text-sm">Hybrid</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label className="text-sm">LinkedIn Profile (Optional)</Label>
            <Input 
              value={formData.linkedinProfile} 
              onChange={(e) => onInputChange('linkedinProfile', e.target.value)} 
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Portfolio Website (Optional)</Label>
            <Input 
              value={formData.portfolioWebsite} 
              onChange={(e) => onInputChange('portfolioWebsite', e.target.value)} 
              className="h-9 mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm">Upload Cover Letter (Optional)</Label>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 mt-1">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => onFileUpload(e, 'coverLetter')}
              className="hidden"
              id="cover-letter-upload"
            />
            <label htmlFor="cover-letter-upload" className="cursor-pointer flex items-center">
              <FileText className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Upload Cover Letter</span>
              {formData.coverLetter && (
                <span className="text-sm text-green-600 ml-2">{formData.coverLetter.name}</span>
              )}
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
