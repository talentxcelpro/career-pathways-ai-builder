
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
import AIJobGenerator from "@/components/jobs/AIJobGenerator";
import AITestButton from "@/components/jobs/AITestButton";
import { IndustryJobPostForm } from "@/components/jobs/IndustryJobPostForm";
import { validateJobData } from "@/utils/jobCategories";
import { normalizeJobContent } from '@/lib/job/normalizeJobContent';
import { toJobsTablePayload } from '@/lib/job/toJobsTablePayload';


function JobPostContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [useIndustryForm, setUseIndustryForm] = useState(false);
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

    // Map form data to database format for auto-save
    const saveData = {
      title: data.job_title,
      description: data.job_description || data.job_summary,
      job_title: data.job_title,
      company_name: data.company_name,
      job_summary: data.job_summary,
      job_description: data.job_description,
      location_city: data.location_city,
      location_state: data.location_state,
      employment_type: data.employment_type,
      work_mode: data.work_mode,
      work_schedule: data.work_schedule,
      experience_level: data.experience_level,
      posted_by: user.id,
      company_id: userCompany.company_id,
      visibility_status: 'draft',
      is_active: false,
      // Handle arrays properly
      key_responsibilities: data.key_responsibilities || [],
      must_have_requirements: data.must_have_requirements || [],
      preferred_requirements: data.preferred_requirements || [],
      skills_required: data.required_skills || [],
      // Contact info
      contact_name: data.contact_name,
      contact_designation: data.contact_designation,
      contact_person_email: data.contact_email,
      contact_person_phone: data.contact_phone,
      // Company info
      company_website: data.company_website,
      industry_domain: data.industry_domain,
      company_size: data.company_size,
      // Salary
      salary_min: data.min_salary || null,
      salary_max: data.max_salary || null,
      // Benefits
      benefits: data.benefits || [],
      // Application deadline
      application_deadline: data.application_deadline ? new Date(data.application_deadline).toISOString().split('T')[0] : null
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

      // ── Gate 2D: Run canonical normalization pipeline ──────────
      const normResult = normalizeJobContent(jobData);
      const canonicalPayload = toJobsTablePayload(normResult.normalized);

      // Resolve company_id
      let resolvedCompanyId = userCompany?.company_id || null;
      if (!resolvedCompanyId && jobData.company_name?.trim()) {
        try {
          const { data: cId } = await supabase.rpc('find_or_create_company', {
            company_name_param: jobData.company_name.trim()
          });
          if (cId) resolvedCompanyId = cId;
        } catch (cErr) {
          console.warn('find_or_create_company error:', cErr);
        }
      }

      // Prepare data with proper null handling and correct column names
      const insertData = {
        // Base canonical payload (normalized title, description, employment_type, requirement arrays)
        ...canonicalPayload,

        // Map form fields to correct database columns
        job_title: jobData.job_title,
        company_name: canonicalPayload.company_name || jobData.company_name,
        job_summary: jobData.job_summary,
        job_description: jobData.job_description,
        location_city: jobData.location_city,
        location_state: jobData.location_state,
        employment_type: canonicalPayload.employment_type,
        work_mode: jobData.work_mode,
        work_schedule: jobData.work_schedule,
        experience_level: canonicalPayload.experience_level || jobData.experience_level,

        // Contact information
        contact_name: jobData.contact_name,
        contact_designation: jobData.contact_designation,
        contact_person_email: jobData.contact_email, // Map to correct column
        contact_person_phone: jobData.contact_phone, // Map to correct column
        
        // Company info
        company_website: jobData.company_website,
        industry_domain: jobData.industry_domain,
        company_size: jobData.company_size,
        
        // System fields
        posted_by: user.id,
        company_id: resolvedCompanyId,
        is_active: jobData.visibility_status === 'active',
        visibility_status: jobData.visibility_status,
        ai_match_enabled: jobData.ai_match_enabled,
        ai_priority: jobData.ai_priority,
        
        // Convert arrays and handle nulls
        key_responsibilities: jobData.key_responsibilities || [],
        must_have_requirements: jobData.must_have_requirements || [],
        preferred_requirements: jobData.preferred_requirements || [],
        skills_required: jobData.required_skills || [],
        field_of_study: jobData.field_of_study || [],
        certifications: jobData.certifications || [],
        preferred_industries: jobData.preferred_industries || [],
        preferred_company_types: jobData.preferred_company_types || [],
        specific_tools: jobData.specific_tools || [],
        benefits: jobData.benefits || [],
        
        // Numeric fields
        salary_min: jobData.min_salary || null,
        salary_max: jobData.max_salary || null,
        min_experience: jobData.min_experience || null,
        max_experience: jobData.max_experience || null,
        year_of_passing: jobData.year_of_passing || null,
        max_education_gap: jobData.max_education_gap || null,
        education_level: jobData.education_level,
        
        // Supporting documents
        jd_flyer_url: jobData.jd_flyer_url,
        team_brochure_url: jobData.team_brochure_url,
        benefits_policy_url: jobData.benefits_policy_url,
        
        // Date handling
        application_deadline: jobData.application_deadline ? new Date(jobData.application_deadline).toISOString().split('T')[0] : null
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
    onSuccess: (data, variables) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['employer-stats'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      const createdJob = Array.isArray(data) ? data[0] : (data || variables);
      const createdId = createdJob?.id || createdJob?.seo_slug || '';

      toast.success('Job posted successfully!');
      navigate('/jobs/post/success', {
        state: {
          jobData: {
            ...variables,
            id: createdId,
            slug: createdJob?.seo_slug || createdJob?.slug || createdId,
            title: createdJob?.job_title || createdJob?.title || variables.job_title,
            location_city: createdJob?.location_city || variables.location_city,
            location_state: createdJob?.location_state || variables.location_state,
            employment_type: createdJob?.employment_type || variables.employment_type,
            salary_min: createdJob?.salary_min ?? variables.min_salary,
            salary_max: createdJob?.salary_max ?? variables.max_salary,
            company_name: createdJob?.company_name || variables.company_name
          }
        }
      });
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
      // Enhanced validation for publishing using utility
      const validation = validateJobData(submitData);
      if (!validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }

      if (!formData.company_name?.trim() && !userCompany?.company_id) {
        toast.error('Please provide a company name');
        return;
      }
    } else {
      // Minimal validation for draft
      if (!formData.job_title?.trim()) {
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
          company_name: formData.company_name || (userCompany?.companies as any)?.name || 'Your Company',
          company_website: formData.company_website || (userCompany?.companies as any)?.website || '',
          industry_domain: formData.industry_domain || (userCompany?.companies as any)?.industry || '',
          company_size: formData.company_size || (userCompany?.companies as any)?.size_range || ''
        }
      } 
    });
  };

  const handleGenerateAI = () => {
    setShowAIGenerator(true);
  };

  const handleAIDataGenerated = (aiData: any) => {
    setFormData(aiData);
    setShowAIGenerator(false);
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

        {/* Toggle between forms */}
        <div className="flex gap-4 mb-6">
          <Button
            type="button"
            variant={!useIndustryForm ? "default" : "outline"}
            onClick={() => setUseIndustryForm(false)}
          >
            Standard Form
          </Button>
          <Button
            type="button"
            variant={useIndustryForm ? "default" : "outline"}
            onClick={() => setUseIndustryForm(true)}
          >
            Industry-Specific Form
          </Button>
        </div>

        {useIndustryForm ? (
          <IndustryJobPostForm 
            onSubmit={(data) => {
              const mappedData = {
                ...data,
                job_title: data.job_title,
                company_name: data.company_name,
                location_city: data.location,
                employment_type: data.employment_type,
                experience_level: data.experience_level,
                work_mode: data.work_mode,
                job_summary: data.job_summary,
                job_description: data.job_description,
                key_responsibilities: data.key_responsibilities,
                required_skills: data.skills_required,
                min_salary: data.salary_min ? parseInt(data.salary_min) : null,
                max_salary: data.salary_max ? parseInt(data.salary_max) : null,
                benefits: data.benefits,
                contact_email: data.contact_email,
                contact_phone: data.contact_phone,
                visibility_status: 'active'
              };
              postJobMutation.mutate(mappedData);
            }}
            initialData={formData}
          />
        ) : (
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
        )}

        {/* AI Job Generator Modal */}
        {showAIGenerator && (
          <AIJobGenerator
            formData={formData}
            onDataGenerated={handleAIDataGenerated}
            onClose={() => setShowAIGenerator(false)}
          />
        )}

        {/* AI Test Button - Remove after testing */}
        <AITestButton />
      </div>
    </div>
  );
}

export default function JobPost() {
  return <JobPostContent />;
}
