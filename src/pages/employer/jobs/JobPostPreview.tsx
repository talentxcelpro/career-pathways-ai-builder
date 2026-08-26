
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Briefcase, 
  DollarSign, 
  Users, 
  Building2,
  Calendar,
  CheckCircle,
  Edit,
  Share2,
  Loader2
} from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { normalizeJobContent } from '@/lib/job/normalizeJobContent';
import { toJobsTablePayload } from '@/lib/job/toJobsTablePayload';

const JobPostPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { aiGenerated, formData } = location.state || {};
  const [isPublishing, setIsPublishing] = useState(false);

  if (!formData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">No preview data available</p>
          <Button onClick={() => navigate('/jobs/post')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Form
          </Button>
        </div>
      </div>
    );
  }

  const formatSalary = (min: number, max: number) => {
    const formatAmount = (amount: number) => {
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
      }
      return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
    };

    if (min && max) {
      return `${formatAmount(min)} - ${formatAmount(max)}`;
    } else if (min) {
      return `${formatAmount(min)}+`;
    } else if (max) {
      return `Up to ${formatAmount(max)}`;
    }
    return 'Salary not disclosed';
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to publish a job');
        setIsPublishing(false);
        return;
      }

      // Normalize payload
      const normResult = normalizeJobContent(formData);
      const canonicalPayload = toJobsTablePayload(normResult.normalized);

      let companyId = formData.company_id || null;
      if (!companyId && formData.company_name?.trim()) {
        try {
          const { data: cId } = await supabase.rpc('find_or_create_company', {
            company_name_param: formData.company_name.trim()
          });
          if (cId) companyId = cId;
        } catch (cErr) {
          console.warn('find_or_create_company rpc error:', cErr);
        }
      }

      const insertData = {
        ...canonicalPayload,
        job_title: formData.job_title || formData.title,
        company_name: canonicalPayload.company_name || formData.company_name,
        job_summary: formData.job_summary,
        job_description: formData.job_description,
        location_city: formData.location_city,
        location_state: formData.location_state,
        employment_type: canonicalPayload.employment_type || formData.employment_type,
        work_mode: formData.work_mode,
        work_schedule: formData.work_schedule,
        experience_level: canonicalPayload.experience_level || formData.experience_level,
        contact_name: formData.contact_name,
        contact_designation: formData.contact_designation,
        contact_person_email: formData.contact_email,
        contact_person_phone: formData.contact_phone,
        company_website: formData.company_website,
        industry_domain: formData.industry_domain,
        company_size: formData.company_size,
        posted_by: user.id,
        company_id: companyId,
        is_active: true,
        visibility_status: 'active',
        ai_match_enabled: formData.ai_match_enabled ?? true,
        ai_priority: formData.ai_priority ?? false,
        key_responsibilities: formData.key_responsibilities || [],
        must_have_requirements: formData.must_have_requirements || [],
        preferred_requirements: formData.preferred_requirements || [],
        skills_required: formData.required_skills || [],
        field_of_study: formData.field_of_study || [],
        certifications: formData.certifications || [],
        preferred_industries: formData.preferred_industries || [],
        preferred_company_types: formData.preferred_company_types || [],
        specific_tools: formData.specific_tools || [],
        benefits: formData.benefits || [],
        salary_min: formData.min_salary || null,
        salary_max: formData.max_salary || null,
        min_experience: formData.min_experience || null,
        max_experience: formData.max_experience || null,
        year_of_passing: formData.year_of_passing || null,
        max_education_gap: formData.max_education_gap || null,
        education_level: formData.education_level,
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString().split('T')[0] : null
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Job preview publishing error:', error);
        toast.error(error.message || 'Failed to publish job');
        setIsPublishing(false);
        return;
      }

      const createdJob = Array.isArray(data) ? data[0] : (data || insertData);
      toast.success('Job published successfully!');
      navigate('/jobs/post/success', {
        state: {
          jobData: {
            ...formData,
            id: createdJob?.id || createdJob?.seo_slug,
            slug: createdJob?.seo_slug || createdJob?.slug || createdJob?.id,
            title: createdJob?.job_title || createdJob?.title || formData.job_title,
            location_city: createdJob?.location_city || formData.location_city,
            location_state: createdJob?.location_state || formData.location_state,
            employment_type: createdJob?.employment_type || formData.employment_type,
            salary_min: createdJob?.salary_min ?? formData.min_salary,
            salary_max: createdJob?.salary_max ?? formData.max_salary,
            company_name: createdJob?.company_name || formData.company_name
          },
          aiGenerated
        }
      });
    } catch (err: any) {
      console.error('Unexpected error publishing job:', err);
      toast.error(err.message || 'Failed to publish job');
      setIsPublishing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/jobs/post')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Edit
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Job Preview</h1>
              <p className="text-muted-foreground">This is how your job posting will appear to candidates</p>
            </div>
            <div className="flex gap-3">
              {aiGenerated && (
                <Badge className="bg-purple-100 text-purple-800">AI Generated</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Job Preview Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{formData.job_title || 'Job Title'}</CardTitle>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{formData.company_name || 'Company Name'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{formData.location_city || 'Location'}, {formData.location_state || 'State'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formData.work_mode || 'Work Mode'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-primary">
                  {formatSalary(formData.min_salary, formData.max_salary)}
                </div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Key Details */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Briefcase className="h-3 w-3 mr-1" />
                {formData.employment_type || 'Employment Type'}
              </Badge>
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {formData.experience_level || 'Experience Level'}
              </Badge>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {formData.work_schedule || 'Work Schedule'}
              </Badge>
              {formData.application_deadline && (
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  Apply by {new Date(formData.application_deadline).toLocaleDateString()}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Job Summary */}
            {formData.job_summary && (
              <div>
                <h3 className="font-semibold mb-2">Job Summary</h3>
                <p className="text-muted-foreground">{formData.job_summary}</p>
              </div>
            )}

            {/* Job Description */}
            {formData.job_description && (
              <div>
                <h3 className="font-semibold mb-2">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{formData.job_description}</p>
              </div>
            )}

            {/* Key Responsibilities */}
            {formData.key_responsibilities && formData.key_responsibilities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Key Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {formData.key_responsibilities.map((responsibility: string, index: number) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {formData.must_have_requirements && formData.must_have_requirements.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Must-Have Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {formData.must_have_requirements.map((requirement: string, index: number) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preferred Requirements */}
            {formData.preferred_requirements && formData.preferred_requirements.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Preferred Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {formData.preferred_requirements.map((requirement: string, index: number) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            {formData.required_skills && formData.required_skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.required_skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {formData.benefits && formData.benefits.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Benefits & Perks</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit: string, index: number) => (
                    <Badge key={index} variant="secondary">{benefit}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Company Information */}
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">About the Company</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Company:</strong> {formData.company_name || 'Company Name'}</p>
                {formData.company_website && (
                  <p><strong>Website:</strong> {formData.company_website}</p>
                )}
                {formData.industry_domain && (
                  <p><strong>Industry:</strong> {formData.industry_domain}</p>
                )}
                {formData.company_size && (
                  <p><strong>Company Size:</strong> {formData.company_size} employees</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/jobs/post')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Edit
          </Button>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => navigate('/jobs/post')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Post
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing} className="bg-green-600 hover:bg-green-700 text-white font-bold">
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publish Job
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostPreview;
