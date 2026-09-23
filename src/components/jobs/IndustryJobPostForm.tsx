import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JOB_CATEGORIES, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, WORK_MODES, getSkillsForCategory, getRolesForCategory } from "@/utils/jobCategories";
import { Sparkles, Plus, X, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from 'sonner';

interface IndustryJobPostFormProps {
  onSubmit: (jobData: any) => void;
  initialData?: any;
  isSubmitting?: boolean;
}

export const IndustryJobPostForm: React.FC<IndustryJobPostFormProps> = ({ 
  onSubmit, 
  initialData = {}, 
  isSubmitting = false 
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'description' | 'requirements' | 'compensation'>('basic');
  const [formData, setFormData] = useState({
    // Basic Info
    industry: initialData.industry || '',
    job_title: initialData.job_title || '',
    company_name: initialData.company_name || '',
    location: initialData.location || '',
    employment_type: initialData.employment_type || '',
    experience_level: initialData.experience_level || '',
    work_mode: initialData.work_mode || '',
    
    // Description
    job_summary: initialData.job_summary || '',
    job_description: initialData.job_description || '',
    key_responsibilities: initialData.key_responsibilities || [],
    
    // Requirements
    skills_required: initialData.skills_required || [],
    education_requirements: initialData.education_requirements || '',
    certifications_required: initialData.certifications_required || [],
    
    // Compensation
    salary_min: initialData.salary_min || '',
    salary_max: initialData.salary_max || '',
    benefits: initialData.benefits || [],
    
    // Contact
    contact_email: initialData.contact_email || '',
    contact_phone: initialData.contact_phone || ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: string, value: string, setValue: (val: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
      setValue('');
    }
  };

  const removeFromArray = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleIndustryChange = (industry: string) => {
    setFormData(prev => ({ ...prev, industry }));
    
    // Auto-suggest skills for the selected industry
    const suggestedSkills = getSkillsForCategory(industry);
    if (suggestedSkills.length > 0 && formData.skills_required.length === 0) {
      setFormData(prev => ({ 
        ...prev, 
        skills_required: suggestedSkills.slice(0, 5) 
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const title = (formData.job_title || '').trim();
    if (!title) {
      setActiveTab('basic');
      toast.error('Please enter a job title');
      return;
    }

    const company = (formData.company_name || '').trim();
    if (!company) {
      setActiveTab('basic');
      toast.error('Please enter a company name');
      return;
    }

    const location = (formData.location || '').trim();
    if (!location) {
      setActiveTab('basic');
      toast.error('Please enter a job location (e.g. Mumbai, India or Remote)');
      return;
    }

    // Auto-fill fallback summary if omitted
    const jobSummary = formData.job_summary?.trim() || 
      formData.job_description?.trim() || 
      `We are hiring a ${title} to join ${company}. This role offers exciting growth opportunities in ${formData.industry || 'the tech domain'}.`;

    const jobDescription = formData.job_description?.trim() || jobSummary;

    const minSalary = formData.salary_min ? parseInt(String(formData.salary_min), 10) : null;
    const maxSalary = formData.salary_max ? parseInt(String(formData.salary_max), 10) : null;
    const salaryRange = (minSalary && maxSalary)
      ? `₹${(minSalary / 100000).toFixed(1)}L - ₹${(maxSalary / 100000).toFixed(1)}L`
      : (minSalary ? `From ₹${(minSalary / 100000).toFixed(1)}L` : 'Competitive / Based on experience');

    onSubmit({
      ...formData,
      job_title: title,
      title: title,
      company_name: company,
      location: location,
      location_city: location,
      job_summary: jobSummary,
      job_description: jobDescription,
      description: jobDescription,
      salary_min: minSalary,
      salary_max: maxSalary,
      min_salary: minSalary,
      max_salary: maxSalary,
      salary_range: salaryRange,
    });
  };

  const generateWithAI = () => {
    if (!formData.industry || !formData.job_title) {
      alert('Please select an industry and enter a job title first');
      return;
    }

    // Generate AI content based on industry and role
    const roles = getRolesForCategory(formData.industry);
    const skills = getSkillsForCategory(formData.industry);
    
    const generatedData = {
      ...formData,
      job_summary: `We are seeking a talented ${formData.job_title} to join our ${formData.industry.toLowerCase()} team. This role offers an excellent opportunity to work with cutting-edge technologies and contribute to innovative projects.`,
      job_description: `As a ${formData.job_title}, you will be responsible for delivering high-quality solutions in the ${formData.industry.toLowerCase()} domain. You'll work collaboratively with cross-functional teams to drive business objectives and technical excellence.`,
      key_responsibilities: [
        `Lead ${formData.industry.toLowerCase()} projects and initiatives`,
        `Collaborate with stakeholders to define requirements`,
        `Implement best practices and industry standards`,
        `Mentor junior team members`,
        `Ensure quality deliverables and timely execution`
      ],
      skills_required: skills.slice(0, 8),
      benefits: [
        'Competitive salary package',
        'Health insurance coverage',
        'Professional development opportunities',
        'Flexible working arrangements',
        'Performance bonuses'
      ]
    };

    setFormData(generatedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">Basic Job Information</span>
                <Button type="button" onClick={generateWithAI} variant="outline" size="sm">
                  <Sparkles className="h-4 w-4 mr-1 text-primary" />
                  AI Generate
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={handleIndustryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(JOB_CATEGORIES).map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="job_title">Job Title *</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="e.g., Acme Tech Solutions"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Mumbai, India or Remote"
                  />
                </div>

                <div>
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select value={formData.employment_type} onValueChange={(value) => handleInputChange('employment_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="work_mode">Work Mode</Label>
                  <Select value={formData.work_mode} onValueChange={(value) => handleInputChange('work_mode', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_MODES.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="button" onClick={() => setActiveTab('description')}>
                  Next: Description <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="description" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="job_summary">Job Summary</Label>
                <Textarea
                  id="job_summary"
                  value={formData.job_summary}
                  onChange={(e) => handleInputChange('job_summary', e.target.value)}
                  placeholder="Brief overview of the role..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="job_description">Detailed Description</Label>
                <Textarea
                  id="job_description"
                  value={formData.job_description}
                  onChange={(e) => handleInputChange('job_description', e.target.value)}
                  placeholder="Detailed job description..."
                  rows={5}
                />
              </div>

              <div>
                <Label>Key Responsibilities</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    placeholder="Add a responsibility..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('key_responsibilities', newResponsibility, setNewResponsibility))}
                  />
                  <Button
                    type="button"
                    onClick={() => addToArray('key_responsibilities', newResponsibility, setNewResponsibility)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.key_responsibilities.map((responsibility, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {responsibility}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromArray('key_responsibilities', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setActiveTab('basic')}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back: Basic Info
                </Button>
                <Button type="button" onClick={() => setActiveTab('requirements')}>
                  Next: Requirements <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requirements & Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Required Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('skills_required', newSkill, setNewSkill))}
                  />
                  <Button
                    type="button"
                    onClick={() => addToArray('skills_required', newSkill, setNewSkill)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills_required.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromArray('skills_required', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="education_requirements">Education Requirements</Label>
                <Textarea
                  id="education_requirements"
                  value={formData.education_requirements}
                  onChange={(e) => handleInputChange('education_requirements', e.target.value)}
                  placeholder="e.g., Bachelor's degree in Computer Science..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Certifications</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add a certification..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('certifications_required', newCertification, setNewCertification))}
                  />
                  <Button
                    type="button"
                    onClick={() => addToArray('certifications_required', newCertification, setNewCertification)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.certifications_required.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {cert}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromArray('certifications_required', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setActiveTab('description')}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back: Description
                </Button>
                <Button type="button" onClick={() => setActiveTab('compensation')}>
                  Next: Compensation <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compensation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compensation & Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary_min">Minimum Salary (₹/year)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => handleInputChange('salary_min', e.target.value)}
                    placeholder="e.g., 800000"
                  />
                </div>

                <div>
                  <Label htmlFor="salary_max">Maximum Salary (₹/year)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => handleInputChange('salary_max', e.target.value)}
                    placeholder="e.g., 1200000"
                  />
                </div>
              </div>

              <div>
                <Label>Benefits</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Add a benefit..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('benefits', newBenefit, setNewBenefit))}
                  />
                  <Button
                    type="button"
                    onClick={() => addToArray('benefits', newBenefit, setNewBenefit)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {benefit}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromArray('benefits', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="hr@company.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setActiveTab('requirements')}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back: Requirements
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting Job...
                    </>
                  ) : (
                    'Ready to Post Job 🚀'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-primary hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Posting Job to TalentXcel...
            </>
          ) : (
            'Post Job Now'
          )}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={generateWithAI} className="h-12 border-primary/30 hover:bg-primary/5">
          <Sparkles className="h-4 w-4 mr-2 text-primary" />
          Generate with AI
        </Button>
      </div>
    </form>
  );
};