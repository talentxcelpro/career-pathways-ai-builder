import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JOB_CATEGORIES, EMPLOYMENT_TYPES, WORK_MODES, getSkillsForCategory, getRolesForCategory } from "@/utils/jobCategories";
import { EXPERIENCE_LEVELS } from "@/config/jobs/experienceLevels";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/config/jobs/currencies";
import { LocationAutocomplete } from "@/components/jobs/LocationAutocomplete";
import { GoogleJobsPreviewCard } from "@/components/jobs/GoogleJobsPreviewCard";
import { Sparkles, Plus, X, ArrowLeft, ArrowRight, Loader2, GraduationCap } from "lucide-react";
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
    employment_type: initialData.employment_type || 'FULL_TIME',
    experience_level: initialData.experience_level || 'ENTRY_LEVEL',
    is_fresher_eligible: initialData.is_fresher_eligible ?? true,
    work_mode: initialData.work_mode || 'hybrid',
    
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
    salary_currency: initialData.salary_currency || DEFAULT_CURRENCY.code,
    benefits: initialData.benefits || [],
    
    // Contact & Application
    contact_email: initialData.contact_email || '',
    contact_phone: initialData.contact_phone || '',
    external_url: initialData.external_url || '',
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
        [field]: [...(prev[field as keyof typeof prev] as string[]), value.trim()]
      }));
      setValue('');
    }
  };

  const removeFromArray = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleIndustryChange = (industry: string) => {
    setFormData(prev => ({ ...prev, industry }));
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
      toast.error('Job Title is required');
      return;
    }

    const company = (formData.company_name || '').trim();
    if (!company) {
      setActiveTab('basic');
      toast.error('Company Name is required');
      return;
    }

    const location = (formData.location || '').trim();
    if (!location) {
      setActiveTab('basic');
      toast.error('Location is required');
      return;
    }

    const jobDescription = (formData.job_description || formData.job_summary || '').trim();
    const jobSummary = (formData.job_summary || jobDescription || '').trim();

    if (!jobDescription && !jobSummary) {
      setActiveTab('description');
      toast.error('Please provide a job summary or description');
      return;
    }

    const minSalary = formData.salary_min ? Number(formData.salary_min) : undefined;
    const maxSalary = formData.salary_max ? Number(formData.salary_max) : undefined;
    const currency = formData.salary_currency || 'INR';

    const salaryRange = (minSalary && maxSalary)
      ? `${currency} ${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()}`
      : (minSalary ? `From ${currency} ${minSalary.toLocaleString()}` : 'Competitive / Based on experience');

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
      salary_currency: currency,
      salary_range: salaryRange,
      is_fresher_eligible: formData.is_fresher_eligible,
    });
  };

  const generateWithAI = () => {
    if (!formData.industry || !formData.job_title) {
      toast.info('Please select an industry and enter a job title first');
      return;
    }

    const skills = getSkillsForCategory(formData.industry);
    
    const generatedData = {
      ...formData,
      job_summary: `We are seeking a talented ${formData.job_title} to join our ${formData.industry.toLowerCase()} team. This role offers an excellent opportunity to work with cutting-edge technologies and contribute to innovative projects.`,
      job_description: `As a ${formData.job_title}, you will be responsible for delivering high-quality solutions in the ${formData.industry.toLowerCase()} domain. You will work collaboratively with cross-functional teams to drive business objectives, mentor teammates, and achieve technical excellence.`,
      key_responsibilities: [
        `Lead key initiatives within the ${formData.industry.toLowerCase()} domain`,
        `Collaborate with cross-functional stakeholders to define requirements`,
        `Implement industry best practices and technical standards`,
        `Participate in code reviews, design sessions, and testing`,
        `Ensure timely execution and high quality deliverables`
      ],
      skills_required: skills.slice(0, 8),
      benefits: [
        'Competitive compensation package',
        'Comprehensive health insurance',
        'Professional development allowance',
        'Flexible working arrangements',
        'Performance-based bonus'
      ]
    };

    setFormData(generatedData);
    toast.success('AI job draft generated successfully!');
  };

  // Prepare Google Jobs preview data
  const previewSalary = formData.salary_min && formData.salary_max
    ? `${formData.salary_currency} ${Number(formData.salary_min).toLocaleString()} - ${Number(formData.salary_max).toLocaleString()}`
    : formData.salary_min
    ? `From ${formData.salary_currency} ${Number(formData.salary_min).toLocaleString()}`
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form tabs (left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="compensation">Compensation</TabsTrigger>
            </TabsList>

            {/* TAB 1: Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Basic Job Information</span>
                    <Button type="button" onClick={generateWithAI} variant="outline" size="sm">
                      <Sparkles className="h-4 w-4 mr-1 text-primary" />
                      AI Generate
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry Family</Label>
                      <Select value={formData.industry} onValueChange={handleIndustryChange}>
                        <SelectTrigger id="industry">
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
                        placeholder="e.g., Graduate Software Engineer"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company_name">Company Name *</Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        placeholder="e.g., TalentXcel Partner Corp"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Verified Location *</Label>
                      <LocationAutocomplete
                        id="location"
                        value={formData.location}
                        onChange={(canonical) => handleInputChange('location', canonical)}
                        placeholder="Search city (e.g. Mumbai, Bengaluru, Noida...)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="employment_type">Employment Type</Label>
                      <Select 
                        value={formData.employment_type} 
                        onValueChange={(value) => handleInputChange('employment_type', value)}
                      >
                        <SelectTrigger id="employment_type">
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
                      <Select 
                        value={formData.experience_level} 
                        onValueChange={(value) => handleInputChange('experience_level', value)}
                      >
                        <SelectTrigger id="experience_level">
                          <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPERIENCE_LEVELS.map((level) => (
                            <SelectItem key={level.code} value={level.code}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="work_mode">Workplace Mode</Label>
                      <Select 
                        value={formData.work_mode} 
                        onValueChange={(value) => handleInputChange('work_mode', value)}
                      >
                        <SelectTrigger id="work_mode">
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

                    {/* Fresher Eligible Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                      <div>
                        <Label htmlFor="fresher_toggle" className="text-sm font-semibold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 cursor-pointer">
                          <GraduationCap className="h-4 w-4" />
                          Fresher Eligible (0–1 yr)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Highlights job to recent college graduates
                        </p>
                      </div>
                      <Switch
                        id="fresher_toggle"
                        checked={formData.is_fresher_eligible}
                        onCheckedChange={(checked) => handleInputChange('is_fresher_eligible', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="button" onClick={() => setActiveTab('description')}>
                      Next: Description <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: Description */}
            <TabsContent value="description" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Job Description & Responsibilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="job_summary">Short Summary</Label>
                    <Textarea
                      id="job_summary"
                      value={formData.job_summary}
                      onChange={(e) => handleInputChange('job_summary', e.target.value)}
                      placeholder="Brief overview of the role, team, and high-level mission..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="job_description">Detailed Description *</Label>
                    <Textarea
                      id="job_description"
                      value={formData.job_description}
                      onChange={(e) => handleInputChange('job_description', e.target.value)}
                      placeholder="Comprehensive job description, team context, growth opportunities..."
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label>Key Responsibilities</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newResponsibility}
                        onChange={(e) => setNewResponsibility(e.target.value)}
                        placeholder="Add a key responsibility..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('key_responsibilities', newResponsibility, setNewResponsibility))}
                      />
                      <Button
                        type="button"
                        onClick={() => addToArray('key_responsibilities', newResponsibility, setNewResponsibility)}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {formData.key_responsibilities.map((resp, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded border">
                          <span>{resp}</span>
                          <X
                            className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromArray('key_responsibilities', index)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2 border-t">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('basic')}>
                      <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                    </Button>
                    <Button type="button" onClick={() => setActiveTab('requirements')}>
                      Next: Requirements <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: Requirements */}
            <TabsContent value="requirements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Candidate Requirements & Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Required Skills</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g. React, Python, SQL..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('skills_required', newSkill, setNewSkill))}
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
                      placeholder="e.g., B.Tech / BE / BCA / MCA / B.Sc in related field"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Certifications (Optional)</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="Add a certification..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('certifications_required', newCertification, setNewCertification))}
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

                  <div className="flex justify-between pt-2 border-t">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('description')}>
                      <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                    </Button>
                    <Button type="button" onClick={() => setActiveTab('compensation')}>
                      Next: Compensation <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: Compensation */}
            <TabsContent value="compensation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Compensation & Apply Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Currency Selector */}
                  <div>
                    <Label htmlFor="salary_currency">Salary Currency</Label>
                    <Select
                      value={formData.salary_currency}
                      onValueChange={(val) => handleInputChange('salary_currency', val)}
                    >
                      <SelectTrigger id="salary_currency" className="max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.symbol} {c.code} — {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salary_min">Minimum Salary / Year</Label>
                      <Input
                        id="salary_min"
                        type="number"
                        value={formData.salary_min}
                        onChange={(e) => handleInputChange('salary_min', e.target.value)}
                        placeholder="e.g., 500000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="salary_max">Maximum Salary / Year</Label>
                      <Input
                        id="salary_max"
                        type="number"
                        value={formData.salary_max}
                        onChange={(e) => handleInputChange('salary_max', e.target.value)}
                        placeholder="e.g., 900000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Benefits & Perks</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        placeholder="e.g. Health Insurance, PF, Annual Bonus..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('benefits', newBenefit, setNewBenefit))}
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
                      <Label htmlFor="contact_email">HR Contact Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        placeholder="careers@company.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="external_url">External Application URL (Optional)</Label>
                      <Input
                        id="external_url"
                        type="url"
                        value={formData.external_url}
                        onChange={(e) => handleInputChange('external_url', e.target.value)}
                        placeholder="https://company.com/apply (leave empty for native apply)"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2 border-t">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('requirements')}>
                      <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="bg-primary text-primary-foreground font-semibold shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        'Publish Job Now 🚀'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form submit bar */}
          <div className="flex gap-4 pt-2">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-primary hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Publishing Job to TalentXcel Network...
                </>
              ) : (
                'Publish Job Now'
              )}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={generateWithAI} className="h-12 border-primary/30 hover:bg-primary/5">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Generate with AI
            </Button>
          </div>
        </div>

        {/* Live Google Jobs Preview Card (right 1 col) */}
        <div className="space-y-4">
          <GoogleJobsPreviewCard
            data={{
              title: formData.job_title,
              company: formData.company_name,
              location: formData.location,
              employmentType: formData.employment_type,
              salary: previewSalary,
              currency: formData.salary_currency,
              datePosted: new Date().toISOString(),
              description: formData.job_description || formData.job_summary,
              externalUrl: formData.external_url || 'https://talentxcel.in/jobs/apply',
              isFresherEligible: formData.is_fresher_eligible,
              workplaceType: formData.work_mode === 'remote' ? 'REMOTE' : formData.work_mode === 'hybrid' ? 'HYBRID' : 'ON_SITE',
            }}
          />
        </div>
      </div>
    </form>
  );
};
