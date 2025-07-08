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
import { EnhancedResumeProcessor } from '@/services/enhancedResumeProcessor';

// Configure PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

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
          ? content.skills 
          : content.skills?.technical 
            ? [
                ...(Array.isArray(content.skills.technical) ? content.skills.technical : [
                  ...(content.skills.technical?.programming || []),
                  ...(content.skills.technical?.frameworks || []),
                  ...(content.skills.technical?.databases || []),
                  ...(content.skills.technical?.tools || []),
                  ...(content.skills.technical?.cloud || [])
                ]),
                ...(content.skills.soft || []), 
                ...(content.skills.languages?.map((lang: any) => typeof lang === 'string' ? lang : lang.language) || []),
                ...(content.skills.certifications || [])
              ]
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
      let promptText = '';
      let sectionData = '';

      // Map section types to data and prompts
      switch (sectionType) {
        case 'summary':
          sectionData = resumeData.personalInfo.summary;
          promptText = enhanceType === 'ats' 
            ? 'Make this professional summary ATS-friendly with relevant keywords'
            : enhanceType === 'achievements'
            ? 'Rewrite this summary to focus on quantifiable achievements and impact'
            : 'Enhance this professional summary to be more compelling and professional';
          break;
        case 'experience':
          sectionData = JSON.stringify(resumeData.experience);
          promptText = enhanceType === 'ats'
            ? 'Optimize these work experiences for ATS with relevant keywords and formatting'
            : enhanceType === 'achievements'
            ? 'Rewrite these experiences to focus on quantifiable achievements using metrics and results'
            : 'Enhance these work experiences to be more professional and impactful';
          break;
        case 'skills':
          sectionData = resumeData.skills.join(', ');
          promptText = enhanceType === 'ats'
            ? 'Optimize this skills list for ATS compatibility and add relevant industry keywords'
            : 'Improve and expand this skills list for better professional presentation';
          break;
        default:
          return;
      }

      const { data, error } = await supabase.functions.invoke('ai-resume-enhancement', {
        body: {
          prompt: promptText,
          resumeData: sectionData,
          category: enhanceType
        }
      });

      if (error) throw error;

      // Apply the enhancement
      if (sectionType === 'summary') {
        setResumeData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            summary: data.enhancement
          }
        }));
      } else if (sectionType === 'experience') {
        try {
          const enhancedExperience = JSON.parse(data.enhancement);
          if (Array.isArray(enhancedExperience)) {
            setResumeData(prev => ({
              ...prev,
              experience: enhancedExperience
            }));
          }
        } catch (parseError) {
          // If parsing fails, treat as description text for first experience
          if (resumeData.experience.length > 0) {
            setResumeData(prev => ({
              ...prev,
              experience: prev.experience.map((exp, index) => 
                index === 0 ? { ...exp, description: data.enhancement } : exp
              )
            }));
          }
        }
      } else if (sectionType === 'skills') {
        const enhancedSkills = data.enhancement.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill);
        setResumeData(prev => ({
          ...prev,
          skills: enhancedSkills
        }));
      }

      toast.success(`${sectionType} enhanced successfully!`);
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error('Failed to enhance section');
    }
  }, [resumeData]);

  // Global enhancement functions
  const handleGlobalEnhancement = useCallback(async (type: string) => {
    try {
      toast.loading(`Applying ${type} enhancement...`, { id: 'global-enhance' });
      
      let promptText = '';
      
      switch (type) {
        case 'ats':
          promptText = 'Optimize this entire resume for ATS systems with proper keywords, formatting, and structure. Return the complete enhanced resume in JSON format with the same structure.';
          break;
        case 'achievements':
          promptText = 'Rewrite this resume to focus on quantifiable achievements, metrics, and impact across all sections. Return the complete enhanced resume in JSON format with the same structure.';
          break;
        case 'professional':
          promptText = 'Enhance this resume for professional tone, clarity, and modern language across all sections. Return the complete enhanced resume in JSON format with the same structure.';
          break;
        case 'job-specific':
          promptText = 'Tailor this resume for maximum job relevance and keyword optimization. Return the complete enhanced resume in JSON format with the same structure.';
          break;
      }

      const { data, error } = await supabase.functions.invoke('ai-resume-enhancement', {
        body: {
          prompt: promptText,
          resumeData: JSON.stringify(resumeData),
          category: type
        }
      });

      if (error) throw error;

      // Try to parse the enhanced resume data
      try {
        const enhancedData = JSON.parse(data.enhancement);
        if (enhancedData.personalInfo || enhancedData.experience || enhancedData.skills) {
          setResumeData(prev => ({
            ...prev,
            ...enhancedData,
            personalInfo: { ...prev.personalInfo, ...enhancedData.personalInfo },
            experience: enhancedData.experience || prev.experience,
            education: enhancedData.education || prev.education,
            skills: enhancedData.skills || prev.skills,
            projects: enhancedData.projects || prev.projects,
            certifications: enhancedData.certifications || prev.certifications,
            awards: enhancedData.awards || prev.awards
          }));
        } else {
          throw new Error('Invalid enhancement format');
        }
      } catch (parseError) {
        // If parsing fails, apply text improvements to summary
        setResumeData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            summary: data.enhancement
          }
        }));
      }

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

  // Quick Upload & Extract function
  const handleQuickUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      toast.loading('Extracting resume content...', { id: 'upload-extract' });

      // Use EnhancedResumeProcessor for reliable extraction
      const processor = new EnhancedResumeProcessor();
      const extractedContent = await processor.processResume(file);

      if (extractedContent && extractedContent.personalInfo) {
        // Apply extracted data to resume
        const extractedData = {
          personalInfo: {
            fullName: extractedContent.personalInfo.fullName || '',
            email: extractedContent.personalInfo.email || '',
            phone: extractedContent.personalInfo.phone || '',
            location: extractedContent.personalInfo.location || '',
            summary: extractedContent.personalInfo.summary || ''
          },
          experience: Array.isArray(extractedContent.experience) ? extractedContent.experience.map((exp: any) => ({
            id: Date.now().toString() + Math.random(),
            company: exp.company || '',
            position: exp.title || exp.position || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            description: exp.description || '',
            achievements: exp.achievements || []
          })) : [],
          education: Array.isArray(extractedContent.education) ? extractedContent.education.map((edu: any) => ({
            id: Date.now().toString() + Math.random(),
            institution: edu.school || edu.institution || '',
            degree: edu.degree || '',
            field: edu.field || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
            gpa: edu.gpa || ''
          })) : [],
          skills: Array.isArray(extractedContent.skills?.technical?.programming) 
            ? [
                ...(extractedContent.skills.technical.programming || []),
                ...(extractedContent.skills.technical.frameworks || []),
                ...(extractedContent.skills.technical.databases || []),
                ...(extractedContent.skills.technical.tools || []),
                ...(extractedContent.skills.technical.cloud || []),
                ...(extractedContent.skills.soft || [])
              ]
            : Array.isArray(extractedContent.skills) ? extractedContent.skills : [],
          projects: Array.isArray(extractedContent.projects) ? extractedContent.projects.map((proj: any) => ({
            id: Date.now().toString() + Math.random(),
            title: proj.title || '',
            description: proj.description || '',
            technologies: proj.technologies || [],
            startDate: proj.startDate || '',
            endDate: proj.endDate || '',
            url: proj.url || '',
            github: proj.github || ''
          })) : [],
          certifications: Array.isArray(extractedContent.certifications) ? extractedContent.certifications.map((cert: any) => ({
            id: Date.now().toString() + Math.random(),
            name: cert.name || '',
            issuer: cert.issuer || '',
            date: cert.date || '',
            url: cert.url || ''
          })) : [],
          awards: Array.isArray(extractedContent.awards) ? extractedContent.awards.map((award: any) => ({
            id: Date.now().toString() + Math.random(),
            name: award.name || '',
            issuer: award.issuer || '',
            date: award.date || '',
            description: award.description || ''
          })) : []
        };

        setResumeData(extractedData);
        
        // Save to database
        if (id) {
          await saveMutation.mutateAsync(extractedData);
        }

        toast.success('Resume extracted and loaded successfully!', { id: 'upload-extract' });
      } else {
        throw new Error('Failed to extract resume content');
      }
    } catch (error) {
      console.error('Upload & extract error:', error);
      toast.error('Failed to extract resume content', { id: 'upload-extract' });
    } finally {
      setIsUploading(false);
      // Clear file input
      event.target.value = '';
    }
  }, [id, saveMutation]);

  // Helper function to read file content based on file type
  const readFileContent = async (file: File): Promise<string> => {
    try {
      if (file.type === 'application/pdf') {
        // Handle PDF files using pdfjs-dist
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          text += pageText + ' ';
        }
        
        return text.trim();
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.type === 'application/msword') {
        // Handle DOCX and DOC files
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } else {
        // Handle text files
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            resolve(content);
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });
      }
    } catch (error) {
      throw new Error(`Failed to read ${file.type} file: ${error}`);
    }
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
            {/* Quick Upload & Extract - ChatGPT Style */}
            <Card className="border-dashed border-2 border-blue-300 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Upload className="h-5 w-5" />
                  Quick Upload & Extract
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-sm text-blue-600">
                    Upload your existing resume for instant AI extraction and enhancement
                  </p>
                  <input
                    type="file"
                    id="quick-upload"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleQuickUpload}
                  />
                  <Button
                    onClick={() => document.getElementById('quick-upload')?.click()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload & Extract Resume
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
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