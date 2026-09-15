import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  Clock,
  DollarSign,
  Users,
  Building,
  Zap,
  Eye,
  Bookmark,
  ArrowRight,
  Brain,
  Target,
  Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface PredictiveJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  matchScore: number;
  aiInsights: {
    fitReason: string;
    growthPotential: string;
    skillAlignment: number;
    cultureMatch: number;
  };
  trending: boolean;
  applicationDeadline?: string;
  estimatedApplicants: number;
  hiringUrgency: 'high' | 'medium' | 'low';
  companyLogo?: string;
}

interface MarketTrend {
  skill: string;
  demand: number;
  growth: string;
  salaryImpact: string;
  opportunities: number;
}

export const PredictiveJobRecommendations: React.FC = () => {
  const [viewMode, setViewMode] = useState<'recommendations' | 'trends' | 'insights'>('recommendations');

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-predictions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { ...user, profile };
    }
  });

  // Mock predictive job data - in real implementation, this would come from AI analysis
  const predictiveJobs: PredictiveJob[] = [
    {
      id: '1',
      title: 'Senior React Developer',
      company: 'TechCorp India',
      location: 'Bangalore, India',
      salaryRange: '₹12-18 LPA',
      matchScore: 94,
      aiInsights: {
        fitReason: 'Perfect match for React expertise and team leadership experience',
        growthPotential: 'High potential for Tech Lead role within 12 months',
        skillAlignment: 95,
        cultureMatch: 88
      },
      trending: true,
      applicationDeadline: '2024-08-15',
      estimatedApplicants: 45,
      hiringUrgency: 'high'
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Mumbai, India',
      salaryRange: '₹8-14 LPA',
      matchScore: 87,
      aiInsights: {
        fitReason: 'Great fit for startup environment and full-stack skills',
        growthPotential: 'Opportunity to shape technical architecture',
        skillAlignment: 82,
        cultureMatch: 92
      },
      trending: false,
      estimatedApplicants: 23,
      hiringUrgency: 'medium'
    },
    {
      id: '3',
      title: 'Frontend Tech Lead',
      company: 'Enterprise Solutions',
      location: 'Hyderabad, India',
      salaryRange: '₹15-22 LPA',
      matchScore: 81,
      aiInsights: {
        fitReason: 'Leadership potential aligns with role requirements',
        growthPotential: 'Direct path to Engineering Manager role',
        skillAlignment: 78,
        cultureMatch: 85
      },
      trending: true,
      estimatedApplicants: 67,
      hiringUrgency: 'low'
    }
  ];

  const marketTrends: MarketTrend[] = [
    {
      skill: 'React',
      demand: 92,
      growth: '+15%',
      salaryImpact: '+12%',
      opportunities: 1247
    },
    {
      skill: 'TypeScript',
      demand: 88,
      growth: '+22%',
      salaryImpact: '+8%',
      opportunities: 987
    },
    {
      skill: 'Node.js',
      demand: 85,
      growth: '+18%',
      salaryImpact: '+10%',
      opportunities: 856
    },
    {
      skill: 'AWS',
      demand: 90,
      growth: '+25%',
      salaryImpact: '+15%',
      opportunities: 1134
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Job Predictions</h3>
          <p className="text-gray-600 mb-4">
            Login to get AI-powered job recommendations tailored for you
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-900">AI Job Predictions</h2>
              <p className="text-sm text-blue-700">Smart recommendations powered by machine learning</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">94%</div>
              <div className="text-xs text-gray-600">Best Match</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-xs text-gray-600">Hot Jobs</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-xs text-gray-600">Urgent Hiring</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">72h</div>
              <div className="text-xs text-gray-600">Avg Response</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'recommendations' ? 'default' : 'outline'}
          onClick={() => setViewMode('recommendations')}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          Smart Jobs
        </Button>
        <Button
          variant={viewMode === 'trends' ? 'default' : 'outline'}
          onClick={() => setViewMode('trends')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Market Trends
        </Button>
        <Button
          variant={viewMode === 'insights' ? 'default' : 'outline'}
          onClick={() => setViewMode('insights')}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          AI Insights
        </Button>
      </div>

      {/* Smart Job Recommendations */}
      {viewMode === 'recommendations' && (
        <div className="space-y-4">
          {predictiveJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      {job.trending && (
                        <Badge className="bg-red-100 text-red-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      <Badge className={getUrgencyColor(job.hiringUrgency)}>
                        {job.hiringUrgency} urgency
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {job.salaryRange}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        ~{job.estimatedApplicants} applicants
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{job.matchScore}%</div>
                    <div className="text-xs text-gray-500">AI Match</div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Analysis
                  </h4>
                  <p className="text-sm text-blue-800 mb-3">{job.aiInsights.fitReason}</p>
                  <p className="text-sm text-blue-700 mb-3">{job.aiInsights.growthPotential}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Skill Alignment</span>
                        <span>{job.aiInsights.skillAlignment}%</span>
                      </div>
                      <Progress value={job.aiInsights.skillAlignment} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Culture Match</span>
                        <span>{job.aiInsights.cultureMatch}%</span>
                      </div>
                      <Progress value={job.aiInsights.cultureMatch} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link to={`/jobs/${job.id}`} className="flex-1">
                    <Button className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Button variant="outline">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    Quick Apply
                  </Button>
                </div>

                {job.applicationDeadline && (
                  <div className="mt-3 text-center">
                    <div className="text-sm text-orange-600 flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      Application deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Market Trends */}
      {viewMode === 'trends' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              AI Market Intelligence
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Real-time skill demand and salary trends in your field
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {marketTrends.map((trend, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{trend.skill}</h4>
                    <Badge className="bg-green-100 text-green-800">
                      {trend.growth} growth
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{trend.demand}%</div>
                      <div className="text-xs text-gray-600">Market Demand</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{trend.salaryImpact}</div>
                      <div className="text-xs text-gray-600">Salary Impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">{trend.opportunities}</div>
                      <div className="text-xs text-gray-600">Open Positions</div>
                    </div>
                  </div>
                  
                  <Progress value={trend.demand} className="h-3 mb-3" />
                  
                  <Button size="sm" className="w-full">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View {trend.skill} Jobs
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {viewMode === 'insights' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Personalized AI Insights
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Deep analysis of your career trajectory and market positioning
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Career Velocity Analysis</h4>
                <p className="text-sm text-purple-800 mb-3">
                  Your career progression is 23% faster than peers in similar roles. 
                  You're on track for senior positions ahead of schedule.
                </p>
                <Progress value={77} className="h-3" />
                <div className="text-sm text-purple-700 mt-2">Above average trajectory</div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Market Positioning</h4>
                <p className="text-sm text-blue-800 mb-3">
                  You're positioned in the top 15% of candidates for React roles. 
                  Consider expanding to full-stack to access 40% more opportunities.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-lg font-bold text-blue-600">Top 15%</div>
                    <div className="text-xs text-blue-700">React Specialists</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">+40%</div>
                    <div className="text-xs text-blue-700">Full-stack Opportunities</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Optimal Timing</h4>
                <p className="text-sm text-green-800 mb-3">
                  Market conditions are favorable for job switches. Q3 2024 shows 
                  30% higher hiring activity in your skill area.
                </p>
                <Badge className="bg-green-100 text-green-800">
                  <Award className="h-3 w-3 mr-1" />
                  Prime opportunity window
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};