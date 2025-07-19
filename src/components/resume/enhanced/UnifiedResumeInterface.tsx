
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ResumeHeader } from './ResumeHeader';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Plus, Trash2, User, Briefcase, GraduationCap, Zap, FolderOpen, Award, ArrowLeft } from "lucide-react";

interface UnifiedResumeInterfaceProps {
  mode: 'edit' | 'create';
}

export const UnifiedResumeInterface: React.FC<UnifiedResumeInterfaceProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [resumeData, setResumeData] = useState<any>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    awards: []
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === 'edit');

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadResume();
    }
  }, [mode, id]);

  const loadResume = async () => {
    if (!id || !user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setResumeData(data.content || resumeData);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      toast.error('Failed to load resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ai_resumes')
        .update({
          content: resumeData
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setLastSaved(new Date());
      setHasChanges(false);
      toast.success('Resume saved successfully');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

  const updateResumeData = (section: string, data: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
    setHasChanges(true);
  };

  const handleEnhancementApplied = (enhancedData: any) => {
    setResumeData(enhancedData);
    setHasChanges(true);
    toast.success('AI enhancement applied');
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentRole: false,
      description: '',
      achievements: []
    };
    updateResumeData('experience', [...resumeData.experience, newExperience]);
  };

  const removeExperience = (index: number) => {
    const updated = resumeData.experience.filter((_, i) => i !== index);
    updateResumeData('experience', updated);
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = resumeData.experience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    updateResumeData('experience', updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ResumeHeader
        mode={mode}
        isSaving={isSaving}
        lastSaved={lastSaved}
        hasChanges={hasChanges}
        onSave={handleSave}
        resumeData={resumeData}
        onEnhancementApplied={handleEnhancementApplied}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/resume-builder')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="awards" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Awards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={resumeData.personalInfo.fullName}
                      onChange={(e) => updateResumeData('personalInfo', {
                        ...resumeData.personalInfo,
                        fullName: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => updateResumeData('personalInfo', {
                        ...resumeData.personalInfo,
                        email: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => updateResumeData('personalInfo', {
                        ...resumeData.personalInfo,
                        phone: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={resumeData.personalInfo.location}
                      onChange={(e) => updateResumeData('personalInfo', {
                        ...resumeData.personalInfo,
                        location: e.target.value
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    rows={4}
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => updateResumeData('personalInfo', {
                      ...resumeData.personalInfo,
                      summary: e.target.value
                    })}
                    placeholder="Write a compelling professional summary..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Work Experience</h2>
                <Button onClick={addExperience}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
              
              {resumeData.experience.map((exp, index) => (
                <Card key={exp.id || index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Experience #{index + 1}</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Job Title</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) => updateExperience(index, 'title', e.target.value)}
                          placeholder="e.g., Software Engineer"
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder="e.g., Google"
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          disabled={exp.isCurrentRole}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        rows={3}
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {resumeData.experience.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No work experience added</h3>
                    <p className="text-gray-600 mb-4">Add your professional experience to get started</p>
                    <Button onClick={addExperience}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Experience
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="education">
            <Card>
              <CardContent className="p-8 text-center">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Education section coming soon</h3>
                <p className="text-gray-600">Add your educational background</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Skills section coming soon</h3>
                <p className="text-gray-600">Showcase your technical and soft skills</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardContent className="p-8 text-center">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Projects section coming soon</h3>
                <p className="text-gray-600">Highlight your key projects and achievements</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="awards">
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Awards section coming soon</h3>
                <p className="text-gray-600">Add your certifications and awards</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
