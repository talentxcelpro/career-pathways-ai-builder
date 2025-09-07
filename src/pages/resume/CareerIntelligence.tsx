import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, Users, MapPin, DollarSign, Briefcase, Brain, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface MarketData {
  role: string;
  avgSalary: number;
  growth: number;
  demand: 'High' | 'Medium' | 'Low';
  locations: string[];
  skills: string[];
  companies: number;
}

interface SkillTrend {
  skill: string;
  demand: number;
  growth: number;
  avgSalary: number;
}

const mockMarketData: MarketData[] = [
  {
    role: 'Software Engineer',
    avgSalary: 850000, // ₹8.5 LPA
    growth: 25,
    demand: 'High',
    locations: ['Bangalore', 'Mumbai', 'Hyderabad', 'Pune'],
    skills: ['JavaScript', 'React', 'Python', 'AWS'],
    companies: 1250
  },
  {
    role: 'Data Scientist',
    avgSalary: 1200000, // ₹12 LPA
    growth: 40,
    demand: 'High',
    locations: ['Bangalore', 'Mumbai', 'Delhi NCR', 'Chennai'],
    skills: ['Python', 'SQL', 'Machine Learning', 'R'],
    companies: 890
  },
  {
    role: 'Product Manager',
    avgSalary: 1500000, // ₹15 LPA
    growth: 32,
    demand: 'High',
    locations: ['Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad'],
    skills: ['Strategy', 'Analytics', 'Leadership', 'Agile'],
    companies: 670
  },
  {
    role: 'DevOps Engineer',
    avgSalary: 950000, // ₹9.5 LPA
    growth: 35,
    demand: 'High',
    locations: ['Bangalore', 'Pune', 'Chennai', 'Hyderabad'],
    skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'],
    companies: 520
  },
  {
    role: 'Full Stack Developer',
    avgSalary: 750000, // ₹7.5 LPA
    growth: 28,
    demand: 'High',
    locations: ['Bangalore', 'Mumbai', 'Pune', 'Noida'],
    skills: ['React', 'Node.js', 'MongoDB', 'Express'],
    companies: 980
  }
];

const salaryTrends = [
  { year: '2020', salary: 650000 }, // ₹6.5 LPA
  { year: '2021', salary: 720000 }, // ₹7.2 LPA
  { year: '2022', salary: 800000 }, // ₹8 LPA
  { year: '2023', salary: 850000 }, // ₹8.5 LPA
  { year: '2024', salary: 920000 }, // ₹9.2 LPA
];

const skillsTrends: SkillTrend[] = [
  { skill: 'AI/ML', demand: 95, growth: 45, avgSalary: 1400000 }, // ₹14 LPA
  { skill: 'React', demand: 88, growth: 25, avgSalary: 850000 }, // ₹8.5 LPA
  { skill: 'Python', demand: 92, growth: 35, avgSalary: 950000 }, // ₹9.5 LPA
  { skill: 'AWS', demand: 85, growth: 30, avgSalary: 1100000 }, // ₹11 LPA
  { skill: 'TypeScript', demand: 78, growth: 40, avgSalary: 900000 }, // ₹9 LPA
  { skill: 'Docker', demand: 75, growth: 28, avgSalary: 880000 }, // ₹8.8 LPA
  { skill: 'GraphQL', demand: 65, growth: 50, avgSalary: 950000 }, // ₹9.5 LPA
  { skill: 'Next.js', demand: 70, growth: 55, avgSalary: 900000 }, // ₹9 LPA
  { skill: 'Kubernetes', demand: 72, growth: 42, avgSalary: 1050000 }, // ₹10.5 LPA
  { skill: 'Flutter', demand: 68, growth: 48, avgSalary: 820000 }, // ₹8.2 LPA
  { skill: 'Go', demand: 63, growth: 38, avgSalary: 1100000 }, // ₹11 LPA
  { skill: 'Blockchain', demand: 58, growth: 60, avgSalary: 1250000 } // ₹12.5 LPA
];

