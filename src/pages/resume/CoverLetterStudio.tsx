import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { PenTool, Sparkles, FileText, Download, Copy, Save, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { aiService } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';

interface CoverLetterTemplate {
  id: string;
  name: string;
  category: string;
  preview: string;
  isPopular: boolean;
}

const templates: CoverLetterTemplate[] = [
  {
    id: 'professional',
    name: 'Professional Standard',
    category: 'general',
    preview: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the [Position] role at [Company]. With [Years] years of experience in [Field]...',
    isPopular: true
  },
  {
    id: 'tech-focused',
    name: 'Tech Professional',
    category: 'technology',
    preview: 'Dear [Hiring Manager],\n\nAs a passionate software engineer with expertise in [Technologies], I am excited to apply for the [Position] role...',
    isPopular: true
  },
  {
    id: 'creative',
    name: 'Creative Industry',
    category: 'creative',
    preview: 'Hello [Team/Name],\n\nYour recent [Project/Campaign] caught my attention and perfectly aligns with my creative vision...',
    isPopular: false
  },
  {
    id: 'executive',
    name: 'Executive Level',
    category: 'leadership',
    preview: 'Dear [Board/Committee],\n\nWith over [Years] years of leadership experience driving [Results], I am uniquely positioned...',
    isPopular: false
  },
  {
    id: 'career-change',
    name: 'Career Transition',
    category: 'transition',
    preview: 'Dear [Hiring Manager],\n\nWhile my background in [Previous Field] may seem unconventional, the transferable skills I\'ve developed...',
    isPopular: true
  }
];

const CoverLetterStudio = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editableContent, setEditableContent] = useState('');

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  const handleGenerateWithAI = async () => {
    if (!jobTitle || !companyName) {
      toast.error('Please fill in job title and company name');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let candidateContext = null;
      if (user?.id) {
        try {
          candidateContext = await aiService.getUnifiedCandidateContext(user.id);
        } catch (ctxErr) {
          console.warn('Candidate context fetch note:', ctxErr);
        }
      }

      const response = await aiService.generateCoverLetterNew(
        candidateContext || { jobTitle, companyName, tone, template: selectedTemplate },
        { 
          position: jobTitle, 
          company: companyName, 
          description: jobDescription || `${jobTitle} at ${companyName}`
        },
        tone
      );

      if (response && response.success && response.data) {
        let content = '';
        if (typeof response.data === 'string') {
          content = response.data;
        } else if (response.data.content) {
          content = response.data.content;
        } else if (response.data.cover_letter) {
          content = response.data.cover_letter;
        } else if (response.data.text) {
          content = response.data.text;
        } else if (typeof response.data === 'object') {
          content = JSON.stringify(response.data, null, 2);
        }
        setGeneratedContent(content);
        setEditableContent(content);
        toast.success('Cover letter generated successfully!');
      } else {
        const errorMsg = response?.error || 'Failed to generate cover letter';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error generating cover letter:', error);
      toast.error(error?.message || 'Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!editableContent) {
      toast.error('No cover letter content to save');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to save your cover letter');
        return;
      }

      const { error } = await supabase
        .from('ai_cover_letters')
        .insert({
          user_id: user.id,
          title: `${jobTitle || 'Cover Letter'} @ ${companyName || 'Draft'}`,
          job_title: jobTitle || 'Target Role',
          company_name: companyName || 'Target Company',
          tone: tone,
          template_id: selectedTemplate,
          content: editableContent
        });

      if (error) {
        console.error('Save cover letter error:', error);
        toast.error('Failed to save cover letter');
      } else {
        toast.success('Cover letter saved to your drafts');
      }
    } catch (err: any) {
      console.error('Error saving cover letter:', err);
      toast.error('Failed to save cover letter');
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([editableContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${jobTitle}-${companyName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Cover letter downloaded');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
    toast.success('Cover letter copied to clipboard');
  };

  return (
    <>
      <Helmet>
        <title>AI Cover Letter Generator | Personalized Cover Letters | TalentXcel</title>
        <meta 
          name="description" 
          content="Generate personalized cover letters with AI. Industry-specific templates, job description matching, and professional formatting." 
        />
        <link rel="canonical" href="https://talentxcel.in/cover-letter" />
        <meta property="og:title" content="AI Cover Letter Generator - TalentXcel" />
        <meta property="og:description" content="Create compelling cover letters in minutes" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Header */}
        <section className="pt-8 pb-6 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[11px] font-extrabold border border-blue-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Writing Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              AI Cover Letter Studio
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Create compelling, personalized cover letters tailored to target job descriptions with instant ATS synthesis.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <div className="bg-card px-3 py-1 rounded-full border border-border/80 text-[11px] font-semibold text-foreground flex items-center gap-1.5 shadow-sm">
                <Sparkles className="h-3 w-3 text-blue-500" />
                AI-Powered
              </div>
              <div className="bg-card px-3 py-1 rounded-full border border-border/80 text-[11px] font-semibold text-foreground flex items-center gap-1.5 shadow-sm">
                <Target className="h-3 w-3 text-purple-500" />
                Job-Matched
              </div>
              <div className="bg-card px-3 py-1 rounded-full border border-border/80 text-[11px] font-semibold text-foreground flex items-center gap-1.5 shadow-sm">
                <PenTool className="h-3 w-3 text-emerald-500" />
                Fully Editable
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="job-title">Job Title *</Label>
                    <Input
                      id="job-title"
                      placeholder="e.g., Senior Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input
                      id="company-name"
                      placeholder="e.g., Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="job-description">Job Description (Optional)</Label>
                    <Textarea
                      id="job-description"
                      placeholder="Paste the job description here for better AI matching..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tone">Writing Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="confident">Confident</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{template.name}</span>
                        {template.isPopular && (
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.preview}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button 
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !jobTitle || !companyName}
                className="w-full gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>

            {/* Preview/Edit Panel */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Cover Letter Preview</CardTitle>
                    {editableContent && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button size="sm" onClick={handleDownload}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editableContent ? (
                    <Textarea
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      className="min-h-[600px] font-mono text-sm leading-relaxed"
                      placeholder="Your generated cover letter will appear here..."
                    />
                  ) : (
                    <div className="min-h-[600px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                      <div className="text-center space-y-4">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <h3 className="font-semibold mb-2">Ready to Create Your Cover Letter?</h3>
                          <p className="text-muted-foreground max-w-md">
                            Fill in the job details and click "Generate with AI" to create a personalized cover letter
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="bg-primary/5 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Our Cover Letters Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Job-Specific Matching</h3>
                <p className="text-muted-foreground">
                  AI analyzes job descriptions to highlight relevant skills and experience
                </p>
              </div>
              <div className="text-center">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Industry Expertise</h3>
                <p className="text-muted-foreground">
                  Templates crafted by career experts for different industries and roles
                </p>
              </div>
              <div className="text-center">
                <PenTool className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Full Customization</h3>
                <p className="text-muted-foreground">
                  Edit every word to match your voice and personal brand
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CoverLetterStudio;