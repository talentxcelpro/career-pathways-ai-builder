import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Sparkles, MapPin, DollarSign, Users, Calendar, Briefcase, Building2, X, Plus, Eye, Send } from 'lucide-react';
import { useCreateJob } from '@/hooks/useJobs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface JobFormData {
  title: string;
  description: string;
  company_name: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_range?: string;
  currency: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
  experience_level: 'entry_level' | 'mid_level' | 'senior_level' | 'executive';
  remote_policy: 'office' | 'remote' | 'hybrid';
  is_remote: boolean;
  skills_required: string[];
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  role_category?: string;
  is_featured: boolean;
  is_urgent: boolean;
  external_url?: string;
  expires_at?: string;
}

const SKILL_SUGGESTIONS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'JavaScript', 'SQL', 'AWS',
  'Docker', 'Kubernetes', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Git', 'Agile',
  'Product Management', 'UI/UX Design', 'Figma', 'Analytics', 'Machine Learning',
  'Data Science', 'Marketing', 'Sales', 'Customer Success', 'Finance', 'HR'
];

const ROLE_CATEGORIES = [
  'Engineering', 'Product', 'Design', 'Data Science', 'Marketing', 'Sales',
  'Customer Success', 'Operations', 'Finance', 'HR', 'Legal', 'Executive'
];

export default function JobPost() {
  const navigate = useNavigate();
  const createJob = useCreateJob();
  const [step, setStep] = useState(1);
  const [skillInput, setSkillInput] = useState('');
  
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    company_name: '',
    location: '',
    currency: 'INR',
    employment_type: 'full_time',
    experience_level: 'mid_level',
    remote_policy: 'office',
    is_remote: false,
    skills_required: [],
    role_category: '',
    is_featured: false,
    is_urgent: false,
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const updateFormData = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills_required.includes(skill)) {
      updateFormData('skills_required', [...formData.skills_required, skill]);
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    updateFormData('skills_required', formData.skills_required.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async () => {
    try {
      // Set expiry date if not provided (default 30 days)
      const expiryDate = formData.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const jobData = {
        ...formData,
        expires_at: expiryDate,
        posted_at: new Date().toISOString(),
        job_status: 'open' as const,
        is_active: true,
      };

      const result = await createJob.mutateAsync(jobData);
      
      if (result) {
        toast.success('Job posted successfully!');
        navigate(`/jobs/${result.id}`);
      }
    } catch (error: any) {
      toast.error('Failed to post job: ' + error.message);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          Job Details
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Job Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Company Name *</label>
            <Input
              value={formData.company_name}
              onChange={(e) => updateFormData('company_name', e.target.value)}
              placeholder="e.g. TechCorp India"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Employment Type</label>
              <Select 
                value={formData.employment_type} 
                onValueChange={(value) => updateFormData('employment_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Experience Level</label>
              <Select 
                value={formData.experience_level} 
                onValueChange={(value) => updateFormData('experience_level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry_level">Entry Level</SelectItem>
                  <SelectItem value="mid_level">Mid Level</SelectItem>
                  <SelectItem value="senior_level">Senior Level</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role Category</label>
            <Select 
              value={formData.role_category} 
              onValueChange={(value) => updateFormData('role_category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Location & Remote Policy
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Location *</label>
            <Input
              value={formData.location}
              onChange={(e) => updateFormData('location', e.target.value)}
              placeholder="e.g. Bangalore, India"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Remote Policy</label>
            <Select 
              value={formData.remote_policy} 
              onValueChange={(value) => {
                updateFormData('remote_policy', value);
                updateFormData('is_remote', value === 'remote');
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office">Office Only</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="remote">Fully Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Compensation
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => updateFormData('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Min Salary</label>
              <Input
                type="number"
                value={formData.salary_min || ''}
                onChange={(e) => updateFormData('salary_min', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="500000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Salary</label>
              <Input
                type="number"
                value={formData.salary_max || ''}
                onChange={(e) => updateFormData('salary_max', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="1000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Salary Range Display (Optional)</label>
            <Input
              value={formData.salary_range || ''}
              onChange={(e) => updateFormData('salary_range', e.target.value)}
              placeholder="e.g. ₹5-10 LPA"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Skills & Requirements
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Required Skills</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Type a skill and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
              />
              <Button onClick={() => addSkill(skillInput)} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Skill suggestions */}
            <div className="flex flex-wrap gap-2 mb-4">
              {SKILL_SUGGESTIONS.filter(skill => 
                !formData.skills_required.includes(skill) && 
                skill.toLowerCase().includes(skillInput.toLowerCase())
              ).slice(0, 8).map(skill => (
                <Badge 
                  key={skill} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => addSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Selected skills */}
            <div className="flex flex-wrap gap-2">
              {formData.skills_required.map(skill => (
                <Badge key={skill} className="bg-primary text-primary-foreground">
                  {skill}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Requirements</label>
            <Textarea
              value={formData.requirements || ''}
              onChange={(e) => updateFormData('requirements', e.target.value)}
              placeholder="List the key requirements for this role..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Responsibilities</label>
            <Textarea
              value={formData.responsibilities || ''}
              onChange={(e) => updateFormData('responsibilities', e.target.value)}
              placeholder="Describe the main responsibilities..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Benefits</label>
            <Textarea
              value={formData.benefits || ''}
              onChange={(e) => updateFormData('benefits', e.target.value)}
              placeholder="List the benefits and perks..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-600" />
          Job Description
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Job Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe the role, company culture, and what makes this opportunity exciting..."
              rows={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">External Application URL (Optional)</label>
            <Input
              value={formData.external_url || ''}
              onChange={(e) => updateFormData('external_url', e.target.value)}
              placeholder="https://company.com/careers/job-id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Application Deadline</label>
            <Input
              type="date"
              value={formData.expires_at ? formData.expires_at.split('T')[0] : ''}
              onChange={(e) => updateFormData('expires_at', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Promotion Options</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.is_featured}
                onCheckedChange={(checked) => updateFormData('is_featured', checked)}
              />
              <label className="text-sm">Featured Job (+₹500)</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.is_urgent}
                onCheckedChange={(checked) => updateFormData('is_urgent', checked)}
              />
              <label className="text-sm">Urgent Hiring (+₹300)</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title && formData.company_name;
      case 2:
        return formData.location;
      case 3:
        return formData.skills_required.length > 0;
      case 4:
        return formData.description;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Post a New Job</h1>
          <p className="text-slate-600">Create an engaging job posting to attract the best candidates</p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Steps Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="space-y-3">
                {[
                  { num: 1, title: 'Job Details', icon: Briefcase },
                  { num: 2, title: 'Location & Salary', icon: MapPin },
                  { num: 3, title: 'Skills & Requirements', icon: Users },
                  { num: 4, title: 'Description & Settings', icon: Calendar }
                ].map(({ num, title, icon: Icon }) => (
                  <div
                    key={num}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      step === num ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-100'
                    }`}
                    onClick={() => setStep(num)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step === num ? 'bg-primary-foreground text-primary' : 'bg-slate-200'
                    }`}>
                      {step > num ? '✓' : num}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => step > 1 ? setStep(step - 1) : navigate('/employer/dashboard')}
                >
                  {step === 1 ? 'Cancel' : 'Previous'}
                </Button>

                <div className="flex gap-2">
                  {step < totalSteps ? (
                    <Button
                      onClick={() => setStep(step + 1)}
                      disabled={!canProceed()}
                    >
                      Next Step
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Preview logic
                          toast.info('Preview feature coming soon!');
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!canProceed() || createJob.isPending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {createJob.isPending ? 'Posting...' : 'Post Job'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}