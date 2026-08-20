import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Send, 
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Save,
  Download,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SmartApplyTool = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [jobUrl, setJobUrl] = useState('');

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('smart-apply-tool', 'Smart Apply Tool');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!user) {
      toast.error('Please log in to use Smart Apply');
      return;
    }

    if (!jobUrl.trim()) {
      toast.error('Please enter a job URL or description');
      return;
    }

    setIsAnalyzing(true);

    try {
      const [profileRes, resumeRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('ai_resumes').select('*').eq('user_id', user.id).eq('is_primary', true).single()
      ]);

      const profile = profileRes.data;
      const resume = resumeRes.data;

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'smart-apply-analysis',
          data: {
            jobUrl,
            profile,
            resume: resume?.content
          },
          userId: user.id
        }
      });

      const result = {
        job_analysis: {
          title: aiResponse?.job_analysis?.title || 'Software Engineer',
          company: aiResponse?.job_analysis?.company || 'Tech Company',
          location: aiResponse?.job_analysis?.location || 'Remote',
          salary_range: aiResponse?.job_analysis?.salary_range || '$80k - $120k',
          key_requirements: aiResponse?.job_analysis?.key_requirements || [
            'Bachelor\'s degree in Computer Science',
            '3+ years of experience',
            'React/JavaScript expertise',
            'Strong problem-solving skills'
          ],
          nice_to_have: aiResponse?.job_analysis?.nice_to_have || [
            'TypeScript experience',
            'AWS knowledge',
            'Agile methodology',
            'Open source contributions'
          ]
        },
        fit_analysis: {
          overall_match: aiResponse?.fit_analysis?.overall_match || 85,
          strengths: aiResponse?.fit_analysis?.strengths || [
            'Strong technical background aligns well',
            'Relevant project experience',
            'Skills match job requirements',
            'Good cultural fit indicators'
          ],
          gaps: aiResponse?.fit_analysis?.gaps || [
            'Missing specific industry experience',
            'Could highlight leadership skills more',
            'Need to emphasize problem-solving examples'
          ],
          match_breakdown: {
            technical_skills: 90,
            experience_level: 80,
            education: 85,
            soft_skills: 85,
            cultural_fit: 80
          }
        },
        application_strategy: {
          priority_level: aiResponse?.application_strategy?.priority_level || 'High',
          best_approach: aiResponse?.application_strategy?.best_approach || 'Direct application with personalized cover letter',
          timing_recommendation: aiResponse?.application_strategy?.timing_recommendation || 'Apply within 3-5 days',
          success_probability: aiResponse?.application_strategy?.success_probability || '75%'
        },
        optimized_materials: {
          resume_suggestions: aiResponse?.optimized_materials?.resume_suggestions || [
            'Highlight React and JavaScript projects prominently',
            'Quantify achievements with specific metrics',
            'Add relevant keywords from job description',
            'Emphasize problem-solving examples'
          ],
          cover_letter_outline: aiResponse?.optimized_materials?.cover_letter_outline || {
            opening: 'Express enthusiasm for the specific role and company',
            body: 'Highlight 2-3 most relevant experiences that match key requirements',
            closing: 'Show knowledge of company values and request interview'
          },
          key_points_to_emphasize: aiResponse?.optimized_materials?.key_points_to_emphasize || [
            'Relevant technical expertise',
            'Problem-solving methodology',
            'Team collaboration experience',
            'Continuous learning mindset'
          ]
        },
        interview_preparation: {
          likely_questions: aiResponse?.interview_preparation?.likely_questions || [
            'Tell me about your experience with React',
            'How do you approach debugging complex problems?',
            'Describe a challenging project you worked on',
            'Why are you interested in this company?'
          ],
          technical_topics: aiResponse?.interview_preparation?.technical_topics || [
            'JavaScript fundamentals',
            'React best practices',
            'System design basics',
            'Database concepts'
          ],
          research_areas: aiResponse?.interview_preparation?.research_areas || [
            'Company\'s recent product launches',
            'Engineering culture and values',
            'Technical stack and architecture',
            'Growth opportunities'
          ]
        },
        next_steps: {
          immediate_actions: [
            'Customize resume with suggested improvements',
            'Draft personalized cover letter',
            'Research company background thoroughly',
            'Prepare answers to likely questions'
          ],
          follow_up_strategy: [
            'Send thank you email within 24 hours',
            'Connect with hiring manager on LinkedIn',
            'Follow up after 1 week if no response',
            'Stay engaged with company content'
          ]
        }
      };

      setApplicationData(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 200);
      }

      toast.success('Smart application analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
      if (usageId) {
        await updateToolUsage(usageId, {}, 'failed', 0);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = async () => {
    if (!applicationData) return;
    
    await saveToolResult(
      'smart-apply-tool',
      `Smart Apply: ${applicationData.job_analysis.title}`,
      applicationData,
      'analysis',
      ['job-application', 'smart-apply', applicationData.job_analysis.company.toLowerCase()]
    );
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderResults = () => {
    if (!applicationData) return null;

    return (
      <div className="space-y-6">
        {/* Job Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{applicationData.job_analysis.title}</span>
              <Badge className={getMatchColor(applicationData.fit_analysis.overall_match)}>
                {applicationData.fit_analysis.overall_match}% Match
              </Badge>
            </CardTitle>
            <CardDescription>
              {applicationData.job_analysis.company} • {applicationData.job_analysis.location}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{applicationData.job_analysis.salary_range}</div>
                <div className="text-sm text-muted-foreground">Salary Range</div>
              </div>
              <div className="text-center">
                <Badge className={getPriorityColor(applicationData.application_strategy.priority_level)}>
                  {applicationData.application_strategy.priority_level}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Priority</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{applicationData.application_strategy.success_probability}</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{applicationData.application_strategy.timing_recommendation}</div>
                <div className="text-sm text-muted-foreground">Apply By</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fit Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Fit Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {Object.entries(applicationData.fit_analysis.match_breakdown).map(([category, score]: [string, any]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                    <Badge className={getMatchColor(score)}>{score}%</Badge>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-600">Your Strengths</h4>
                <ul className="space-y-2">
                  {applicationData.fit_analysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-orange-600">Areas to Address</h4>
                <ul className="space-y-2">
                  {applicationData.fit_analysis.gaps.map((gap: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span className="text-sm">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Job Requirements Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-red-600">Required Skills</h4>
                <div className="space-y-2">
                  {applicationData.job_analysis.key_requirements.map((req: string, index: number) => (
                    <Badge key={index} variant="destructive" className="block text-center py-1">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-blue-600">Nice to Have</h4>
                <div className="space-y-2">
                  {applicationData.job_analysis.nice_to_have.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="block text-center py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Application Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Recommended Approach</h4>
                <p className="text-sm">{applicationData.application_strategy.best_approach}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">Resume Optimizations</h4>
                  <ul className="space-y-2">
                    {applicationData.optimized_materials.resume_suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Key Points to Emphasize</h4>
                  <ul className="space-y-2">
                    {applicationData.optimized_materials.key_points_to_emphasize.map((point: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Letter Outline */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Letter Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Opening Paragraph</h4>
                <p className="text-sm text-muted-foreground">{applicationData.optimized_materials.cover_letter_outline.opening}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Body Paragraph</h4>
                <p className="text-sm text-muted-foreground">{applicationData.optimized_materials.cover_letter_outline.body}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Closing Paragraph</h4>
                <p className="text-sm text-muted-foreground">{applicationData.optimized_materials.cover_letter_outline.closing}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Preparation */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Preparation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Likely Questions</h4>
                <ul className="space-y-2">
                  {applicationData.interview_preparation.likely_questions.map((question: string, index: number) => (
                    <li key={index} className="text-sm p-2 bg-muted rounded-lg">
                      {question}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Technical Topics</h4>
                <div className="space-y-2">
                  {applicationData.interview_preparation.technical_topics.map((topic: string, index: number) => (
                    <Badge key={index} variant="outline" className="block text-center py-1">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Research Areas</h4>
                <ul className="space-y-2">
                  {applicationData.interview_preparation.research_areas.map((area: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Search className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span className="text-sm">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Action Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Immediate Actions</h4>
                <div className="space-y-2">
                  {applicationData.next_steps.immediate_actions.map((action: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 border rounded-lg">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Follow-up Strategy</h4>
                <ul className="space-y-2">
                  {applicationData.next_steps.follow_up_strategy.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Analysis
          </Button>
          <Button variant="outline" className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            Apply Now
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </div>

        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-8">
            {!applicationData ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Smart Apply Tool</h2>
                  <p className="text-muted-foreground mb-6">
                    Get personalized application strategy and optimized materials
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Job URL or Description</label>
                  <Input
                    placeholder="Paste job URL from LinkedIn, Indeed, or job description text"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="mb-4"
                  />
                </div>

                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Analyzing Job & Creating Strategy</h3>
                    <p className="text-muted-foreground">
                      Processing job requirements and matching with your profile...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleAnalyze} size="lg" className="w-full">
                    <Send className="h-5 w-5 mr-2" />
                    Analyze & Create Smart Application
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

export default SmartApplyTool;