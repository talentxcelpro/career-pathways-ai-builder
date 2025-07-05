import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Eye, Download, Plus, Edit3, Palette, Trash2, Award, Briefcase, AlertCircle, Target, Sparkles, GraduationCap, Code, Star, User } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeTemplates } from "@/components/resume/ResumeTemplates";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableSection } from "@/components/resume/DraggableSection";
import { useAutoSave } from "@/hooks/useAutoSave";
import { validateResumeData, getFieldError, getSectionErrors } from "@/utils/resumeValidation";
import { analyzeATSCompatibility } from "@/utils/atsOptimization";
import { ATSOptimizationPanel } from "@/components/resume/ATSOptimizationPanel";
import { KeywordAnalyzer } from "@/components/resume/KeywordAnalyzer";
import { TemplateGallery } from "@/components/resume/TemplateGallery";
import { AIContentSuggestions } from "@/components/resume/AIContentSuggestions";
import { toast } from 'sonner';

const EditResume = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [resumeData, setResumeData] = useState<any>({
    personalInfo: { 
      fullName: '', 
      professionalTitle: '',
      email: '', 
      phone: '', 
      location: '', 
      linkedin: '',
      website: '',
      summary: '' 
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    awards: []
  });
  const [sectionOrder, setSectionOrder] = useState([
    'personalInfo',
    'experience', 
    'education',
    'skills',
    'projects',
    'certifications',
    'awards'
  ]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('editor');
  
  // Form validation
  const validation = validateResumeData(resumeData);
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch resume data
  const { data: resume, isLoading, error } = useQuery({
    queryKey: ['resume', id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      console.log('Fetching resume:', { id, userId: user.id });
      
      const { data, error } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Resume fetch error:', error);
        throw error;
      }
      
      console.log('Resume data:', data);
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
          professionalTitle: content.personalInfo?.professionalTitle || '',
          email: content.personalInfo?.email || '',
          phone: content.personalInfo?.phone || '',
          location: content.personalInfo?.location || '',
          linkedin: content.personalInfo?.linkedin || '',
          website: content.personalInfo?.website || '',
          summary: content.personalInfo?.summary || ''
        },
        experience: Array.isArray(content.experience) ? content.experience : [],
        education: Array.isArray(content.education) ? content.education : [],
        skills: Array.isArray(content.skills) 
          ? content.skills 
          : content.skills?.technical 
            ? [...(content.skills.technical || []), ...(content.skills.soft || []), ...(content.skills.languages || []), ...(content.skills.tools || [])]
            : [],
        projects: Array.isArray(content.projects) ? content.projects : [],
        certifications: Array.isArray(content.certifications) ? content.certifications : [],
        awards: Array.isArray(content.awards) ? content.awards : []
      };
      
      console.log('Processed resume data:', processedData);
      setResumeData(processedData);
    }
  }, [resume]);

  // Save resume mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!id || !user) throw new Error('Missing required data');
      
      const atsAnalysis = analyzeATSCompatibility(data);
      
      const { error } = await supabase
        .from('ai_resumes')
        .update({ 
          content: data,
          ats_score: atsAnalysis.overall,
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

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync(resumeData);
      toast.success('Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [resumeData, saveMutation]);

  // Auto-save functionality
  useAutoSave({
    data: resumeData,
    saveFunction: saveMutation.mutateAsync,
    delay: 3000,
    enabled: autoSaveEnabled && !isSaving
  });

  // Personal Info Updates
  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData((prev: any) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  // Experience Management
  const addExperience = () => {
    setResumeData((prev: any) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now().toString(),
          title: '',
          company: '',
          location: '',
          employmentType: '',
          startDate: '',
          endDate: '',
          description: '',
          achievements: [],
          technologies: [],
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

  const removeExperience = (index: number) => {
    setResumeData((prev: any) => ({
      ...prev,
      experience: prev.experience.filter((_: any, i: number) => i !== index)
    }));
  };

  // Education Management
  const addEducation = () => {
    setResumeData((prev: any) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now().toString(),
          degree: '',
          school: '',
          location: '',
          startDate: '',
          endDate: '',
          gpa: '',
          honors: '',
          relevantCoursework: []
        }
      ]
    }));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    setResumeData((prev: any) => ({
      ...prev,
      education: prev.education.map((edu: any, i: number) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData((prev: any) => ({
      ...prev,
      education: prev.education.filter((_: any, i: number) => i !== index)
    }));
  };

  // Skills Management
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

  // Projects Management
  const addProject = () => {
    setResumeData((prev: any) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: Date.now().toString(),
          title: '',
          description: '',
          technologies: [],
          startDate: '',
          endDate: '',
          url: '',
          github: ''
        }
      ]
    }));
  };

  const updateProject = (index: number, field: string, value: any) => {
    setResumeData((prev: any) => ({
      ...prev,
      projects: prev.projects.map((project: any, i: number) =>
        i === index ? { ...project, [field]: value } : project
      )
    }));
  };

  const removeProject = (index: number) => {
    setResumeData((prev: any) => ({
      ...prev,
      projects: prev.projects.filter((_: any, i: number) => i !== index)
    }));
  };

  // Certifications Management
  const addCertification = () => {
    setResumeData((prev: any) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: Date.now().toString(),
          name: '',
          issuer: '',
          date: '',
          expiryDate: '',
          credentialId: '',
          url: ''
        }
      ]
    }));
  };

  const updateCertification = (index: number, field: string, value: any) => {
    setResumeData((prev: any) => ({
      ...prev,
      certifications: prev.certifications.map((cert: any, i: number) =>
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (index: number) => {
    setResumeData((prev: any) => ({
      ...prev,
      certifications: prev.certifications.filter((_: any, i: number) => i !== index)
    }));
  };

  // Awards Management
  const addAward = () => {
    setResumeData((prev: any) => ({
      ...prev,
      awards: [
        ...prev.awards,
        {
          id: Date.now().toString(),
          name: '',
          issuer: '',
          date: '',
          description: ''
        }
      ]
    }));
  };

  const updateAward = (index: number, field: string, value: any) => {
    setResumeData((prev: any) => ({
      ...prev,
      awards: prev.awards.map((award: any, i: number) =>
        i === index ? { ...award, [field]: value } : award
      )
    }));
  };

  const removeAward = (index: number) => {
    setResumeData((prev: any) => ({
      ...prev,
      awards: prev.awards.filter((_: any, i: number) => i !== index)
    }));
  };

  // Utility Functions
  const handleKeywordSuggestion = (keyword: string) => {
    const currentSkills = resumeData.skills || [];
    if (!currentSkills.includes(keyword)) {
      setResumeData((prev: any) => ({
        ...prev,
        skills: [...currentSkills, keyword]
      }));
      toast.success(`Added "${keyword}" to your skills`);
    } else {
      toast.info(`"${keyword}" is already in your skills`);
    }
  };

  const handleAIContentGenerated = (content: string, type: string, sectionIndex?: number) => {
    switch (type) {
      case 'summary':
        setResumeData((prev: any) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            summary: content
          }
        }));
        break;

      case 'skills':
        const newSkills = content.split(',').map(skill => skill.trim()).filter(skill => skill);
        setResumeData((prev: any) => ({
          ...prev,
          skills: [...new Set([...prev.skills, ...newSkills])]
        }));
        break;

      case 'experience':
        if (sectionIndex !== undefined) {
          setResumeData((prev: any) => ({
            ...prev,
            experience: prev.experience.map((exp: any, index: number) =>
              index === sectionIndex ? { ...exp, description: content } : exp
            )
          }));
        }
        break;

      case 'projects':
        if (sectionIndex !== undefined) {
          setResumeData((prev: any) => ({
            ...prev,
            projects: prev.projects.map((project: any, index: number) =>
              index === sectionIndex ? { ...project, description: content } : project
            )
          }));
        }
        break;

      default:
        console.warn('Unknown AI content type:', type);
    }
  };

  // Drag and drop functionality
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Loading and Error States
  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resume Not Found</h2>
          <p className="text-gray-600 mb-6">
            No resume ID provided. Please select a resume to edit from your dashboard.
          </p>
          <Button onClick={() => navigate('/resume-builder')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resume Dashboard
          </Button>
        </div>
      </div>
    );
  }

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

  if (error) {
    console.error('Resume query error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading resume</h2>
          <p className="text-gray-600 mb-4">There was a problem loading this resume. Error: {error.message}</p>
          <Button onClick={() => navigate('/resume-builder')}>
            Back to Dashboard
          </Button>
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
          <Button onClick={() => navigate('/resume-builder')}>
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
              onClick={() => navigate('/resume-builder')}
              className="flex items-center mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Resume Builder</h1>
              <p className="text-gray-600">AI-powered comprehensive resume editor</p>
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
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'editor' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit3 className="h-4 w-4 inline mr-2" />
            Resume Editor
          </button>
          <button
            onClick={() => setActiveTab('ats')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'ats' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Target className="h-4 w-4 inline mr-2" />
            ATS Optimization
          </button>
          <button
            onClick={() => setActiveTab('keywords')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'keywords' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code className="h-4 w-4 inline mr-2" />
            Keyword Analysis
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'templates' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Palette className="h-4 w-4 inline mr-2" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'ai' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="h-4 w-4 inline mr-2" />
            AI Assistant
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'editor' && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">
                {sectionOrder.map((sectionId) => {
                  switch (sectionId) {
                    case 'personalInfo':
                      return (
                        <Card key="personalInfo" className="shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">Personal Information</CardTitle>
                                  <CardDescription>Your basic contact and professional information</CardDescription>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Full Name *
                                </label>
                                <Input
                                  value={resumeData.personalInfo?.fullName || ''}
                                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                                  placeholder="Your full name"
                                  className={getFieldError('personalInfo.fullName', validation) ? 'border-red-500' : ''}
                                />
                                {getFieldError('personalInfo.fullName', validation) && (
                                  <p className="text-red-500 text-xs mt-1">{getFieldError('personalInfo.fullName', validation)}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Professional Title
                                </label>
                                <Input
                                  value={resumeData.personalInfo?.professionalTitle || ''}
                                  onChange={(e) => updatePersonalInfo('professionalTitle', e.target.value)}
                                  placeholder="e.g., Senior Software Engineer"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Email *
                                </label>
                                <Input
                                  type="email"
                                  value={resumeData.personalInfo?.email || ''}
                                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                  placeholder="your.email@example.com"
                                  className={getFieldError('personalInfo.email', validation) ? 'border-red-500' : ''}
                                />
                                {getFieldError('personalInfo.email', validation) && (
                                  <p className="text-red-500 text-xs mt-1">{getFieldError('personalInfo.email', validation)}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Phone *
                                </label>
                                <Input
                                  value={resumeData.personalInfo?.phone || ''}
                                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                  placeholder="+1 (555) 123-4567"
                                  className={getFieldError('personalInfo.phone') ? 'border-red-500' : ''}
                                />
                                {getFieldError('personalInfo.phone') && (
                                  <p className="text-red-500 text-xs mt-1">{getFieldError('personalInfo.phone')}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Location
                                </label>
                                <Input
                                  value={resumeData.personalInfo?.location || ''}
                                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                                  placeholder="City, State/Country"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  LinkedIn Profile
                                </label>
                                <Input
                                  value={resumeData.personalInfo?.linkedin || ''}
                                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                                  placeholder="https://linkedin.com/in/yourprofile"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Website/Portfolio
                                </label>
                                <Input
                                  value={resumeData.personalInfo?.website || ''}
                                  onChange={(e) => updatePersonalInfo('website', e.target.value)}
                                  placeholder="https://yourwebsite.com"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Professional Summary *
                                </label>
                                <Textarea
                                  value={resumeData.personalInfo?.summary || ''}
                                  onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                                  placeholder="A compelling professional summary highlighting your key strengths, experience, and career objectives (2-3 sentences recommended)"
                                  rows={4}
                                  className={getFieldError('personalInfo.summary') ? 'border-red-500' : ''}
                                />
                                {getFieldError('personalInfo.summary') && (
                                  <p className="text-red-500 text-xs mt-1">{getFieldError('personalInfo.summary')}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );

                    case 'experience':
                      return (
                        <Card key="experience" className="shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <Briefcase className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">Work Experience</CardTitle>
                                  <CardDescription>Your professional work history</CardDescription>
                                </div>
                              </div>
                              <Button onClick={addExperience} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Experience
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              {resumeData.experience?.length > 0 ? (
                                resumeData.experience.map((exp: any, index: number) => (
                                  <div key={exp.id || index} className="p-6 border border-gray-200 rounded-lg bg-gray-50 relative">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeExperience(index)}
                                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Job Title *
                                        </label>
                                        <Input
                                          value={exp.position || exp.title || ''}
                                          onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                          placeholder="e.g., Senior Software Engineer"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Company *
                                        </label>
                                        <Input
                                          value={exp.company || ''}
                                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                          placeholder="Company name"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Location
                                        </label>
                                        <Input
                                          value={exp.location || ''}
                                          onChange={(e) => updateExperience(index, 'location', e.target.value)}
                                          placeholder="City, State/Country"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Employment Type
                                        </label>
                                        <Select
                                          value={exp.employmentType || ''}
                                          onValueChange={(value) => updateExperience(index, 'employmentType', value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="full-time">Full-time</SelectItem>
                                            <SelectItem value="part-time">Part-time</SelectItem>
                                            <SelectItem value="contract">Contract</SelectItem>
                                            <SelectItem value="freelance">Freelance</SelectItem>
                                            <SelectItem value="internship">Internship</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Start Date *
                                        </label>
                                        <Input
                                          type="month"
                                          value={exp.startDate || ''}
                                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          End Date
                                        </label>
                                        <Input
                                          type="month"
                                          value={exp.endDate || ''}
                                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                          disabled={exp.current}
                                          placeholder={exp.current ? 'Present' : ''}
                                        />
                                      </div>
                                      <div className="md:col-span-2">
                                        <div className="flex items-center space-x-2 mb-4">
                                          <input
                                            type="checkbox"
                                            id={`current-${index}`}
                                            checked={exp.current || false}
                                            onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                                            className="rounded"
                                          />
                                          <label htmlFor={`current-${index}`} className="text-sm text-gray-700">
                                            I currently work here
                                          </label>
                                        </div>
                                      </div>
                                      <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Job Description & Key Responsibilities *
                                        </label>
                                        <Textarea
                                          value={exp.description || ''}
                                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                          placeholder="• Developed and maintained web applications using React and Node.js&#10;• Led a team of 5 developers and improved code quality by 40%&#10;• Implemented CI/CD pipelines reducing deployment time by 60%"
                                          rows={5}
                                        />
                                      </div>
                                      <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Key Achievements (Optional)
                                        </label>
                                        <Textarea
                                          value={exp.achievements?.join('\n') || ''}
                                          onChange={(e) => updateExperience(index, 'achievements', e.target.value.split('\n').filter((a: string) => a.trim()))}
                                          placeholder="• Increased team productivity by 25%&#10;• Won Employee of the Month award&#10;• Successfully delivered 3 major projects ahead of schedule"
                                          rows={3}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Enter each achievement on a new line</p>
                                      </div>
                                      <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Technologies & Tools Used
                                        </label>
                                        <Input
                                          value={exp.technologies?.join(', ') || ''}
                                          onChange={(e) => updateExperience(index, 'technologies', e.target.value.split(',').map((t: string) => t.trim()).filter((t: string) => t))}
                                          placeholder="React, Node.js, PostgreSQL, AWS, Docker, Kubernetes"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Separate technologies with commas</p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                  <h3 className="text-lg font-medium mb-2">No work experience added yet</h3>
                                  <p className="mb-4">Add your professional work history to make your resume stand out</p>
                                  <Button onClick={addExperience} variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Job
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );

                    case 'education':
                      return (
                        <Card key="education" className="shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                  <GraduationCap className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">Education</CardTitle>
                                  <CardDescription>Your educational background</CardDescription>
                                </div>
                              </div>
                              <Button onClick={addEducation} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Education
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              {resumeData.education?.length > 0 ? (
                                resumeData.education.map((edu: any, index: number) => (
                                  <div key={edu.id || index} className="p-6 border border-gray-200 rounded-lg bg-gray-50 relative">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeEducation(index)}
                                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Degree/Qualification *
                                        </label>
                                        <Input
                                          value={edu.degree || ''}
                                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                          placeholder="e.g., Bachelor of Science in Computer Science"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          School/University *
                                        </label>
                                        <Input
                                          value={edu.school || ''}
                                          onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                          placeholder="University/College name"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Location
                                        </label>
                                        <Input
                                          value={edu.location || ''}
                                          onChange={(e) => updateEducation(index, 'location', e.target.value)}
                                          placeholder="City, State/Country"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          GPA (Optional)
                                        </label>
                                        <Input
                                          value={edu.gpa || ''}
                                          onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                          placeholder="e.g., 3.8/4.0"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Start Date
                                        </label>
                                        <Input
                                          type="month"
                                          value={edu.startDate || ''}
                                          onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Graduation Date
                                        </label>
                                        <Input
                                          type="month"
                                          value={edu.endDate || ''}
                                          onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                                        />
                                      </div>
                                      <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Honors & Awards
                                        </label>
                                        <Input
                                          value={edu.honors || ''}
                                          onChange={(e) => updateEducation(index, 'honors', e.target.value)}
                                          placeholder="e.g., Magna Cum Laude, Dean's List"
                                        />
                                      </div>
                                      <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Relevant Coursework
                                        </label>
                                        <Input
                                          value={edu.relevantCoursework?.join(', ') || ''}
                                          onChange={(e) => updateEducation(index, 'relevantCoursework', e.target.value.split(',').map((c: string) => c.trim()).filter((c: string) => c))}
                                          placeholder="Data Structures, Algorithms, Database Systems, Software Engineering"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Separate courses with commas</p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                  <h3 className="text-lg font-medium mb-2">No education added yet</h3>
                                  <p className="mb-4">Add your educational background to strengthen your resume</p>
                                  <Button onClick={addEducation} variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Education
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );

                    case 'skills':
                      return (
                        <Card key="skills" className="shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                  <Code className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">Skills</CardTitle>
                                  <CardDescription>Your technical and professional skills</CardDescription>
                                </div>
                              </div>
                              <Button onClick={addSkill} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Skill
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              {resumeData.skills?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {resumeData.skills.map((skill: string, index: number) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <Input
                                        value={skill}
                                        onChange={(e) => updateSkill(index, e.target.value)}
                                        placeholder="Enter a skill"
                                        className="flex-1"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSkill(index)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                  <h3 className="text-lg font-medium mb-2">No skills added yet</h3>
                                  <p className="mb-4">Add your technical and professional skills</p>
                                  <Button onClick={addSkill} variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Skill
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );

                    case 'projects':
                      return (
                        <Card key="projects" className="shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-teal-100 rounded-lg">
                                  <Code className="h-5 w-5 text-teal-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">Projects</CardTitle>
                                  <CardDescription>Your personal or professional projects</CardDescription>
                                </div>
                              </div>
                              <Button onClick={addProject} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Project
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              {resumeData.projects?.length > 0 ? (
                                resumeData.projects.map((project: any, index: number) => (
                                  <div key={project.id || index} className="p-6 border border-gray-200 rounded-lg bg-gray-50 relative">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeProject(index)}
                                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Project Title *
                                        </label>
                                        <Input
                                          value={project.title || ''}
                                          onChange={(e) => updateProject(index, 'title', e.target.value)}
                                          placeholder="e.g., E-commerce Web Application"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Technologies Used
                                        </label>
                                        <Input
                                          value={project.technologies?.join(', ') || ''}
                                          onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map((t: string) => t.trim()).filter((t: string) => t))}
                                          placeholder="React, Node.js, MongoDB, AWS"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Start Date
                                        </label>
                                        <Input
                                          type="month"
                                          value={project.startDate || ''}
                                          onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          End Date
                                        </label>
                                        <Input
                                          type="month"
                                          value={project.endDate || ''}
                                          onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Project URL
                                        </label>
                                        <Input
                                          value={project.url || ''}
                                          onChange={(e) => updateProject(index, 'url', e.target.value)}
                                          placeholder="https://yourproject.com"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          GitHub Repository
                                        </label>
                                        <Input
                                          value={project.github || ''}
                                          onChange={(e) => updateProject(index, 'github', e.target.value)}
                                          placeholder="https://github.com/yourusername/project"
                                        />
                                      </div>
                                      <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Project Description *
                                        </label>
                                        <Textarea
                                          value={project.description || ''}
                                          onChange={(e) => updateProject(index, 'description', e.target.value)}
                                          placeholder="Describe your project, its features, and your role in developing it..."
                                          rows={4}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                  <h3 className="text-lg font-medium mb-2">No projects added yet</h3>
                                  <p className="mb-4">Showcase your personal or professional projects</p>
                                  <Button onClick={addProject} variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Project
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );

                    case 'certifications':
                      return (
                        <Card key="certifications" className="shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                  <Award className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">Certifications</CardTitle>
                                  <CardDescription>Your professional certifications and licenses</CardDescription>
                                </div>
                              </div>
                              <Button onClick={addCertification} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Certification
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              {resumeData.certifications?.length > 0 ? (
                                resumeData.certifications.map((cert: any, index: number) => (
                                  <div key={cert.id || index} className="p-6 border border-gray-200 rounded-lg bg-gray-50 relative">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeCertification(index)}
                                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Certification Name *
                                        </label>
                                        <Input
                                          value={cert.name || ''}
                                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                          placeholder="e.g., AWS Certified Solutions Architect"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Issuing Organization *
                                        </label>
                                        <Input
                                          value={cert.issuer || ''}
                                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                          placeholder="e.g., Amazon Web Services"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Issue Date
                                        </label>
                                        <Input
                                          type="month"
                                          value={cert.date || ''}
                                          onChange={(e) => updateCertification(index, 'date', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Expiry Date (Optional)
                                        </label>
                                        <Input
                                          type="month"
                                          value={cert.expiryDate || ''}
                                          onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Credential ID
                                        </label>
                                        <Input
                                          value={cert.credentialId || ''}
                                          onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                                          placeholder="Certification ID/Number"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Verification URL
                                        </label>
                                        <Input
                                          value={cert.url || ''}
                                          onChange={(e) => updateCertification(index, 'url', e.target.value)}
                                          placeholder="https://verify.certification.com"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                  <h3 className="text-lg font-medium mb-2">No certifications added yet</h3>
                                  <p className="mb-4">Add your professional certifications and licenses</p>
                                  <Button onClick={addCertification} variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Certification
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );

                    case 'awards':
                      return (
                        <Card key="awards" className="shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                  <Star className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">Awards & Achievements</CardTitle>
                                  <CardDescription>Your professional awards and recognitions</CardDescription>
                                </div>
                              </div>
                              <Button onClick={addAward} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Award
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              {resumeData.awards?.length > 0 ? (
                                resumeData.awards.map((award: any, index: number) => (
                                  <div key={award.id || index} className="p-6 border border-gray-200 rounded-lg bg-gray-50 relative">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeAward(index)}
                                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Award Name *
                                        </label>
                                        <Input
                                          value={award.name || ''}
                                          onChange={(e) => updateAward(index, 'name', e.target.value)}
                                          placeholder="e.g., Employee of the Year"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Awarding Organization *
                                        </label>
                                        <Input
                                          value={award.issuer || ''}
                                          onChange={(e) => updateAward(index, 'issuer', e.target.value)}
                                          placeholder="Company/Organization name"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Date Received
                                        </label>
                                        <Input
                                          type="month"
                                          value={award.date || ''}
                                          onChange={(e) => updateAward(index, 'date', e.target.value)}
                                        />
                                      </div>
                                      <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Description (Optional)
                                        </label>
                                        <Textarea
                                          value={award.description || ''}
                                          onChange={(e) => updateAward(index, 'description', e.target.value)}
                                          placeholder="Brief description of the award and why you received it..."
                                          rows={3}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                  <h3 className="text-lg font-medium mb-2">No awards added yet</h3>
                                  <p className="mb-4">Add your professional awards and achievements</p>
                                  <Button onClick={addAward} variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Award
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );

                    default:
                      return null;
                  }
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {activeTab === 'ats' && (
          <ATSOptimizationPanel
            resumeData={resumeData}
            onSuggestionApplied={(suggestion) => {
              console.log('ATS suggestion applied:', suggestion);
              toast.success('ATS suggestion applied successfully!');
            }}
          />
        )}

        {activeTab === 'keywords' && (
          <KeywordAnalyzer
            resumeData={resumeData}
            onKeywordSuggestion={handleKeywordSuggestion}
          />
        )}

        {activeTab === 'templates' && (
          <TemplateGallery
            onTemplateSelect={(templateId) => {
              setSelectedTemplate(templateId);
              toast.success('Template applied successfully!');
            }}
            selectedTemplate={selectedTemplate}
          />
        )}

        {activeTab === 'ai' && (
          <AIContentSuggestions
            resumeData={resumeData}
            onContentGenerated={handleAIContentGenerated}
          />
        )}
      </div>
    </div>
  );
};

export default EditResume;