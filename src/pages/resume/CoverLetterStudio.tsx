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
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockGenerated = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With my extensive background in software development and proven track record of delivering high-quality solutions, I am confident I would be a valuable addition to your team.

In my previous role as a Senior Software Engineer, I successfully:
• Led the development of scalable web applications serving over 100,000 users
• Implemented CI/CD pipelines that reduced deployment time by 60%
• Mentored junior developers and contributed to a 25% improvement in team productivity
• Collaborated with cross-functional teams to deliver projects on time and within budget

I am particularly drawn to ${companyName} because of your innovative approach to technology and commitment to excellence. Your recent work on [specific project/initiative mentioned in job description] aligns perfectly with my passion for creating impactful solutions.

I would welcome the opportunity to discuss how my technical expertise and leadership experience can contribute to ${companyName}'s continued success. Thank you for considering my application.

Best regards,
[Your Name]`;

      setGeneratedContent(mockGenerated);
      setEditableContent(mockGenerated);
      toast.success('Cover letter generated successfully!');
    } catch (error) {
      toast.error('Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    toast.success('Cover letter saved to your drafts');
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

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
        {/* Header */}
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Cover Letter Studio
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Create compelling, personalized cover letters that get you noticed. 
              Our AI analyzes job descriptions and crafts targeted content.
            </p>
            
            <div className="flex justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-Powered
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Job-Matched
              </div>
              <div className="flex items-center gap-2">
                <PenTool className="h-4 w-4 text-primary" />
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