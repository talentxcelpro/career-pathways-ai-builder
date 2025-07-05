import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  ArrowLeft, Download, Wand2, Plus, X, Loader2, FileText, Eye, 
  Sparkles, Target, BookOpen, Award, Briefcase, User, Mail, Phone, 
  MapPin, Globe, Save, Settings, Palette, Zap, Brain, BarChart3
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ResumeData {
  id: string;
  title: string;
  completion_percentage: number;
  sections: ResumeSection[];
  skills: ResumeSkill[];
  template_id?: string;
}

interface ResumeSection {
  id: string;
  section_type: string;
  display_order: number;
  is_visible: boolean;
  content: any;
}

interface ResumeContentBlock {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  location?: string;
  company?: string;
  position: number;
}

interface ResumeSkill {
  id: string;
  skill_name: string;
  category: string;
  proficiency: string;
  proficiency_score: number;
}

const EnhancedResumeBuilder = () => {
  const navigate = useNavigate();
  const { resumeId } = useParams();
  const { user } = useAuth();
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Load resume data
  useEffect(() => {
    if (resumeId) {
      loadResumeData();
    }
  }, [resumeId]);

  const loadResumeData = async () => {
    try {
      setLoading(true);
      
      // Load resume basic info
      const { data: resumeInfo, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (resumeError) throw resumeError;

      // Load sections with content blocks
      const { data: sections, error: sectionsError } = await supabase
        .from('resume_sections')
        .select('*')
        .eq('resume_id', resumeId)
        .order('display_order');

      if (sectionsError) throw sectionsError;

      // Load skills
      const { data: skills, error: skillsError } = await supabase
        .from('resume_skills')
        .select('*')
        .eq('resume_id', resumeId);

      if (skillsError) throw skillsError;

      setResumeData({
        ...resumeInfo,
        sections: sections || [],
        skills: skills || []
      });
    } catch (error) {
      console.error('Error loading resume:', error);
      toast.error('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async () => {
    if (!resumeData) return;
    
    setSaving(true);
    try {
      // Update resume completion percentage
      await supabase.rpc('calculate_resume_completion_enhanced', {
        resume_uuid: resumeData.id
      });
      
      toast.success('Resume saved successfully');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const generateAISuggestions = async (sectionType: string) => {
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-enhanced', {
        body: {
          action: 'generate_suggestions',
          section_type: sectionType,
          user_id: user?.id,
          current_content: resumeData?.sections.find(s => s.section_type === sectionType)?.content
        }
      });

      if (error) throw error;
      setAiSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      toast.error('Failed to generate AI suggestions');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const addSection = async (sectionType: string, label: string) => {
    if (!resumeData) return;

    try {
      const { data, error } = await supabase
        .from('resume_sections')
        .insert({
          resume_id: resumeData.id,
          section_type: sectionType,
          display_order: resumeData.sections.length + 1,
          is_visible: true,
          content: {}
        })
        .select()
        .single();

      if (error) throw error;

      setResumeData(prev => prev ? {
        ...prev,
        sections: [...prev.sections, data]
      } : null);

      toast.success('Section added successfully');
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error('Failed to add section');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your resume...</p>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Resume Not Found</CardTitle>
            <CardDescription>The resume you're looking for doesn't exist or you don't have permission to view it.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/resume')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/resume')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="font-semibold text-lg">{resumeData.title}</h1>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-3 w-3" />
                  <span>{resumeData.completion_percentage}% Complete</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Progress value={resumeData.completion_percentage} className="w-24" />
              
              <Sheet open={showAIPanel} onOpenChange={setShowAIPanel}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Assist
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-80">
                  <SheetHeader>
                    <SheetTitle>AI Writing Assistant</SheetTitle>
                    <SheetDescription>
                      Get smart suggestions to improve your resume content
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <Button 
                      onClick={() => generateAISuggestions(activeSection)} 
                      disabled={isGeneratingAI}
                      className="w-full"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Suggestions
                        </>
                      )}
                    </Button>
                    
                    {aiSuggestions.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {aiSuggestions.map((suggestion, index) => (
                          <Card key={index} className="p-3">
                            <p className="text-sm">{suggestion.text}</p>
                            <Button size="sm" variant="outline" className="mt-2">
                              Use This
                            </Button>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button 
                onClick={saveResume} 
                disabled={saving}
                size="sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeSection} onValueChange={setActiveSection}>
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="personal" className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="experience" className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Work
                </TabsTrigger>
                <TabsTrigger value="education" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex items-center">
                  <Zap className="h-4 w-4 mr-1" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Projects
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Your contact details and professional summary
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input placeholder="john@example.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <Input placeholder="+1 (555) 123-4567" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input placeholder="New York, NY" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Website/Portfolio</label>
                        <Input placeholder="https://johndoe.com" />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Professional Summary</label>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateAISuggestions('summary')}
                        >
                          <Wand2 className="h-3 w-3 mr-1" />
                          AI Write
                        </Button>
                      </div>
                      <Textarea 
                        placeholder="Write a compelling professional summary that highlights your key achievements and career goals..."
                        className="min-h-[120px] resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-primary" />
                          Work Experience
                        </CardTitle>
                        <CardDescription>
                          Your professional work history and achievements
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={() => addSection('experience', 'Work Experience')}
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No work experience added yet</p>
                      <p className="text-sm">Click "Add Experience" to get started</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-primary" />
                      Skills & Expertise
                    </CardTitle>
                    <CardDescription>
                      Showcase your technical and soft skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill) => (
                        <Badge key={skill.id} variant="secondary" className="px-3 py-1">
                          {skill.skill_name}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-2 h-auto p-0 text-xs"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input placeholder="Add a skill (e.g., React, Project Management)" />
                      <Button size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-primary" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>
                    See how your resume looks in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[600px]">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">John Doe</h2>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>john@example.com • +1 (555) 123-4567</p>
                        <p>New York, NY • johndoe.com</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-1 mb-2">Summary</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Professional summary will appear here when you add content...
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-1 mb-2">Experience</h3>
                        <p className="text-sm text-gray-500 italic">
                          No experience added yet
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-1 mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-1">
                          {resumeData.skills.length > 0 ? (
                            resumeData.skills.map((skill) => (
                              <span 
                                key={skill.id}
                                className="px-2 py-1 bg-gray-100 text-xs rounded"
                              >
                                {skill.skill_name}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">No skills added yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedResumeBuilder;