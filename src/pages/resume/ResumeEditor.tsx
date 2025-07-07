import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Plus, Trash2, Award, Briefcase, Target, BookOpen, Code, Phone, Mail, MapPin, Linkedin, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const ResumeEditor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Load user resume data from normalized tables
  const { data: resumeData, isLoading, error } = useQuery({
    queryKey: ['user-resume-data', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [
        { data: profile },
        { data: workExperience },
        { data: education },
        { data: skills },
        { data: projects },
        { data: certifications },
        { data: awards },
        { data: volunteerExperience },
        { data: publications },
        { data: interests },
        { data: references },
        { data: customSections }
      ] = await Promise.all([
        supabase.from('users_profile').select('*').eq('id', user.id).single(),
        supabase.from('work_experience').select('*').eq('user_id', user.id),
        supabase.from('education').select('*').eq('user_id', user.id),
        supabase.from('skills').select('*').eq('user_id', user.id).single(),
        supabase.from('projects').select('*').eq('user_id', user.id),
        supabase.from('certifications').select('*').eq('user_id', user.id),
        supabase.from('awards').select('*').eq('user_id', user.id),
        supabase.from('volunteer_experience').select('*').eq('user_id', user.id),
        supabase.from('publications').select('*').eq('user_id', user.id),
        supabase.from('interests').select('*').eq('user_id', user.id).single(),
        supabase.from('references_info').select('*').eq('user_id', user.id),
        supabase.from('custom_sections').select('*').eq('user_id', user.id)
      ]);

      return {
        profile: profile || { full_name: '', email: '', phone: '', location: '', linkedin_url: '', professional_summary: '' },
        workExperience: workExperience || [],
        education: education || [],
        skills: skills || { technical_skills: [], programming_languages: [], tools_software: [], soft_skills: [], languages_spoken: [] },
        projects: projects || [],
        certifications: certifications || [],
        awards: awards || [],
        volunteerExperience: volunteerExperience || [],
        publications: publications || [],
        interests: interests || { interest_items: [] },
        references: references || [],
        customSections: customSections || []
      };
    },
    enabled: !!user
  });

  // Save mutations for each section
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const { error } = await supabase
        .from('users_profile')
        .upsert({ id: user!.id, ...profileData });
      if (error) throw error;
    }
  });

  const saveWorkExperienceMutation = useMutation({
    mutationFn: async (workData: any[]) => {
      // Clear existing work experience
      await supabase.from('work_experience').delete().eq('user_id', user!.id);
      
      if (workData.length > 0) {
        const { error } = await supabase
          .from('work_experience')
          .insert(workData.map(exp => ({ ...exp, user_id: user!.id })));
        if (error) throw error;
      }
    }
  });

  const saveEducationMutation = useMutation({
    mutationFn: async (educationData: any[]) => {
      // Clear existing education
      await supabase.from('education').delete().eq('user_id', user!.id);
      
      if (educationData.length > 0) {
        const { error } = await supabase
          .from('education')
          .insert(educationData.map(edu => ({ ...edu, user_id: user!.id })));
        if (error) throw error;
      }
    }
  });

  const saveSkillsMutation = useMutation({
    mutationFn: async (skillsData: any) => {
      const { error } = await supabase
        .from('skills')
        .upsert({ user_id: user!.id, ...skillsData });
      if (error) throw error;
    }
  });

  const saveProjectsMutation = useMutation({
    mutationFn: async (projectsData: any[]) => {
      // Clear existing projects
      await supabase.from('projects').delete().eq('user_id', user!.id);
      
      if (projectsData.length > 0) {
        const { error } = await supabase
          .from('projects')
          .insert(projectsData.map(proj => ({ ...proj, user_id: user!.id })));
        if (error) throw error;
      }
    }
  });

  const handleSaveAll = async () => {
    if (!resumeData) return;
    
    setIsSaving(true);
    try {
      await Promise.all([
        saveProfileMutation.mutateAsync(resumeData.profile),
        saveWorkExperienceMutation.mutateAsync(resumeData.workExperience),
        saveEducationMutation.mutateAsync(resumeData.education),
        saveSkillsMutation.mutateAsync(resumeData.skills),
        saveProjectsMutation.mutateAsync(resumeData.projects)
      ]);
      
      toast.success('Resume saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-resume-data'] });
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your resume data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading resume</h2>
          <p className="text-gray-600 mb-4">There was a problem loading your resume data.</p>
          <Button onClick={() => navigate('/resume-builder')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/resume-builder')}
              className="flex items-center mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Editor</h1>
              <p className="text-gray-600">Build and customize your professional resume</p>
            </div>
          </div>
          <Button onClick={handleSaveAll} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Resume'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Section */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your contact details and professional summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input
                      value={resumeData?.profile?.full_name || ''}
                      onChange={(e) => {
                        const newData = { ...resumeData };
                        newData.profile.full_name = e.target.value;
                        queryClient.setQueryData(['user-resume-data', user?.id], newData);
                      }}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      value={resumeData?.profile?.email || ''}
                      onChange={(e) => {
                        const newData = { ...resumeData };
                        newData.profile.email = e.target.value;
                        queryClient.setQueryData(['user-resume-data', user?.id], newData);
                      }}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <Input
                      value={resumeData?.profile?.phone || ''}
                      onChange={(e) => {
                        const newData = { ...resumeData };
                        newData.profile.phone = e.target.value;
                        queryClient.setQueryData(['user-resume-data', user?.id], newData);
                      }}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input
                      value={resumeData?.profile?.location || ''}
                      onChange={(e) => {
                        const newData = { ...resumeData };
                        newData.profile.location = e.target.value;
                        queryClient.setQueryData(['user-resume-data', user?.id], newData);
                      }}
                      placeholder="New York, NY"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">LinkedIn URL</label>
                  <Input
                    value={resumeData?.profile?.linkedin_url || ''}
                    onChange={(e) => {
                      const newData = { ...resumeData };
                      newData.profile.linkedin_url = e.target.value;
                      queryClient.setQueryData(['user-resume-data', user?.id], newData);
                    }}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Professional Summary</label>
                  <Textarea
                    rows={4}
                    value={resumeData?.profile?.professional_summary || ''}
                    onChange={(e) => {
                      const newData = { ...resumeData };
                      newData.profile.professional_summary = e.target.value;
                      queryClient.setQueryData(['user-resume-data', user?.id], newData);
                    }}
                    placeholder="A brief summary of your professional background and career objectives..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
                <CardDescription>Your professional work history</CardDescription>
                <Button 
                  size="sm" 
                onClick={() => {
                  const newData = { ...resumeData };
                  newData.workExperience.push({
                    id: Date.now().toString(),
                    job_title: '',
                    company_name: '',
                    location: '',
                    start_date: '',
                    end_date: '',
                    responsibilities: [],
                    key_achievements: [],
                    technologies_used: []
                  });
                  queryClient.setQueryData(['user-resume-data', user?.id], newData);
                }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData?.workExperience?.map((exp: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">Experience {index + 1}</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newData = { ...resumeData };
                          newData.workExperience.splice(index, 1);
                          queryClient.setQueryData(['user-resume-data', user?.id], newData);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Job Title"
                        value={exp.job_title || ''}
                        onChange={(e) => {
                          const newData = { ...resumeData };
                          newData.workExperience[index].job_title = e.target.value;
                          queryClient.setQueryData(['user-resume-data', user?.id], newData);
                        }}
                      />
                      <Input
                        placeholder="Company Name"
                        value={exp.company_name || ''}
                        onChange={(e) => {
                          const newData = { ...resumeData };
                          newData.workExperience[index].company_name = e.target.value;
                          queryClient.setQueryData(['user-resume-data', user?.id], newData);
                        }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        placeholder="Location"
                        value={exp.location || ''}
                        onChange={(e) => {
                          const newData = { ...resumeData };
                          newData.workExperience[index].location = e.target.value;
                          queryClient.setQueryData(['user-resume-data', user?.id], newData);
                        }}
                      />
                      <Input
                        type="date"
                        placeholder="Start Date"
                        value={exp.start_date || ''}
                        onChange={(e) => {
                          const newData = { ...resumeData };
                          newData.workExperience[index].start_date = e.target.value;
                          queryClient.setQueryData(['user-resume-data', user?.id], newData);
                        }}
                      />
                      <Input
                        type="date"
                        placeholder="End Date"
                        value={exp.end_date || ''}
                        onChange={(e) => {
                          const newData = { ...resumeData };
                          newData.workExperience[index].end_date = e.target.value;
                          queryClient.setQueryData(['user-resume-data', user?.id], newData);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Skills
                </CardTitle>
                <CardDescription>Your technical and professional skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Technical Skills</label>
                  <Textarea
                    rows={2}
                    value={resumeData?.skills?.technical_skills?.join(', ') || ''}
                    onChange={(e) => {
                      const newData = { ...resumeData };
                      newData.skills.technical_skills = e.target.value.split(',').map((skill: string) => skill.trim()).filter(Boolean);
                      queryClient.setQueryData(['user-resume-data', user?.id], newData);
                    }}
                    placeholder="JavaScript, Python, React, Node.js..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Programming Languages</label>
                  <Textarea
                    rows={2}
                    value={resumeData?.skills?.programming_languages?.join(', ') || ''}
                    onChange={(e) => {
                      const newData = { ...resumeData };
                      newData.skills.programming_languages = e.target.value.split(',').map((skill: string) => skill.trim()).filter(Boolean);
                      queryClient.setQueryData(['user-resume-data', user?.id], newData);
                    }}
                    placeholder="JavaScript, Python, Java, C++..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tools & Software</label>
                  <Textarea
                    rows={2}
                    value={resumeData?.skills?.tools_software?.join(', ') || ''}
                    onChange={(e) => {
                      const newData = { ...resumeData };
                      newData.skills.tools_software = e.target.value.split(',').map((skill: string) => skill.trim()).filter(Boolean);
                      queryClient.setQueryData(['user-resume-data', user?.id], newData);
                    }}
                    placeholder="Git, Docker, VS Code, Figma..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Soft Skills</label>
                  <Textarea
                    rows={2}
                    value={resumeData?.skills?.soft_skills?.join(', ') || ''}
                    onChange={(e) => {
                      const newData = { ...resumeData };
                      newData.skills.soft_skills = e.target.value.split(',').map((skill: string) => skill.trim()).filter(Boolean);
                      queryClient.setQueryData(['user-resume-data', user?.id], newData);
                    }}
                    placeholder="Leadership, Communication, Problem Solving..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle>Resume Preview</CardTitle>
                <CardDescription>Live preview of your resume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded-lg shadow-sm border min-h-[600px]">
                  {/* Preview Content */}
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center border-b pb-4">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {resumeData?.profile?.full_name || 'Your Name'}
                      </h1>
                      <div className="flex justify-center items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {resumeData?.profile?.email || 'email@example.com'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {resumeData?.profile?.phone || '+1 (555) 123-4567'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {resumeData?.profile?.location || 'Location'}
                        </span>
                      </div>
                      {resumeData?.profile?.linkedin_url && (
                        <div className="mt-2">
                          <span className="flex justify-center items-center gap-1 text-sm text-blue-600">
                            <Linkedin className="h-3 w-3" />
                            LinkedIn Profile
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Professional Summary */}
                    {resumeData?.profile?.professional_summary && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-3">
                          Professional Summary
                        </h2>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {resumeData.profile.professional_summary}
                        </p>
                      </div>
                    )}

                    {/* Work Experience */}
                    {resumeData?.workExperience?.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-3">
                          Work Experience
                        </h2>
                        <div className="space-y-4">
                          {resumeData.workExperience.map((exp: any, index: number) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-gray-900">{exp.job_title || 'Job Title'}</h3>
                                  <p className="text-sm text-gray-600">{exp.company_name || 'Company Name'}</p>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                  <p>{exp.location || 'Location'}</p>
                                  <p>{exp.start_date || 'Start'} - {exp.end_date || 'End'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-3">
                        Skills
                      </h2>
                      <div className="space-y-3">
                        {resumeData?.skills?.technical_skills?.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-800 text-sm mb-1">Technical Skills</h4>
                            <div className="flex flex-wrap gap-1">
                              {resumeData.skills.technical_skills.map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {resumeData?.skills?.programming_languages?.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-800 text-sm mb-1">Programming Languages</h4>
                            <div className="flex flex-wrap gap-1">
                              {resumeData.skills.programming_languages.map((skill: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;