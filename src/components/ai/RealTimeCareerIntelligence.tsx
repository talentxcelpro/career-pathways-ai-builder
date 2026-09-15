import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Users, Calendar, MapPin, Building, Star, Clock,
  TrendingUp, Target, Award, CheckCircle, AlertCircle,
  ExternalLink, MessageSquare, Phone, Mail, Linkedin
} from 'lucide-react';

interface RealTimeMarketData {
  industryGrowth: number;
  demandScore: number;
  salaryTrend: 'up' | 'down' | 'stable';
  averageSalary: string;
  salaryRange: {
    min: number;
    max: number;
    median: number;
  };
  hotSkills: Array<{
    skill: string;
    demand: number;
    salaryBoost: number;
    growthRate: number;
  }>;
  emergingRoles: Array<{
    role: string;
    growth: number;
    salaryRange: string;
    demand: 'high' | 'medium' | 'low';
  }>;
  competitionLevel: 'low' | 'medium' | 'high';
  remoteOpportunities: number;
  topCompanies: Array<{
    name: string;
    openRoles: number;
    avgSalary: number;
    rating: number;
  }>;
  marketInsights: string[];
  careerPaths: Array<{
    title: string;
    timeframe: string;
    probability: number;
    requiredSkills: string[];
    salaryIncrease: number;
  }>;
}

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  skills: string[];
  postedDate: string;
  applicants: number;
  remote: boolean;
  benefits: string[];
  description: string;
  requirements: string[];
}

const RealTimeCareerIntelligence: React.FC = () => {
  const [marketData, setMarketData] = useState<RealTimeMarketData | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('technology');
  const [selectedRole, setSelectedRole] = useState('software engineer');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchRealTimeData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching real-time market data...');
      
      const { data, error } = await supabase.functions.invoke('real-time-market-data', {
        body: {
          industry: selectedIndustry,
          role: selectedRole,
          location: 'United States',
          experience_level: 'mid-level'
        }
      });

      if (error) {
        console.error('Error fetching market data:', error);
        toast.error('Failed to fetch market data');
        return;
      }

      if (data?.success) {
        setMarketData(data.data);
        setLastUpdated(new Date().toLocaleString());
        toast.success('Market data updated successfully');
        
        // Simulate job matching based on market data
        generateJobMatches(data.data);
      } else {
        throw new Error(data?.error || 'Failed to fetch market data');
      }

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to fetch real-time data');
    } finally {
      setLoading(false);
    }
  };

  const generateJobMatches = (data: RealTimeMarketData) => {
    // Generate realistic job matches based on market data
    const matches: JobMatch[] = data.topCompanies.map((company, index) => ({
      id: `job-${index}`,
      title: `${selectedRole} - ${company.name}`,
      company: company.name,
      location: 'San Francisco, CA',
      salary: `$${(company.avgSalary - 10000).toLocaleString()} - $${(company.avgSalary + 20000).toLocaleString()}`,
      matchScore: 85 + Math.floor(Math.random() * 15),
      skills: data.hotSkills.slice(0, 3).map(s => s.skill),
      postedDate: `${Math.floor(Math.random() * 7) + 1} days ago`,
      applicants: Math.floor(Math.random() * 200) + 50,
      remote: Math.random() > 0.3,
      benefits: ['Health Insurance', '401k Match', 'Stock Options', 'Remote Work'],
      description: `Join ${company.name} as a ${selectedRole} and work on cutting-edge technology...`,
      requirements: data.hotSkills.slice(0, 4).map(s => s.skill)
    }));

    setJobMatches(matches);
  };

  useEffect(() => {
    fetchRealTimeData();
  }, [selectedIndustry, selectedRole]);

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && !marketData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing real-time market data...</p>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load market data. Please try again.</p>
        <Button onClick={fetchRealTimeData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-Time Dashboard Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Real-Time Career Intelligence
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Live Data
              </Badge>
              <Button 
                onClick={fetchRealTimeData} 
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? 'Updating...' : 'Refresh'}
              </Button>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">+{marketData.industryGrowth}%</div>
              <div className="text-sm text-muted-foreground">Industry Growth</div>
              <div className="text-xs text-muted-foreground">Year over year</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{marketData.demandScore}/100</div>
              <div className="text-sm text-muted-foreground">Market Demand</div>
              <div className="text-xs text-muted-foreground">Real-time score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">${(marketData.salaryRange.median / 1000).toFixed(0)}K</div>
              <div className="text-sm text-muted-foreground">Median Salary</div>
              <div className="text-xs text-muted-foreground">{marketData.averageSalary}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{marketData.remoteOpportunities}%</div>
              <div className="text-sm text-muted-foreground">Remote Available</div>
              <div className="text-xs text-muted-foreground">Of all positions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              High-Demand Skills (Live Data)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.hotSkills.map((skill, index) => (
                <div key={skill.skill} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-50 text-green-700">
                        +{skill.salaryBoost}% salary
                      </Badge>
                      <Badge variant="secondary">
                        {skill.growthRate}% growth
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={skill.demand} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground">{skill.demand}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emerging Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Emerging Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.emergingRoles.map((role, index) => (
                <div key={role.role} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{role.role}</h4>
                      <p className="text-sm text-muted-foreground">{role.salaryRange}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={getDemandColor(role.demand)}>
                        {role.demand} demand
                      </Badge>
                      <span className="text-sm font-medium text-green-600">
                        +{role.growth}% growth
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Companies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Top Hiring Companies (Real-Time)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketData.topCompanies.map((company, index) => (
              <div key={company.name} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{company.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{company.rating}</span>
                      <span className="text-sm text-muted-foreground">rating</span>
                    </div>
                  </div>
                  <Badge variant="outline">{company.openRoles} open roles</Badge>
                </div>
                <div className="mt-3">
                  <div className="text-lg font-bold text-primary">
                    ${(company.avgSalary / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-muted-foreground">Average salary</div>
                </div>
                <Button size="sm" className="mt-3 w-full">
                  View Open Positions
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Job Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI-Matched Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobMatches.map((job) => (
              <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{job.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{job.company}</span>
                          <MapPin className="h-4 w-4 text-muted-foreground ml-2" />
                          <span className="text-muted-foreground">{job.location}</span>
                          {job.remote && (
                            <Badge variant="secondary" className="ml-2">Remote</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{job.matchScore}%</div>
                        <div className="text-xs text-muted-foreground">Match Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <div className="text-sm font-medium">Salary</div>
                        <div className="text-lg font-semibold">{job.salary}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Required Skills</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {job.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Competition</div>
                        <div className="text-sm text-muted-foreground">
                          {job.applicants} applicants • {job.postedDate}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button size="sm">
                    Apply Now
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Contact Recruiter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {marketData.marketInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-white rounded border border-blue-200">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-blue-800 text-sm">{insight}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-white rounded border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Competition Analysis</h4>
            <div className="flex items-center gap-2">
              <Badge className={getCompetitionColor(marketData.competitionLevel)}>
                {marketData.competitionLevel} competition
              </Badge>
              <span className="text-sm text-blue-700">
                {marketData.competitionLevel === 'high' 
                  ? 'Focus on specialization and unique skills to stand out'
                  : marketData.competitionLevel === 'medium'
                  ? 'Good opportunities for skilled professionals'
                  : 'Excellent time to enter this market'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeCareerIntelligence;