import React from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Users, Zap } from 'lucide-react';

const SkillMarketTrends = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Skill Market Trends | TalentXcel Learning',
      description: 'Real-time data on skill demand, salary trends, and job market insights.'
    });
  }, []);

  // Mock market trends data
  const trendingSkills = [
    {
      skill: 'Artificial Intelligence',
      demandChange: 45,
      avgSalary: '$125,000',
      jobOpenings: 12500,
      growth: 'up',
      category: 'Technology'
    },
    {
      skill: 'Cloud Computing',
      demandChange: 38,
      avgSalary: '$105,000',
      jobOpenings: 18200,
      growth: 'up',
      category: 'Technology'
    },
    {
      skill: 'Data Science',
      demandChange: 32,
      avgSalary: '$95,000',
      jobOpenings: 15600,
      growth: 'up',
      category: 'Analytics'
    },
    {
      skill: 'Cybersecurity',
      demandChange: 28,
      avgSalary: '$92,000',
      jobOpenings: 9800,
      growth: 'up',
      category: 'Security'
    },
    {
      skill: 'Digital Marketing',
      demandChange: 25,
      avgSalary: '$65,000',
      jobOpenings: 22100,
      growth: 'up',
      category: 'Marketing'
    },
    {
      skill: 'Project Management',
      demandChange: -8,
      avgSalary: '$75,000',
      jobOpenings: 8900,
      growth: 'down',
      category: 'Management'
    }
  ];

  const industryTrends = [
    {
      industry: 'Technology',
      growth: 42,
      topSkills: ['AI/ML', 'Cloud', 'DevOps'],
      avgSalary: '$110K'
    },
    {
      industry: 'Healthcare',
      growth: 35,
      topSkills: ['Telemedicine', 'Data Analysis', 'Digital Health'],
      avgSalary: '$85K'
    },
    {
      industry: 'Finance',
      growth: 22,
      topSkills: ['FinTech', 'Blockchain', 'Risk Analysis'],
      avgSalary: '$95K'
    },
    {
      industry: 'E-commerce',
      growth: 38,
      topSkills: ['Digital Marketing', 'UX Design', 'Analytics'],
      avgSalary: '$72K'
    }
  ];

  const emergingSkills = [
    { skill: 'Prompt Engineering', growth: 180, category: 'AI' },
    { skill: 'Web3 Development', growth: 95, category: 'Blockchain' },
    { skill: 'Quantum Computing', growth: 75, category: 'Computing' },
    { skill: 'AR/VR Development', growth: 68, category: 'Extended Reality' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Skill Market Trends</h1>
            <p className="text-gray-600">
              Real-time data on skill demand, salary trends, and job market insights
            </p>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-50 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Skills in High Demand</p>
                  <p className="text-2xl font-bold text-gray-900">47</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Salary Increase</p>
                  <p className="text-2xl font-bold text-gray-900">+15%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-50 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Job Openings</p>
                  <p className="text-2xl font-bold text-gray-900">127K</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-50 rounded-full">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Skill Gap Index</p>
                  <p className="text-2xl font-bold text-gray-900">72%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trending Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Trending Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingSkills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{skill.skill}</span>
                        <Badge variant="outline" className="text-xs">
                          {skill.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {skill.avgSalary}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {skill.jobOpenings.toLocaleString()} jobs
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {skill.growth === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        skill.growth === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {skill.demandChange > 0 ? '+' : ''}{skill.demandChange}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Industry Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Industry Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {industryTrends.map((industry, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{industry.industry}</h3>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-green-600">
                          +{industry.growth}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                      <span>Avg Salary: {industry.avgSalary}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Top Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {industry.topSkills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emerging Skills */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Emerging Skills to Watch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {emergingSkills.map((skill, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">{skill.skill}</h3>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {skill.category}
                    </Badge>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-green-600">
                        +{skill.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SkillMarketTrends;