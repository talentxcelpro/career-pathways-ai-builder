import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  FileText, 
  Target, 
  Sparkles, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Brain,
  Upload,
  Download,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SmartApplyTemplate {
  id: string;
  template_name: string;
  job_category: string;
  industry: string;
  resume_template: any;
  cover_letter_template: string;
  keywords: string[];
  success_rate: number;
  usage_count: number;
  is_default: boolean;
}

interface JobToApply {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary_range?: string;
  url?: string;
}

export function SmartOneClickApply() {
  const [templates, setTemplates] = useState<SmartApplyTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobData, setJobData] = useState<JobToApply | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [optimizations, setOptimizations] = useState<any>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockTemplates: SmartApplyTemplate[] = [
        {
          id: '1',
          template_name: 'Software Engineer Template',
          job_category: 'Technology',
          industry: 'Software',
          resume_template: {},
          cover_letter_template: 'Dear Hiring Manager,\n\nI am excited to apply for the Software Engineer position...',
          keywords: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
          success_rate: 85.5,
          usage_count: 24,
          is_default: true
        },
        {
          id: '2',
          template_name: 'Data Scientist Template',
          job_category: 'Data Science',
          industry: 'Technology',
          resume_template: {},
          cover_letter_template: 'Dear Hiring Team,\n\nI am writing to express my interest in the Data Scientist role...',
          keywords: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Data Analysis'],
          success_rate: 78.2,
          usage_count: 12,
          is_default: false
        },
        {
          id: '3',
          template_name: 'Product Manager Template',
          job_category: 'Product',
          industry: 'Technology',
          resume_template: {},
          cover_letter_template: 'Dear Product Team,\n\nI am thrilled to apply for the Product Manager position...',
          keywords: ['Product Strategy', 'Agile', 'User Research', 'Analytics', 'Roadmap'],
          success_rate: 72.8,
          usage_count: 18,
          is_default: false
        }
      ];
      
      setTemplates(mockTemplates);
      setSelectedTemplate(mockTemplates.find(t => t.is_default)?.id || '');
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load application templates",
        variant: "destructive",
      });
    }
  };

  const analyzeJobPosting = async () => {
    if (!jobUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a valid job posting URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate AI analysis - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockJobData: JobToApply = {
        id: 'job-1',
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc',
        location: 'San Francisco, CA',
        description: 'We are looking for a Senior Software Engineer to join our growing team...',
        requirements: ['5+ years experience', 'React/Node.js', 'AWS experience', 'Team leadership'],
        salary_range: '$120,000 - $180,000',
        url: jobUrl
      };

      const mockOptimizations = {
        match_score: 87,
        missing_keywords: ['Docker', 'Kubernetes', 'GraphQL'],
        recommended_changes: [
          'Add Docker experience to your skills section',
          'Emphasize team leadership in your summary',
          'Include specific AWS services you\'ve used'
        ],
        ats_score: 92,
        tailored_summary: 'Experienced Senior Software Engineer with 6+ years building scalable web applications using React and Node.js. Led teams of 4-6 developers and deployed applications on AWS infrastructure.',
        cover_letter_suggestions: [
          'Mention specific TechCorp products you admire',
          'Highlight your experience with microservices architecture',
          'Reference the company\'s recent funding round'
        ]
      };

      setJobData(mockJobData);
      setOptimizations(mockOptimizations);
      
      toast({
        title: "Analysis Complete",
        description: `Job analyzed! Match score: ${mockOptimizations.match_score}%`,
      });
    } catch (error) {
      console.error('Error analyzing job:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze job posting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitApplication = async () => {
    if (!jobData || !selectedTemplate) {
      toast({
        title: "Missing Information",
        description: "Please analyze a job posting and select a template first",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create application record
      const { error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          company_name: jobData.company,
          job_title: jobData.title,
          job_url: jobData.url,
          status: 'applied',
          application_method: 'smart_apply',
          ai_match_score: optimizations?.match_score,
          ats_optimized: true,
          cover_letter_content: templates.find(t => t.id === selectedTemplate)?.cover_letter_template
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your optimized application has been submitted successfully.",
      });

      // Reset form
      setJobUrl("");
      setJobData(null);
      setOptimizations(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Smart One-Click Apply
          </h2>
          <p className="text-muted-foreground">
            AI-powered job applications with automatic resume and cover letter optimization
          </p>
        </div>
        
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Manage Templates
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Templates</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{template.template_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.job_category} • {template.industry}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-green-600">
                            {template.success_rate}% success rate
                          </span>
                          <span className="text-muted-foreground">
                            Used {template.usage_count} times
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {template.is_default && (
                          <Badge variant="outline">Default</Badge>
                        )}
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Job Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Job Posting URL</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://company.com/jobs/software-engineer"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  disabled={isAnalyzing}
                />
                <Button 
                  onClick={analyzeJobPosting}
                  disabled={isAnalyzing || !jobUrl.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </div>

            {jobData && (
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
                <div>
                  <h3 className="font-semibold">{jobData.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {jobData.company} • {jobData.location}
                  </p>
                  {jobData.salary_range && (
                    <p className="text-sm font-medium text-green-600">
                      {jobData.salary_range}
                    </p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Key Requirements:</h4>
                  <div className="flex flex-wrap gap-1">
                    {jobData.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Application Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Template</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an application template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{template.template_name}</span>
                        <span className="text-xs text-green-600 ml-2">
                          {template.success_rate}%
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                {templates
                  .filter(t => t.id === selectedTemplate)
                  .map(template => (
                    <div key={template.id}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{template.template_name}</h4>
                        <Badge variant="outline">{template.job_category}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Success Rate: {template.success_rate}% • Used {template.usage_count} times
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-1">Optimized Keywords:</h5>
                        <div className="flex flex-wrap gap-1">
                          {template.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Optimization Results */}
      {optimizations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Optimization Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Match Score */}
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-3xl font-bold mb-2">
                  <span className={getScoreColor(optimizations.match_score)}>
                    {optimizations.match_score}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Job Match Score</p>
                <Badge variant={getScoreBadgeVariant(optimizations.match_score)} className="mt-2">
                  {optimizations.match_score >= 80 ? 'Excellent' : 
                   optimizations.match_score >= 60 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>

              {/* ATS Score */}
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-3xl font-bold mb-2">
                  <span className={getScoreColor(optimizations.ats_score)}>
                    {optimizations.ats_score}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">ATS Compatibility</p>
                <Badge variant={getScoreBadgeVariant(optimizations.ats_score)} className="mt-2">
                  {optimizations.ats_score >= 80 ? 'Optimized' : 
                   optimizations.ats_score >= 60 ? 'Good' : 'Needs Fix'}
                </Badge>
              </div>

              {/* Missing Keywords */}
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-3xl font-bold mb-2">
                  <span className="text-orange-600">
                    {optimizations.missing_keywords.length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Missing Keywords</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {optimizations.missing_keywords.slice(0, 2).map((keyword: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recommendations */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Recommended Changes
                </h4>
                <ul className="space-y-2">
                  {optimizations.recommended_changes.map((change: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {change}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cover Letter Suggestions */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Cover Letter Tips
                </h4>
                <ul className="space-y-2">
                  {optimizations.cover_letter_suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tailored Summary */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">AI-Optimized Summary</h4>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm">{optimizations.tailored_summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          onClick={submitApplication}
          disabled={!jobData || !selectedTemplate || isApplying}
          className="px-8"
        >
          {isApplying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Submit Optimized Application
            </>
          )}
        </Button>
        
        <Button variant="outline" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Download Resume
        </Button>
      </div>
    </div>
  );
}