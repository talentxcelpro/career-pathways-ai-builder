
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import CompanySelector from "@/components/jobs/CompanySelector";
import CompanyDetails from "@/components/jobs/CompanyDetails";
import BasicJobInformation from "@/components/jobs/BasicJobInformation";
import JobDetailsForm from "@/components/jobs/JobDetailsForm";
import SkillsBenefitsForm from "@/components/jobs/SkillsBenefitsForm";

export default function JobPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    employment_type: '',
    experience_level: '',
    is_remote: false,
    salary_min: '',
    salary_max: '',
    company_id: '',
    category_id: '',
    skills_required: [] as string[],
    benefits: [] as string[],
    application_deadline: ''
  });

  // Fetch companies with logo and details
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, logo_url, description, location, industry, size_range, website, founded_year, employee_count_range')
        .order('name');
      
      if (error) throw error;
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

  // Get selected company details
  const selectedCompany = companies.find(company => company.id === formData.company_id);

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
        category_id: jobData.category_id || null
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.company_id) {
      toast.error('Please fill in all required fields (title, description, and company)');
      return;
    }

    postJobMutation.mutate(formData);
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
            <Briefcase className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Post a Job</h1>
          </div>
          <p className="text-gray-600">Find the perfect candidate for your open position</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Selection & Details */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <CompanySelector
                    companies={companies}
                    value={formData.company_id}
                    onValueChange={(value) => handleInputChange('company_id', value)}
                  />
                </div>
                
                {/* Company Details Preview */}
                <CompanyDetails company={selectedCompany || null} />
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <BasicJobInformation
            formData={formData}
            categories={categories}
            onInputChange={handleInputChange}
          />

          {/* Job Details */}
          <JobDetailsForm
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Skills and Benefits */}
          <SkillsBenefitsForm
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Submit */}
          <Card>
            <CardContent className="p-6">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={postJobMutation.isPending}
              >
                {postJobMutation.isPending ? 'Posting...' : 'Post Job'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
