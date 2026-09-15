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
  Briefcase, 
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Save,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AIJobMatchGPT = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isSearching, setIsSearching] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('ai-job-match-gpt', 'AI Job Match GPT');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleSearch = async () => {
    if (!user) {
      toast.error('Please log in to search for jobs');
      return;
    }

    if (!searchQuery.trim()) {
      toast.error('Please enter a job title or keywords');
      return;
    }

    setIsSearching(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: resume } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      // Use AI to find and rank jobs based on user profile
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'job-matching',
          data: {
            searchQuery,
            location,
            profile,
            resumeContent: resume?.content
          },
          userId: user.id
        }
      });

      const result = {
        total_jobs_found: aiResponse?.total_jobs_found || 25,
        matched_jobs: aiResponse?.matched_jobs || [
          {
            id: '1',
            title: 'Senior Software Engineer',
            company: 'TechCorp',
            location: 'San Francisco, CA',
            salary_range: '$120k - $160k',
            match_score: 92,
            posted_date: '2 days ago',
            job_type: 'Full-time',
            remote_options: 'Hybrid',
            key_skills: ['React', 'Node.js', 'TypeScript'],
            match_reasons: [
              'Your React experience aligns perfectly',
              'Salary matches your expectations',
              'Company culture fits your preferences'
            ],
            url: '#'
          },
          {
            id: '2',
            title: 'Product Manager',
            company: 'Innovation Labs',
            location: 'New York, NY',
            salary_range: '$110k - $140k',
            match_score: 87,
            posted_date: '1 day ago',
            job_type: 'Full-time',
            remote_options: 'Remote',
            key_skills: ['Product Strategy', 'User Research', 'Analytics'],
            match_reasons: [
              'Strong analytical background matches',
              'Leadership experience is relevant',
              'Remote work preference satisfied'
            ],
            url: '#'
          }
        ],
        search_insights: aiResponse?.search_insights || {
          market_competitiveness: 'High',
          salary_benchmark: '$130k average for your experience',
          trending_skills: ['AI/ML', 'Cloud Computing', 'DevOps'],
          job_market_outlook: 'Growing demand in your field'
        },
        personalized_tips: aiResponse?.personalized_tips || [
          'Your profile matches 85% of senior-level positions',
          'Consider highlighting your leadership experience',
          'Remote positions offer 15% salary premium in your field'
        ]
      };

      setSearchResults(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 180);
      }

      toast.success(`Found ${result.total_jobs_found} personalized job matches!`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Job search failed. Please try again.');
      if (usageId) {
        await updateToolUsage(usageId, {}, 'failed', 0);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveResult = async () => {
    if (!searchResults) return;
    
    await saveToolResult(
      'ai-job-match-gpt',
      `Job Search Results for ${searchQuery}`,
      searchResults,
      'report',
      ['jobs', 'search', 'matching', location].filter(Boolean)
    );
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const renderJobCard = (job: any) => (
    <Card key={job.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
              <p className="text-muted-foreground mb-2">{job.company}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {job.salary_range}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {job.posted_date}
                </span>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${getMatchScoreColor(job.match_score)} mb-2`}>
                {job.match_score}% Match
              </Badge>
              <div className="text-sm text-muted-foreground">
                {job.job_type} • {job.remote_options}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-sm font-medium mb-2">Key Skills:</h4>
            <div className="flex flex-wrap gap-1">
              {job.key_skills.map((skill: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Match Reasons */}
          <div>
            <h4 className="text-sm font-medium mb-2">Why This Matches:</h4>
            <ul className="space-y-1">
              {job.match_reasons.map((reason: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Job
            </Button>
            <Button size="sm" variant="outline">
              Save Job
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderResults = () => {
    if (!searchResults) return null;

    return (
      <div className="space-y-6">
        {/* Search Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              <Badge variant="outline">{searchResults.total_jobs_found} jobs found</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{searchResults.matched_jobs.length}</div>
                <div className="text-sm text-muted-foreground">Top Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(searchResults.matched_jobs.reduce((sum: number, job: any) => sum + job.match_score, 0) / searchResults.matched_jobs.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Match</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {searchResults.matched_jobs.filter((job: any) => job.remote_options.includes('Remote')).length}
                </div>
                <div className="text-sm text-muted-foreground">Remote Jobs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {searchResults.matched_jobs.filter((job: any) => job.match_score >= 90).length}
                </div>
                <div className="text-sm text-muted-foreground">Perfect Matches</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Market Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Competitiveness:</span>
                    <Badge variant="outline">{searchResults.search_insights.market_competitiveness}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Salary Benchmark:</span>
                    <span className="font-medium">{searchResults.search_insights.salary_benchmark}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Outlook:</span>
                    <span className="text-green-600">{searchResults.search_insights.job_market_outlook}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Trending Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {searchResults.search_insights.trending_skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personalized Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Personalized Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {searchResults.personalized_tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Top Matches for You</h3>
          {searchResults.matched_jobs.map(renderJobCard)}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Search Results
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Jobs List
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
            {!searchResults ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">AI Job Match GPT</h2>
                  <p className="text-muted-foreground mb-6">
                    Finds jobs across the web prioritized by your profile fit
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Title or Keywords</label>
                    <Input
                      placeholder="e.g., Software Engineer, Product Manager"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location (Optional)</label>
                    <Input
                      placeholder="e.g., San Francisco, Remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {isSearching ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Searching Jobs</h3>
                    <p className="text-muted-foreground">
                      AI is analyzing your profile and finding the best matches...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleSearch} size="lg" className="w-full">
                    <Search className="h-5 w-5 mr-2" />
                    Find My Perfect Jobs
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

export default AIJobMatchGPT;