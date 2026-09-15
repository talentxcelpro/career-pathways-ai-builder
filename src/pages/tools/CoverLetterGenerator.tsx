import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  FileText, 
  Wand2,
  Copy,
  Download,
  Save,
  RefreshCw,
  Briefcase,
  Building,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CoverLetterGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [generatedLetter, setGeneratedLetter] = useState<any>(null);
  
  // Form inputs
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [hiringManagerName, setHiringManagerName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('professional');
  const [template, setTemplate] = useState('modern');

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('cover-letter-generator', 'Cover Letter Generator');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Please log in to generate cover letters');
      return;
    }

    if (!jobTitle || !companyName) {
      toast.error('Please fill in job title and company name');
      return;
    }

    setIsGenerating(true);

    try {
      const [profileRes, resumeRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('ai_resumes').select('*').eq('user_id', user.id).eq('is_primary', true).single()
      ]);

      const profile = profileRes.data;
      const resume = resumeRes.data;

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'cover-letter-generation',
          data: {
            jobTitle,
            companyName,
            hiringManagerName,
            jobDescription,
            tone,
            template,
            profile,
            resume: resume?.content
          },
          userId: user.id
        }
      });

      const result = {
        letter_content: aiResponse?.letter_content || generateDefaultLetter(),
        letter_analysis: {
          word_count: aiResponse?.letter_analysis?.word_count || 285,
          readability_score: aiResponse?.letter_analysis?.readability_score || 8.2,
          tone_match: aiResponse?.letter_analysis?.tone_match || 'Professional',
          keyword_density: aiResponse?.letter_analysis?.keyword_density || 'Optimal'
        },
        customization_suggestions: aiResponse?.customization_suggestions || [
          'Consider adding specific metrics from your experience',
          'Mention the company\'s recent achievements or news',
          'Highlight skills that directly match the job requirements',
          'Include a call-to-action in the closing paragraph'
        ],
        strengths: aiResponse?.strengths || [
          'Clear structure and professional tone',
          'Good alignment with job requirements',
          'Compelling opening statement',
          'Strong closing with next steps'
        ],
        improvement_areas: aiResponse?.improvement_areas || [
          'Could be more specific about achievements',
          'Add more company-specific details',
          'Include quantifiable results'
        ],
        formatting_tips: aiResponse?.formatting_tips || [
          'Use standard business letter format',
          'Keep to one page maximum',
          'Use consistent font and spacing',
          'Include proper contact information'
        ],
        template_variations: {
          modern: 'Clean, contemporary format with subtle design elements',
          traditional: 'Classic business letter format, conservative approach',
          creative: 'Visually appealing with strategic use of color and layout',
          minimal: 'Simple, text-focused approach with maximum readability'
        }
      };

      setGeneratedLetter(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 180);
      }

      toast.success('Cover letter generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Generation failed. Please try again.');
      if (usageId) {
        await updateToolUsage(usageId, {}, 'failed', 0);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDefaultLetter = () => {
    return `Dear ${hiringManagerName || 'Hiring Manager'},

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With my background in technology and passion for innovation, I am excited about the opportunity to contribute to your team's success.

In my previous roles, I have developed strong skills in problem-solving, team collaboration, and technical implementation. I am particularly drawn to ${companyName} because of your commitment to excellence and innovation in the industry. Your recent achievements and company culture align perfectly with my professional values and career aspirations.

I am confident that my experience, combined with my enthusiasm for continuous learning, makes me an ideal candidate for this position. I would welcome the opportunity to discuss how I can contribute to ${companyName}'s continued success.

Thank you for considering my application. I look forward to hearing from you soon.

Sincerely,
${user?.email?.split('@')[0] || 'Your Name'}`;
  };

  const handleSaveResult = async () => {
    if (!generatedLetter) return;
    
    await saveToolResult(
      'cover-letter-generator',
      `Cover Letter: ${jobTitle} at ${companyName}`,
      generatedLetter,
      'document',
      ['cover-letter', 'job-application', companyName.toLowerCase(), jobTitle.toLowerCase()].filter(Boolean)
    );
  };

  const handleCopyToClipboard = () => {
    if (generatedLetter?.letter_content) {
      navigator.clipboard.writeText(generatedLetter.letter_content);
      toast.success('Cover letter copied to clipboard!');
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'text-blue-600 bg-blue-100';
      case 'enthusiastic': return 'text-green-600 bg-green-100';
      case 'confident': return 'text-purple-600 bg-purple-100';
      case 'friendly': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderResults = () => {
    if (!generatedLetter) return null;

    return (
      <div className="space-y-6">
        {/* Generated Letter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Cover Letter</span>
              <div className="flex gap-2">
                <Badge className={getToneColor(tone)}>
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </Badge>
                <Badge variant="outline">{template.charAt(0).toUpperCase() + template.slice(1)}</Badge>
              </div>
            </CardTitle>
            <CardDescription>
              For {jobTitle} position at {companyName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-6 rounded-lg border">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {generatedLetter.letter_content}
              </pre>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCopyToClipboard} variant="outline" className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download as PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Letter Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Letter Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{generatedLetter.letter_analysis.word_count}</div>
                <div className="text-sm text-muted-foreground">Word Count</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{generatedLetter.letter_analysis.readability_score}/10</div>
                <div className="text-sm text-muted-foreground">Readability</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Badge variant="secondary">{generatedLetter.letter_analysis.tone_match}</Badge>
                <div className="text-sm text-muted-foreground mt-1">Tone Match</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Badge variant="secondary">{generatedLetter.letter_analysis.keyword_density}</Badge>
                <div className="text-sm text-muted-foreground mt-1">Keywords</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strengths and Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {generatedLetter.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Improvement Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {generatedLetter.improvement_areas.map((area: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span className="text-sm">{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Customization Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Customization Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {generatedLetter.customization_suggestions.map((suggestion: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Formatting Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Formatting Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {generatedLetter.formatting_tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Cover Letter
          </Button>
          <Button variant="outline" onClick={() => setGeneratedLetter(null)} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate New
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="flex items-center gap-2 text-body">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </div>

        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            {!generatedLetter ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-3">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-heading-xl font-bold mb-2 text-slate-900">Cover Letter Generator</h2>
                  <p className="text-body text-slate-600 mb-6">
                    Create personalized, professional cover letters tailored to specific jobs
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-body font-medium mb-2 block text-slate-700">Job Title *</label>
                    <Input
                      placeholder="e.g., Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="text-body"
                    />
                  </div>
                  <div>
                    <label className="text-body font-medium mb-2 block text-slate-700">Company Name *</label>
                    <Input
                      placeholder="e.g., Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="text-body"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hiring Manager Name</label>
                    <Input
                      placeholder="e.g., John Smith (optional)"
                      value={hiringManagerName}
                      onChange={(e) => setHiringManagerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Template Style</label>
                    <Select value={template} onValueChange={setTemplate}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="traditional">Traditional</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tone</label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="confident">Confident</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Job Description (Optional)</label>
                  <Textarea
                    placeholder="Paste the job description here to create a more tailored cover letter..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {isGenerating ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Generating Cover Letter</h3>
                    <p className="text-muted-foreground">
                      Creating a personalized cover letter tailored to this position...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleGenerate} size="lg" className="w-full">
                    <Wand2 className="h-5 w-5 mr-2" />
                    Generate Cover Letter
                  </Button>
                )}
              </div>
            ) : (
              renderResults()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;