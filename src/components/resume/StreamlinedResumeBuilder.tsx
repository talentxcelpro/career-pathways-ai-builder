import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Download, Wand2, Sparkles, Target, FileText, Globe, Briefcase, Eye, Plus, Trash2, Palette, User, Upload } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateList } from "./templates";
import { toast } from 'sonner';

// Import file processing libraries
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { configurePDFWorker } from '@/utils/pdfWorkerConfig';
import { EnhancedResumeProcessor } from '@/services/enhancedResumeProcessor';

// Initialize PDF worker
configurePDFWorker().catch(console.error);

interface SectionEnhancerProps {
  title: string;
  icon: React.ReactNode;
  content: string;
  onContentChange: (content: string) => void;
  onEnhance: (type: string) => void;
  placeholder: string;
  isTextarea?: boolean;
  enhanceTypes: { key: string; label: string; icon: string }[];
}

const SectionEnhancer: React.FC<SectionEnhancerProps> = ({
  title,
  icon,
  content,
  onContentChange,
  onEnhance,
  placeholder,
  isTextarea = false,
  enhanceTypes
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async (type: string) => {
    setIsEnhancing(true);
    try {
      await onEnhance(type);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          <div className="flex gap-2">
            {enhanceTypes.map((enhance) => (
              <Button
                key={enhance.key}
                size="sm"
                variant="outline"
                onClick={() => handleEnhance(enhance.key)}
                disabled={isEnhancing}
                className="text-xs"
              >
                <span className="mr-1">{enhance.icon}</span>
                {enhance.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isTextarea ? (
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="resize-none"
          />
        ) : (
          <Input
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder={placeholder}
          />
        )}
      </CardContent>
    </Card>
  );
};

export const StreamlinedResumeBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isUploading, setIsUploading] = useState(false);
  const [resumeData, setResumeData] = useState<any>({
    personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    awards: []
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
      const content = resume.content as any;
      
      const processedData = {
        personalInfo: {
          fullName: content.personalInfo?.fullName || '',
          email: content.personalInfo?.email || '',
          phone: content.personalInfo?.phone || '',
          location: content.personalInfo?.location || '',
          summary: content.personalInfo?.summary || ''
        },
        experience: Array.isArray(content.experience) ? content.experience : [],
        education: Array.isArray(content.education) ? content.education : [],
        skills: Array.isArray(content.skills) 
          ? content.skills.map(skill => typeof skill === 'string' ? skill : skill?.skill || skill?.name || '').filter(Boolean)
          : content.skills?.technical 
            ? [
                ...(Array.isArray(content.skills.technical) 
                  ? content.skills.technical.map(skill => typeof skill === 'string' ? skill : skill?.skill || skill?.name || '').filter(Boolean)
                  : [
                      ...(content.skills.technical?.programming || []).map(skill => typeof skill === 'string' ? skill : skill?.skill || skill?.name || ''),
                      ...(content.skills.technical?.frameworks || []).map(skill => typeof skill === 'string' ? skill : skill?.skill || skill?.name || ''),
                      ...(content.skills.technical?.databases || []).map(skill => typeof skill === 'string' ? skill : skill?.skill || skill?.name || ''),
                      ...(content.skills.technical?.tools || []).map(skill => typeof skill === 'string' ? skill : skill?.skill || skill?.name || ''),
                      ...(content.skills.technical?.cloud || []).map(skill => typeof skill === 'string' ? skill : skill?.skill || skill?.name || '')
                    ].filter(Boolean)
                ),
                ...(content.skills.soft || []).map(skill => typeof skill === 'string' ? skill : skill?.skill || skill?.name || '').filter(Boolean), 
                ...(content.skills.languages?.map((lang: any) => typeof lang === 'string' ? lang : lang.language || lang.skill || lang.name) || []).filter(Boolean),
                ...(content.skills.certifications || []).map(skill => typeof skill === 'string' ? skill : skill?.skill || skill?.name || '').filter(Boolean)
              ].filter(Boolean)
            : [],
        projects: Array.isArray(content.projects) ? content.projects : [],
        certifications: Array.isArray(content.certifications) ? content.certifications : [],
        awards: Array.isArray(content.awards) ? content.awards : []
      };
      
      setResumeData(processedData);
      if (resume.template_id) setSelectedTemplate(resume.template_id);
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
          template_id: selectedTemplate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', id] });
      toast.success('Resume saved!');
    }
  });

  // AI Enhancement function
  const enhanceSection = useCallback(async (sectionType: string, enhanceType: string) => {
    try {
      toast.loading(`Enhancing ${sectionType}...`, { id: 'section-enhance' });

      // Create focused resume data for section enhancement
      const focusedData = {
        personalInfo: resumeData.personalInfo,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        projects: resumeData.projects,
        certifications: resumeData.certifications,
        awards: resumeData.awards
      };

      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          resumeData: focusedData,
          enhancementType: `${sectionType}_${enhanceType}`
        }
      });

      if (error) throw error;

      // Check for valid response
      if (!data || !data.enhancedResume) {
        throw new Error('Invalid response from enhancement service');
      }

      // Apply the enhancement to the specific section
      if (sectionType === 'summary') {
        setResumeData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            summary: data.enhancedResume.personalInfo?.summary || prev.personalInfo.summary
          }
        }));
      } else if (sectionType === 'experience') {
        setResumeData(prev => ({
          ...prev,
          experience: data.enhancedResume.experience || prev.experience
        }));
      } else if (sectionType === 'skills') {
        setResumeData(prev => ({
          ...prev,
          skills: data.enhancedResume.skills || prev.skills
        }));
      }

      toast.success(`${sectionType} enhanced successfully!`, { id: 'section-enhance' });
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error('Failed to enhance section', { id: 'section-enhance' });
    }
  }, [resumeData]);

  // Global enhancement functions
  const handleGlobalEnhancement = useCallback(async (type: string) => {
    try {
      toast.loading(`Applying ${type} enhancement...`, { id: 'global-enhance' });
      
      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          resumeData: resumeData,
          enhancementType: type
        }
      });

      if (error) throw error;

      // Check for valid response
      if (!data || !data.enhancedResume) {
        throw new Error('Invalid response from enhancement service');
      }

      // Apply the enhanced resume data
      setResumeData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, ...data.enhancedResume.personalInfo },
        experience: data.enhancedResume.experience || prev.experience,
        education: data.enhancedResume.education || prev.education,
        skills: data.enhancedResume.skills || prev.skills,
        projects: data.enhancedResume.projects || prev.projects,
        certifications: data.enhancedResume.certifications || prev.certifications,
        awards: data.enhancedResume.awards || prev.awards
      }));

      toast.success(`Resume enhanced globally for ${type}!`, { id: 'global-enhance' });
    } catch (error) {
      console.error('Global enhancement error:', error);
      toast.error('Failed to enhance resume', { id: 'global-enhance' });
    }
  }, [resumeData]);

  // Export functions
  const exportPDF = useCallback(async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' });
      const { exportToPDF } = await import('@/utils/exportResume');
      await exportToPDF('resume-preview', `${resumeData.personalInfo.fullName || 'resume'}.pdf`);
      toast.success('PDF downloaded!', { id: 'pdf-export' });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: 'pdf-export' });
    }
  }, [resumeData.personalInfo.fullName]);

  const exportDOCX = useCallback(async () => {
    try {
      toast.loading('Generating DOCX...', { id: 'docx-export' });
      const { exportToDOCX } = await import('@/utils/exportResume');
      await exportToDOCX(resumeData, `${resumeData.personalInfo.fullName || 'resume'}.docx`);
      toast.success('DOCX downloaded!', { id: 'docx-export' });
    } catch (error) {
      toast.error('Failed to generate DOCX', { id: 'docx-export' });
    }
  }, [resumeData]);

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (resumeData.personalInfo.fullName) {
        saveMutation.mutate(resumeData);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [resumeData, saveMutation]);

  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const updateSkills = (skills: string) => {
    const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    setResumeData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };


  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const SelectedTemplate = templateList.find(t => t.id === selectedTemplate)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/resume-builder')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Resume Builder</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Global Enhancement Buttons */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGlobalEnhancement('ats')}
              className="bg-blue-50 border-blue-200 text-blue-700"
            >
              <Target className="h-4 w-4 mr-1" />
              🎯 ATS Optimize
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGlobalEnhancement('achievements')}
              className="bg-green-50 border-green-200 text-green-700"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              🚀 Focus Achievements
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGlobalEnhancement('professional')}
              className="bg-purple-50 border-purple-200 text-purple-700"
            >
              <FileText className="h-4 w-4 mr-1" />
              📝 Professional Tone
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* Export Buttons */}
            <Button size="sm" variant="outline" onClick={exportPDF}>
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button size="sm" variant="outline" onClick={exportDOCX}>
              <Download className="h-4 w-4 mr-1" />
              DOCX
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Choose Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateList.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

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
              </CardContent>
            </Card>

            {/* Professional Summary with Enhancement */}
            <SectionEnhancer
              title="Professional Summary"
              icon={<FileText className="h-5 w-5" />}
              content={resumeData.personalInfo.summary}
              onContentChange={(content) => updatePersonalInfo('summary', content)}
              onEnhance={(type) => enhanceSection('summary', type)}
              placeholder="Write a compelling professional summary..."
              isTextarea={true}
              enhanceTypes={[
                { key: 'general', label: '✨ Enhance', icon: '✨' },
                { key: 'ats', label: 'ATS', icon: '🎯' },
                { key: 'achievements', label: 'Results', icon: '🚀' }
              ]}
            />

            {/* Skills with Enhancement */}
            <SectionEnhancer
              title="Skills"
              icon={<Briefcase className="h-5 w-5" />}
              content={resumeData.skills.join(', ')}
              onContentChange={updateSkills}
              onEnhance={(type) => enhanceSection('skills', type)}
              placeholder="React, JavaScript, Python, etc."
              enhanceTypes={[
                { key: 'general', label: '✨ Enhance', icon: '✨' },
                { key: 'ats', label: 'ATS', icon: '🎯' }
              ]}
            />

            {/* Experience Section - Enhanced */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience  
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => enhanceSection('experience', 'achievements')}
                      className="text-xs"
                    >
                      <span className="mr-1">🚀</span>
                      Results Focus
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => enhanceSection('experience', 'ats')}
                      className="text-xs"
                    >
                      <span className="mr-1">🎯</span>
                      ATS Optimize
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {resumeData.experience.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No experience added yet</p>
                    <Button className="mt-4" onClick={() => {
                      setResumeData(prev => ({
                        ...prev,
                        experience: [...prev.experience, {
                          id: Date.now().toString(),
                          company: '',
                          position: '',
                          startDate: '',
                          endDate: '',
                          description: '',
                          achievements: []
                        }]
                      }));
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Job Title"
                            value={exp.position || exp.title || ''}
                            onChange={(e) => {
                              const newExperience = [...resumeData.experience];
                              newExperience[index] = { ...newExperience[index], position: e.target.value, title: e.target.value };
                              setResumeData(prev => ({ ...prev, experience: newExperience }));
                            }}
                          />
                          <Input
                            placeholder="Company"
                            value={exp.company || ''}
                            onChange={(e) => {
                              const newExperience = [...resumeData.experience];
                              newExperience[index] = { ...newExperience[index], company: e.target.value };
                              setResumeData(prev => ({ ...prev, experience: newExperience }));
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Start Date"
                            value={exp.startDate || ''}
                            onChange={(e) => {
                              const newExperience = [...resumeData.experience];
                              newExperience[index] = { ...newExperience[index], startDate: e.target.value };
                              setResumeData(prev => ({ ...prev, experience: newExperience }));
                            }}
                          />
                          <Input
                            placeholder="End Date"
                            value={exp.endDate || ''}
                            onChange={(e) => {
                              const newExperience = [...resumeData.experience];
                              newExperience[index] = { ...newExperience[index], endDate: e.target.value };
                              setResumeData(prev => ({ ...prev, experience: newExperience }));
                            }}
                          />
                        </div>
                        <Textarea
                          placeholder="Job description and achievements..."
                          value={exp.description || ''}
                          onChange={(e) => {
                            const newExperience = [...resumeData.experience];
                            newExperience[index] = { ...newExperience[index], description: e.target.value };
                            setResumeData(prev => ({ ...prev, experience: newExperience }));
                          }}
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newExperience = resumeData.experience.filter((_, i) => i !== index);
                              setResumeData(prev => ({ ...prev, experience: newExperience }));
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setResumeData(prev => ({
                          ...prev,
                          experience: [...prev.experience, {
                            id: Date.now().toString(),
                            company: '',
                            position: '',
                            startDate: '',
                            endDate: '',
                            description: '',
                            achievements: []
                          }]
                        }));
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div id="resume-preview" className="bg-white border rounded-lg overflow-hidden" style={{ transform: 'scale(0.7)', transformOrigin: 'top left', width: '142.86%', height: '142.86%' }}>
                  {SelectedTemplate && <SelectedTemplate data={resumeData} />}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};