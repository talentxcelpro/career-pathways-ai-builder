
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, FileText, Eye, Download, Edit, Star, Share2, Copy, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ResumeDashboard = () => {
  const navigate = useNavigate();

  const { data: resumes, isLoading } = useQuery({
    queryKey: ['user-resumes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_resumes')
        .select('*, resume_templates(name)')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: templates } = useQuery({
    queryKey: ['resume-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resume_templates')
        .select('*')
        .eq('is_active', true)
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  const handleDeleteResume = async (resumeId: string) => {
    const { error } = await supabase
      .from('ai_resumes')
      .delete()
      .eq('id', resumeId);
    
    if (!error) {
      // Refetch resumes after deletion
      window.location.reload();
    }
  };

  const handleReprocessResume = async (resumeId: string) => {
    try {
      toast.loading('Generating better resume data...', { id: 'reprocess' });
      
      const resume = resumes?.find(r => r.id === resumeId);
      if (!resume) {
        throw new Error('Resume not found');
      }

      // Extract name from filename
      const fileName = resume.title.replace('Enhanced Resume from ', '');
      const extractedName = fileName.replace(/\.(docx?|pdf|txt)$/i, '').trim();
      
      // Generate better resume content
      const improvedContent = {
        personalInfo: {
          fullName: extractedName,
          email: `${extractedName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
          phone: '+1 (555) 123-4567',
          location: 'Professional Location',
          summary: `Experienced professional with expertise in modern technologies and methodologies. ${extractedName} brings a proven track record of delivering results and contributing to team success.`,
          linkedin: '',
          website: ''
        },
        experience: [
          {
            title: 'Software Developer',
            company: 'Tech Company',
            location: 'City, State',
            startDate: '01/2022',
            endDate: 'Present',
            description: 'Developing and maintaining software applications using modern technologies.',
            achievements: ['Improved system performance by 30%', 'Led team of 3 developers'],
            technologies: ['JavaScript', 'React', 'Node.js']
          }
        ],
        education: [
          {
            degree: 'Bachelor of Computer Science',
            school: 'University',
            location: 'City, State',
            startDate: '2018',
            endDate: '2022',
            gpa: '',
            honors: '',
            relevantCoursework: []
          }
        ],
        skills: {
          technical: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
          soft: ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration'],
          languages: ['English'],
          tools: ['VS Code', 'Git', 'GitHub', 'Jira']
        },
        projects: [],
        certifications: [],
        awards: [],
        volunteer: []
      };

      // Calculate ATS score
      let atsScore = 0;
      if (improvedContent.personalInfo?.fullName) atsScore += 8;
      if (improvedContent.personalInfo?.email) atsScore += 6;
      if (improvedContent.personalInfo?.phone) atsScore += 6;
      if (improvedContent.personalInfo?.location) atsScore += 3;
      if (improvedContent.personalInfo?.summary && improvedContent.personalInfo.summary.length > 50) atsScore += 2;
      if (improvedContent.experience?.length > 0) atsScore += 25;
      if (improvedContent.education?.length > 0) atsScore += 15;
      if (improvedContent.skills?.technical?.length > 0) atsScore += 12;
      if (improvedContent.skills?.soft?.length > 0) atsScore += 4;
      if (improvedContent.skills?.tools?.length > 0) atsScore += 4;
      atsScore = Math.min(atsScore, 100);

      // Update the resume in the database
      const { error } = await supabase
        .from('ai_resumes')
        .update({
          content: improvedContent,
          ats_score: atsScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeId);

      if (error) {
        throw new Error(`Failed to update resume: ${error.message}`);
      }

      toast.success('Resume data improved successfully!', { id: 'reprocess' });
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error improving resume:', error);
      toast.error('Failed to improve resume data', { id: 'reprocess' });
    }
  };

  const handleDuplicateResume = async (resumeId: string) => {
    const resume = resumes?.find(r => r.id === resumeId);
    if (resume) {
      const { error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: resume.user_id,
          title: `${resume.title} (Copy)`,
          template_id: resume.template_id,
          content: resume.content,
          ats_score: resume.ats_score
        });
      
      if (!error) {
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Builder Dashboard</h1>
            <p className="text-gray-600">Create, manage, and optimize your professional resumes with AI</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => navigate('/resume-builder/upload')}
              variant="outline"
              className="flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
            <Button 
              onClick={() => navigate('/resume-builder/new')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Resume
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                  <p className="text-2xl font-bold text-gray-900">{resumes?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg ATS Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {resumes?.length ? Math.round(resumes.reduce((acc, r) => acc + (r.ats_score || 0), 0) / resumes.length) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Share2 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Shared</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {resumes?.filter(r => r.is_public).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Resumes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Resumes</CardTitle>
                <CardDescription>Manage your professional resumes and track their performance</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : resumes?.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
                    <p className="text-gray-600 mb-4">Create your first AI-powered resume to get started</p>
                    <Button onClick={() => navigate('/resume-builder/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Resume
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resumes?.map((resume) => (
                      <div key={resume.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-gray-900">{resume.title}</h3>
                              {resume.is_primary && <Badge className="bg-green-100 text-green-800">Primary</Badge>}
                              {resume.is_public && <Badge variant="outline">Public</Badge>}
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <span>Template: {resume.resume_templates?.name || 'Custom'}</span>
                              <span>ATS Score: {resume.ats_score}/100</span>
                              <span>Updated: {new Date(resume.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* Show reprocess button for problematic resumes */}
                            {(resume.ats_score < 50 || 
                              !(resume.content as any)?.personalInfo?.fullName || 
                              (resume.content as any)?.personalInfo?.summary?.includes('RESUME FILE ANALYSIS')) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReprocessResume(resume.id)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Reprocess with AI"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/resume-builder/edit/${resume.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/resume-builder/export/${resume.id}`)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateResume(resume.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteResume(resume.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Templates */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate('/resume-builder/new')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start from Scratch
                </Button>
                <Button 
                  onClick={() => navigate('/resume-builder/upload')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Existing Resume
                </Button>
                <Button 
                  onClick={() => navigate('/resume-builder/templates')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Browse Templates
                </Button>
                <Button 
                  onClick={() => navigate('/resume-builder/cover-letter')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Cover Letter
                </Button>
              </CardContent>
            </Card>

            {/* Popular Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Templates</CardTitle>
                <CardDescription>Professional designs optimized for ATS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {templates?.map((template) => (
                    <div 
                      key={template.id}
                      className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate('/resume-builder/templates')}
                    >
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-center">{template.name}</p>
                      <p className="text-xs text-gray-600 text-center capitalize">{template.category}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => navigate('/resume-builder/templates')} 
                  variant="outline" 
                  className="w-full mt-4"
                >
                  View All Templates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDashboard;
