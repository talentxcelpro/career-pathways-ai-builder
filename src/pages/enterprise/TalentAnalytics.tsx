import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Brain,
  Globe,
  Building
} from 'lucide-react';

export const TalentAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('quarter');

  const metrics = {
    totalHires: 47,
    retentionRate: 94,
    timeToHire: 23,
    costPerHire: 4500,
    diversityScore: 82,
    employeeSatisfaction: 88
  };

  const trends = {
    hiring: '+23%',
    retention: '+8%',
    timeToHire: '-15%',
    cost: '-12%'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              Talent Analytics & Workforce Planning
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Real-time talent insights for C-suite executives and HR leaders with predictive analytics
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {['month', 'quarter', 'year'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="diversity">Diversity</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hires</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalHires}</div>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {trends.hiring}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.retentionRate}%</div>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {trends.retention}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time to Hire</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.timeToHire} days</div>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {trends.timeToHire}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cost per Hire</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.costPerHire}</div>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {trends.cost}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Diversity Score</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.diversityScore}%</div>
                  <p className="text-xs text-blue-600">
                    Above industry avg
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.employeeSatisfaction}%</div>
                  <p className="text-xs text-green-600">
                    Employee NPS: +47
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hiring Trends by Department</CardTitle>
                  <CardDescription>Last 6 months hiring activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { dept: 'Engineering', hires: 23, budget: 85, color: 'bg-blue-500' },
                      { dept: 'Sales', hires: 18, budget: 92, color: 'bg-green-500' },
                      { dept: 'Marketing', hires: 12, budget: 78, color: 'bg-purple-500' },
                      { dept: 'Product', hires: 9, budget: 67, color: 'bg-orange-500' },
                      { dept: 'Operations', hires: 6, budget: 45, color: 'bg-gray-500' }
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.dept}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">{item.hires} hires</span>
                            <span className="text-sm text-gray-600">{item.budget}% budget used</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${(item.hires / 25) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Intelligence</CardTitle>
                  <CardDescription>Industry benchmarks and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">23 days</div>
                        <p className="text-sm text-gray-600">Industry Avg TTH</p>
                        <Badge variant="secondary" className="mt-1">You're faster</Badge>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">$5,200</div>
                        <p className="text-sm text-gray-600">Industry Avg CPH</p>
                        <Badge variant="secondary" className="mt-1">You're lower</Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Skill Availability (Local Market)</h4>
                      <div className="space-y-2">
                        {[
                          { skill: 'React Developers', availability: 'High', demand: 'Medium' },
                          { skill: 'Data Scientists', availability: 'Low', demand: 'High' },
                          { skill: 'DevOps Engineers', availability: 'Medium', demand: 'High' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{item.skill}</span>
                            <div className="flex gap-2">
                              <Badge variant={item.availability === 'High' ? 'default' : item.availability === 'Medium' ? 'secondary' : 'destructive'}>
                                {item.availability} Availability
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="acquisition" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acquisition Funnel</CardTitle>
                  <CardDescription>Candidate journey through hiring process</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { stage: 'Applications Received', count: 1247, percentage: 100, color: 'bg-blue-500' },
                      { stage: 'Initial Screening', count: 623, percentage: 50, color: 'bg-green-500' },
                      { stage: 'Technical Interview', count: 186, percentage: 15, color: 'bg-orange-500' },
                      { stage: 'Final Interview', count: 93, percentage: 7.5, color: 'bg-purple-500' },
                      { stage: 'Offers Extended', count: 62, percentage: 5, color: 'bg-red-500' },
                      { stage: 'Offers Accepted', count: 47, percentage: 3.8, color: 'bg-gray-700' }
                    ].map((stage, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{stage.stage}</span>
                          <span className="text-sm text-gray-600">{stage.count} ({stage.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${stage.color}`}
                            style={{ width: `${stage.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Source Performance</CardTitle>
                  <CardDescription>Quality and quantity by recruitment source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { source: 'Employee Referrals', applications: 234, hires: 18, quality: 95, cost: 1200 },
                      { source: 'TalentXcel Platform', applications: 456, hires: 15, quality: 88, cost: 2800 },
                      { source: 'LinkedIn', applications: 189, hires: 8, quality: 82, cost: 3200 },
                      { source: 'Job Boards', applications: 368, hires: 6, quality: 65, cost: 1800 }
                    ].map((source, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{source.source}</span>
                          <Badge variant="outline">{source.hires} hires</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>Quality: {source.quality}%</div>
                          <div>Apps: {source.applications}</div>
                          <div>Cost: ${source.cost}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="retention" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">At-Risk Employees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">12</div>
                    <p className="text-sm text-gray-600">High flight risk</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exit Interviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">8</div>
                    <p className="text-sm text-gray-600">This month</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      View Insights
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Satisfaction Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">+5%</div>
                    <p className="text-sm text-gray-600">vs last quarter</p>
                    <Progress value={88} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Retention Risk Analysis</CardTitle>
                <CardDescription>AI-powered predictions for employee turnover</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Sarah Johnson', role: 'Senior Developer', risk: 85, factors: ['Low engagement', 'Salary below market', 'Limited growth'] },
                    { name: 'Mike Chen', role: 'Product Manager', risk: 72, factors: ['Work-life balance', 'Team conflicts'] },
                    { name: 'Emily Davis', role: 'Marketing Lead', risk: 68, factors: ['Career progression', 'Remote work preference'] }
                  ].map((employee, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-gray-600">{employee.role}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={employee.risk > 80 ? 'destructive' : employee.risk > 60 ? 'default' : 'secondary'}>
                            {employee.risk}% risk
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Risk Factors:</p>
                        <div className="flex flex-wrap gap-1">
                          {employee.factors.map((factor, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diversity" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Gender Diversity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">48%</div>
                    <p className="text-xs text-gray-600">Female representation</p>
                    <Progress value={48} className="mt-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>25-35</span>
                      <span>45%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>35-45</span>
                      <span>35%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>45+</span>
                      <span>20%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cultural Background</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">32%</div>
                    <p className="text-xs text-gray-600">International hires</p>
                    <Badge variant="secondary" className="mt-2">+12% YoY</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Leadership Diversity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">38%</div>
                    <p className="text-xs text-gray-600">Diverse leadership</p>
                    <Badge variant="default" className="mt-2">Above target</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Powered Workforce Predictions
                </CardTitle>
                <CardDescription>
                  Advanced analytics to forecast future talent needs and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">Next Quarter Predictions</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Hiring Demand</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Engineering team will need 8-12 additional developers based on project pipeline
                        </p>
                        <Badge variant="outline" className="mt-2">High Confidence</Badge>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">Retention Risk</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          15% increase in resignation likelihood for mid-level employees
                        </p>
                        <Badge variant="outline" className="mt-2">Medium Confidence</Badge>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Compensation Trends</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Market salaries for data scientists expected to rise 12-15%
                        </p>
                        <Badge variant="outline" className="mt-2">High Confidence</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Strategic Recommendations</h3>
                    <div className="space-y-3">
                      {[
                        { action: 'Start recruiting senior developers now', priority: 'High', timeline: 'Immediate' },
                        { action: 'Review compensation packages for data team', priority: 'Medium', timeline: '2 weeks' },
                        { action: 'Implement retention program for at-risk employees', priority: 'High', timeline: '1 week' },
                        { action: 'Expand diversity hiring initiatives', priority: 'Medium', timeline: '1 month' }
                      ].map((rec, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{rec.action}</p>
                            <p className="text-xs text-gray-600">Timeline: {rec.timeline}</p>
                          </div>
                          <Badge variant={rec.priority === 'High' ? 'destructive' : 'default'}>
                            {rec.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};