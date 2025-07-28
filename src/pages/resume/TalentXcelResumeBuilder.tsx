import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  Save, 
  Sparkles, 
  Layout, 
  Palette, 
  Type, 
  Plus,
  Trash2,
  GripVertical,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Lightbulb,
  Globe,
  Target,
  BarChart3
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { SectionEditor } from '@/components/resume/SectionEditor';
import { useResumeExport } from '@/hooks/useResumeExport';

interface ResumeSection {
  id: string;
  type: string;
  title: string;
  content: any;
  order: number;
  isVisible: boolean;
}

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template_config: any;
  is_premium: boolean;
}

const TalentXcelResumeBuilder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [currentSection, setCurrentSection] = useState<string>('personal');
  const [resumeTitle, setResumeTitle] = useState<string>('My TalentXcel Resume');
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Export functionality
  const { exportResume } = useResumeExport();

  // Fetch resume templates
  const { data: templates } = useQuery({
    queryKey: ['resume-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resume_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as ResumeTemplate[];
    }
  });

  // Fetch current resume data
  const { data: resumeData, isLoading } = useQuery({
    queryKey: ['ai-resume', id],
    queryFn: async () => {
      if (!id || id === 'new') return null;
      
      const { data, error } = await supabase
        .from('ai_resumes')
        .select(`
          *
        `)
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user && id !== 'new'
  });

  // Save resume mutation
  const saveResumeMutation = useMutation({
    mutationFn: async (resumeData: any) => {
      if (!user) throw new Error('User not authenticated');

      const templateId = selectedTemplate || null; // Use null instead of empty string

      if (id === 'new') {
        // Create new resume using ai_resumes table
        const { data: newResume, error: resumeError } = await supabase
          .from('ai_resumes')
          .insert({
            user_id: user.id,
            title: resumeTitle,
            template_id: templateId,
            content: JSON.stringify({
              sections,
              customization: {}
            }) as any
          })
          .select()
          .single();

        if (resumeError) throw resumeError;
        return newResume;
      } else {
        // Update existing resume
        const { error: resumeError } = await supabase
          .from('ai_resumes')
          .update({
            title: resumeTitle,
            template_id: templateId,
            content: JSON.stringify({
              sections,
              customization: {}
            }) as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (resumeError) throw resumeError;
        return { id };
      }
    },
    onSuccess: (data) => {
      toast.success('Resume saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['ai-resume'] });
      if (id === 'new') {
        navigate(`/resume-builder/enhanced/${data.id}`);
      }
    },
    onError: (error) => {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    }
  });

  // Initialize default sections
  useEffect(() => {
    if (resumeData?.content) {
      try {
        const content = typeof resumeData.content === 'string' 
          ? JSON.parse(resumeData.content) 
          : resumeData.content;
        
        if (content?.sections) {
          setSections(content.sections);
        }
      } catch (e) {
        console.error('Error parsing resume content:', e);
      }
      setResumeTitle(resumeData.title);
      setSelectedTemplate(resumeData.template_id);
    } else if (id === 'new') {
      // Initialize with default sections for new resume
      setSections([
        { id: '1', type: 'personal', title: 'Personal Information', content: {}, order: 1, isVisible: true },
        { id: '2', type: 'summary', title: 'Professional Summary', content: {}, order: 2, isVisible: true },
        { id: '3', type: 'experience', title: 'Work Experience', content: { items: [] }, order: 3, isVisible: true },
        { id: '4', type: 'education', title: 'Education', content: { items: [] }, order: 4, isVisible: true },
        { id: '5', type: 'skills', title: 'Skills', content: { items: [] }, order: 5, isVisible: true }
      ]);
    }
  }, [resumeData, id]);

  const calculateCompletion = () => {
    let completed = 0;
    const total = sections.length;
    
    sections.forEach(section => {
      if (section.type === 'personal' && section.content.fullName) completed++;
      else if (section.type === 'summary' && section.content.text) completed++;
      else if (section.content.items && section.content.items.length > 0) completed++;
    });
    
    return Math.round((completed / total) * 100);
  };

  const handleSectionDrag = (result: any) => {
    if (!result.destination) return;

    const newSections = Array.from(sections);
    const [reorderedSection] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, reorderedSection);

    // Update order
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index + 1
    }));

    setSections(updatedSections);
  };

  const addSection = (type: string) => {
    const newSection: ResumeSection = {
      id: Date.now().toString(),
      type,
      title: getSectionTitle(type),
      content: type === 'experience' || type === 'education' || type === 'skills' ? { items: [] } : {},
      order: sections.length + 1,
      isVisible: true
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSectionContent = (id: string, content: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, content } : s));
  };

  const getSectionTitle = (type: string) => {
    const titles: Record<string, string> = {
      personal: 'Personal Information',
      summary: 'Professional Summary',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Skills',
      projects: 'Projects',
      certifications: 'Certifications',
      awards: 'Awards & Achievements',
      languages: 'Languages',
      interests: 'Interests'
    };
    return titles[type] || type;
  };

  const getSectionIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      personal: <User className="h-4 w-4" />,
      summary: <FileText className="h-4 w-4" />,
      experience: <Briefcase className="h-4 w-4" />,
      education: <GraduationCap className="h-4 w-4" />,
      skills: <Lightbulb className="h-4 w-4" />,
      projects: <Target className="h-4 w-4" />,
      certifications: <Award className="h-4 w-4" />,
      awards: <Award className="h-4 w-4" />,
      languages: <Globe className="h-4 w-4" />,
      interests: <Target className="h-4 w-4" />
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading TalentXcel Resume Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/resume-builder')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">TalentXcel Resume Builder</h1>
                <p className="text-sm text-muted-foreground">
                  Create professional resumes with AI-powered assistance
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Enhanced
              </Badge>
              <Progress value={calculateCompletion()} className="w-24" />
              <span className="text-sm text-muted-foreground">{calculateCompletion()}%</span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              
              <Button
                onClick={() => saveResumeMutation.mutate({})}
                disabled={saveResumeMutation.isPending}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveResumeMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Resume</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => {
                        const resumeContent = { sections, title: resumeTitle };
                        exportResume(resumeContent, {
                          format: 'pdf',
                          template: selectedTemplate || 'default',
                          colorScheme: 'default',
                          fontSize: 'medium',
                          fontFamily: 'sans',
                          showBranding: false,
                          includePhoto: false,
                          pageMargins: 'normal',
                          sectionOrder: sections.map(s => s.type)
                        });
                      }}>
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button variant="outline" onClick={() => {
                        const resumeContent = { sections, title: resumeTitle };
                        exportResume(resumeContent, {
                          format: 'docx',
                          template: selectedTemplate || 'default',
                          colorScheme: 'default',
                          fontSize: 'medium',
                          fontFamily: 'sans',
                          showBranding: false,
                          includePhoto: false,
                          pageMargins: 'normal',
                          sectionOrder: sections.map(s => s.type)
                        });
                      }}>
                        <FileText className="h-4 w-4 mr-2" />
                        Word
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Resume Title */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Resume Title</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Input
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="Enter resume title..."
                />
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Layout className="h-4 w-4 mr-2" />
                  Template
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateSelector(true)}
                  className="w-full"
                >
                  {selectedTemplate ? 
                    templates?.find(t => t.id === selectedTemplate)?.name || 'Select Template' :
                    'Choose Template'
                  }
                </Button>
              </CardContent>
            </Card>

            {/* Sections Management */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Resume Sections</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <DragDropContext onDragEnd={handleSectionDrag}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {sections.map((section, index) => (
                          <Draggable key={section.id} draggableId={section.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                  currentSection === section.type ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                                }`}
                                onClick={() => setCurrentSection(section.type)}
                              >
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                {getSectionIcon(section.type)}
                                <span className="flex-1 text-sm">{section.title}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeSection(section.id);
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                
                <div className="mt-3 pt-3 border-t">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Resume Section</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-2">
                        {['projects', 'certifications', 'awards', 'languages', 'interests'].map(type => (
                          <Button
                            key={type}
                            variant="outline"
                            onClick={() => addSection(type)}
                            className="justify-start"
                          >
                            {getSectionIcon(type)}
                            <span className="ml-2">{getSectionTitle(type)}</span>
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Resume Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-muted rounded">
                    <div className="text-lg font-semibold">0</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="text-lg font-semibold">0</div>
                    <div className="text-xs text-muted-foreground">Downloads</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card className="min-h-[800px]">
              <CardContent className="p-6">
                {previewMode ? (
                  <div className="prose max-w-none">
                    <h1 className="text-center mb-8">Resume Preview</h1>
                    <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto">
                      {sections.filter(s => s.isVisible).map(section => (
                        <div key={section.id} className="mb-6">
                          <h2 className="text-lg font-semibold border-b pb-2 mb-3">{section.title}</h2>
                          <div className="text-gray-700">
                            {/* Preview content will be rendered here */}
                            Preview content for {section.type}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    {currentSection ? (
                      <SectionEditor 
                        section={sections.find(s => s.type === currentSection)}
                        onUpdate={(content) => {
                          const section = sections.find(s => s.type === currentSection);
                          if (section) {
                            updateSectionContent(section.id, content);
                          }
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <h2 className="text-2xl font-semibold mb-4">Edit Your Resume</h2>
                        <p className="text-muted-foreground mb-6">Use the sections panel to build your professional resume</p>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Select a section from the left panel to start editing
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Template Selector Dialog */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose a TalentXcel Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {templates?.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setShowTemplateSelector(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="aspect-[8.5/11] bg-gradient-to-br from-muted to-muted/50 rounded mb-3 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{template.category}</Badge>
                    {template.is_premium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TalentXcelResumeBuilder;