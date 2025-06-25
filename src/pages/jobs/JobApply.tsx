import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload, FileText, ArrowLeft, Send, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { incrementJobApplications } from "@/utils/supabaseHelpers";

export default function JobApply() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cover_letter: '',
    resume_url: '',
    custom_resume: null as File | null,
    availability: '',
    salary_expectation: '',
    willing_to_relocate: false,
    requires_visa_sponsorship: false,
    additional_info: ''
  });

  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch user's resumes
  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ['user-resumes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if already applied
      const { data: existingApplication } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', id)
        .single();

      if (existingApplication) {
        throw new Error('You have already applied to this job');
      }

      // Upload custom resume if provided
      let resumeUrl = applicationData.resume_url;
      if (applicationData.custom_resume) {
        const fileName = `${user.id}/${Date.now()}_${applicationData.custom_resume.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, applicationData.custom_resume);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        
        resumeUrl = publicUrl;
      }

      // Submit application
      const { error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_id: id,
          cover_letter: applicationData.cover_letter,
          resume_url: resumeUrl,
          status: 'applied'
        });

      if (error) throw error;

      // Update application count
      if (id) {
        try {
          await incrementJobApplications(id);
        } catch (error) {
          console.log('Failed to increment application count:', error);
        }
      }
    },
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      navigate('/jobs/applied');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit application');
    }
  });

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange('custom_resume', file);
      handleInputChange('resume_url', '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.resume_url && !formData.custom_resume) {
      toast.error('Please select a resume or upload one');
      return;
    }

    if (!formData.cover_letter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    applyMutation.mutate(formData);
  };

  const generateCoverLetter = async () => {
    const templateCoverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${job?.title} position at ${job?.companies?.name}. With my background and passion for this field, I am confident I would be a valuable addition to your team.

I am particularly excited about this opportunity because of ${job?.companies?.name}'s reputation in the industry. I believe my skills and experience align well with the requirements for this role.

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to your team's success. Thank you for considering my application.

Best regards,
[Your Name]`;

    handleInputChange('cover_letter', templateCoverLetter);
    toast.success('Cover letter template generated! Please customize it.');
  };

  if (jobLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/jobs/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Details
          </Button>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={job.companies?.logo_url} alt={job.companies?.name} />
                  <AvatarFallback>
                    {job.companies?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">Apply for {job.title}</h1>
                  <p className="text-gray-600">{job.companies?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumes && resumes.length > 0 && (
                <div>
                  <Label>Select from your resumes:</Label>
                  <Select
                    value={formData.resume_url}
                    onValueChange={(value) => {
                      handleInputChange('resume_url', value);
                      handleInputChange('custom_resume', null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.file_url || ''}>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>{resume.title}</span>
                            {resume.is_primary && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="text-center text-gray-500">or</div>

              <div>
                <Label htmlFor="resume-upload">Upload a new resume:</Label>
                <div className="mt-2">
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {formData.custom_resume ? formData.custom_resume.name : 'Upload Resume'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cover Letter</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateCoverLetter}
                >
                  Generate Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your cover letter here..."
                value={formData.cover_letter}
                onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                rows={10}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-2">
                {formData.cover_letter.length} characters
              </p>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => handleInputChange('availability', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="When can you start?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately</SelectItem>
                      <SelectItem value="2-weeks">2 weeks notice</SelectItem>
                      <SelectItem value="1-month">1 month</SelectItem>
                      <SelectItem value="2-months">2 months</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="salary">Salary Expectation</Label>
                  <Input
                    id="salary"
                    placeholder="e.g., $80,000 - $90,000"
                    value={formData.salary_expectation}
                    onChange={(e) => handleInputChange('salary_expectation', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="relocate"
                    checked={formData.willing_to_relocate}
                    onCheckedChange={(checked) => handleInputChange('willing_to_relocate', checked)}
                  />
                  <Label htmlFor="relocate">I am willing to relocate for this position</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visa"
                    checked={formData.requires_visa_sponsorship}
                    onCheckedChange={(checked) => handleInputChange('requires_visa_sponsorship', checked)}
                  />
                  <Label htmlFor="visa">I require visa sponsorship</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="additional">Additional Information (Optional)</Label>
                <Textarea
                  id="additional"
                  placeholder="Anything else you'd like to mention..."
                  value={formData.additional_info}
                  onChange={(e) => handleInputChange('additional_info', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Card>
            <CardContent className="p-6">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={applyMutation.isPending}
              >
                {applyMutation.isPending ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                By submitting this application, you agree to share your information with {job.companies?.name}.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
