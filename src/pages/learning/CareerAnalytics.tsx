import React from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Target, User, Briefcase, Award, Star } from 'lucide-react';

const CareerAnalytics = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Career Analytics | TalentXcel Learning',
      description: 'Personal career development insights, skill gap analysis, and growth recommendations.'
    });
  }, []);

  // Mock analytics data
  const skillGrowthData = [
    { month: 'Jan', React: 65, JavaScript: 70, Python: 40 },
    { month: 'Feb', React: 70, JavaScript: 75, Python: 45 },
    { month: 'Mar', React: 75, JavaScript: 78, Python: 50 },
    { month: 'Apr', React: 80, JavaScript: 82, Python: 55 },
    { month: 'May', React: 85, JavaScript: 85, Python: 60 },
    { month: 'Jun', React: 88, JavaScript: 88, Python: 65 }
  ];

  const marketDemandData = [
    { skill: 'React', demand: 92, yourLevel: 88 },
    { skill: 'JavaScript', demand: 95, yourLevel: 88 },
    { skill: 'Python', demand: 88, yourLevel: 65 },
    { skill: 'Node.js', demand: 85, yourLevel: 70 },
    { skill: 'TypeScript', demand: 78, yourLevel: 60 },
    { skill: 'AWS', demand: 90, yourLevel: 45 }
  ];

  const careerInsights = {
    currentRole: 'Frontend Developer',
    targetRole: 'Full Stack Developer',
    careerProgress: 72,
    skillGaps: ['Backend Development', 'Database Design', 'DevOps'],
    recommendations: [
      'Complete Node.js fundamentals course',
      'Learn database management with MongoDB',
      'Practice API development and testing'
    ],
    marketFit: 85,
    salaryPotential: '+$15,000'
  };

  const achievements = [
    { title: 'React Expert', level: 'Advanced', date: '2024-01-15' },
    { title: 'JavaScript Master', level: 'Expert', date: '2024-01-10' },
    { title: 'Frontend Specialist', level: 'Intermediate', date: '2024-01-05' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Career Analytics</h1>
            <p className="text-gray-600">
              Personal career development insights and growth recommendations
            </p>
          </div>
        </div>

        {/* Career Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Role</p>
                  <p className="text-lg font-bold text-gray-900">{careerInsights.currentRole}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-50 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Target Role</p>
                  <p className="text-lg font-bold text-gray-900">{careerInsights.targetRole}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-50 rounded-full">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Market Fit</p>
                  <p className="text-lg font-bold text-gray-900">{careerInsights.marketFit}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-50 rounded-full">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Salary Potential</p>
                  <p className="text-lg font-bold text-gray-900">{careerInsights.salaryPotential}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skill Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Growth Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={skillGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="React" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="JavaScript" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Python" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Skill vs Market Demand */}
          <Card>
            <CardHeader>
              <CardTitle>Skills vs Market Demand</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marketDemandData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="skill" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="demand" fill="#e5e7eb" name="Market Demand" />
                  <Bar dataKey="yourLevel" fill="#3b82f6" name="Your Level" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Career Progress & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Career Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Career Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Overall Progress to Target Role</span>
                    <span className="text-sm font-medium">{careerInsights.careerProgress}%</span>
                  </div>
                  <Progress value={careerInsights.careerProgress} className="h-3" />
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Skill Gaps to Address:</h3>
                  <div className="space-y-2">
                    {careerInsights.skillGaps.map((gap, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium">{gap}</span>
                        <Badge variant="destructive">Gap</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Recent Achievements:</h3>
                  <div className="space-y-2">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">{achievement.title}</span>
                          <p className="text-xs text-gray-500">{achievement.date}</p>
                        </div>
                        <Badge variant="secondary">{achievement.level}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-900">Next Steps for Career Growth</h3>
                  <ul className="space-y-2">
                    {careerInsights.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-sm text-blue-800">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold mb-2 text-green-900">Strengths to Leverage</h3>
                  <ul className="space-y-1">
                    <li className="text-sm text-green-800">• Strong foundation in React and JavaScript</li>
                    <li className="text-sm text-green-800">• Consistent learning progress</li>
                    <li className="text-sm text-green-800">• Good alignment with market demand</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold mb-2 text-yellow-900">Market Opportunities</h3>
                  <p className="text-sm text-yellow-800">
                    Full-stack developers with your skill set are in high demand. 
                    Focus on backend technologies to maximize your market value.
                  </p>
                </div>

                <Button className="w-full">
                  Get Personalized Learning Path
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CareerAnalytics;