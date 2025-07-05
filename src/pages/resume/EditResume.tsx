
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Download, Save, Eye, Settings, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ATSOptimizationPanel } from '@/components/resume/ATSOptimizationPanel';
import { TemplateGallery } from '@/components/resume/TemplateGallery';
import { AIContentSuggestions } from '@/components/resume/AIContentSuggestions';
import { ResumePreview } from '@/components/resume/ResumePreview';

interface ValidationError {
  field: string;
  message: string;
}

interface Experience {
  id?: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

interface Education {
  id?: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  honors: string;
  relevantCoursework: string[];
}

interface Project {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate: string;
  url: string;
  github: string;
}

interface Certification {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate: string;
  credentialId: string;
  url: string;
}

interface Award {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    linkedin: string;
    website: string;
  };
  experience: Experience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    tools: string[];
  };
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
}

const EditResume = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showATS, setShowATS] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      linkedin: '',
      website: ''
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      languages: [],
      tools: []
    },
    projects: [],
    certifications: [],
    awards: []
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Load resume data
  useEffect(() => {
    const loadResume = async () => {
      if (!user || !id) {
        navigate('/resume-builder');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ai_resumes')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading resume:', error);
          toast.error('Failed to load resume');
          navigate('/resume-builder');
          return;
        }

        if (!data) {
          toast.error('Resume not found');
          navigate('/resume-builder');
          return;
        }

        if (data.content) {
          setResumeData(data.content as unknown as ResumeData);
        }
        if (data.template_id) {
          setSelectedTemplate(data.template_id);
        }
      } catch (error) {
        console.error('Error loading resume:', error);
        toast.error('Failed to load resume');
        navigate('/resume-builder');
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [id, user, navigate]);

  const validateResume = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!resumeData.personalInfo.fullName.trim()) {
      errors.push({ field: 'fullName', message: 'Full name is required' });
    }
    if (!resumeData.personalInfo.email.trim()) {
      errors.push({ field: 'email', message: 'Email is required' });
    }
    if (!resumeData.personalInfo.phone.trim()) {
      errors.push({ field: 'phone', message: 'Phone is required' });
    }
    
    return errors;
  };

  const saveResume = async () => {
    const errors = validateResume();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_resumes')
        .update({
          content: resumeData as unknown as Json,
          template_id: selectedTemplate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Resume saved successfully!');
      setValidationErrors([]);
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: [],
      technologies: []
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      degree: '',
      school: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      honors: '',
      relevantCoursework: []
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addSkill = (category: keyof ResumeData['skills'], skill: string) => {
    if (!skill.trim()) return;
    
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: [...prev.skills[category], skill.trim()]
      }
    }));
  };

  const removeSkill = (category: keyof ResumeData['skills'], index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter((_, i) => i !== index)
      }
    }));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      url: '',
      github: ''
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === index ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    const newCertification: Certification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
  };

  const updateCertification = (index: number, field: keyof Certification, value: any) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addAward = () => {
    const newAward: Award = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      awards: [...prev.awards, newAward]
    }));
  };

  const updateAward = (index: number, field: keyof Award, value: any) => {
    setResumeData(prev => ({
      ...prev,
      awards: prev.awards.map((award, i) => 
        i === index ? { ...award, [field]: value } : award
      )
    }));
  };

  const removeAward = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index)
    }));
  };

  const addArrayItem = (experienceIndex: number, field: 'achievements' | 'technologies', value: string) => {
    if (!value.trim()) return;
    
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === experienceIndex ? {
          ...exp,
          [field]: [...exp[field], value.trim()]
        } : exp
      )
    }));
  };

  const removeArrayItem = (experienceIndex: number, field: 'achievements' | 'technologies', itemIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === experienceIndex ? {
          ...exp,
          [field]: exp[field].filter((_, idx) => idx !== itemIndex)
        } : exp
      )
    }));
  };

  const addEducationArrayItem = (educationIndex: number, field: 'relevantCoursework', value: string) => {
    if (!value.trim()) return;
    
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === educationIndex ? {
          ...edu,
          [field]: [...edu[field], value.trim()]
        } : edu
      )
    }));
  };

  const removeEducationArrayItem = (educationIndex: number, field: 'relevantCoursework', itemIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === educationIndex ? {
          ...edu,
          [field]: edu[field].filter((_, idx) => idx !== itemIndex)
        } : edu
      )
    }));
  };

  const addProjectArrayItem = (projectIndex: number, field: 'technologies', value: string) => {
    if (!value.trim()) return;
    
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === projectIndex ? {
          ...proj,
          [field]: [...proj[field], value.trim()]
        } : proj
      )
    }));
  };

  const removeProjectArrayItem = (projectIndex: number, field: 'technologies', itemIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === projectIndex ? {
          ...proj,
          [field]: proj[field].filter((_, idx) => idx !== itemIndex)
        } : proj
      )
    }));
  };

  const getFieldError = (fieldName: string): string | null => {
    const error = validationErrors.find(err => err.field === fieldName);
    return error ? error.message : null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading resume...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Resume</h1>
          <p className="text-gray-600">Customize your resume to perfection</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAI(!showAI)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI Suggestions
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowATS(!showATS)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            ATS Optimization
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowTemplates(!showTemplates)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Templates
          </Button>
          <Button onClick={saveResume} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Resume'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <p className="text-sm text-gray-600">Your basic contact and professional information</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    placeholder="John Doe"
                    className={getFieldError('fullName') ? 'border-red-500' : ''}
                  />
                  {getFieldError('fullName') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('fullName')}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Professional Title</label>
                  <Input
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    placeholder="john@example.com"
                    className={getFieldError('email') ? 'border-red-500' : ''}
                  />
                  {getFieldError('email') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('email')}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={getFieldError('phone') ? 'border-red-500' : ''}
                  />
                  {getFieldError('phone') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('phone')}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    value={resumeData.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn</label>
                  <Input
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <Input
                    value={resumeData.personalInfo.website}
                    onChange={(e) => updatePersonalInfo('website', e.target.value)}
                    placeholder="johndoe.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Work Experience
                <Button onClick={addExperience} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Experience
                </Button>
              </CardTitle>
              <p className="text-sm text-gray-600">Your professional work history</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.experience.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No work experience added yet</p>
                  <Button onClick={addExperience} variant="outline" className="mt-2">
                    Add Your First Job
                  </Button>
                </div>
              ) : (
                resumeData.experience.map((exp, index) => (
                  <div key={exp.id || index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      <Button
                        onClick={() => removeExperience(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Job Title</label>
                        <Input
                          value={exp.title}
                          onChange={(e) => updateExperience(index, 'title', e.target.value)}
                          placeholder="Software Engineer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Company</label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder="Tech Corp"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <Input
                          value={exp.location}
                          onChange={(e) => updateExperience(index, 'location', e.target.value)}
                          placeholder="San Francisco, CA"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium mb-2">Start Date</label>
                          <Input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">End Date</label>
                          <Input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                            placeholder="Leave empty if current"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Job Description</label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="Describe your role and responsibilities..."
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Key Achievements</label>
                      <div className="space-y-2">
                        {exp.achievements.map((achievement, achievementIndex) => (
                          <div key={achievementIndex} className="flex gap-2">
                            <Input
                              value={achievement}
                              onChange={(e) => {
                                const newAchievements = [...exp.achievements];
                                newAchievements[achievementIndex] = e.target.value;
                                updateExperience(index, 'achievements', newAchievements);
                              }}
                              placeholder="Increased team productivity by 30%"
                            />
                            <Button
                              onClick={() => removeArrayItem(index, 'achievements', achievementIndex)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a new achievement..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                addArrayItem(index, 'achievements', target.value);
                                target.value = '';
                              }
                            }}
                          />
                          <Button
                            onClick={() => {
                              const input = document.querySelector(`input[placeholder="Add a new achievement..."]`) as HTMLInputElement;
                              if (input && input.value.trim()) {
                                addArrayItem(index, 'achievements', input.value);
                                input.value = '';
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Technologies Used</label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech, techIndex) => (
                            <Badge
                              key={techIndex}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeArrayItem(index, 'technologies', techIndex)}
                            >
                              {tech} ×
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add technology (React, Node.js, etc.)"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                addArrayItem(index, 'technologies', target.value);
                                target.value = '';
                              }
                            }}
                          />
                          <Button
                            onClick={() => {
                              const input = document.querySelector(`input[placeholder="Add technology (React, Node.js, etc.)"]`) as HTMLInputElement;
                              if (input && input.value.trim()) {
                                addArrayItem(index, 'technologies', input.value);
                                input.value = '';
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Education
                <Button onClick={addEducation} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Education
                </Button>
              </CardTitle>
              <p className="text-sm text-gray-600">Your educational background</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.education.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No education added yet</p>
                  <Button onClick={addEducation} variant="outline" className="mt-2">
                    Add Your First Education
                  </Button>
                </div>
              ) : (
                resumeData.education.map((edu, index) => (
                  <div key={edu.id || index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Education {index + 1}</h4>
                      <Button
                        onClick={() => removeEducation(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Degree</label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="Bachelor of Science in Computer Science"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">School/University</label>
                        <Input
                          value={edu.school}
                          onChange={(e) => updateEducation(index, 'school', e.target.value)}
                          placeholder="Stanford University"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <Input
                          value={edu.location}
                          onChange={(e) => updateEducation(index, 'location', e.target.value)}
                          placeholder="Stanford, CA"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium mb-2">Start Date</label>
                          <Input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Graduation Date</label>
                          <Input
                            type="month"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">GPA (Optional)</label>
                        <Input
                          value={edu.gpa}
                          onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                          placeholder="3.8/4.0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Honors/Awards</label>
                        <Input
                          value={edu.honors}
                          onChange={(e) => updateEducation(index, 'honors', e.target.value)}
                          placeholder="Magna Cum Laude, Dean's List"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Relevant Coursework</label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {edu.relevantCoursework.map((course, courseIndex) => (
                            <Badge
                              key={courseIndex}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeEducationArrayItem(index, 'relevantCoursework', courseIndex)}
                            >
                              {course} ×
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add relevant course..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                addEducationArrayItem(index, 'relevantCoursework', target.value);
                                target.value = '';
                              }
                            }}
                          />
                          <Button
                            onClick={() => {
                              const input = document.querySelector(`input[placeholder="Add relevant course..."]`) as HTMLInputElement;
                              if (input && input.value.trim()) {
                                addEducationArrayItem(index, 'relevantCoursework', input.value);
                                input.value = '';
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <p className="text-sm text-gray-600">Your technical and professional skills</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Technical Skills */}
              <div>
                <label className="block text-sm font-medium mb-2">Technical Skills</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.technical.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => removeSkill('technical', index)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add technical skill (React, Python, etc.)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          addSkill('technical', target.value);
                          target.value = '';
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.querySelector(`input[placeholder="Add technical skill (React, Python, etc.)"]`) as HTMLInputElement;
                        if (input && input.value.trim()) {
                          addSkill('technical', input.value);
                          input.value = '';
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Soft Skills */}
              <div>
                <label className="block text-sm font-medium mb-2">Soft Skills</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.soft.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeSkill('soft', index)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add soft skill (Leadership, Communication, etc.)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          addSkill('soft', target.value);
                          target.value = '';
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.querySelector(`input[placeholder="Add soft skill (Leadership, Communication, etc.)"]`) as HTMLInputElement;
                        if (input && input.value.trim()) {
                          addSkill('soft', input.value);
                          input.value = '';
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium mb-2">Languages</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.languages.map((language, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => removeSkill('languages', index)}
                      >
                        {language} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add language (English - Native, Spanish - Fluent, etc.)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          addSkill('languages', target.value);
                          target.value = '';
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.querySelector(`input[placeholder="Add language (English - Native, Spanish - Fluent, etc.)"]`) as HTMLInputElement;
                        if (input && input.value.trim()) {
                          addSkill('languages', input.value);
                          input.value = '';
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tools */}
              <div>
                <label className="block text-sm font-medium mb-2">Tools & Software</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.tools.map((tool, index) => (
                      <Badge
                        key={index}
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => removeSkill('tools', index)}
                      >
                        {tool} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tool (VS Code, Docker, etc.)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          addSkill('tools', target.value);
                          target.value = '';
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.querySelector(`input[placeholder="Add tool (VS Code, Docker, etc.)"]`) as HTMLInputElement;
                        if (input && input.value.trim()) {
                          addSkill('tools', input.value);
                          input.value = '';
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Projects
                <Button onClick={addProject} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              </CardTitle>
              <p className="text-sm text-gray-600">Your personal or professional projects</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No projects added yet</p>
                  <Button onClick={addProject} variant="outline" className="mt-2">
                    Add Your First Project
                  </Button>
                </div>
              ) : (
                resumeData.projects.map((project, index) => (
                  <div key={project.id || index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Project {index + 1}</h4>
                      <Button
                        onClick={() => removeProject(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Project Title</label>
                        <Input
                          value={project.title}
                          onChange={(e) => updateProject(index, 'title', e.target.value)}
                          placeholder="E-commerce Platform"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium mb-2">Start Date</label>
                          <Input
                            type="month"
                            value={project.startDate}
                            onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">End Date</label>
                          <Input
                            type="month"
                            value={project.endDate}
                            onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Project URL</label>
                        <Input
                          value={project.url}
                          onChange={(e) => updateProject(index, 'url', e.target.value)}
                          placeholder="https://project-demo.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">GitHub Repository</label>
                        <Input
                          value={project.github}
                          onChange={(e) => updateProject(index, 'github', e.target.value)}
                          placeholder="https://github.com/username/project"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Project Description</label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                        placeholder="Describe your project, its features, and your role..."
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Technologies Used</label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge
                              key={techIndex}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeProjectArrayItem(index, 'technologies', techIndex)}
                            >
                              {tech} ×
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add technology..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                addProjectArrayItem(index, 'technologies', target.value);
                                target.value = '';
                              }
                            }}
                          />
                          <Button
                            onClick={() => {
                              const input = document.querySelector(`input[placeholder="Add technology..."]`) as HTMLInputElement;
                              if (input && input.value.trim()) {
                                addProjectArrayItem(index, 'technologies', input.value);
                                input.value = '';
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Certifications
                <Button onClick={addCertification} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Certification
                </Button>
              </CardTitle>
              <p className="text-sm text-gray-600">Your professional certifications and licenses</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.certifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No certifications added yet</p>
                  <Button onClick={addCertification} variant="outline" className="mt-2">
                    Add Your First Certification
                  </Button>
                </div>
              ) : (
                resumeData.certifications.map((cert, index) => (
                  <div key={cert.id || index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Certification {index + 1}</h4>
                      <Button
                        onClick={() => removeCertification(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Certification Name</label>
                        <Input
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          placeholder="AWS Certified Developer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Issuing Organization</label>
                        <Input
                          value={cert.issuer}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          placeholder="Amazon Web Services"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Issue Date</label>
                        <Input
                          type="month"
                          value={cert.date}
                          onChange={(e) => updateCertification(index, 'date', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date (Optional)</label>
                        <Input
                          type="month"
                          value={cert.expiryDate}
                          onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Credential ID</label>
                        <Input
                          value={cert.credentialId}
                          onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                          placeholder="ABC123DEF456"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Verification URL</label>
                        <Input
                          value={cert.url}
                          onChange={(e) => updateCertification(index, 'url', e.target.value)}
                          placeholder="https://verify.certification.com"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Awards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Awards & Achievements
                <Button onClick={addAward} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Award
                </Button>
              </CardTitle>
              <p className="text-sm text-gray-600">Your professional awards and recognitions</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.awards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No awards added yet</p>
                  <Button onClick={addAward} variant="outline" className="mt-2">
                    Add Your First Award
                  </Button>
                </div>
              ) : (
                resumeData.awards.map((award, index) => (
                  <div key={award.id || index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Award {index + 1}</h4>
                      <Button
                        onClick={() => removeAward(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Award Name</label>
                        <Input
                          value={award.name}
                          onChange={(e) => updateAward(index, 'name', e.target.value)}
                          placeholder="Employee of the Year"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Awarding Organization</label>
                        <Input
                          value={award.issuer}
                          onChange={(e) => updateAward(index, 'issuer', e.target.value)}
                          placeholder="Tech Corp Inc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Date Received</label>
                        <Input
                          type="month"
                          value={award.date}
                          onChange={(e) => updateAward(index, 'date', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={award.description}
                        onChange={(e) => updateAward(index, 'description', e.target.value)}
                        placeholder="Describe the award and why you received it..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Suggestions */}
          {showAI && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AIContentSuggestions 
                  resumeData={resumeData} 
                  onContentGenerated={(newContent) => setResumeData(newContent as unknown as ResumeData)}
                />
              </CardContent>
            </Card>
          )}

          {/* ATS Optimization */}
          {showATS && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  ATS Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ATSOptimizationPanel resumeData={resumeData} />
              </CardContent>
            </Card>
          )}

          {/* Template Gallery */}
          {showTemplates && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Templates & Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <TemplateGallery
                  resumeData={resumeData}
                  onTemplateSelect={setSelectedTemplate}
                  selectedTemplate={selectedTemplate}
                />
                {/* Live Preview */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Live Preview</h4>
                  <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="transform scale-50 origin-top-left">
                      <ResumePreview 
                        resumeData={resumeData}
                        template={selectedTemplate}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditResume;
