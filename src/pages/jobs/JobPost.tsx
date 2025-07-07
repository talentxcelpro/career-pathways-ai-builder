
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Eye, FileText, Sparkles, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmployerAccessGuard } from "@/components/employer/EmployerAccessGuard";
import { useAutoSave } from "@/hooks/useAutoSave";

import JobOverviewForm from "@/components/jobs/JobOverviewForm";
import RoleDescriptionForm from "@/components/jobs/RoleDescriptionForm";
import SkillsQualificationsForm from "@/components/jobs/SkillsQualificationsForm";
import CompensationBenefitsForm from "@/components/jobs/CompensationBenefitsForm";
import CompanyInformationForm from "@/components/jobs/CompanyInformationForm";
import ContactPersonForm from "@/components/jobs/ContactPersonForm";
import JobVisibilityForm from "@/components/jobs/JobVisibilityForm";
import SupportingDocumentsForm from "@/components/jobs/SupportingDocumentsForm";

function JobPostContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    // Company Information
    company_id: '',
    company_name: '',
    company_website: '',
    industry_domain: '',
    company_size: '',
    
    // Job Overview
    job_title: '',
    employment_type: '',
    work_mode: '',
    location_city: '',
    location_state: '',
    work_schedule: '',
    experience_level: '',
    application_deadline: '',
    
    // Description
    job_summary: '',
    job_description: '',
    key_responsibilities: [] as string[],
    must_have_requirements: [] as string[],
    preferred_requirements: [] as string[],
    
    // Skills & Education
    required_skills: [] as string[],
    education_level: '',
    field_of_study: [] as string[],
    year_of_passing: null as number | null,
    max_education_gap: null as number | null,
    certifications: [] as string[],
    
    // Experience
    experience_type: '',
    min_experience: null as number | null,
    max_experience: null as number | null,
    preferred_industries: [] as string[],
    preferred_company_types: [] as string[],
    specific_tools: [] as string[],
    
    // Salary & Benefits
    min_salary: null as number | null,
    max_salary: null as number | null,
    benefits: [] as string[],
    
    // Supporting Documents (URLs to Supabase Storage)
    jd_flyer_url: '',
    team_brochure_url: '',
    benefits_policy_url: '',
    
    // Contact Person
    contact_name: '',
    contact_designation: '',
    contact_email: '',
    contact_phone: '',
    
    // System Fields
    visibility_status: 'active' as 'active' | 'expired' | 'draft',
    ai_match_enabled: true,
    ai_priority: false
  });

  // Fetch user's company info
  const { data: userCompany } = useQuery({
    queryKey: ['user-company'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('company_team_members')
        .select(`
          company_id,
          companies (
            id,
            name,
            website,
            industry,
            size_range
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      if (error) return null;
      return data;
    }
  });

  // Fetch job categories
  const { data: categories = [] } = useQuery({
    queryKey: ['job-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Auto-save functionality
  const autoSaveFunction = async (data: any) => {
    if (!data.job_title?.trim()) return; // Don't save empty forms
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !userCompany?.company_id) return;

    const saveData = {
      ...data,
      posted_by: user.id,
      company_id: userCompany.company_id,
      visibility_status: 'draft',
      is_active: false
    };

    const { error } = await supabase
      .from('jobs')
      .upsert(saveData, { onConflict: 'id' });

    if (error) throw error;
  };

  const { triggerSave, isSaving } = useAutoSave({
    data: formData,
    saveFunction: autoSaveFunction,
    delay: 3000,
    enabled: !!userCompany?.company_id && !!formData.job_title?.trim()
  });

  // Post job mutation
  const postJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Posting job with data:', jobData);

      // Prepare data with proper null handling
      const insertData = {
        ...jobData,
        posted_by: user.id,
        company_id: userCompany?.company_id || null,
        is_active: jobData.visibility_status === 'active',
        // Convert string numbers to integers
        min_salary: jobData.min_salary || null,
        max_salary: jobData.max_salary || null,
        min_experience: jobData.min_experience || null,
        max_experience: jobData.max_experience || null,
        year_of_passing: jobData.year_of_passing || null,
        max_education_gap: jobData.max_education_gap || null,
        // Convert date string to date
        application_deadline: jobData.application_deadline ? new Date(jobData.application_deadline).toISOString().split('T')[0] : null,
        // Ensure arrays are properly formatted
        required_skills: jobData.required_skills || [],
        key_responsibilities: jobData.key_responsibilities || [],
        must_have_requirements: jobData.must_have_requirements || [],
        preferred_requirements: jobData.preferred_requirements || [],
        field_of_study: jobData.field_of_study || [],
        certifications: jobData.certifications || [],
        preferred_industries: jobData.preferred_industries || [],
        preferred_company_types: jobData.preferred_company_types || [],
        specific_tools: jobData.specific_tools || [],
        benefits: jobData.benefits || []
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Job posting error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['employer-stats'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      toast.success('Job posted successfully!');
      navigate('/employer');
    },
    onError: (error: any) => {
      console.error('Job posting failed:', error);
      toast.error(error.message || 'Failed to post job');
    }
  });

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    
    const submitData = { 
      ...formData, 
      visibility_status: isDraft ? 'draft' : 'active'
    };
    
    if (!isDraft) {
      // Validation for publishing
      if (!formData.job_title.trim() || !formData.job_summary.trim()) {
        toast.error('Please fill in all required fields (job title and job summary)');
        return;
      }

      if (formData.required_skills.length === 0) {
        toast.error('Please add at least one required skill');
        return;
      }

      if (!userCompany?.company_id) {
        toast.error('Please join a company first to post jobs');
        return;
      }
    } else {
      // Minimal validation for draft
      if (!formData.job_title.trim()) {
        toast.error('Please add a job title to save as draft');
        return;
      }
    }

    postJobMutation.mutate(submitData);
  };

  const handlePreview = () => {
    if (!formData.job_title.trim()) {
      toast.error('Please add a job title to preview');
      return;
    }
    
    // Navigate to preview with current form data
    navigate('/jobs/post/preview', { 
      state: { 
        formData: {
          ...formData,
          company_name: userCompany?.companies?.name || 'Your Company',
          company_website: userCompany?.companies?.website || '',
          industry_domain: userCompany?.companies?.industry || '',
          company_size: userCompany?.companies?.size_range || ''
        }
      } 
    });
  };

  const handleGenerateAI = () => {
    navigate('/jobs/post/ai');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/jobs')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Briefcase className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Post a New Job</h1>
            </div>
            {isSaving && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Save className="h-4 w-4 mr-1 animate-pulse" />
                Auto-saving...
              </div>
            )}
          </div>
          <p className="text-muted-foreground">Fill in the job details below to find top candidates via AI-powered TalentXcel.</p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Company Information */}
          <CompanyInformationForm
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Job Overview */}
          <JobOverviewForm
            formData={formData}
            categories={categories}
            onInputChange={handleInputChange}
          />

          {/* Role Description */}
          <RoleDescriptionForm
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Skills & Qualifications */}
          <SkillsQualificationsForm
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Compensation & Benefits */}
          <CompensationBenefitsForm
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Supporting Documents */}
          <SupportingDocumentsForm
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Contact Person */}
          <ContactPersonForm
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Job Visibility & AI Features */}
          <JobVisibilityForm />

          {/* Final Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleGenerateAI}
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handlePreview}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Job
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={postJobMutation.isPending}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {postJobMutation.isPending ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={postJobMutation.isPending}
                  className="flex-1"
                >
                  {postJobMutation.isPending ? 'Publishing...' : 'Publish Job Now'}
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                By publishing, you agree to our terms and the job will be live for 15 days
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

export default function JobPost() {
  return (
    <EmployerAccessGuard>
      <JobPostContent />
    </EmployerAccessGuard>
  );
}
