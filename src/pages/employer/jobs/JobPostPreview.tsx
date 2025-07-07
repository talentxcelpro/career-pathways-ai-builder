
import React from 'react';
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
  Share2
} from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';

const JobPostPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { aiGenerated, formData } = location.state || {};

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

  const handlePublish = () => {
    navigate('/jobs/post/success', { 
      state: { 
        jobData: formData,
        aiGenerated 
      } 
    });
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
            <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Publish Job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostPreview;
