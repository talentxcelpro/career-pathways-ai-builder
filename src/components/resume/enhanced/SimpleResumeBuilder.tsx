import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Download, 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap,
  Award,
  Plus,
  Trash2,
  Eye,
  ArrowLeft,
  Wand2,
  Target
} from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useResumeDataProcessor, ProcessedResumeData } from './ResumeDataProcessor';
import { analyzeATSCompatibility } from '@/utils/atsOptimization';

export const SimpleResumeBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const { processRawResumeData, validateResumeData, getEmptyResumeData } = useResumeDataProcessor();
  
  const [resumeData, setResumeData] = useState<ProcessedResumeData>(getEmptyResumeData());
  const [atsScore, setAtsScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch resume data
  const { data: resume, isLoading: resumeLoading, error } = useQuery({
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

  // Process resume data when loaded
  useEffect(() => {
    if (resume?.content) {
      const processed = processRawResumeData(resume.content);
      setResumeData(processed);
      
      // Calculate ATS score
      try {
        const atsAnalysis = analyzeATSCompatibility(processed);
        setAtsScore(atsAnalysis.overall);
      } catch (error) {
        console.error('ATS analysis failed:', error);
        setAtsScore(65);
      }
    }
  }, [resume, processRawResumeData]);

  // Save resume mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ProcessedResumeData) => {
      if (!id || !user) throw new Error('Missing required data');
      
      const { error } = await supabase
        .from('ai_resumes')
        .update({ 
          content: data as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', id] });
      toast.success('Resume saved!');
    },
    onError: (error) => {
      console.error('Save failed:', error);
      toast.error('Failed to save resume');
    }
  });

  // Handle data updates
  const handleDataUpdate = useCallback((updatedData: ProcessedResumeData) => {
    setResumeData(updatedData);
    
    // Recalculate ATS score
    try {
      const atsAnalysis = analyzeATSCompatibility(updatedData);
      setAtsScore(atsAnalysis.overall);
    } catch (error) {
      console.error('ATS analysis failed:', error);
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!resumeData.personalInfo.fullName || !id) return;
    
    const timer = setTimeout(() => {
      if (validateResumeData(resumeData)) {
        saveMutation.mutate(resumeData);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [resumeData, saveMutation, validateResumeData, id]);

  // Update functions
  const updatePersonalInfo = (field: string, value: string) => {
    handleDataUpdate({
      ...resumeData,
      personalInfo: { ...resumeData.personalInfo, [field]: value }
    });
  };

  const updateSkills = (skillsText: string) => {
    const skillsArray = skillsText.split(',').map(s => s.trim()).filter(s => s);
    handleDataUpdate({ ...resumeData, skills: skillsArray });
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    handleDataUpdate({
      ...resumeData,
      experience: [...resumeData.experience, newExp]
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updatedExperience = resumeData.experience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    handleDataUpdate({ ...resumeData, experience: updatedExperience });
  };

  const removeExperience = (index: number) => {
    const updatedExperience = resumeData.experience.filter((_, i) => i !== index);
    handleDataUpdate({ ...resumeData, experience: updatedExperience });
  };

  // Export functions
  const handleExportPDF = useCallback(async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' });
      const { exportToPDF } = await import('@/utils/exportResume');
      await exportToPDF('resume-preview', `${resumeData.personalInfo.fullName || 'resume'}.pdf`);
      toast.success('PDF downloaded!', { id: 'pdf-export' });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-export' });
    }
  }, [resumeData.personalInfo.fullName]);

  // Loading states
  if (authLoading || resumeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">Failed to load resume</p>
          <Button onClick={() => navigate('/resume-builder')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resume Builder
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-6 text-center">
          <p className="mb-4">Please sign in to access the resume builder</p>
          <Button onClick={() => navigate('/auth')} variant="default">
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/resume-builder')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Simple Resume Builder</h1>
              <p className="text-muted-foreground">Clean, focused resume editing</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={atsScore >= 80 ? 'default' : atsScore >= 60 ? 'secondary' : 'destructive'}>
              ATS: {atsScore}%
            </Badge>
            
            <Button
              onClick={handleExportPDF}
              size="sm"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Full Name"
                  value={resumeData.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Location"
                  value={resumeData.personalInfo.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                />
                <Textarea
                  placeholder="Professional Summary"
                  value={resumeData.personalInfo.summary}
                  onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experience
                  </CardTitle>
                  <Button size="sm" onClick={addExperience}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id || index} className="border rounded p-4 space-y-3">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Job Title"
                        value={exp.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      />
                      <Input
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      />
                      <Input
                        placeholder="Start Date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                      />
                      <Input
                        placeholder="End Date"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      />
                    </div>
                    <Textarea
                      placeholder="Description and achievements"
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your skills separated by commas (e.g., React, JavaScript, Python)"
                  value={resumeData.skills.join(', ')}
                  onChange={(e) => updateSkills(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div id="resume-preview" className="bg-white p-6 text-black space-y-4 text-sm">
                  {/* Personal Info */}
                  <div className="text-center border-b pb-4">
                    <h1 className="text-xl font-bold">
                      {resumeData.personalInfo.fullName || 'Your Name'}
                    </h1>
                    <div className="flex justify-center space-x-4 text-gray-600 mt-2">
                      {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                      {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                      {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.personalInfo.summary && (
                    <div>
                      <h2 className="font-bold text-lg mb-2">Professional Summary</h2>
                      <p className="text-gray-700">{resumeData.personalInfo.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.length > 0 && (
                    <div>
                      <h2 className="font-bold text-lg mb-2">Experience</h2>
                      {resumeData.experience.map((exp, index) => (
                        <div key={index} className="mb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{exp.title}</h3>
                              <p className="text-gray-600">{exp.company}</p>
                            </div>
                            <span className="text-gray-500 text-sm">
                              {exp.startDate} - {exp.endDate}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-gray-700 mt-1">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  {resumeData.skills.length > 0 && (
                    <div>
                      <h2 className="font-bold text-lg mb-2">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill, index) => (
                          <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {!resumeData.personalInfo.fullName && (
                    <div className="text-center py-12 text-gray-500">
                      <p>Start editing to see your resume preview</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};