const locationData = [
  { location: 'Bangalore', avgSalary: 950000, costOfLiving: 130, jobs: 4500 }, // ₹9.5 LPA
  { location: 'Mumbai', avgSalary: 920000, costOfLiving: 180, jobs: 3200 }, // ₹9.2 LPA
  { location: 'Delhi NCR', avgSalary: 880000, costOfLiving: 140, jobs: 2800 }, // ₹8.8 LPA
  { location: 'Hyderabad', avgSalary: 850000, costOfLiving: 110, jobs: 2200 }, // ₹8.5 LPA
  { location: 'Pune', avgSalary: 820000, costOfLiving: 120, jobs: 1800 }, // ₹8.2 LPA
  { location: 'Chennai', avgSalary: 800000, costOfLiving: 115, jobs: 1600 }, // ₹8 LPA
  { location: 'Kolkata', avgSalary: 750000, costOfLiving: 105, jobs: 800 }, // ₹7.5 LPA
  { location: 'Ahmedabad', avgSalary: 720000, costOfLiving: 100, jobs: 600 }, // ₹7.2 LPA
  { location: 'Kochi', avgSalary: 680000, costOfLiving: 95, jobs: 450 }, // ₹6.8 LPA
  { location: 'Chandigarh', avgSalary: 700000, costOfLiving: 108, jobs: 400 }, // ₹7 LPA
  { location: 'Jaipur', avgSalary: 650000, costOfLiving: 90, jobs: 350 }, // ₹6.5 LPA
  { location: 'Remote', avgSalary: 850000, costOfLiving: 100, jobs: 5500 } // ₹8.5 LPA
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

const CareerIntelligence = () => {
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [selectedMetric, setSelectedMetric] = useState('salary');
  const [timeframe, setTimeframe] = useState('1y');

  const currentRoleData = mockMarketData.find(data => data.role === selectedRole) || mockMarketData[0];

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      <Helmet>
        <title>Career Intelligence | Market Data & Insights | TalentXcel</title>
        <meta 
          name="description" 
          content="Real-time career market data, salary trends, skill demand, and location insights. Make data-driven career decisions." 
        />
        <link rel="canonical" href="https://talentxcel.in/insights" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
        {/* Header */}
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Career Intelligence Hub
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
              Make data-driven career decisions with real-time market insights, salary trends, and skill demand analysis.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">₹9.2L</div>
                  <p className="text-xs text-muted-foreground">Avg Tech Salary</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">32%</div>
                  <p className="text-xs text-muted-foreground">Job Growth</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">65K+</div>
                  <p className="text-xs text-muted-foreground">Open Roles</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">2.1M</div>
                  <p className="text-xs text-muted-foreground">Data Points</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 pb-20">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="salaries">Salaries</TabsTrigger>
              <TabsTrigger value="skills">Skills Trends</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Role Selector */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Market Overview</CardTitle>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-[250px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockMarketData.map(data => (
                          <SelectItem key={data.role} value={data.role}>
                            {data.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        ₹{(currentRoleData.avgSalary / 100000).toFixed(1)}L
                      </div>
                      <p className="text-sm text-muted-foreground">Average Salary</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        +{currentRoleData.growth}%
                      </div>
                      <p className="text-sm text-muted-foreground">YoY Growth</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-3xl font-bold mb-1 ${getDemandColor(currentRoleData.demand)}`}>
                        {currentRoleData.demand}
                      </div>
                      <p className="text-sm text-muted-foreground">Market Demand</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {currentRoleData.companies}
                      </div>
                      <p className="text-sm text-muted-foreground">Hiring Companies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>In-Demand Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentRoleData.skills.map((skill, index) => (
                        <div key={skill} className="flex items-center justify-between">
                          <span className="font-medium">{skill}</span>
                          <Badge variant="secondary">#{index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Locations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Hiring Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentRoleData.locations.map((location, index) => (
                        <div key={location} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{location}</span>
                          </div>
                          <Badge variant="outline">Top {index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="salaries" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Salary Trends Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Salary Trends (5 Years)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salaryTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${(value / 100000).toFixed(1)}L`, 'Salary']} />
                        <Line type="monotone" dataKey="salary" stroke="#8884d8" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Location Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Salary by Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={locationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="location" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${(value / 100000).toFixed(1)}L`, 'Avg Salary']} />
                        <Bar dataKey="avgSalary" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Salary Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Salary Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">₹5.5L</div>
                      <div className="text-xs text-muted-foreground">10th percentile</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">₹7L</div>
                      <div className="text-xs text-muted-foreground">25th percentile</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">₹9.2L</div>
                      <div className="text-xs text-muted-foreground">Median</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">₹12L</div>
                      <div className="text-xs text-muted-foreground">75th percentile</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">₹16L</div>
                      <div className="text-xs text-muted-foreground">90th percentile</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skills Demand Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills Demand vs Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {skillsTrends.slice(0, 6).map((skill) => (
                        <div key={skill.skill} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{skill.skill}</span>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                ₹{(skill.avgSalary / 100000).toFixed(1)}L
                              </div>
                              <div className="text-xs text-green-600">
                                +{skill.growth}% growth
                              </div>
                            </div>
                          </div>
                          <Progress value={skill.demand} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {skill.demand}% demand score
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Emerging Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fastest Growing Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {skillsTrends
                        .sort((a, b) => b.growth - a.growth)
                        .slice(0, 6)
                        .map((skill, index) => (
                          <div key={skill.skill} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <span className="font-medium">{skill.skill}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-green-600 font-medium">
                                +{skill.growth}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                growth
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Skills Recommendation */}
              <Card>
                <CardHeader>
                  <CardTitle>Personalized Skill Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <Brain className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-semibold mb-1">High Priority</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Skills that will significantly boost your marketability
                      </p>
                      <div className="space-y-1">
                        <Badge variant="destructive" className="text-xs">AI/ML</Badge>
                        <Badge variant="destructive" className="text-xs">Cloud Computing</Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <Target className="h-8 w-8 text-yellow-600 mb-2" />
                      <h3 className="font-semibold mb-1">Medium Priority</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Valuable additions to your skill portfolio
                      </p>
                      <div className="space-y-1">
                        <Badge variant="default" className="text-xs">TypeScript</Badge>
                        <Badge variant="default" className="text-xs">GraphQL</Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <Zap className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-semibold mb-1">Future Skills</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Emerging technologies to watch
                      </p>
                      <div className="space-y-1">
                        <Badge variant="secondary" className="text-xs">Web3</Badge>
                        <Badge variant="secondary" className="text-xs">Quantum Computing</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Location Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Location Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {locationData.map((location) => (
                        <div key={location.location} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">{location.location}</h3>
                              <p className="text-sm text-muted-foreground">
                                {location.jobs.toLocaleString()} open positions
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                ₹{(location.avgSalary / 100000).toFixed(1)}L
                              </div>
                              <div className="text-xs text-muted-foreground">
                                avg salary
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Cost of Living</span>
                              <span>{location.costOfLiving}% of national avg</span>
                            </div>
                            <Progress value={location.costOfLiving} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Job Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={locationData}
                          dataKey="jobs"
                          nameKey="location"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label={({location, percent}) => `${location} ${(percent * 100).toFixed(0)}%`}
                        >
                          {locationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value.toLocaleString(), 'Jobs']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Career Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Next 12 Months</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">High Confidence</span>
                          </div>
                          <p className="text-sm text-green-700">
                            AI/ML roles will see 40%+ salary increase in India
                          </p>
                        </div>
                        
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-800">Medium Confidence</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            Remote work will stabilize at 50% of Indian tech roles
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold">Next 5 Years</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-purple-800">Trend Prediction</span>
                          </div>
                          <p className="text-sm text-purple-700">
                            Quantum computing roles will emerge as mainstream
                          </p>
                        </div>
                        
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-800">Market Shift</span>
                          </div>
                          <p className="text-sm text-orange-700">
                            Soft skills premium will increase by 25%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default CareerIntelligence;