import React, { useState, useEffect } from 'react';
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
import { Sparkles, Plus, X, ArrowLeft, ArrowRight, Loader2, GraduationCap, Save, RotateCcw, CheckCircle2, Clock } from "lucide-react";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const LOCAL_DRAFT_KEY = 'txc_industry_job_draft';

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
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Basic Info
    industry: initialData.industry || initialData.industry_domain || '',
    job_title: initialData.job_title || initialData.title || '',
    company_name: initialData.company_name || '',
    location: initialData.location || initialData.location_city || '',
    employment_type: initialData.employment_type || 'FULL_TIME',
    experience_level: initialData.experience_level || 'ENTRY_LEVEL',
    is_fresher_eligible: initialData.is_fresher_eligible ?? true,
    work_mode: initialData.work_mode || 'hybrid',
    
    // Description
    job_summary: initialData.job_summary || '',
    job_description: initialData.job_description || initialData.description || '',
    key_responsibilities: initialData.key_responsibilities || [],
    
    // Requirements
    skills_required: initialData.skills_required || initialData.required_skills || [],
    education_requirements: initialData.education_requirements || '',
    certifications_required: initialData.certifications_required || initialData.certifications || [],
    
    // Compensation
    salary_min: initialData.salary_min || initialData.min_salary || '',
    salary_max: initialData.salary_max || initialData.max_salary || '',
    salary_currency: initialData.salary_currency || DEFAULT_CURRENCY.code,
    benefits: initialData.benefits || [],
    
    // Contact & Application
    contact_email: initialData.contact_email || initialData.contact_person_email || '',
    contact_phone: initialData.contact_phone || initialData.contact_person_phone || '',
    external_url: initialData.external_url || '',
  });

  // Restore local draft on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.data) {
          if (!formData.job_title && !formData.job_description) {
            setFormData(prev => ({
              ...prev,
              ...parsed.data
            }));
            if (parsed.savedAt) {
              const timeStr = new Date(parsed.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              setLastSavedTime(timeStr);
              toast.info(`Restored your saved draft from ${timeStr}`);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse local draft', e);
    }
  }, []);

  // Auto-save form data to localStorage with debounce
  useEffect(() => {
    const hasContent = !!(formData.job_title || formData.job_description || formData.job_summary || formData.location);
    if (!hasContent) return;

    const timer = setTimeout(() => {
      try {
        const now = new Date();
        localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify({
          data: formData,
          savedAt: now.toISOString()
        }));
        setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('Auto-save draft error:', err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Sync initialData changes when employer profile loads asynchronously
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        company_name: prev.company_name || initialData.company_name || '',
        location: prev.location || initialData.location || initialData.location_city || '',
        contact_email: prev.contact_email || initialData.contact_email || initialData.contact_person_email || '',
        contact_phone: prev.contact_phone || initialData.contact_phone || initialData.contact_person_phone || '',
        industry: prev.industry || initialData.industry_domain || initialData.industry || '',
      }));
    }
  }, [initialData]);

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
      experience_level: formData.experience_level || (formData.is_fresher_eligible ? 'entry-level' : 'mid-level'),
      visibility_status: 'active',
    });
  };

  const handleSaveDraft = () => {
    const title = (formData.job_title || '').trim() || 'Draft Job Role';
    const company = (formData.company_name || '').trim() || initialData.company_name || 'TalentXcel Partner';
    const location = (formData.location || '').trim() || 'Noida, Uttar Pradesh, India';
    const description = (formData.job_description || formData.job_summary || '').trim() || (title ? `Draft posting for ${title} at ${company}.` : '');

    const minSalary = formData.salary_min ? Number(formData.salary_min) : undefined;
    const maxSalary = formData.salary_max ? Number(formData.salary_max) : undefined;
    const currency = formData.salary_currency || 'INR';

    try {
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify({
        data: formData,
        savedAt: new Date().toISOString()
      }));
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error(e);
    }

    onSubmit({
      ...formData,
      job_title: title,
      title: title,
      company_name: company,
      location: location,
      location_city: location,
      job_summary: formData.job_summary || description.slice(0, 250),
      job_description: description,
      description: description,
      salary_min: minSalary,
      salary_max: maxSalary,
      min_salary: minSalary,
      max_salary: maxSalary,
      salary_currency: currency,
      visibility_status: 'draft',
      is_active: false,
    });
  };

  const handleResetDraft = () => {
    if (window.confirm('Reset this job draft? All current unsaved inputs will be cleared.')) {
      try {
        localStorage.removeItem(LOCAL_DRAFT_KEY);
      } catch (e) {
        console.error(e);
      }
      setFormData({
        industry: initialData.industry || initialData.industry_domain || '',
        job_title: '',
        company_name: initialData.company_name || '',
        location: initialData.location || initialData.location_city || '',
        employment_type: 'FULL_TIME',
        experience_level: 'ENTRY_LEVEL',
        is_fresher_eligible: true,
        work_mode: 'hybrid',
        job_summary: '',
        job_description: '',
        key_responsibilities: [],
        skills_required: [],
        education_requirements: '',
        certifications_required: [],
        salary_min: '',
        salary_max: '',
        salary_currency: DEFAULT_CURRENCY.code,
        benefits: [],
        contact_email: initialData.contact_email || initialData.contact_person_email || '',
        contact_phone: initialData.contact_phone || initialData.contact_person_phone || '',
        external_url: '',
      });
      setLastSavedTime(null);
      toast.info('Draft cleared successfully.');
    }
  };

  const generateWithAI = () => {
    let title = (formData.job_title || '').trim();
    let industry = formData.industry;

    if (!title && !industry) {
      title = 'Senior Software Engineer';
      industry = 'Technology';
    } else if (title && !industry) {
      const lower = title.toLowerCase();
      if (
        lower.includes('software') || 
        lower.includes('developer') || 
        lower.includes('engineer') || 
        lower.includes('cloud') || 
        lower.includes('devops') || 
        lower.includes('full stack') ||
        lower.includes('data') ||
        lower.includes('qa') ||
        lower.includes('frontend') ||
        lower.includes('backend')
      ) {
        industry = 'Technology';
      } else if (
        lower.includes('sales') || 
        lower.includes('marketing') || 
        lower.includes('business development') ||
        lower.includes('growth')
      ) {
        industry = 'Sales & Marketing';
      } else if (
        lower.includes('finance') || 
        lower.includes('accountant') || 
        lower.includes('banking') ||
        lower.includes('audit')
      ) {
        industry = 'Finance & Banking';
      } else if (
        lower.includes('hr') || 
        lower.includes('talent') || 
        lower.includes('recruiter') ||
        lower.includes('people')
      ) {
        industry = 'Human Resources';
      } else if (
        lower.includes('design') || 
        lower.includes('ui') || 
        lower.includes('ux') ||
        lower.includes('graphic')
      ) {
        industry = 'Design & Creative';
      } else if (
        lower.includes('health') || 
        lower.includes('nurse') || 
        lower.includes('medical') ||
        lower.includes('pharma')
      ) {
        industry = 'Healthcare';
      } else {
        industry = 'Technology';
      }
    } else if (!title && industry) {
      const roles = getRolesForCategory(industry);
      title = roles.length > 0 ? roles[0] : `${industry} Specialist`;
    }

    const companyName = formData.company_name?.trim() || initialData.company_name || 'TalentXcel Services';
    const location = formData.location?.trim() || initialData.location || initialData.location_city || 'Noida, Uttar Pradesh, India';
    const skills = getSkillsForCategory(industry);

    const jobDescription = `About the Role:
We are seeking an experienced, proactive, and results-driven ${title} to join our high-performing team at ${companyName}. In this strategic role within the ${industry} domain, you will be responsible for leading core initiatives, architecting reliable solutions, and driving cross-functional collaboration that directly influences our technological growth and client satisfaction.

Key Responsibilities & Scope:
• Take end-to-end ownership of project lifecycles, ensuring rigorous engineering excellence, scalability, and adherence to industry best standards.
• Partner closely with multidisciplinary teams including product managers, domain leads, and engineering teams to translate business requirements into technical blueprints.
• Conduct thorough code evaluations, architecture reviews, and automated testing to maintain system stability and high availability.
• Troubleshoot complex technical challenges, identify bottlenecks, and engineer durable, high-throughput solutions.
• Mentor teammates, foster a culture of continuous learning, and document system workflows and best practices.

Candidate Profile & Qualifications:
• Demonstrated background in the ${industry} landscape with a solid track record of delivering resilient products.
• Exceptional problem-solving capabilities, clear communication, and an agile, customer-first mindset.
• Ability to thrive in a fast-paced environment, taking initiative with minimal supervision.`;

    const jobSummary = `We are looking for a dedicated and forward-thinking ${title} to contribute to our mission at ${companyName}. In this position, you will lead high-impact initiatives in the ${industry} domain, work closely with cross-functional partners, and leverage modern industry best practices to deliver outstanding results.`;

    const generatedData = {
      ...formData,
      job_title: title,
      industry: industry,
      company_name: companyName,
      location: location,
      employment_type: formData.employment_type || 'FULL_TIME',
      experience_level: formData.experience_level || 'ENTRY_LEVEL',
      work_mode: formData.work_mode || 'hybrid',
      job_summary: jobSummary,
      job_description: jobDescription,
      key_responsibilities: [
        `Lead day-to-day execution and delivery of key ${title} initiatives and project roadmaps`,
        `Collaborate closely with cross-functional teams and product stakeholders to refine requirements`,
        `Apply industry best practices, modern methodologies, and quality assurance principles`,
        `Troubleshoot issues, identify root causes, and implement scalable, resilient solutions`,
        `Maintain clear technical documentation, reports, and knowledge-sharing artifacts`,
        `Contribute to continuous improvement of workflows, systems, and team standards`
      ],
      skills_required: skills.length > 0 ? skills.slice(0, 8) : ['Analytical Thinking', 'Problem Solving', 'Team Collaboration', 'Communication', 'Strategic Planning'],
      education_requirements: "Bachelor's or Master's degree in Computer Science, Engineering, Business, or related discipline (or equivalent practical experience)",
      salary_min: formData.salary_min || '600000',
      salary_max: formData.salary_max || '1400000',
      salary_currency: formData.salary_currency || 'INR',
      benefits: [
        'Competitive compensation with annual performance appraisal',
        'Comprehensive health, medical, and accidental insurance coverage',
        'Annual professional development and industry certification budget',
        'Flexible hybrid working arrangements with modern tech setup',
        'Generous paid time off, parental leave, and wellness holidays'
      ],
      contact_email: formData.contact_email || initialData.contact_email || '',
      contact_phone: formData.contact_phone || initialData.contact_phone || '',
    };

    setFormData(generatedData);
    toast.success('AI draft & auto-population applied! Google Jobs criteria fulfilled.');
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
        <div className="lg:col-span-2 space-y-4">
          {/* Draft & Auto-population Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border border-border/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              {lastSavedTime ? (
                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Draft auto-saved at {lastSavedTime}
                </span>
              ) : (
                <span className="inline-flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1.5" />
                  Local auto-save active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetDraft}
                className="text-xs text-muted-foreground hover:text-destructive h-8 px-2.5"
                title="Clear current draft and start fresh"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset Draft
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="text-xs h-8 px-3 border-border hover:bg-muted font-medium"
                title="Save draft directly to your employer dashboard"
              >
                <Save className="h-3.5 w-3.5 mr-1 text-primary" />
                Save as Draft
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={generateWithAI}
                className="text-xs bg-primary hover:bg-primary/90 h-8 px-3 font-semibold shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-primary-foreground" />
                Auto-Fill with AI
              </Button>
            </div>
          </div>

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
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="job_description">Detailed Description *</Label>
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full transition-colors",
                        (formData.job_description || '').length >= 500 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40" 
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40"
                      )}>
                        {(formData.job_description || '').length} / 500 chars {(formData.job_description || '').length >= 500 ? '✓ (Google Jobs ready)' : '(min 500 for Google Jobs)'}
                      </span>
                    </div>
                    <Textarea
                      id="job_description"
                      value={formData.job_description}
                      onChange={(e) => handleInputChange('job_description', e.target.value)}
                      placeholder="Comprehensive job description, team context, growth opportunities..."
                      rows={7}
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

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('requirements')}>
                      <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={isSubmitting}
                      >
                        <Save className="h-4 w-4 mr-1.5 text-primary" />
                        Save as Draft
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form submit bar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="h-12 border-border/80 hover:bg-muted font-medium"
            >
              <Save className="h-4 w-4 mr-2 text-primary" />
              Save as Draft
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={generateWithAI} className="h-12 border-primary/30 hover:bg-primary/5">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Auto-Fill with AI
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
              validThrough: new Date(Date.now() + 30 * 86400000).toISOString(),
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
