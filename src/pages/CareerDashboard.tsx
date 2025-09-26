import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Brain, TrendingUp, Star, Target, Zap, Award, 
  Sparkles, ChevronRight, Bell, Rocket, Users,
  Clock, Building, MapPin, Heart, Play
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// AI Career Components
import { PersonalCareerDashboard } from '@/components/jobs/PersonalCareerDashboard';
import { SmartJobMatchingBar } from '@/components/jobs/SmartJobMatchingBar';
import { QuickApplyWidget } from '@/components/jobs/QuickApplyWidget';
import { SalaryTransparencyWidget } from '@/components/jobs/SalaryTransparencyWidget';
import { TXCCoinBalance } from '@/components/jobs/TXCCoinBalance';
import { TopCompaniesSalaries } from '@/components/jobs/TopCompaniesSalaries';

import { useAuth } from '@/contexts/AuthContext';
import { updateMetaTags } from '@/utils/metaTags';

const CareerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    employment_type: [],
    experience_level: '',
    salary_min: '',
    salary_max: ''
  });

  // SEO meta tags
  useEffect(() => {
    updateMetaTags({
      title: 'Career Dashboard | AI-Powered Career Intelligence | TalentXcel',
      description: 'Your personalized AI career assistant. Get job matches, salary insights, career recommendations, and track your professional growth with intelligent analytics.',
      url: `${window.location.origin}/career-dashboard`,
      keywords: ['career dashboard', 'AI career assistant', 'job matching', 'salary insights', 'career analytics', 'professional growth'],
      type: 'website'
    });
  }, []);

  const handleBackToJobs = () => {
    navigate('/jobs');
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Navigate to jobs with filters applied
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <>
      <Helmet>
        <title>Career Dashboard | AI-Powered Career Intelligence | TalentXcel</title>
        <meta name="description" content="Your personalized AI career assistant with job matching, salary insights, and career recommendations." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-apple-bold mb-2">
                  Career Intelligence Hub
                </h1>
                <p className="text-lg text-white/90 font-apple-medium">
                  Your AI-powered career command center
                </p>
              </div>
              <Button 
                onClick={handleBackToJobs}
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 font-apple-medium"
              >
                <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Jobs
              </Button>
            </div>

            {/* Welcome Message */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-apple-bold text-white mb-1">
                      Welcome back, TalentXcel Pro! 👋
                    </h2>
                    <p className="text-white/90 font-apple-medium">
                      Your AI Career Assistant found 15 new matches today
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* TXC Coin Balance */}
          <div className="mb-8">
            <TXCCoinBalance balance={1250} />
          </div>

          {/* Personal Career Dashboard */}
          <div className="mb-8">
            <PersonalCareerDashboard />
          </div>

          {/* AI Job Matching Bar */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-apple-bold">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Smart Search & Matching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SmartJobMatchingBar onFiltersChange={handleFiltersChange} onSearch={() => {}} />
              </CardContent>
            </Card>
          </div>

          {/* Career Progress & Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Career Progress Compass */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-apple-bold">
                  <Target className="h-5 w-5 text-primary" />
                  Career Progress Compass
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-apple-medium">Career Readiness</span>
                    <span className="text-sm font-apple-bold text-primary">44.5%</span>
                  </div>
                  <Progress value={44.5} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1 font-apple-medium">
                    You're 55.5% away from your next career milestone
                  </p>
                </div>

                <div>
                  <h4 className="font-apple-bold mb-3">Skills to Boost Your Profile</h4>
                  <div className="space-y-2">
                    {['React Native', 'AWS', 'Docker'].map((skill) => (
                      <div key={skill} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <span className="font-apple-medium">{skill}</span>
                        <Badge variant="outline">High Impact</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-apple-bold">
                  <Clock className="h-5 w-5 text-primary" />
                  Today's Job Hunt Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-apple-medium">Apply to 3 new jobs</span>
                    <Badge variant="outline">0/3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-apple-medium">Update profile skills</span>
                    <Badge variant="default">1/1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-apple-medium">Network with 2 professionals</span>
                    <Badge variant="default">2/2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-apple-medium">Complete Daily Challenge</span>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-apple-bold mb-2">Your Activity</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-apple-bold text-primary">0</div>
                      <div className="text-sm text-muted-foreground font-apple-medium">Jobs Saved</div>
                    </div>
                    <div>
                      <div className="text-2xl font-apple-bold text-primary">0</div>
                      <div className="text-sm text-muted-foreground font-apple-medium">Applied</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 font-apple-medium">
                    37 profile views this week
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Apply Dashboard */}
          <div className="mb-8">
            <QuickApplyWidget />
          </div>

          {/* AI Career Recommendations */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-apple-bold">
                  <Rocket className="h-5 w-5 text-primary" />
                  AI Career Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-green-100 text-green-700">High Impact</Badge>
                      <span className="text-sm text-muted-foreground font-apple-medium">2 weeks</span>
                    </div>
                    <h4 className="font-apple-bold">Learn React Native</h4>
                    <p className="text-sm text-muted-foreground mt-1 font-apple-medium">
                      Expand your mobile development skills
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-blue-100 text-blue-700">High Impact</Badge>
                      <span className="text-sm text-muted-foreground font-apple-medium">1 month</span>
                    </div>
                    <h4 className="font-apple-bold">AWS Solutions Architect</h4>
                    <p className="text-sm text-muted-foreground mt-1 font-apple-medium">
                      Get certified in cloud architecture
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Salary Crystal Ball */}
          <div className="mb-8">
            <SalaryTransparencyWidget />
          </div>

          {/* Top Companies */}
          <div className="mb-8">
            <TopCompaniesSalaries />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-apple-bold">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="justify-start h-auto p-4 font-apple-medium" variant="outline">
                  <Brain className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-apple-bold">Ask AI Career Assistant</div>
                    <div className="text-sm text-muted-foreground">Get personalized advice</div>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4 font-apple-medium" variant="outline">
                  <Users className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-apple-bold">Update Job Preferences</div>
                    <div className="text-sm text-muted-foreground">Refine your search</div>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4 font-apple-medium" variant="outline">
                  <TrendingUp className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-apple-bold">View Salary Insights</div>
                    <div className="text-sm text-muted-foreground">Market analysis</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CareerDashboard;