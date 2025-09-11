import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MapPin, 
  Users, 
  Award,
  BarChart3,
  Target,
  Building,
  Calendar
} from 'lucide-react';

interface SalaryData {
  role: string;
  experience_level: string;
  location: string;
  industry: string;
  company_size: string;
  min_salary: number;
  max_salary: number;
  median_salary: number;
  currency: string;
  data_points: number;
  last_updated: string;
}

interface CompensationInsight {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  percentage: number;
  description: string;
}

interface MarketTrend {
  period: string;
  change_percentage: number;
  trend_direction: 'up' | 'down' | 'stable';
  factors: string[];
}

export const SalaryBenchmarkingTool: React.FC = () => {
  const [formData, setFormData] = useState({
    role: '',
    experience_level: '',
    location: '',
    industry: '',
    company_size: '',
    current_salary: '',
    skills: [] as string[]
  });

  const [showResults, setShowResults] = useState(false);

  // Mock data for demonstration - in production this would come from salary APIs
  const salaryData: SalaryData[] = [
    {
      role: 'Software Engineer',
      experience_level: 'Mid-level',
      location: 'Bangalore',
      industry: 'Technology',
      company_size: 'Large',
      min_salary: 800000,
      max_salary: 1500000,
      median_salary: 1200000,
      currency: 'INR',
      data_points: 1250,
      last_updated: '2025-01-10'
    },
    {
      role: 'Product Manager',
      experience_level: 'Senior',
      location: 'Mumbai',
      industry: 'Fintech',
      company_size: 'Medium',
      min_salary: 1500000,
      max_salary: 3000000,
      median_salary: 2200000,
      currency: 'INR',
      data_points: 850,
      last_updated: '2025-01-10'
    }
  ];

  const compensationFactors: CompensationInsight[] = [
    {
      factor: 'Education (Master\'s Degree)',
      impact: 'positive',
      percentage: 15,
      description: 'Advanced degree typically increases compensation by 10-20%'
    },
    {
      factor: 'Remote Work Experience',
      impact: 'positive',
      percentage: 8,
      description: 'Remote work skills are highly valued in current market'
    },
    {
      factor: 'Location (Tier-2 City)',
      impact: 'negative',
      percentage: -12,
      description: 'Smaller cities typically offer 10-15% lower salaries'
    },
    {
      factor: 'Company Size (Startup)',
      impact: 'neutral',
      percentage: 0,
      description: 'Startups often compensate with equity and growth opportunities'
    }
  ];

  const marketTrends: MarketTrend[] = [
    {
      period: 'Last 6 months',
      change_percentage: 12,
      trend_direction: 'up',
      factors: ['High demand for tech talent', 'Inflation adjustments', 'Remote work adoption']
    },
    {
      period: 'Next 12 months (Predicted)',
      change_percentage: 8,
      trend_direction: 'up',
      factors: ['AI/ML skill premium', 'Digital transformation', 'Talent shortage']
    }
  ];

  const industryBenchmarks = [
    { industry: 'Technology', avg_salary: 1800000, growth: 15, color: 'text-blue-600' },
    { industry: 'Banking & Finance', avg_salary: 1600000, growth: 8, color: 'text-green-600' },
    { industry: 'Healthcare', avg_salary: 1200000, growth: 12, color: 'text-purple-600' },
    { industry: 'E-commerce', avg_salary: 1400000, growth: 18, color: 'text-orange-600' },
    { industry: 'Consulting', avg_salary: 1700000, growth: 10, color: 'text-red-600' }
  ];

  const skillsPremiums = [
    { skill: 'Machine Learning', premium: 25, demand: 'High' },
    { skill: 'Cloud Architecture', premium: 20, demand: 'High' },
    { skill: 'DevOps', premium: 18, demand: 'High' },
    { skill: 'Data Science', premium: 22, demand: 'High' },
    { skill: 'Cybersecurity', premium: 28, demand: 'Very High' },
    { skill: 'Blockchain', premium: 15, demand: 'Medium' }
  ];

  const locationFactors = [
    { city: 'Bangalore', factor: 1.0, cost_of_living: 'High' },
    { city: 'Mumbai', factor: 1.1, cost_of_living: 'Very High' },
    { city: 'Delhi NCR', factor: 1.05, cost_of_living: 'High' },
    { city: 'Hyderabad', factor: 0.9, cost_of_living: 'Medium' },
    { city: 'Chennai', factor: 0.85, cost_of_living: 'Medium' },
    { city: 'Pune', factor: 0.9, cost_of_living: 'Medium' }
  ];

  const handleAnalyze = () => {
    setShowResults(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculatePersonalizedSalary = () => {
    const baseSalary = salaryData.find(d => 
      d.role.toLowerCase().includes(formData.role.toLowerCase()) &&
      d.experience_level.toLowerCase() === formData.experience_level.toLowerCase()
    )?.median_salary || 1200000;

    let adjustedSalary = baseSalary;
    
    // Apply location factor
    const locationFactor = locationFactors.find(l => 
      l.city.toLowerCase().includes(formData.location.toLowerCase())
    )?.factor || 1.0;
    
    adjustedSalary *= locationFactor;

    // Apply industry factor (simplified)
    if (formData.industry === 'Technology') adjustedSalary *= 1.1;
    if (formData.industry === 'Banking') adjustedSalary *= 1.05;

    return Math.round(adjustedSalary);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Salary Benchmarking Tool</h1>
        <p className="text-muted-foreground">
          Get accurate salary insights based on role, location, experience, and market trends
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Role</label>
              <Input
                placeholder="e.g., Software Engineer"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Experience Level</label>
              <Select value={formData.experience_level} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, experience_level: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry-level">Entry-level (0-2 years)</SelectItem>
                  <SelectItem value="Mid-level">Mid-level (3-5 years)</SelectItem>
                  <SelectItem value="Senior">Senior (6-10 years)</SelectItem>
                  <SelectItem value="Lead">Lead/Principal (10+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select value={formData.location} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, location: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Select value={formData.industry} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, industry: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Banking">Banking & Finance</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Size</label>
              <Select value={formData.company_size} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, company_size: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Startup">Startup (1-50)</SelectItem>
                  <SelectItem value="Small">Small (51-200)</SelectItem>
                  <SelectItem value="Medium">Medium (201-1000)</SelectItem>
                  <SelectItem value="Large">Large (1000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Salary (Optional)</label>
              <Input
                type="number"
                placeholder="₹12,00,000"
                value={formData.current_salary}
                onChange={(e) => setFormData(prev => ({ ...prev, current_salary: e.target.value }))}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleAnalyze} 
            className="mt-6 w-full"
            disabled={!formData.role || !formData.experience_level || !formData.location}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze Salary
          </Button>
        </CardContent>
      </Card>

      {showResults && (
        <>
          {/* Salary Analysis Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-primary">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary">{formatCurrency(calculatePersonalizedSalary())}</div>
                <p className="text-sm text-muted-foreground">Estimated Market Rate</p>
                <div className="mt-2">
                  <Badge variant="secondary">Based on 1,250+ data points</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <div className="text-3xl font-bold text-green-600">12%</div>
                <p className="text-sm text-muted-foreground">6-Month Growth</p>
                <div className="mt-2">
                  <Badge variant="secondary">Above market average</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <div className="text-3xl font-bold text-blue-600">85th</div>
                <p className="text-sm text-muted-foreground">Percentile Ranking</p>
                <div className="mt-2">
                  <Badge variant="secondary">Top performer range</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Salary Range Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Range Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Entry Level (25th percentile)</span>
                  <span className="font-bold">{formatCurrency(calculatePersonalizedSalary() * 0.75)}</span>
                </div>
                <Progress value={25} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Market Average (50th percentile)</span>
                  <span className="font-bold">{formatCurrency(calculatePersonalizedSalary())}</span>
                </div>
                <Progress value={50} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Experienced (75th percentile)</span>
                  <span className="font-bold">{formatCurrency(calculatePersonalizedSalary() * 1.25)}</span>
                </div>
                <Progress value={75} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Top Tier (90th percentile)</span>
                  <span className="font-bold">{formatCurrency(calculatePersonalizedSalary() * 1.5)}</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Compensation Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Factors Affecting Your Compensation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {compensationFactors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        factor.impact === 'positive' ? 'bg-green-500' :
                        factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium">{factor.factor}</div>
                        <div className="text-sm text-muted-foreground">{factor.description}</div>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      factor.impact === 'positive' ? 'text-green-600' :
                      factor.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {factor.percentage > 0 ? '+' : ''}{factor.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketTrends.map((trend, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{trend.period}</span>
                      <div className="flex items-center gap-1">
                        {trend.trend_direction === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`font-bold ${
                          trend.change_percentage > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trend.change_percentage > 0 ? '+' : ''}{trend.change_percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trend.factors.map((factor, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Industry Benchmarks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Industry Benchmarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {industryBenchmarks.map((industry, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{industry.industry}</h4>
                      <Badge variant="secondary">+{industry.growth}%</Badge>
                    </div>
                    <div className={`text-2xl font-bold ${industry.color}`}>
                      {formatCurrency(industry.avg_salary)}
                    </div>
                    <p className="text-sm text-muted-foreground">Average annual salary</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills Premium */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                High-Value Skills Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillsPremiums.map((skill, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{skill.skill}</h4>
                      <Badge variant={skill.demand === 'Very High' ? 'default' : 'secondary'}>
                        {skill.demand}
                      </Badge>
                    </div>
                    <div className="text-xl font-bold text-green-600">+{skill.premium}%</div>
                    <p className="text-sm text-muted-foreground">Salary premium</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {locationFactors.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{location.city}</div>
                      <div className="text-sm text-muted-foreground">Cost of living: {location.cost_of_living}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{(location.factor * 100).toFixed(0)}%</div>
                      <div className="text-sm text-muted-foreground">of base rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="bg-primary/5 border-primary">
            <CardHeader>
              <CardTitle className="text-primary">Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <div className="font-medium">Develop High-Demand Skills</div>
                    <div className="text-sm text-muted-foreground">
                      Focus on Machine Learning and Cloud Architecture for 25-28% salary premium
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <div className="font-medium">Consider Market Timing</div>
                    <div className="text-sm text-muted-foreground">
                      Current market shows 12% growth - good time for role transition
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <div className="font-medium">Negotiate Strategically</div>
                    <div className="text-sm text-muted-foreground">
                      Your profile suggests potential for 75th percentile compensation
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};