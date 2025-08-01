import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Save, Download, Wand2, Eye, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ResumeSection {
  id: string;
  type: 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications';
  title: string;
  content: any;
  aiEnhanced?: boolean;
}

interface ResumeData {
  id?: string;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    portfolio?: string;
  };
  sections: ResumeSection[];
  templateId: string;
  atsScore?: number;
}

export const EnhancedResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    title: 'My Resume',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: ''
    },
    sections: [],
    templateId: 'modern'
  });
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const addSection = (type: ResumeSection['type']) => {
    const newSection: ResumeSection = {
      id: `${type}_${Date.now()}`,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      content: getDefaultSectionContent(type)
    };
    
    setResumeData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const getDefaultSectionContent = (type: ResumeSection['type']) => {
    switch (type) {
      case 'summary':
        return { text: '' };
      case 'experience':
        return {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          achievements: []
        };
      case 'education':
        return {
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: ''
        };
      case 'skills':
        return {
          technical: [],
          soft: [],
          tools: []
        };
      case 'projects':
        return {
          name: '',
          description: '',
          technologies: [],
          url: '',
          achievements: []
        };
      case 'certifications':
        return {
          name: '',
          issuer: '',
          date: '',
          url: '',
          expires: ''
        };
      default:
        return {};
    }
  };

  const enhanceWithAI = async (sectionId: string) => {
    setIsEnhancing(true);
    try {
      const section = resumeData.sections.find(s => s.id === sectionId);
      if (!section) return;

      const { data, error } = await supabase.functions.invoke('ai-resume-enhancer', {
        body: {
          sectionType: section.type,
          content: section.content,
          personalInfo: resumeData.personalInfo
        }
      });

      if (error) throw error;

      // Update section with AI-enhanced content
      setResumeData(prev => ({
        ...prev,
        sections: prev.sections.map(s => 
          s.id === sectionId 
            ? { ...s, content: data.enhancedContent, aiEnhanced: true }
            : s
        )
      }));

      toast.success('Section enhanced with AI!');
    } catch (error) {
      console.error('AI enhancement error:', error);
      toast.error('Failed to enhance section');
    } finally {
      setIsEnhancing(false);
    }
  };

  const generateATSScore = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-enhancer', {
        body: {
          action: 'calculate_ats_score',
          resumeData
        }
      });

      if (error) throw error;

      setResumeData(prev => ({
        ...prev,
        atsScore: data.atsScore
      }));
    } catch (error) {
      console.error('ATS score error:', error);
    }
  };

  const saveResume = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const resumePayload = {
        user_id: user.id,
        title: resumeData.title,
        content: resumeData as any, // Type assertion for JSON compatibility
        ats_score: resumeData.atsScore || 0,
        template_id: resumeData.templateId
      };

      const { error } = resumeData.id 
        ? await supabase.from('ai_resumes').update(resumePayload).eq('id', resumeData.id)
        : await supabase.from('ai_resumes').insert([resumePayload]);

      if (error) throw error;
      toast.success('Resume saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save resume');
    }
  };

  const exportResume = async (format: 'pdf' | 'docx') => {
    try {
      const { data, error } = await supabase.functions.invoke('resume-export', {
        body: {
          resumeData,
          format,
          templateId: resumeData.templateId
        }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data.file], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.title}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Resume exported as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export resume');
    }
  };

  useEffect(() => {
    if (resumeData.sections.length > 0) {
      generateATSScore();
    }
  }, [resumeData.sections]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Enhanced Resume Builder</h1>
          <p className="text-muted-foreground">Create ATS-optimized resumes with AI assistance</p>
        </div>
        <div className="flex items-center gap-3">
          {resumeData.atsScore && (
            <Badge variant={resumeData.atsScore >= 80 ? "default" : resumeData.atsScore >= 60 ? "secondary" : "destructive"}>
              <Star className="h-4 w-4 mr-1" />
              ATS Score: {resumeData.atsScore}%
            </Badge>
          )}
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={saveResume}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={() => exportResume('pdf')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Resume Builder
                <Input
                  value={resumeData.title}
                  onChange={(e) => setResumeData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-lg font-semibold border-none shadow-none p-0 h-auto"
                  placeholder="Resume Title"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="template">Template</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Full Name"
                      value={resumeData.personalInfo.fullName}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Phone"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Location"
                      value={resumeData.personalInfo.location}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, location: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="LinkedIn Profile"
                      value={resumeData.personalInfo.linkedIn || ''}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, linkedIn: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Portfolio URL"
                      value={resumeData.personalInfo.portfolio || ''}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, portfolio: e.target.value }
                      }))}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sections" className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['summary', 'experience', 'education', 'projects', 'certifications'] as const).map(type => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        onClick={() => addSection(type)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {resumeData.sections.map((section) => (
                      <Card key={section.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              {section.aiEnhanced && (
                                <Badge variant="secondary">
                                  <Wand2 className="h-3 w-3 mr-1" />
                                  AI Enhanced
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => enhanceWithAI(section.id)}
                                disabled={isEnhancing}
                              >
                                <Wand2 className="h-4 w-4 mr-1" />
                                {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Section-specific content editors would go here */}
                          <Textarea
                            placeholder={`Enter ${section.type} details...`}
                            value={JSON.stringify(section.content, null, 2)}
                            onChange={(e) => {
                              try {
                                const content = JSON.parse(e.target.value);
                                setResumeData(prev => ({
                                  ...prev,
                                  sections: prev.sections.map(s => 
                                    s.id === section.id ? { ...s, content } : s
                                  )
                                }));
                              } catch (error) {
                                // Invalid JSON, ignore
                              }
                            }}
                            className="min-h-32"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="skills">
                  <div className="text-center py-8 text-muted-foreground">
                    Skills management interface coming soon...
                  </div>
                </TabsContent>

                <TabsContent value="template">
                  <div className="text-center py-8 text-muted-foreground">
                    Template selection interface coming soon...
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resume Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-lg border min-h-96 text-sm">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">{resumeData.personalInfo.fullName || 'Your Name'}</h2>
                  <p className="text-gray-600">{resumeData.personalInfo.email}</p>
                  <p className="text-gray-600">{resumeData.personalInfo.phone} • {resumeData.personalInfo.location}</p>
                </div>
                
                {resumeData.sections.map((section) => (
                  <div key={section.id} className="mb-4">
                    <h3 className="text-lg font-semibold border-b border-gray-300 mb-2">
                      {section.title}
                    </h3>
                    <div className="text-gray-700">
                      {section.type === 'summary' && section.content.text && (
                        <p>{section.content.text}</p>
                      )}
                      {section.type === 'experience' && (
                        <div>
                          <div className="font-medium">{section.content.position}</div>
                          <div className="text-sm text-gray-600">{section.content.company}</div>
                          <div className="text-xs text-gray-500">
                            {section.content.startDate} - {section.content.current ? 'Present' : section.content.endDate}
                          </div>
                          <p className="mt-1">{section.content.description}</p>
                        </div>
                      )}
                      {/* Add more section type renderers as needed */}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};