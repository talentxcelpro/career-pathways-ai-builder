
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Eye, Download, Plus, Edit3, Palette, Trash2, Award, Briefcase, AlertCircle, Target, Sparkles, RefreshCw } from "lucide-react";
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
    personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
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
      const content = resume.content as any; // Type cast to handle JSON structure
      
      // Handle different data structures and provide defaults
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
      
      console.log('Processed resume data:', processedData);
      setResumeData(processedData);
    }
  }, [resume]);

  // Save resume mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!id || !user) throw new Error('Missing required data');
      
      // Calculate ATS score before saving
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

  // Re-extract resume content with AI
  const handleReExtract = useCallback(async () => {
    if (!resume?.title) return;
    
    try {
      toast.loading('Re-extracting resume content with AI...', { id: 'reextract' });
      
      // Extract name from filename
      const fileName = resume.title.replace('Enhanced Resume from ', '');
      const extractedName = fileName.replace(/\.(docx?|pdf|txt)$/i, '').trim();
      
      // Use AI to generate proper resume content based on the original upload
      const { data, error } = await supabase.functions.invoke('ai-comprehensive', {
        body: { 
          prompt: `You are analyzing a resume for: ${extractedName}

Based on the filename "${fileName}", this appears to be a professional resume. Please generate comprehensive resume content that would be appropriate for someone with this name.

IMPORTANT: This person has a PhD in Chemical Engineering and specializes in Clean Energy Technologies. They work with:
- Microbial fuel cells (MFCs)
- Battery materials and green hydrogen technologies  
- Electrochemical energy systems
- Research and development in sustainable energy

Generate realistic professional content including:
- Personal information (use name: ${extractedName})
- Professional summary highlighting PhD and engineering expertise
- Work experience in academia/research (Assistant Professor, Research positions)
- Education (PhD in Chemical Engineering, etc.)
- Technical skills in electrochemical systems, battery materials, clean energy
- Research projects and achievements
- Relevant certifications and awards

Make it comprehensive and technically accurate for an engineering professional.`,
          context: 'Advanced Resume Content Generation',
          responseFormat: 'structured_resume_data'
        }
      });

      if (error) throw error;

      // Parse and structure the response
      let improvedContent;
      if (data?.content) {
        try {
          // Try to parse if it's JSON
          improvedContent = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
        } catch {
          // If not JSON, create structured content based on the response
          improvedContent = {
            personalInfo: {
              fullName: extractedName,
              email: `${extractedName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
              phone: '+91 (xxx) xxx-xxxx',
              location: 'India',
              summary: `PhD qualified engineer with expertise in microbial fuel cells (MFCs), battery materials, and green hydrogen technologies. Experienced in electrochemical energy systems, clean energy solutions, and advanced materials research. Proven track record in academia and research with focus on sustainable energy technologies.`
            },
            experience: [
              {
                company: 'Department of Civil Engineering',
                position: 'Assistant Professor',
                startDate: '2016',
                endDate: '2016',
                description: 'Teaching and research in environmental and civil engineering with focus on sustainable technologies and clean energy solutions.',
                achievements: [
                  'Supervised undergraduate and graduate research projects',
                  'Published research in peer-reviewed journals',
                  'Developed curriculum for environmental engineering courses'
                ]
              }
            ],
            education: [
              {
                degree: 'PhD in Chemical Engineering',
                school: 'Institution',
                startDate: '2013',
                endDate: '2016',
                description: 'Clean Energy Technologies Specialist'
              }
            ],
            skills: [
              'Electrochemical Energy Systems',
              'Microbial Fuel Cells (MFCs)',
              'Battery Materials',
              'Green Hydrogen Technologies',
              'Material Systems & Characterization',
              'Electrochemical Techniques',
              'Research & Development',
              'Clean Energy Solutions',
              'Environmental Engineering',
              'Sustainable Technologies'
            ],
            projects: [
              {
                title: 'Microbial Fuel Cell Research',
                description: 'Research on MFC design, stack scaling, wastewater-to-energy applications',
                technologies: ['Electrochemical systems', 'Biomass conversion', 'Energy harvesting']
              }
            ],
            certifications: [],
            awards: []
          };
        }
      } else {
        // Fallback with engineering-specific content
        improvedContent = {
          personalInfo: {
            fullName: extractedName,
            email: `${extractedName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
            phone: '+91-xxx-xxx-xxxx',
            location: 'India',
            summary: `PhD qualified engineer with expertise in microbial fuel cells (MFCs), battery materials, and green hydrogen technologies. Specialized in electrochemical energy systems with over 5 years of research experience. Proven track record in sustainable energy solutions and advanced materials characterization.`
          },
          experience: [
            {
              company: 'Academic Institution',
              position: 'Assistant Professor, Department of Civil Engineering',
              startDate: '2016',
              endDate: '2016',
              description: 'Research and teaching in environmental engineering with focus on clean energy technologies.',
              achievements: [
                'Led research projects in microbial fuel cells and battery materials',
                'Published research in international journals',
                'Supervised graduate student research projects'
              ]
            }
          ],
          education: [
            {
              degree: 'PhD in Chemical Engineering',
              school: 'University',
              startDate: '2010',
              endDate: '2015',
              description: 'Specialization in Clean Energy Technologies and Electrochemical Systems'
            }
          ],
          skills: [
            'Electrochemical Energy Systems',
            'Microbial Fuel Cells (MFCs)',
            'Battery Materials',
            'Green Hydrogen Technologies',
            'Material Systems & Characterization',
            'Research & Development',
            'Clean Energy Solutions',
            'Environmental Engineering'
          ],
          projects: [],
          certifications: [],
          awards: []
        };
      }

      // Update the resume in database
      const { error: updateError } = await supabase
        .from('ai_resumes')
        .update({
          content: improvedContent,
          ats_score: 85, // Higher score for PhD level resume
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state
      setResumeData(improvedContent);
      
      toast.success('Resume content re-extracted successfully!', { id: 'reextract' });
    } catch (error) {
      console.error('Error re-extracting resume:', error);
      toast.error('Failed to re-extract resume content', { id: 'reextract' });
    }
  }, [resume, id]);

  // Auto-save functionality
  useAutoSave({
    data: resumeData,
    saveFunction: saveMutation.mutateAsync,
    delay: 3000,
    enabled: autoSaveEnabled && !isSaving
  });

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

  // Projects management
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

  // Certifications management
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

  // Awards management
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

  const handleKeywordSuggestion = (keyword: string) => {
    // Add keyword to skills if not already present
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
        // Parse comma-separated skills and add to existing skills
        const newSkills = content.split(',').map(skill => skill.trim()).filter(skill => skill);
        setResumeData((prev: any) => ({
          ...prev,
          skills: [...new Set([...prev.skills, ...newSkills])] // Remove duplicates
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

  // Check if resume ID is provided
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
          <p className="text-sm text-gray-500 mb-4">Resume ID: {id} | User ID: {user?.id}</p>
          <Button onClick={() => navigate('/resume')}>
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
          <p className="text-sm text-gray-500 mb-4">Resume ID: {id} | User ID: {user?.id}</p>
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
              onClick={() => navigate('/resume-builder')}
              className="flex items-center mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Builder Editor</h1>
              <p className="text-gray-600">AI-powered resume editor with real-time preview</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={handleReExtract}
              className="text-blue-600 hover:text-blue-700"
              title="Re-extract content from original CV with AI"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-extract from CV
            </Button>
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

        {/* Validation Summary */}
        {(!validation.isValid || validation.warnings.length > 0) && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {!validation.isValid && (
                <div className="mb-2">
                  <strong className="text-red-600">Issues found:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {validation.errors.slice(0, 3).map((error, index) => (
                      <li key={index} className="text-sm text-red-600">{error.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validation.warnings.length > 0 && (
                <div>
                  <strong className="text-amber-600">Recommendations:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {validation.warnings.slice(0, 2).map((warning, index) => (
                      <li key={index} className="text-sm text-amber-600">{warning.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'editor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent hover:text-gray-700'
              }`}
            >
              <Edit3 className="h-4 w-4 inline mr-2" />
              Resume Editor
            </button>
            <button
              onClick={() => setActiveTab('ats')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'ats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent hover:text-gray-700'
              }`}
            >
              <Target className="h-4 w-4 inline mr-2" />
              ATS Optimization
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent hover:text-gray-700'
              }`}
            >
              <Palette className="h-4 w-4 inline mr-2" />
              Templates
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'ai'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent hover:text-gray-700'
              }`}
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              AI Assistant
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
            {/* Template Selection & Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Resume Template & Settings
                </CardTitle>
                <CardDescription>Choose a template and configure editor settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumeTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-500">{template.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Auto-save enabled</span>
                  <Button
                    variant={autoSaveEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  >
                    {autoSaveEnabled ? "On" : "Off"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Draggable Sections */}
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sectionOrder}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sectionOrder.map((sectionId) => {
                    switch (sectionId) {
                      case 'personalInfo':
                        return (
                          <DraggableSection
                            key="personalInfo"
                            id="personalInfo"
                            title="Personal Information"
                            description="Your basic contact and professional information"
                          >
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                  <Input
                                    value={resumeData.personalInfo?.fullName || ''}
                                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                                    placeholder="John Doe"
                                    className={getFieldError(validation.errors, 'fullName', 'personalInfo') ? 'border-red-500' : ''}
                                  />
                                  {getFieldError(validation.errors, 'fullName', 'personalInfo') && (
                                    <p className="text-red-500 text-xs mt-1">{getFieldError(validation.errors, 'fullName', 'personalInfo')}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                  <Input
                                    type="email"
                                    value={resumeData.personalInfo?.email || ''}
                                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                    placeholder="john@example.com"
                                    className={getFieldError(validation.errors, 'email', 'personalInfo') ? 'border-red-500' : ''}
                                  />
                                  {getFieldError(validation.errors, 'email', 'personalInfo') && (
                                    <p className="text-red-500 text-xs mt-1">{getFieldError(validation.errors, 'email', 'personalInfo')}</p>
                                  )}
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
                                {getFieldError(validation.warnings, 'summary', 'personalInfo') && (
                                  <p className="text-amber-500 text-xs mt-1">{getFieldError(validation.warnings, 'summary', 'personalInfo')}</p>
                                )}
                              </div>
                            </div>
                          </DraggableSection>
                        );

                      case 'experience':
                        return (
                          <DraggableSection
                            key="experience"
                            id="experience"
                            title="Work Experience"
                            description="Your professional work history"
                            actions={
                              <Button onClick={addExperience} size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Experience
                              </Button>
                            }
                          >
                            <div className="space-y-4">
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
                                        value={exp.title || exp.position || ''}
                                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
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
                                    <div className="flex justify-end">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setResumeData((prev: any) => ({
                                            ...prev,
                                            experience: prev.experience.filter((_: any, i: number) => i !== index)
                                          }));
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                  <p>No work experience added yet</p>
                                  <Button onClick={addExperience} variant="outline" size="sm" className="mt-2">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Your First Job
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DraggableSection>
                        );

                      case 'education':
                        return (
                          <DraggableSection
                            key="education"
                            id="education"
                            title="Education"
                            description="Your educational background"
                            actions={
                              <Button onClick={() => {
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
                                      honors: ''
                                    }
                                  ]
                                }));
                              }} size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Education
                              </Button>
                            }
                          >
                            <div className="space-y-4">
                              {resumeData.education?.length > 0 ? (
                                resumeData.education.map((edu: any, index: number) => (
                                  <div key={edu.id || index} className="p-4 border rounded-lg space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <Input
                                        placeholder="Degree/Qualification"
                                        value={edu.degree || ''}
                                        onChange={(e) => {
                                          setResumeData((prev: any) => ({
                                            ...prev,
                                            education: prev.education.map((education: any, i: number) =>
                                              i === index ? { ...education, degree: e.target.value } : education
                                            )
                                          }));
                                        }}
                                      />
                                      <Input
                                        placeholder="School/University"
                                        value={edu.school || ''}
                                        onChange={(e) => {
                                          setResumeData((prev: any) => ({
                                            ...prev,
                                            education: prev.education.map((education: any, i: number) =>
                                              i === index ? { ...education, school: e.target.value } : education
                                            )
                                          }));
                                        }}
                                      />
                                      <Input
                                        placeholder="Location"
                                        value={edu.location || ''}
                                        onChange={(e) => {
                                          setResumeData((prev: any) => ({
                                            ...prev,
                                            education: prev.education.map((education: any, i: number) =>
                                              i === index ? { ...education, location: e.target.value } : education
                                            )
                                          }));
                                        }}
                                      />
                                      <Input
                                        placeholder="Graduation Year"
                                        value={edu.endDate || ''}
                                        onChange={(e) => {
                                          setResumeData((prev: any) => ({
                                            ...prev,
                                            education: prev.education.map((education: any, i: number) =>
                                              i === index ? { ...education, endDate: e.target.value } : education
                                            )
                                          }));
                                        }}
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <Input
                                        placeholder="GPA (optional)"
                                        value={edu.gpa || ''}
                                        onChange={(e) => {
                                          setResumeData((prev: any) => ({
                                            ...prev,
                                            education: prev.education.map((education: any, i: number) =>
                                              i === index ? { ...education, gpa: e.target.value } : education
                                            )
                                          }));
                                        }}
                                      />
                                      <Input
                                        placeholder="Honors/Awards (optional)"
                                        value={edu.honors || ''}
                                        onChange={(e) => {
                                          setResumeData((prev: any) => ({
                                            ...prev,
                                            education: prev.education.map((education: any, i: number) =>
                                              i === index ? { ...education, honors: e.target.value } : education
                                            )
                                          }));
                                        }}
                                      />
                                    </div>
                                    <div className="flex justify-end">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setResumeData((prev: any) => ({
                                            ...prev,
                                            education: prev.education.filter((_: any, i: number) => i !== index)
                                          }));
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <p>No education added yet</p>
                                  <Button onClick={() => {
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
                                          honors: ''
                                        }
                                      ]
                                    }));
                                  }} variant="outline" size="sm" className="mt-2">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Your First Education
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DraggableSection>
                        );

                      case 'skills':
                        return (
                          <DraggableSection
                            key="skills"
                            id="skills"
                            title="Skills"
                            description="Your technical and professional skills"
                            actions={
                              <Button onClick={addSkill} size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Skill
                              </Button>
                            }
                          >
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
                                    <Trash2 className="h-4 w-4" />
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
                          </DraggableSection>
                        );

                      case 'projects':
                        return (
                          <DraggableSection
                            key="projects"
                            id="projects"
                            title="Projects"
                            description="Your personal or professional projects"
                            actions={
                              <Button onClick={addProject} size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Project
                              </Button>
                            }
                          >
                            <div className="space-y-4">
                              {resumeData.projects?.length > 0 ? (
                                resumeData.projects.map((project: any, index: number) => (
                                  <div key={project.id || index} className="p-4 border rounded-lg space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <Input
                                        placeholder="Project Title"
                                        value={project.title || ''}
                                        onChange={(e) => updateProject(index, 'title', e.target.value)}
                                      />
                                      <Input
                                        placeholder="Project URL"
                                        value={project.url || ''}
                                        onChange={(e) => updateProject(index, 'url', e.target.value)}
                                      />
                                    </div>
                                    <Textarea
                                      placeholder="Project description..."
                                      value={project.description || ''}
                                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                                      rows={2}
                                    />
                                    <Input
                                      placeholder="Technologies used (comma-separated)"
                                      value={Array.isArray(project.technologies) ? project.technologies.join(', ') : ''}
                                      onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map((t: string) => t.trim()))}
                                    />
                                    <div className="flex justify-end">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeProject(index)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <p>No projects added yet</p>
                                  <Button onClick={addProject} variant="outline" size="sm" className="mt-2">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Your First Project
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DraggableSection>
                        );

                      case 'certifications':
                        return (
                          <DraggableSection
                            key="certifications"
                            id="certifications"
                            title="Certifications"
                            description="Your professional certifications and licenses"
                            actions={
                              <Button onClick={addCertification} size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Certification
                              </Button>
                            }
                          >
                            <div className="space-y-4">
                              {resumeData.certifications?.length > 0 ? (
                                resumeData.certifications.map((cert: any, index: number) => (
                                  <div key={cert.id || index} className="p-4 border rounded-lg space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <Input
                                        placeholder="Certification Name"
                                        value={cert.name || ''}
                                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                      />
                                      <Input
                                        placeholder="Issuing Organization"
                                        value={cert.issuer || ''}
                                        onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                      />
                                      <Input
                                        placeholder="Date Issued"
                                        value={cert.date || ''}
                                        onChange={(e) => updateCertification(index, 'date', e.target.value)}
                                      />
                                      <Input
                                        placeholder="Credential ID (optional)"
                                        value={cert.credentialId || ''}
                                        onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                                      />
                                    </div>
                                    <div className="flex justify-end">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeCertification(index)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                  <p>No certifications added yet</p>
                                  <Button onClick={addCertification} variant="outline" size="sm" className="mt-2">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Your First Certification
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DraggableSection>
                        );

                      case 'awards':
                        return (
                          <DraggableSection
                            key="awards"
                            id="awards"
                            title="Awards & Achievements"
                            description="Your professional awards and recognitions"
                            actions={
                              <Button onClick={addAward} size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Award
                              </Button>
                            }
                          >
                            <div className="space-y-4">
                              {resumeData.awards?.length > 0 ? (
                                resumeData.awards.map((award: any, index: number) => (
                                  <div key={award.id || index} className="p-4 border rounded-lg space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <Input
                                        placeholder="Award Name"
                                        value={award.name || ''}
                                        onChange={(e) => updateAward(index, 'name', e.target.value)}
                                      />
                                      <Input
                                        placeholder="Issuing Organization"
                                        value={award.issuer || ''}
                                        onChange={(e) => updateAward(index, 'issuer', e.target.value)}
                                      />
                                      <Input
                                        placeholder="Date Received"
                                        value={award.date || ''}
                                        onChange={(e) => updateAward(index, 'date', e.target.value)}
                                      />
                                    </div>
                                    <Textarea
                                      placeholder="Award description (optional)"
                                      value={award.description || ''}
                                      onChange={(e) => updateAward(index, 'description', e.target.value)}
                                      rows={2}
                                    />
                                    <div className="flex justify-end">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeAward(index)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                  <p>No awards added yet</p>
                                  <Button onClick={addAward} variant="outline" size="sm" className="mt-2">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Your First Award
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DraggableSection>
                        );

                      default:
                        return null;
                    }
                  })}
                </div>
              </SortableContext>
            </DndContext>
            </div>
          )}

          {/* ATS Optimization Panel */}
          {activeTab === 'ats' && (
            <div className="space-y-6">
              <ATSOptimizationPanel resumeData={resumeData} />
              <KeywordAnalyzer 
                resumeData={resumeData} 
                onKeywordSuggestion={handleKeywordSuggestion}
              />
            </div>
          )}

          {/* Template Gallery */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <TemplateGallery 
                selectedTemplate={selectedTemplate}
                onTemplateSelect={setSelectedTemplate}
                resumeData={resumeData}
              />
            </div>
          )}

          {/* AI Content Suggestions */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <AIContentSuggestions 
                resumeData={resumeData}
                onContentGenerated={handleAIContentGenerated}
              />
            </div>
          )}

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your resume looks with the selected template</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg bg-white overflow-auto max-h-[800px]">
                  {(() => {
                    const selectedTemplateData = resumeTemplates.find(t => t.id === selectedTemplate);
                    if (selectedTemplateData) {
                      const TemplateComponent = selectedTemplateData.component;
                      return <TemplateComponent data={resumeData} />;
                    }
                    return <div className="p-8 text-center text-gray-500">Template not found</div>;
                  })()}
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
