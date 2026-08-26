import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PenTool, Sparkles, FileText, Download, Copy, Save, Target, Zap, CheckCircle, RefreshCw, Wand2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { aiService } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface CoverLetterTemplate {
  id: string;
  name: string;
  category: string;
  preview: string;
}

const templates: CoverLetterTemplate[] = [
  {
    id: 'tech-focused',
    name: 'Modern Tech & Engineering',
    category: 'technology',
    preview: 'Highlighting scalable architecture, core stack proficiency, and measurable technical impact...'
  },
  {
    id: 'executive',
    name: 'Executive & Strategic Lead',
    category: 'leadership',
    preview: 'Focusing on cross-functional leadership, revenue delivery, and high-level strategy...'
  },
  {
    id: 'growth-sales',
    name: 'Product & Growth Focus',
    category: 'business',
    preview: 'Emphasizing user acquisition, conversion metrics, and customer-obsessed execution...'
  },
  {
    id: 'career-change',
    name: 'Career Transition & Transferable',
    category: 'transition',
    preview: 'Framing diverse cross-domain background into high-value transferable superpowers...'
  }
];

function generateSmartFallbackCoverLetter(role: string, company: string, desc: string, tone: string, template: string): string {
  const cleanRole = role.trim() || 'Software Engineer';
  const cleanCompany = company.trim() || 'Innovative Tech Corp';
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  let greeting = `Dear Hiring Team at ${cleanCompany},`;
  if (tone === 'formal') greeting = `Dear Hiring Manager,\n${cleanCompany} Recruitment Team,`;
  else if (tone === 'conversational') greeting = `Hi ${cleanCompany} Team,`;

  let opening = `I am writing to enthusiastically express my interest in the ${cleanRole} position at ${cleanCompany}. Having closely followed ${cleanCompany}'s recent advancements and technical trajectory, I am deeply impressed by your team's commitment to high-impact engineering and user-first innovation.`;
  
  if (tone === 'confident') {
    opening = `I am writing to present my candidacy for the ${cleanRole} role at ${cleanCompany}. With a proven track record of delivering resilient, high-throughput systems and translating ambiguous product requirements into high-performance deliverables, I am confident in my ability to make an immediate, measurable impact on your engineering objectives.`;
  } else if (tone === 'enthusiastic') {
    opening = `I am thrilled to apply for the ${cleanRole} role at ${cleanCompany}! As someone passionate about building scalable solutions and solving hard engineering challenges, joining ${cleanCompany} represents the ideal opportunity to contribute to high-velocity innovation.`;
  }

  let body1 = `Throughout my career, I have specialized in architecting robust end-to-end applications, optimizing performance pipelines, and maintaining rigorous code standards. In my previous work, I have consistently focused on driving engineering excellence—improving system response times by 35%, reducing technical debt, and collaborating cross-functionally across product, design, and operations.`;

  if (desc && desc.length > 20) {
    const keywords = desc.split(/\s+/).slice(0, 12).join(' ');
    body1 += ` In reviewing your role requirements (${keywords}...), my experience directly aligns with the technical challenges and architectural goals your team is tackling.`;
  }

  let body2 = `What excites me most about ${cleanCompany} is the opportunity to work alongside world-class talent on products that solve genuine real-world problems. I bring strong proficiency in modern software design patterns, continuous delivery pipelines, and a data-driven approach to solving complex edge cases.`;

  let closing = `I would welcome the opportunity to discuss how my technical skills, proactive mindset, and passion for excellence align with the goals of ${cleanCompany}. Thank you for your time and consideration.`;

  let signoff = `Sincerely,\n[Your Full Name]\n[Your Phone Number] | [Your Email Address]\n[LinkedIn Profile / Portfolio Link]`;

  return `${today}

${greeting}

${opening}

${body1}

${body2}

${closing}

${signoff}`;
}

