import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, DollarSign, Clock, Zap, Heart, Filter } from 'lucide-react';
import { TieredAccessGuard } from '@/components/access/TieredAccessGuard';
import { UsageMeter } from '@/components/ui/usage-meter';

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: { min: number; max: number };
  matchScore: number;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  matchReasons: string[];
  skillGaps: string[];
  cultureFit: number;
  careerGrowth: number;
  workLifeBalance: number;
  remoteOption: boolean;
}

interface MatchingPreferences {
  salaryMin: number;
  preferredLocations: string[];
  remoteWork: boolean;
  industries: string[];
  companySize: string[];
  workCulture: string[];
}

const AdvancedAIJobMatching: React.FC = () => {
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [preferences, setPreferences] = useState<MatchingPreferences>({
    salaryMin: 80000,
    preferredLocations: ['San Francisco', 'Remote'],
    remoteWork: true,
    industries: ['Technology', 'Healthcare'],
    companySize: ['Startup', 'Mid-size'],
    workCulture: ['Innovative', 'Collaborative']
  });

  useEffect(() => {
    performAIMatching();
  }, []);

  const performAIMatching = async () => {
    setIsMatching(true);
    
    // Simulate AI job matching
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockMatches: JobMatch[] = [
      {
        id: '1',
        title: 'Senior AI Engineer',
        company: 'TechFlow AI',
        location: 'San Francisco, CA (Remote)',
        salary: { min: 140000, max: 180000 },
        matchScore: 94,
        description: 'Lead AI initiatives and develop cutting-edge machine learning solutions.',
        requirements: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', '5+ years experience'],
        benefits: ['Equity', 'Health Insurance', 'Flexible Hours', '$5K Learning Budget'],
        postedDate: '2 days ago',
        matchReasons: [
          'Your ML skills perfectly align with requirements',
          'Company culture matches your preferences',
          'Salary exceeds your expectations by 15%'
        ],
        skillGaps: ['Kubernetes deployment experience'],
        cultureFit: 92,
        careerGrowth: 88,
        workLifeBalance: 85,
        remoteOption: true
      },
      {
        id: '2',
        title: 'Machine Learning Product Manager',
        company: 'HealthTech Solutions',
        location: 'Remote',
        salary: { min: 130000, max: 170000 },
        matchScore: 89,
        description: 'Drive product strategy for AI-powered healthcare solutions.',
        requirements: ['Product Management', 'ML Understanding', 'Healthcare Domain', 'Leadership'],
        benefits: ['Stock Options', 'Health Coverage', 'Remote Work', 'Conference Budget'],
        postedDate: '1 day ago',
        matchReasons: [
          'Your PM skills and ML background are ideal',
          'Healthcare industry aligns with your interests',
          'Remote-first company culture'
        ],
        skillGaps: ['Healthcare regulatory knowledge'],
        cultureFit: 87,
        careerGrowth: 91,
        workLifeBalance: 89,
        remoteOption: true
      },
      {
        id: '3',
        title: 'Data Science Lead',
        company: 'FinanceAI Corp',
        location: 'New York, NY (Hybrid)',
        salary: { min: 150000, max: 190000 },
        matchScore: 82,
        description: 'Lead data science team building financial AI products.',
        requirements: ['Python', 'Statistics', 'Finance Domain', 'Team Leadership', 'PhD preferred'],
        benefits: ['High Salary', 'Bonus Structure', 'Health Benefits', 'Learning Stipend'],
        postedDate: '3 days ago',
        matchReasons: [
          'Strong compensation package',
          'Leadership role matches career goals',
          'Growing fintech sector'
        ],
        skillGaps: ['Finance domain expertise', 'Team management experience'],
        cultureFit: 78,
        careerGrowth: 85,
        workLifeBalance: 72,
        remoteOption: false
      }
    ];

    setJobMatches(mockMatches);
    setIsMatching(false);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <TieredAccessGuard feature="advanced_job_matching">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Advanced AI Job Matching
            </h2>
            <p className="text-muted-foreground">Intelligent job recommendations based on your profile and preferences</p>
          </div>
          <Button onClick={performAIMatching} disabled={isMatching}>
            {isMatching ? 'Finding Matches...' : 'Refresh Matches'}
          </Button>
        </div>

        <UsageMeter type="dailyAIRequests" currentUsage={3} label="AI Job Match Requests" />

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Smart Search & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search jobs with AI-powered understanding..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Minimum Salary</label>
                  <Input
                    type="number"
                    value={preferences.salaryMin}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      salaryMin: parseInt(e.target.value)
                    })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Preferred Industries</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preferences.industries.map((industry) => (
                      <Badge key={industry} variant="secondary">{industry}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Work Culture</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preferences.workCulture.map((culture) => (
                      <Badge key={culture} variant="outline">{culture}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Matches */}
        <div className="space-y-4">
          {jobMatches.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <Badge className={`${getMatchScoreColor(job.matchScore)} font-bold`}>
                        {job.matchScore}% Match
                      </Badge>
                      {job.remoteOption && (
                        <Badge variant="secondary">Remote</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-muted-foreground mb-3">
                      <span className="font-medium">{job.company}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.postedDate}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="culture">Culture Fit</TabsTrigger>
                    <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Requirements</h4>
                        <div className="flex flex-wrap gap-1">
                          {job.requirements.map((req) => (
                            <Badge key={req} variant="outline">{req}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Benefits</h4>
                        <div className="flex flex-wrap gap-1">
                          {job.benefits.map((benefit) => (
                            <Badge key={benefit} variant="secondary">{benefit}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="requirements" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-green-600">Your Strengths</h4>
                        <div className="space-y-2">
                          {job.requirements.slice(0, 3).map((req) => (
                            <div key={req} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-sm">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-yellow-600">Skill Gaps</h4>
                        <div className="space-y-2">
                          {job.skillGaps.map((gap) => (
                            <div key={gap} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              <span className="text-sm">{gap}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="culture" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Culture Fit</span>
                          <span className="text-sm">{job.cultureFit}%</span>
                        </div>
                        <Progress value={job.cultureFit} className={getScoreColor(job.cultureFit)} />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Career Growth</span>
                          <span className="text-sm">{job.careerGrowth}%</span>
                        </div>
                        <Progress value={job.careerGrowth} className={getScoreColor(job.careerGrowth)} />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Work-Life Balance</span>
                          <span className="text-sm">{job.workLifeBalance}%</span>
                        </div>
                        <Progress value={job.workLifeBalance} className={getScoreColor(job.workLifeBalance)} />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analysis" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Why This Job Matches You</h4>
                      <div className="space-y-2">
                        {job.matchReasons.map((reason, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1">Apply Now</Button>
                  <Button variant="outline">Learn More</Button>
                  <Button variant="outline">Contact Recruiter</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TieredAccessGuard>
  );
};

export default AdvancedAIJobMatching;