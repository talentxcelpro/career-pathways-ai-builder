import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface EducationCertificationFormProps {
  formData: any;
  onInputChange: (key: string, value: any) => void;
}

const educationOptions = [
  '10th Pass',
  '12th Pass',
  'Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate / PhD',
  'Any Graduate',
  'Other'
];

const specializationOptions = [
  'Computer Science / IT',
  'Engineering (Any)',
  'Business Administration',
  'Finance / Accounting',
  'Arts / Humanities',
  'Law',
  'Medical / Healthcare',
  'Education / Teaching',
  'Science / Research',
  'Design / Multimedia',
  'Other'
];

const experienceTypeOptions = [
  'Fresher Only',
  'Experienced Only',
  'Both Fresher & Experienced'
];

const industryExperienceOptions = [
  'IT / Software',
  'Sales / Marketing',
  'Customer Service / BPO',
  'Finance / Banking',
  'Education / Training',
  'Healthcare / Pharma',
  'Engineering / Manufacturing',
  'Design / Creative',
  'Government / PSU',
  'Other'
];

const preferredExperienceOptions = [
  'Startup',
  'MNC',
  'Government',
  'Remote/Distributed Teams',
  'On-site Roles',
  'Field Work',
  'Customer-Facing Roles'
];

export default function EducationCertificationForm({ formData, onInputChange }: EducationCertificationFormProps) {
  const handleSpecializationChange = (field: string, checked: boolean) => {
    const current = formData.specialization_fields || [];
    if (checked) {
      onInputChange('specialization_fields', [...current, field]);
    } else {
      onInputChange('specialization_fields', current.filter((f: string) => f !== field));
    }
  };

  const handleIndustryExperienceChange = (field: string, checked: boolean) => {
    const current = formData.relevant_industry_experience || [];
    if (checked) {
      onInputChange('relevant_industry_experience', [...current, field]);
    } else {
      onInputChange('relevant_industry_experience', current.filter((f: string) => f !== field));
    }
  };

  const handlePreferredExperienceChange = (field: string, checked: boolean) => {
    const current = formData.preferred_experience_in || [];
    if (checked) {
      onInputChange('preferred_experience_in', [...current, field]);
    } else {
      onInputChange('preferred_experience_in', current.filter((f: string) => f !== field));
    }
  };

  const addCertification = () => {
    const current = formData.preferred_certifications || [];
    onInputChange('preferred_certifications', [
      ...current,
      {
        name: '',
        issuing_authority: '',
        validity: '',
        mandatory: false
      }
    ]);
  };

  const updateCertification = (index: number, field: string, value: any) => {
    const current = formData.preferred_certifications || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    onInputChange('preferred_certifications', updated);
  };

  const removeCertification = (index: number) => {
    const current = formData.preferred_certifications || [];
    onInputChange('preferred_certifications', current.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Education Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Education Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimum_education">Minimum Education Requirement *</Label>
              <Select
                value={formData.minimum_education || ''}
                onValueChange={(value) => onInputChange('minimum_education', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select minimum education" />
                </SelectTrigger>
                <SelectContent>
                  {educationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_year_of_passing">Minimum Year of Passing</Label>
              <Input
                id="minimum_year_of_passing"
                type="number"
                placeholder="e.g., 2020"
                value={formData.minimum_year_of_passing || ''}
                onChange={(e) => onInputChange('minimum_year_of_passing', parseInt(e.target.value) || null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Specialization / Field of Study (Multiple selections allowed)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {specializationOptions.map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={`spec-${field}`}
                    checked={(formData.specialization_fields || []).includes(field)}
                    onCheckedChange={(checked) => handleSpecializationChange(field, !!checked)}
                  />
                  <Label htmlFor={`spec-${field}`} className="text-sm">
                    {field}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maximum_gap_allowed">Maximum Gap Allowed (years)</Label>
              <Input
                id="maximum_gap_allowed"
                type="number"
                placeholder="e.g., 2"
                value={formData.maximum_gap_allowed || ''}
                onChange={(e) => onInputChange('maximum_gap_allowed', parseInt(e.target.value) || null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education_notes">Notes / Additional Preferences</Label>
            <Textarea
              id="education_notes"
              placeholder="Any other preferences like full-time education, NAAC accredited colleges, etc."
              value={formData.education_notes || ''}
              onChange={(e) => onInputChange('education_notes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Certification Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Preferred Certifications
            <Button type="button" variant="outline" size="sm" onClick={addCertification}>
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.preferred_certifications || []).map((cert: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Certification {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Certification Name</Label>
                  <Input
                    placeholder="e.g., AWS Certified Solutions Architect"
                    value={cert.name || ''}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Issuing Authority</Label>
                  <Input
                    placeholder="e.g., Amazon Web Services"
                    value={cert.issuing_authority || ''}
                    onChange={(e) => updateCertification(index, 'issuing_authority', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Validity (Optional)</Label>
                  <Input
                    placeholder="e.g., 3 years"
                    value={cert.validity || ''}
                    onChange={(e) => updateCertification(index, 'validity', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Requirement Type</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`mandatory-${index}`}
                        checked={cert.mandatory || false}
                        onCheckedChange={(checked) => updateCertification(index, 'mandatory', !!checked)}
                      />
                      <Label htmlFor={`mandatory-${index}`} className="text-sm">
                        Mandatory
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experience Level Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Experience Level Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Experience Type *</Label>
            <Select
              value={formData.experience_type || ''}
              onValueChange={(value) => onInputChange('experience_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience type" />
              </SelectTrigger>
              <SelectContent>
                {experienceTypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimum_experience_years">Minimum Experience (years)</Label>
              <Input
                id="minimum_experience_years"
                type="number"
                placeholder="0"
                value={formData.minimum_experience_years || ''}
                onChange={(e) => onInputChange('minimum_experience_years', parseInt(e.target.value) || null)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maximum_experience_years">Maximum Experience (years)</Label>
              <Input
                id="maximum_experience_years"
                type="number"
                placeholder="10"
                value={formData.maximum_experience_years || ''}
                onChange={(e) => onInputChange('maximum_experience_years', parseInt(e.target.value) || null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Relevant Industry Experience</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {industryExperienceOptions.map((industry) => (
                <div key={industry} className="flex items-center space-x-2">
                  <Checkbox
                    id={`industry-${industry}`}
                    checked={(formData.relevant_industry_experience || []).includes(industry)}
                    onCheckedChange={(checked) => handleIndustryExperienceChange(industry, !!checked)}
                  />
                  <Label htmlFor={`industry-${industry}`} className="text-sm">
                    {industry}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specific_experience_areas">Specific Experience Areas (Optional)</Label>
            <Textarea
              id="specific_experience_areas"
              placeholder="List specific roles, tools, or domains"
              value={formData.specific_experience_areas || ''}
              onChange={(e) => onInputChange('specific_experience_areas', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred Experience in</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {preferredExperienceOptions.map((pref) => (
                <div key={pref} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pref-${pref}`}
                    checked={(formData.preferred_experience_in || []).includes(pref)}
                    onCheckedChange={(checked) => handlePreferredExperienceChange(pref, !!checked)}
                  />
                  <Label htmlFor={`pref-${pref}`} className="text-sm">
                    {pref}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}