import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, GraduationCap } from "lucide-react";

interface SkillsQualificationsFormProps {
  formData: any;
  onInputChange: (key: string, value: any) => void;
}

const popularSkills = [
  'JavaScript', 'React.js', 'SQL', 'Data Analysis', 'Communication', 
  'Figma', 'Python', 'Node.js', 'HTML/CSS', 'Project Management',
  'Leadership', 'Problem Solving', 'Teamwork', 'Marketing', 'Sales'
];

const educationOptions = [
  'High School / 10+2',
  'Diploma', 
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate / PhD',
  'Not Mandatory'
];

const fieldOfStudyOptions = [
  'Computer Science / IT',
  'Engineering',
  'Business / Management', 
  'Finance / Accounting',
  'Law',
  'Arts / Humanities',
  'Education',
  'Healthcare / Life Sciences',
  'Design / Multimedia',
  'Others'
];

const experienceTypeOptions = [
  'Total Experience',
  'Relevant Experience Only'
];

const preferredIndustryOptions = [
  'IT / Software',
  'Sales / Marketing',
  'Customer Support / BPO',
  'Finance / Banking',
  'Education / Training',
  'Healthcare / Pharma',
  'Manufacturing / Engineering',
  'Government / PSU',
  'Creative / Design',
  'Others'
];

const companyBackgroundOptions = [
  'Startup',
  'MNC',
  'Government',
  'Remote Teams',
  'Field Work',
  'Customer-Facing Roles'
];

export default function SkillsQualificationsForm({ formData, onInputChange }: SkillsQualificationsFormProps) {
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const addSkill = (skill: string) => {
    if (skill && !(formData.skills_required || []).includes(skill) && (formData.skills_required || []).length < 15) {
      onInputChange('skills_required', [...(formData.skills_required || []), skill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onInputChange('skills_required', (formData.skills_required || []).filter((skill: string) => skill !== skillToRemove));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      onInputChange('preferred_certifications_list', [...(formData.preferred_certifications_list || []), newCertification.trim()]);
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    const current = formData.preferred_certifications_list || [];
    onInputChange('preferred_certifications_list', current.filter((_: any, i: number) => i !== index));
  };

  const handleMultiSelectChange = (field: string, value: string, checked: boolean) => {
    const current = formData[field] || [];
    if (checked) {
      onInputChange(field, [...current, value]);
    } else {
      onInputChange(field, current.filter((item: string) => item !== value));
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1990; year--) {
      years.push(year);
    }
    return years;
  };

  const generateNumberOptions = (max: number) => {
    return Array.from({ length: max + 1 }, (_, i) => i);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Skills & Qualifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required Skills */}
        <div className="space-y-2">
          <Label>Required Skills (max 15)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(newSkill);
                }
              }}
            />
            <Button type="button" onClick={() => addSkill(newSkill)} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Popular skills:</p>
            <div className="flex flex-wrap gap-2">
              {popularSkills.map((skill) => (
                <Button
                  key={skill}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSkill(skill)}
                  disabled={(formData.skills_required || []).includes(skill) || (formData.skills_required || []).length >= 15}
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(formData.skills_required || []).map((skill: string) => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {(formData.skills_required || []).length}/15 skills added
          </p>
        </div>

        {/* Education Requirements */}
        <div className="space-y-4">
          <h3 className="font-medium">Education Requirements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Education *</Label>
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
              <Label>Minimum Year of Passing</Label>
              <Select
                value={formData.minimum_year_of_passing?.toString() || ''}
                onValueChange={(value) => onInputChange('minimum_year_of_passing', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {generateYearOptions().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Field of Study (Multiple Selections Allowed)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {fieldOfStudyOptions.map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={`field-${field}`}
                    checked={(formData.field_of_study || []).includes(field)}
                    onCheckedChange={(checked) => handleMultiSelectChange('field_of_study', field, !!checked)}
                  />
                  <Label htmlFor={`field-${field}`} className="text-sm">
                    {field}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maximum Education Gap Allowed (in years)</Label>
            <Select
              value={formData.max_education_gap?.toString() || ''}
              onValueChange={(value) => onInputChange('max_education_gap', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gap allowed" />
              </SelectTrigger>
              <SelectContent>
                {generateNumberOptions(10).map((gap) => (
                  <SelectItem key={gap} value={gap.toString()}>
                    {gap === 10 ? '10+' : gap} years
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferred Certifications</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a certification..."
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCertification();
                  }
                }}
              />
              <Button type="button" onClick={addCertification} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.preferred_certifications_list || []).map((cert: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {cert}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeCertification(index)} />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Experience Requirements */}
        <div className="space-y-4">
          <h3 className="font-medium">Experience Requirements</h3>
          
          <div className="space-y-2">
            <Label>Experience Type *</Label>
            <Select
              value={formData.experience_preference || ''}
              onValueChange={(value) => onInputChange('experience_preference', value)}
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
              <Label>Minimum Experience (Years)</Label>
              <Select
                value={formData.minimum_experience_years?.toString() || ''}
                onValueChange={(value) => onInputChange('minimum_experience_years', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select minimum" />
                </SelectTrigger>
                <SelectContent>
                  {generateNumberOptions(30).map((years) => (
                    <SelectItem key={years} value={years.toString()}>
                      {years} years
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Maximum Experience (Years)</Label>
              <Select
                value={formData.maximum_experience_years?.toString() || ''}
                onValueChange={(value) => onInputChange('maximum_experience_years', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select maximum" />
                </SelectTrigger>
                <SelectContent>
                  {generateNumberOptions(30).map((years) => (
                    <SelectItem key={years} value={years.toString()}>
                      {years} years
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Industries (Multiple Selections)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {preferredIndustryOptions.map((industry) => (
                <div key={industry} className="flex items-center space-x-2">
                  <Checkbox
                    id={`industry-${industry}`}
                    checked={(formData.preferred_industries || []).includes(industry)}
                    onCheckedChange={(checked) => handleMultiSelectChange('preferred_industries', industry, !!checked)}
                  />
                  <Label htmlFor={`industry-${industry}`} className="text-sm">
                    {industry}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Company Background (Multiple Selections)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {companyBackgroundOptions.map((background) => (
                <div key={background} className="flex items-center space-x-2">
                  <Checkbox
                    id={`background-${background}`}
                    checked={(formData.preferred_company_background || []).includes(background)}
                    onCheckedChange={(checked) => handleMultiSelectChange('preferred_company_background', background, !!checked)}
                  />
                  <Label htmlFor={`background-${background}`} className="text-sm">
                    {background}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Specific Tools / Domains</Label>
            <Input
              placeholder="e.g., React Native, SAP, Salesforce, Adobe XD"
              value={formData.specific_tools_domains || ''}
              onChange={(e) => onInputChange('specific_tools_domains', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}