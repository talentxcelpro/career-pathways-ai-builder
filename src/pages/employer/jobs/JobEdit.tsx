
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

const JobEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<Job>>({});

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Job;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (job) {
      setFormData(job);
    }
  }, [job]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<Job>) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Job updated successfully');
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      navigate('/jobs/manage');
    },
    onError: (error) => {
      toast.error('Failed to update job');
      console.error('Error updating job:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof Job, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field: keyof Job, value: string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: keyof Job, item: string) => {
    const currentArray = (formData[field] as string[]) || [];
    handleArrayFieldChange(field, [...currentArray, item]);
  };

  const removeArrayItem = (field: keyof Job, index: number) => {
    const currentArray = (formData[field] as string[]) || [];
    handleArrayFieldChange(field, currentArray.filter((_, i) => i !== index));
  };

  const ArrayInput = ({ field, label, placeholder }: { field: keyof Job, label: string, placeholder: string }) => {
    const [inputValue, setInputValue] = useState('');
    const items = (formData[field] as string[]) || [];

    const handleAdd = () => {
      if (inputValue.trim()) {
        addArrayItem(field, inputValue.trim());
        setInputValue('');
      }
    };

    return (
      <div>
        <Label>{label}</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            />
            <Button type="button" onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeArrayItem(field, index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
        <Button onClick={() => navigate('/jobs/manage')}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/jobs/manage')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Edit className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Job Post</h1>
          <p className="text-gray-600">Update your job posting details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential job posting details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input 
                id="title" 
                value={formData.title || ''} 
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea 
                id="description" 
                rows={8} 
                value={formData.description || ''} 
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                placeholder="Provide a detailed description of the role, responsibilities, and what the candidate will be doing..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={formData.location || ''} 
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Mumbai, Bangalore, Remote"
                />
              </div>
              
              <div>
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select 
                  value={formData.employment_type || ''} 
                  onValueChange={(value) => handleInputChange('employment_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select 
                  value={formData.experience_level || ''} 
                  onValueChange={(value) => handleInputChange('experience_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (6+ years)</SelectItem>
                    <SelectItem value="executive">Executive/Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select 
                  value={formData.employment_type || ''} 
                  onValueChange={(value) => handleInputChange('employment_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_remote"
                  checked={formData.is_remote || false}
                  onCheckedChange={(checked) => handleInputChange('is_remote', checked)}
                />
                <Label htmlFor="is_remote">Remote Work Available</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured || false}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
                <Label htmlFor="is_featured">Featured Job Posting</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compensation & Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Compensation & Benefits</CardTitle>
            <CardDescription>Salary range and benefits information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salary_min">Minimum Salary (₹)</Label>
                <Input 
                  id="salary_min" 
                  type="number"
                  value={formData.salary_min || ''} 
                  onChange={(e) => handleInputChange('salary_min', parseInt(e.target.value) || null)}
                  placeholder="e.g., 500000"
                />
              </div>
              
              <div>
                <Label htmlFor="salary_max">Maximum Salary (₹)</Label>
                <Input 
                  id="salary_max" 
                  type="number"
                  value={formData.salary_max || ''} 
                  onChange={(e) => handleInputChange('salary_max', parseInt(e.target.value) || null)}
                  placeholder="e.g., 800000"
                />
              </div>

              <div>
                <Label htmlFor="salary_currency">Currency</Label>
                <Select 
                  value={formData.salary_currency || 'INR'} 
                  onValueChange={(value) => handleInputChange('salary_currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ INR</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ArrayInput 
              field="benefits" 
              label="Benefits & Perks" 
              placeholder="Add benefit (e.g., Health insurance, Flexible hours)"
            />
          </CardContent>
        </Card>

        {/* Requirements & Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements & Skills</CardTitle>
            <CardDescription>Qualifications and technical requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="requirements">Job Requirements</Label>
              <Textarea 
                id="requirements" 
                rows={6} 
                value={formData.requirements || ''} 
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="List the key requirements, qualifications, and responsibilities for this role..."
              />
            </div>

            <ArrayInput 
              field="skills_required" 
              label="Required Skills" 
              placeholder="Add skill (e.g., React, Node.js, Python)"
            />

            <ArrayInput 
              field="preferred_certifications" 
              label="Preferred Certifications" 
              placeholder="Add preferred certification"
            />

            <div>
              <Label htmlFor="minimum_education">Minimum Education</Label>
              <Input 
                id="minimum_education" 
                value={formData.minimum_education || ''} 
                onChange={(e) => handleInputChange('minimum_education', e.target.value)}
                placeholder="e.g., Bachelor's degree in Computer Science"
              />
            </div>
          </CardContent>
        </Card>

        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>How candidates should apply and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="application_method">Application Method</Label>
                <Select 
                  value={formData.application_method || 'platform'} 
                  onValueChange={(value) => handleInputChange('application_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform">Through Platform</SelectItem>
                    <SelectItem value="email">Email Application</SelectItem>
                    <SelectItem value="external">External Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="application_deadline">Application Deadline</Label>
                <Input 
                  id="application_deadline" 
                  type="date"
                  value={formData.application_deadline ? new Date(formData.application_deadline).toISOString().split('T')[0] : ''} 
                  onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="external_url">External Application URL</Label>
              <Input 
                id="external_url" 
                type="url"
                value={formData.external_url || ''} 
                onChange={(e) => handleInputChange('external_url', e.target.value)}
                placeholder="https://company.com/careers/apply"
              />
              <p className="text-sm text-gray-500 mt-1">Only required if application method is "External Link"</p>
            </div>

          </CardContent>
        </Card>

        {/* Job Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Job Settings</CardTitle>
            <CardDescription>Publication and visibility settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active !== false}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Job is Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ai_match_enabled"
                  checked={formData.ai_match_enabled || false}
                  onCheckedChange={(checked) => handleInputChange('ai_match_enabled', checked)}
                />
                <Label htmlFor="ai_match_enabled">Enable AI Candidate Matching</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="employment_type">Employment Category</Label>
              <Select 
                value={formData.employment_type || ''} 
                onValueChange={(value) => handleInputChange('employment_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border">
          <Button type="button" variant="outline" onClick={() => navigate('/jobs/manage')}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobEdit;
