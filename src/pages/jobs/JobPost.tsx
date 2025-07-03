
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Eye, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmployerAccessGuard } from "@/components/employer/EmployerAccessGuard";
import CompanyInformationForm from "@/components/jobs/CompanyInformationForm";
import JobOverviewForm from "@/components/jobs/JobOverviewForm";
import RoleDescriptionForm from "@/components/jobs/RoleDescriptionForm";
import SkillsQualificationsForm from "@/components/jobs/SkillsQualificationsForm";
import CompensationBenefitsForm from "@/components/jobs/CompensationBenefitsForm";
import ContactPersonForm from "@/components/jobs/ContactPersonForm";
import JobVisibilityForm from "@/components/jobs/JobVisibilityForm";
import SupportingDocumentsForm from "@/components/jobs/SupportingDocumentsForm";

function JobPostContent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Company Information
    company_id: '',
    company_website: '',
    industry_domain: '',
    company_size: '',
    
    // Job Overview
    title: '',
    employment_type: '',
    work_mode: '',
    location: '',
    work_schedule: '',
    experience_level: '',
    application_deadline: '',
    category_id: '',
    
    // Role Description
    job_summary: '',
    detailed_description: '',
    key_responsibilities: [] as string[],
    must_have_requirements: [] as string[],
    nice_to_have: [] as string[],
    
    // Skills & Qualifications
    skills_required: [] as string[],
    minimum_education: '',
    field_of_study: [] as string[],
    minimum_year_of_passing: null as number | null,
    max_education_gap: null as number | null,
    preferred_certifications_list: [] as string[],
    experience_preference: '',
    minimum_experience_years: null as number | null,
    maximum_experience_years: null as number | null,
    preferred_industries: [] as string[],
    preferred_company_background: [] as string[],
    specific_tools_domains: '',
    
    // Compensation & Benefits
    salary_min: '',
    salary_max: '',
    benefits_offered: [] as string[],
    
    // Contact Person
    contact_person_name: '',
    contact_person_designation: '',
    contact_person_email: '',
    contact_person_phone: '',
    
    // Supporting Documents
    supporting_documents: [] as any[],
    
    // Legacy fields for backward compatibility
    description: '',
    requirements: '',
    is_remote: false,
    benefits: [] as string[],
    location_type: '',
    specialization_fields: [] as string[],
    preferred_certifications: [] as any[],
    maximum_gap_allowed: null as number | null,
    education_notes: '',
    experience_type: '',
    relevant_industry_experience: [] as string[],
    specific_experience_areas: '',
    preferred_experience_in: [] as string[],
    
    // Draft functionality
    is_draft: false
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
        salary_min: jobData.salary_min ? parseInt(jobData.salary_min) : null,
        salary_max: jobData.salary_max ? parseInt(jobData.salary_max) : null,
        application_deadline: jobData.application_deadline || null,
        employment_type: jobData.employment_type || null,
        experience_level: jobData.experience_level || null,
        category_id: jobData.category_id || null,
        // Map location_type to is_remote for backward compatibility
        is_remote: jobData.location_type === 'remote',
        // Additional fields that might not be in the database yet
        work_schedule: jobData.work_schedule || null,
        contact_person_name: jobData.contact_person_name || null,
        contact_person_designation: jobData.contact_person_designation || null
      };

      const { error } = await supabase
        .from('jobs')
        .insert(insertData);

      if (error) {
        console.error('Job posting error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Job posted successfully!');
      navigate('/jobs');
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
    
    const submitData = { ...formData, is_draft: isDraft };
    
    if (!isDraft) {
      // Validation for publishing
      if (!formData.title.trim() || !formData.job_summary.trim() || !formData.company_id) {
        toast.error('Please fill in all required fields (title, job summary, and company)');
        return;
      }

      if (formData.skills_required.length === 0) {
        toast.error('Please add at least one required skill');
        return;
      }
    } else {
      // Minimal validation for draft
      if (!formData.title.trim()) {
        toast.error('Please add a job title to save as draft');
        return;
      }
    }

    postJobMutation.mutate(submitData);
  };

  const handlePreview = () => {
    toast.info('Preview functionality coming soon!');
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
          
          <div className="flex items-center space-x-3 mb-2">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Post a New Job</h1>
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