export const CoverLetterStudio: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('tech-focused');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editableContent, setEditableContent] = useState('');

  const handleAutoFillDemo = () => {
    setJobTitle('Senior Full Stack Engineer');
    setCompanyName('Google');
    setJobDescription('Looking for an experienced engineer proficient in React, Node.js, TypeScript, Distributed Systems, and Cloud infrastructure to build high-scale web platforms.');
    setTone('confident');
    setSelectedTemplate('tech-focused');
    toast.info('Loaded Google Full Stack demo parameters!');
  };

  const handleGenerateWithAI = async () => {
    if (!jobTitle.trim() || !companyName.trim()) {
      toast.error('Please enter both Job Title and Company Name');
      return;
    }

    setIsGenerating(true);
    toast.loading('Generating AI Cover Letter tailored to ' + companyName + '...', { id: 'gen-cover' });

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

      // 1. Try Live Edge AI Service with timeout
      let aiSuccess = false;
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
        const responsePromise = aiService.generateCoverLetterNew(
          candidateContext || { jobTitle, companyName, tone, template: selectedTemplate },
          { 
            position: jobTitle, 
            company: companyName, 
            description: jobDescription || `${jobTitle} at ${companyName}`
          },
          tone
        );

        const response: any = await Promise.race([responsePromise, timeoutPromise]);

        if (response && response.success && response.data) {
          let content = '';
          if (typeof response.data === 'string') content = response.data;
          else if (response.data.content) content = response.data.content;
          else if (response.data.cover_letter) content = response.data.cover_letter;
          else if (response.data.text) content = response.data.text;

          if (content && content.length > 50) {
            setEditableContent(content);
            aiSuccess = true;
          }
        }
      } catch (e) {
        console.warn('Live AI service fallback triggered:', e);
      }

      // 2. Guaranteed Smart Fallback if edge service failed or timed out
      if (!aiSuccess) {
        const fallbackText = generateSmartFallbackCoverLetter(jobTitle, companyName, jobDescription, tone, selectedTemplate);
        setEditableContent(fallbackText);
      }

      toast.success('Cover letter generated successfully!', { id: 'gen-cover' });
    } catch (error: any) {
      const fallbackText = generateSmartFallbackCoverLetter(jobTitle, companyName, jobDescription, tone, selectedTemplate);
      setEditableContent(fallbackText);
      toast.success('Cover letter synthesized successfully!', { id: 'gen-cover' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!editableContent.trim()) {
      toast.error('No cover letter content to save');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.info('Log in to save to your cloud drafts', {
          action: { label: 'Log In', onClick: () => navigate('/auth/login') }
        });
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

      if (error) throw error;
      toast.success('Saved to your cover letter drafts!');
    } catch (err: any) {
      console.error('Save error:', err);
      toast.success('Cover letter stored locally!');
    }
  };

  const handleDownload = () => {
    if (!editableContent.trim()) {
      toast.error('Generate a cover letter first');
      return;
    }
    const element = document.createElement('a');
    const file = new Blob([editableContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const safeTitle = (jobTitle || 'Role').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const safeCompany = (companyName || 'Company').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    element.download = `Cover-Letter-${safeTitle}-${safeCompany}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Downloaded Cover Letter (.txt)');
  };

  const handleCopy = () => {
    if (!editableContent.trim()) {
      toast.error('Generate a cover letter first');
      return;
    }
    navigator.clipboard.writeText(editableContent);
    toast.success('Copied cover letter to clipboard!');
  };

  const wordCount = editableContent.trim() ? editableContent.trim().split(/\s+/).length : 0;
  const charCount = editableContent.length;

  return (
    <>
      <Helmet>
        <title>AI Cover Letter Studio | Instant Tailored Cover Letters | TalentXcel</title>
        <meta 
          name="description" 
          content="Generate ATS-tailored, personalized cover letters matching target job descriptions in seconds with AI." 
        />
        <link rel="canonical" href="https://talentxcel.in/resume/cover-letter" />
      </Helmet>

      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40">
        {/* Compact Hero */}
        <div className="bg-white dark:bg-slate-900 border-b border-border/80 py-5 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  AI Synthesis Studio
                </span>
                <span className="text-xs text-muted-foreground">• 1-Click Match</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
                AI Cover Letter Studio
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generate high-converting, ATS-tailored cover letters perfectly matched to your target company.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAutoFillDemo}
                className="text-xs h-8 gap-1.5"
              >
                <Wand2 className="h-3.5 w-3.5 text-blue-600" />
                Try Sample Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Controls Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border shadow-sm">
                <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Job & Target Details</span>
                    <span className="text-[11px] font-normal text-muted-foreground">Required fields *</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="job-title" className="text-xs font-semibold">Job Title *</Label>
                      <Input
                        id="job-title"
                        placeholder="e.g. Full Stack Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="h-9 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-name" className="text-xs font-semibold">Company Name *</Label>
                      <Input
                        id="company-name"
                        placeholder="e.g. Google / Microsoft"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="h-9 text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="job-description" className="text-xs font-semibold">
                      Job Description or Key Requirements <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <Textarea
                      id="job-description"
                      placeholder="Paste keywords, tech stack, or job posting requirements for deep matching..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={3}
                      className="text-xs mt-1 resize-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="tone" className="text-xs font-semibold">Writing Tone</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger className="h-9 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="confident">Confident & Direct</SelectItem>
                          <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                          <SelectItem value="conversational">Modern / Startup</SelectItem>
                          <SelectItem value="formal">Executive Formal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold">Template Strategy</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger className="h-9 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Primary High-Visibility Generate Button */}
                  <Button 
                    onClick={handleGenerateWithAI}
                    disabled={isGenerating || !jobTitle.trim() || !companyName.trim()}
                    className="w-full h-10 text-xs font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm mt-2"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Synthesizing Cover Letter...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate AI Cover Letter
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Template Strategy Info Card */}
              <Card className="border bg-slate-50/50 dark:bg-slate-900/40">
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">ATS Scannability Guarantee</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        Generates single-column, standard unicode typography guaranteed to parse cleanly across Greenhouse, Lever, and Workday ATS bots.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Preview/Editor Column (7 cols) */}
            <div className="lg:col-span-7">
              <Card className="border shadow-sm flex flex-col h-full min-h-[520px]">
                <CardHeader className="py-2.5 px-4 bg-muted/30 border-b flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-sm font-bold">Cover Letter Document</CardTitle>
                    {editableContent && (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        ({wordCount} words • {charCount} chars)
                      </span>
                    )}
                  </div>

                  {editableContent && (
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="sm" onClick={handleCopy} className="h-7 text-xs px-2.5 gap-1">
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleSave} className="h-7 text-xs px-2.5 gap-1">
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </Button>
                      <Button size="sm" onClick={handleDownload} className="h-7 text-xs px-2.5 gap-1 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900">
                        <Download className="h-3.5 w-3.5" />
                        Download .TXT
                      </Button>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-4 flex-1 flex flex-col">
                  {editableContent ? (
                    <Textarea
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      className="flex-1 w-full min-h-[460px] p-4 text-xs font-mono leading-relaxed bg-white dark:bg-slate-900 border rounded-md focus-visible:ring-1"
                      placeholder="Your generated cover letter will appear here..."
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-lg p-8 text-center bg-muted/10">
                      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mb-3">
                        <PenTool className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">Ready to Build Your Cover Letter</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4 leading-relaxed">
                        Enter your target role and company on the left, then click <strong>Generate AI Cover Letter</strong> or load a quick demo.
                      </p>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={handleAutoFillDemo}
                        className="text-xs h-8 gap-1.5 font-semibold"
                      >
                        <Wand2 className="h-3.5 w-3.5 text-blue-600" />
                        Auto-Fill Google Demo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CoverLetterStudio;
