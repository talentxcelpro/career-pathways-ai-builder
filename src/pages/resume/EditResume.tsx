
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Eye, Download, Plus, Edit3 } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const EditResume = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [resumeData, setResumeData] = useState<any>({
    personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  });

  // Fetch resume data
  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      const { data, error } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user
  });

  // Update local state when resume data is loaded
  useEffect(() => {
    if (resume?.content) {
      setResumeData(resume.content);
    }
  }, [resume]);

  // Save resume mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!id || !user) throw new Error('Missing required data');
      
      const { error } = await supabase
        .from('ai_resumes')
        .update({ 
          content: data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', id] });
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync(resumeData);
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData((prev: any) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const addExperience = () => {
    setResumeData((prev: any) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now().toString(),
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: '',
          current: false
        }
      ]
    }));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    setResumeData((prev: any) => ({
      ...prev,
      experience: prev.experience.map((exp: any, i: number) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addSkill = () => {
    setResumeData((prev: any) => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setResumeData((prev: any) => ({
      ...prev,
      skills: prev.skills.map((skill: string, i: number) =>
        i === index ? value : skill
      )
    }));
  };

  const removeSkill = (index: number) => {
    setResumeData((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((_: any, i: number) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume not found</h2>
          <p className="text-gray-600 mb-4">The resume you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/resume')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/resume')}
              className="flex items-center mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Resume</h1>
              <p className="text-gray-600">AI-powered resume editor with real-time preview</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || saveMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving || saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your basic contact and professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input
                      value={resumeData.personalInfo?.fullName || ''}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={resumeData.personalInfo?.email || ''}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <Input
                      value={resumeData.personalInfo?.phone || ''}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <Input
                      value={resumeData.personalInfo?.location || ''}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="New York, NY"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                  <Textarea
                    value={resumeData.personalInfo?.summary || ''}
                    onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                    placeholder="Brief professional summary highlighting your key strengths and experience..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Work Experience</CardTitle>
                    <CardDescription>Your professional work history</CardDescription>
                  </div>
                  <Button onClick={addExperience} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.experience?.length > 0 ? (
                  resumeData.experience.map((exp: any, index: number) => (
                    <div key={exp.id || index} className="p-4 border rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Company Name"
                          value={exp.company || ''}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        />
                        <Input
                          placeholder="Job Title"
                          value={exp.position || ''}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        />
                        <Input
                          placeholder="Start Date"
                          value={exp.startDate || ''}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        />
                        <Input
                          placeholder="End Date"
                          value={exp.endDate || ''}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        />
                      </div>
                      <Textarea
                        placeholder="Job description and achievements..."
                        value={exp.description || ''}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        rows={3}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No work experience added yet</p>
                    <Button onClick={addExperience} variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Your First Job
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Skills</CardTitle>
                    <CardDescription>Your technical and professional skills</CardDescription>
                  </div>
                  <Button onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resumeData.skills?.map((skill: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Skill name"
                        value={skill}
                        onChange={(e) => updateSkill(index, e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSkill(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                {(!resumeData.skills || resumeData.skills.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No skills added yet</p>
                    <Button onClick={addSkill} variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Your First Skill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your resume looks in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/4] border rounded-lg bg-white p-6 overflow-auto">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="text-center border-b pb-4">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {resumeData.personalInfo?.fullName || 'Your Name'}
                      </h1>
                      <div className="flex justify-center space-x-4 text-sm text-gray-600 mt-2">
                        {resumeData.personalInfo?.email && <span>{resumeData.personalInfo.email}</span>}
                        {resumeData.personalInfo?.phone && <span>{resumeData.personalInfo.phone}</span>}
                        {resumeData.personalInfo?.location && <span>{resumeData.personalInfo.location}</span>}
                      </div>
                    </div>

                    {/* Summary */}
                    {resumeData.personalInfo?.summary && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Professional Summary</h2>
                        <p className="text-sm text-gray-700">{resumeData.personalInfo.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experience?.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Work Experience</h2>
                        <div className="space-y-3">
                          {resumeData.experience.map((exp: any, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium text-gray-900">
                                {exp.position} {exp.company && `at ${exp.company}`}
                              </div>
                              {(exp.startDate || exp.endDate) && (
                                <div className="text-gray-600 text-xs">
                                  {exp.startDate} - {exp.endDate || 'Present'}
                                </div>
                              )}
                              {exp.description && (
                                <p className="text-gray-700 mt-1">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {resumeData.skills?.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map((skill: string, index: number) => (
                            skill && (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {skill}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}
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

export default EditResume;
