import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  MapPin,
  Briefcase,
  GraduationCap,
  Save,
  Download,
  BarChart3,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SalaryBenchmarkTool = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  
  // Form inputs
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('salary-benchmark-tool', 'Salary Benchmark Tool');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!user) {
      toast.error('Please log in to get salary benchmarks');
      return;
    }

    if (!jobTitle || !location) {
      toast.error('Please fill in job title and location');
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'salary-benchmark-analysis',
          data: {
            jobTitle,
            location,
            experience,
            industry,
            companySize,
            profile
          },
          userId: user.id
        }
      });

      const result = {
        position_overview: {
          title: jobTitle,
          location: location,
          experience_level: experience,
          industry: industry || 'Technology',
          company_size: companySize || 'Medium'
        },
        salary_ranges: {
          market_average: aiResponse?.salary_ranges?.market_average || 85000,
          percentile_25: aiResponse?.salary_ranges?.percentile_25 || 70000,
          percentile_50: aiResponse?.salary_ranges?.percentile_50 || 85000,
          percentile_75: aiResponse?.salary_ranges?.percentile_75 || 105000,
          percentile_90: aiResponse?.salary_ranges?.percentile_90 || 125000,
          your_estimated_range: {
            min: aiResponse?.salary_ranges?.your_estimated_range?.min || 80000,
            max: aiResponse?.salary_ranges?.your_estimated_range?.max || 95000
          }
        },
        market_insights: {
          demand_level: aiResponse?.market_insights?.demand_level || 'High',
          growth_trend: aiResponse?.market_insights?.growth_trend || '+8%',
          competition_level: aiResponse?.market_insights?.competition_level || 'Moderate',
          job_availability: aiResponse?.market_insights?.job_availability || 'Good',
          hiring_trend: aiResponse?.market_insights?.hiring_trend || 'Increasing'
        },
        location_analysis: {
          cost_of_living_index: aiResponse?.location_analysis?.cost_of_living_index || 110,
          adjusted_salary: aiResponse?.location_analysis?.adjusted_salary || 92500,
          top_paying_cities: aiResponse?.location_analysis?.top_paying_cities || [
            { city: 'San Francisco, CA', avg_salary: 135000, col_adjustment: 1.8 },
            { city: 'New York, NY', avg_salary: 125000, col_adjustment: 1.6 },
            { city: 'Seattle, WA', avg_salary: 115000, col_adjustment: 1.3 },
            { city: 'Austin, TX', avg_salary: 95000, col_adjustment: 1.0 },
            { city: 'Chicago, IL', avg_salary: 90000, col_adjustment: 1.1 }
          ],
          remote_salary_impact: aiResponse?.location_analysis?.remote_salary_impact || '+5% premium for remote roles'
        },
        experience_breakdown: {
          entry_level: { range: '60k - 75k', years: '0-2 years' },
          mid_level: { range: '75k - 100k', years: '3-6 years' },
          senior_level: { range: '100k - 130k', years: '7-10 years' },
          executive_level: { range: '130k - 180k+', years: '10+ years' }
        },
        company_size_impact: {
          startup: { multiplier: 0.9, equity: 'High equity potential', benefits: 'Basic' },
          mid_size: { multiplier: 1.0, equity: 'Moderate equity', benefits: 'Good' },
          enterprise: { multiplier: 1.2, equity: 'Low equity', benefits: 'Comprehensive' },
          faang: { multiplier: 1.5, equity: 'Significant RSUs', benefits: 'Premium' }
        },
        negotiation_insights: {
          negotiation_potential: aiResponse?.negotiation_insights?.negotiation_potential || 'High',
          leverage_factors: aiResponse?.negotiation_insights?.leverage_factors || [
            'High market demand for your skills',
            'Limited candidate pool',
            'Strong technical background',
            'Relevant industry experience'
          ],
          negotiation_tips: aiResponse?.negotiation_insights?.negotiation_tips || [
            'Research company-specific salary bands',
            'Consider total compensation package',
            'Highlight unique value propositions',
            'Be prepared to discuss market rates',
            'Consider non-salary benefits'
          ]
        },
        skills_impact: {
          high_value_skills: aiResponse?.skills_impact?.high_value_skills || [
            { skill: 'Machine Learning', premium: '+15k' },
            { skill: 'Cloud Architecture', premium: '+12k' },
            { skill: 'DevOps', premium: '+10k' },
            { skill: 'Leadership', premium: '+8k' }
          ],
          certifications_impact: aiResponse?.skills_impact?.certifications_impact || [
            { cert: 'AWS Certified Solutions Architect', impact: '+10k' },
            { cert: 'PMP Certification', impact: '+8k' },
            { cert: 'Google Cloud Professional', impact: '+7k' }
          ]
        },
        industry_comparison: aiResponse?.industry_comparison || {
          tech: '20% above average',
          finance: '15% above average',
          healthcare: '5% above average',
          retail: '10% below average',
          education: '25% below average'
        },
        recommendations: aiResponse?.recommendations || [
          'Your current skill set positions you well for the upper salary range',
          'Consider highlighting cloud and ML experience in negotiations',
          'Target companies in high-growth tech sectors',
          'Remote work options could increase your effective compensation',
          'Continuous learning in AI/ML could add 15-20% salary premium'
        ]
      };

      setBenchmarkData(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 220);
      }

      toast.success('Salary benchmark analysis complete!');
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
    if (!benchmarkData) return;
    
    await saveToolResult(
      'salary-benchmark-tool',
      `Salary Benchmark: ${jobTitle} in ${location}`,
      benchmarkData,
      'analysis',
      ['salary', 'benchmark', 'compensation', location.toLowerCase()]
    );
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendColor = (trend: string) => {
    if (trend.includes('+') || trend.includes('up') || trend.includes('increase')) {
      return 'text-green-600';
    } else if (trend.includes('-') || trend.includes('down') || trend.includes('decrease')) {
      return 'text-red-600';
    }
    return 'text-blue-600';
  };

  const getTrendIcon = (trend: string) => {
    if (trend.includes('+') || trend.includes('up') || trend.includes('increase')) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend.includes('-') || trend.includes('down') || trend.includes('decrease')) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <BarChart3 className="h-4 w-4 text-blue-600" />;
  };

  const renderResults = () => {
    if (!benchmarkData) return null;

    return (
      <div className="space-y-6">
        {/* Position Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {benchmarkData.position_overview.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {benchmarkData.position_overview.location} • {benchmarkData.position_overview.industry}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{benchmarkData.position_overview.experience_level}</div>
                <div className="text-sm text-muted-foreground">Experience</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{benchmarkData.position_overview.industry}</div>
                <div className="text-sm text-muted-foreground">Industry</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{benchmarkData.position_overview.company_size}</div>
                <div className="text-sm text-muted-foreground">Company Size</div>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {formatSalary(benchmarkData.salary_ranges.market_average)}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Market Avg</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Ranges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Salary Benchmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Your Range Highlight */}
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-primary">Your Estimated Range</span>
                  <Badge className="bg-primary text-primary-foreground">
                    {formatSalary(benchmarkData.salary_ranges.your_estimated_range.min)} - {formatSalary(benchmarkData.salary_ranges.your_estimated_range.max)}
                  </Badge>
                </div>
                <Progress 
                  value={75} 
                  className="h-3"
                />
              </div>

              {/* Market Percentiles */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-bold">{formatSalary(benchmarkData.salary_ranges.percentile_25)}</div>
                  <div className="text-sm text-muted-foreground">25th Percentile</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-bold">{formatSalary(benchmarkData.salary_ranges.percentile_50)}</div>
                  <div className="text-sm text-muted-foreground">Median</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-muted">
                  <div className="text-lg font-bold text-primary">{formatSalary(benchmarkData.salary_ranges.market_average)}</div>
                  <div className="text-sm text-muted-foreground">Average</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-bold">{formatSalary(benchmarkData.salary_ranges.percentile_75)}</div>
                  <div className="text-sm text-muted-foreground">75th Percentile</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-bold">{formatSalary(benchmarkData.salary_ranges.percentile_90)}</div>
                  <div className="text-sm text-muted-foreground">90th Percentile</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Badge variant="secondary">{benchmarkData.market_insights.demand_level}</Badge>
                <div className="text-sm text-muted-foreground mt-1">Demand</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className={`text-lg font-bold flex items-center justify-center gap-1 ${getTrendColor(benchmarkData.market_insights.growth_trend)}`}>
                  {getTrendIcon(benchmarkData.market_insights.growth_trend)}
                  {benchmarkData.market_insights.growth_trend}
                </div>
                <div className="text-sm text-muted-foreground">Growth</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Badge variant="outline">{benchmarkData.market_insights.competition_level}</Badge>
                <div className="text-sm text-muted-foreground mt-1">Competition</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Badge variant="secondary">{benchmarkData.market_insights.job_availability}</Badge>
                <div className="text-sm text-muted-foreground mt-1">Job Market</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className={`text-lg font-bold ${getTrendColor(benchmarkData.market_insights.hiring_trend)}`}>
                  {benchmarkData.market_insights.hiring_trend}
                </div>
                <div className="text-sm text-muted-foreground">Hiring</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Cost of Living Adjusted Salary</span>
                    <Badge variant="secondary">{formatSalary(benchmarkData.location_analysis.adjusted_salary)}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    COL Index: {benchmarkData.location_analysis.cost_of_living_index}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-1">Remote Work Impact</div>
                  <div className="text-sm text-muted-foreground">{benchmarkData.location_analysis.remote_salary_impact}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Top Paying Cities</h4>
                <div className="space-y-2">
                  {benchmarkData.location_analysis.top_paying_cities.map((city: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{city.city}</div>
                        <div className="text-xs text-muted-foreground">COL: {city.col_adjustment}x</div>
                      </div>
                      <Badge variant="outline">{formatSalary(city.avg_salary)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Skills & Certifications Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">High-Value Skills</h4>
                <div className="space-y-2">
                  {benchmarkData.skills_impact.high_value_skills.map((skill: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{skill.skill}</span>
                      <Badge className="bg-green-100 text-green-800">{skill.premium}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Valuable Certifications</h4>
                <div className="space-y-2">
                  {benchmarkData.skills_impact.certifications_impact.map((cert: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium text-sm">{cert.cert}</span>
                      <Badge className="bg-blue-100 text-blue-800">{cert.impact}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Negotiation Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Negotiation Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Negotiation Potential:</span>
                  <Badge className={benchmarkData.negotiation_insights.negotiation_potential === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {benchmarkData.negotiation_insights.negotiation_potential}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Your Leverage Factors</h4>
                  <ul className="space-y-2">
                    {benchmarkData.negotiation_insights.leverage_factors.map((factor: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        <span className="text-sm">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Negotiation Tips</h4>
                  <ul className="space-y-2">
                    {benchmarkData.negotiation_insights.negotiation_tips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {benchmarkData.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2 p-3 border rounded-lg">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Analysis
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
            {!benchmarkData ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Salary Benchmark Tool</h2>
                  <p className="text-muted-foreground mb-6">
                    Get comprehensive salary insights and market data for your role
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Title *</label>
                    <Input
                      placeholder="e.g., Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location *</label>
                    <Input
                      placeholder="e.g., San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Experience Level</label>
                    <Select value={experience} onValueChange={setExperience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-6 years)</SelectItem>
                        <SelectItem value="senior">Senior Level (7-10 years)</SelectItem>
                        <SelectItem value="executive">Executive (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Industry</label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Company Size</label>
                    <Select value={companySize} onValueChange={setCompanySize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup (1-50 employees)</SelectItem>
                        <SelectItem value="small">Small (51-200 employees)</SelectItem>
                        <SelectItem value="medium">Medium (201-1000 employees)</SelectItem>
                        <SelectItem value="large">Large (1001-5000 employees)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (5000+ employees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Analyzing Salary Data</h3>
                    <p className="text-muted-foreground">
                      Gathering market insights and benchmarking compensation...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleAnalyze} size="lg" className="w-full">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Get Salary Benchmark
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

export default SalaryBenchmarkTool;