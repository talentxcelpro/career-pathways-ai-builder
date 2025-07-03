import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfessionalDetailsSectionProps {
  formData: {
    industry: string;
    experience_years: number;
    current_company: string;
  };
  onFieldChange: (field: string, value: string | number) => void;
}

export const ProfessionalDetailsSection: React.FC<ProfessionalDetailsSectionProps> = ({ 
  formData, 
  onFieldChange 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Details</CardTitle>
        <CardDescription>Additional information about your career</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Industry</label>
            <Select 
              value={formData.industry} 
              onValueChange={(value) => onFieldChange('industry', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Years of Experience</label>
            <Input
              type="number"
              value={formData.experience_years}
              onChange={(e) => onFieldChange('experience_years', parseInt(e.target.value) || 0)}
              placeholder="5"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Current Company</label>
            <Input
              value={formData.current_company}
              onChange={(e) => onFieldChange('current_company', e.target.value)}
              placeholder="Company name"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};