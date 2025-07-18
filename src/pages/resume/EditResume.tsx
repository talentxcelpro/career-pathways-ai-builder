import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, Sparkles, FileText, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Resume {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  ats_score: number;
  created_at: string;
  updated_at: string;
}

interface ResumeSection {
  id: string;
  section: string;
  data: any;
  display_order: number;
}

const EditResume = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [resume, setResume] = useState<Resume | null>(null);
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  useEffect(() => {
    if (id) {
      fetchResumeData();
    }
  }, [id]);

  const fetchResumeData = async () => {
    try {
      // Get resume data
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single();

      if (resumeError) throw resumeError;

      // Get resume sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('resume_sections')
        .select('*')
        .eq('resume_id', id)
        .order('display_order');

      if (sectionsError) throw sectionsError;

      setResume(resumeData);
      setSections(sectionsData || []);
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resume. Please try again.',
        variant: 'destructive',
      });
      navigate('/resume-builder');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!resume) return;

    setSaving(true);
    try {
      // Save resume title
      const { error: resumeError } = await supabase
        .from('resumes')
        .update({ title: resume.title })
        .eq('id', id);

      if (resumeError) throw resumeError;

      // Save sections
      for (const section of sections) {
        const { error: sectionError } = await supabase
          .from('resume_sections')
          .upsert({
            id: section.id,
            resume_id: id,
            section: section.section,
            data: section.data,
            display_order: section.display_order
          });

        if (sectionError) throw sectionError;
      }

      toast({
        title: 'Success',
        description: 'Resume saved successfully!',
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to save resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEnhanceSection = async (sectionType: string) => {
    if (!resume) return;

    setEnhancing(true);
    try {
      const sectionData = sections.find(s => s.section === sectionType)?.data || {};
      
      const { data: enhancedData, error } = await supabase.functions
        .invoke('enhance-resume', {
          body: {
            resumeData: { [sectionType]: sectionData },
            section: sectionType,
            userId: (await supabase.auth.getUser()).data.user?.id
          }
        });

      if (error) throw error;

      if (enhancedData.success) {
        // Update the section with enhanced data
        const updatedSections = sections.map(section => {
          if (section.section === sectionType) {
            return {
              ...section,
              data: enhancedData.enhanced
            };
          }
          return section;
        });

        setSections(updatedSections);
        toast({
          title: 'Success',
          description: `${sectionType} section enhanced successfully!`,
        });
      }
    } catch (error) {
      console.error('Error enhancing section:', error);
      toast({
        title: 'Error',
        description: 'Failed to enhance section. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setEnhancing(false);
    }
  };

  const addSection = (sectionType: string) => {
    const newSection: ResumeSection = {
      id: `temp-${Date.now()}`,
      section: sectionType,
      data: getDefaultSectionData(sectionType),
      display_order: sections.length + 1
    };

    setSections([...sections, newSection]);
  };

  const getDefaultSectionData = (sectionType: string) => {
    switch (sectionType) {
      case 'personal_info':
        return { name: '', email: '', phone: '', location: '', linkedin: '' };
      case 'summary':
        return '';
      case 'experience':
        return [{ title: '', company: '', location: '', startDate: '', endDate: '', achievements: [] }];
      case 'education':
        return [{ degree: '', institution: '', location: '', startDate: '', endDate: '', grade: '' }];
      case 'skills':
        return [];
      case 'projects':
        return [{ name: '', description: '', technologies: [] }];
      case 'certifications':
        return [{ name: '', issuer: '', date: '' }];
      case 'languages':
        return [{ language: '', proficiency: '' }];
      case 'awards':
        return [{ name: '', issuer: '', date: '' }];
      case 'hobbies':
        return [];
      default:
        return {};
    }
  };

  const updateSectionData = (sectionId: string, newData: any) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, data: newData }
        : section
    ));
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Resume Not Found</h1>
          <Button onClick={() => navigate('/resume-builder')}>
            Back to Resume Builder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/resume-builder')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{resume.title}</h1>
            <p className="text-muted-foreground">
              Last updated {format(new Date(resume.updated_at), 'PPP')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">ATS Score: {resume.ats_score}%</Badge>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={() => navigate(`/resume-builder/export/${id}`)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="enhance">AI Enhance</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          {/* Resume Title */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={resume.title}
                onChange={(e) => setResume({ ...resume, title: e.target.value })}
                placeholder="Enter resume title"
              />
            </CardContent>
          </Card>

          {/* Sections */}
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="capitalize">{section.section.replace('_', ' ')}</CardTitle>
                  <CardDescription>
                    Edit your {section.section.replace('_', ' ')} information
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnhanceSection(section.section)}
                    disabled={enhancing}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    {enhancing ? 'Enhancing...' : 'Enhance'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSection(section.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {section.section === 'personal_info' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={section.data.name || ''}
                        onChange={(e) => updateSectionData(section.id, { ...section.data, name: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={section.data.email || ''}
                        onChange={(e) => updateSectionData(section.id, { ...section.data, email: e.target.value })}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={section.data.phone || ''}
                        onChange={(e) => updateSectionData(section.id, { ...section.data, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={section.data.location || ''}
                        onChange={(e) => updateSectionData(section.id, { ...section.data, location: e.target.value })}
                        placeholder="City, State"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>LinkedIn</Label>
                      <Input
                        value={section.data.linkedin || ''}
                        onChange={(e) => updateSectionData(section.id, { ...section.data, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                  </div>
                )}
                {section.section === 'summary' && (
                  <Textarea
                    value={section.data || ''}
                    onChange={(e) => updateSectionData(section.id, e.target.value)}
                    placeholder="Write a compelling professional summary..."
                    rows={4}
                  />
                )}
                {section.section === 'skills' && (
                  <Textarea
                    value={Array.isArray(section.data) ? section.data.join(', ') : ''}
                    onChange={(e) => updateSectionData(section.id, e.target.value.split(', '))}
                    placeholder="JavaScript, React, Node.js, Python..."
                    rows={3}
                  />
                )}
                {/* Add more section types as needed */}
              </CardContent>
            </Card>
          ))}

          {/* Add Section Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {[
                  'personal_info',
                  'summary',
                  'experience',
                  'education',
                  'skills',
                  'projects',
                  'certifications',
                  'languages',
                  'awards',
                  'hobbies'
                ].map(sectionType => (
                  <Button
                    key={sectionType}
                    variant="outline"
                    size="sm"
                    onClick={() => addSection(sectionType)}
                    disabled={sections.some(s => s.section === sectionType)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {sectionType.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Resume Preview</CardTitle>
              <CardDescription>
                Preview how your resume will look when exported
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-8 shadow-sm">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {sections.find(s => s.section === 'personal_info')?.data?.name || 'Your Name'}
                  </h2>
                  <p className="text-muted-foreground">
                    {sections.find(s => s.section === 'personal_info')?.data?.email || 'your.email@example.com'} • 
                    {sections.find(s => s.section === 'personal_info')?.data?.phone || '(555) 123-4567'}
                  </p>
                </div>
                
                {sections.find(s => s.section === 'summary') && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Professional Summary</h3>
                    <p className="text-sm leading-relaxed">
                      {sections.find(s => s.section === 'summary')?.data || 'Your professional summary will appear here...'}
                    </p>
                  </div>
                )}
                
                {sections.find(s => s.section === 'skills') && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {(sections.find(s => s.section === 'skills')?.data || []).map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhance">
          <Card>
            <CardHeader>
              <CardTitle>AI Enhancement</CardTitle>
              <CardDescription>
                Use AI to improve your resume sections with professional suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section) => (
                  <Card key={section.id} className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold capitalize">
                          {section.section.replace('_', ' ')}
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEnhanceSection(section.section)}
                          disabled={enhancing}
                        >
                          <Sparkles className="w-4 h-4 mr-1" />
                          Enhance
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditResume;