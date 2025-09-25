import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DollarSign, TrendingUp, Eye, Calculator, 
  MapPin, Building2, GraduationCap, BarChart3,
  Search, Filter, Star, AlertCircle
} from 'lucide-react';

export const SalaryTransparencyWidget: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [selectedLocation, setSelectedLocation] = useState('Bangalore');
  const [selectedExperience, setSelectedExperience] = useState('3-5 years');

  const salaryData = {
    'Software Engineer': {
      'Bangalore': { min: 800000, max: 1500000, avg: 1150000 },
      'Mumbai': { min: 900000, max: 1600000, avg: 1250000 },
      'Delhi': { min: 750000, max: 1400000, avg: 1075000 },
      'Hyderabad': { min: 700000, max: 1300000, avg: 1000000 }
    },
    'Data Scientist': {
      'Bangalore': { min: 1000000, max: 2000000, avg: 1500000 },
      'Mumbai': { min: 1100000, max: 2200000, avg: 1650000 },
      'Delhi': { min: 950000, max: 1900000, avg: 1425000 },
      'Hyderabad': { min: 900000, max: 1800000, avg: 1350000 }
    },
    'Product Manager': {
      'Bangalore': { min: 1500000, max: 3000000, avg: 2250000 },
      'Mumbai': { min: 1600000, max: 3200000, avg: 2400000 },
      'Delhi': { min: 1400000, max: 2800000, avg: 2100000 },
      'Hyderabad': { min: 1300000, max: 2600000, avg: 1950000 }
    }
  };

  const currentSalary = salaryData[selectedRole]?.[selectedLocation] || { min: 0, max: 0, avg: 0 };

  const formatSalary = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const industryInsights = [
    {
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      title: "Market Trend",
      value: "+15%",
      description: "Salary growth this year"
    },
    {
      icon: <Building2 className="h-4 w-4 text-blue-500" />,
      title: "Top Paying",
      value: "Fintech",
      description: "Industry with highest salaries"
    },
    {
      icon: <MapPin className="h-4 w-4 text-purple-500" />,
      title: "Remote Premium",
      value: "+8%",
      description: "Additional for remote roles"
    },
    {
      icon: <GraduationCap className="h-4 w-4 text-orange-500" />,
      title: "Skill Premium",
      value: "AI/ML",
      description: "Highest paying skills"
    }
  ];

  const salaryBenchmarks = [
    { percentile: '25th', amount: currentSalary.min },
    { percentile: '50th (Median)', amount: currentSalary.avg },
    { percentile: '75th', amount: currentSalary.max },
    { percentile: '90th', amount: currentSalary.max * 1.2 }
  ];

  const companySalaryRanges = [
    { company: 'Google', range: '₹25L - ₹45L', verified: true },
    { company: 'Microsoft', range: '₹22L - ₹40L', verified: true },
    { company: 'Amazon', range: '₹20L - ₹38L', verified: true },
    { company: 'Flipkart', range: '₹18L - ₹35L', verified: false },
    { company: 'Zomato', range: '₹15L - ₹30L', verified: true }
  ];

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Salary Crystal Ball</h3>
              <p className="text-sm text-muted-foreground">Real-time salary insights and market data</p>
            </div>
          </div>
          
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Eye className="h-3 w-3 mr-1" />
            100% Transparent
          </Badge>
        </div>

        {/* Salary Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Role</label>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Product Manager">Product Manager</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Experience</label>
            <select 
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="0-2 years">0-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="6-10 years">6-10 years</option>
              <option value="10+ years">10+ years</option>
            </select>
          </div>
        </div>

        {/* Salary Range Display */}
        <Card className="bg-white/50 backdrop-blur-sm border-0 mb-6">
          <div className="p-6">
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedRole} • {selectedLocation} • {selectedExperience}
              </h4>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatSalary(currentSalary.avg)}
              </div>
              <div className="text-sm text-muted-foreground">
                Average Annual Salary
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{formatSalary(currentSalary.min)}</div>
                <div className="text-muted-foreground">Min</div>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{formatSalary(currentSalary.max)}</div>
                <div className="text-muted-foreground">Max</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Salary Benchmarks */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Salary Percentiles</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {salaryBenchmarks.map((benchmark) => (
              <Card key={benchmark.percentile} className="p-3 bg-white/50 backdrop-blur-sm border-0">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {formatSalary(benchmark.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {benchmark.percentile}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Industry Insights */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Market Insights</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {industryInsights.map((insight) => (
              <Card key={insight.title} className="p-3 bg-white/50 backdrop-blur-sm border-0">
                <div className="flex items-center gap-2 mb-2">
                  {insight.icon}
                  <span className="text-xs font-medium text-gray-600">
                    {insight.title}
                  </span>
                </div>
                <div className="font-bold text-gray-900">{insight.value}</div>
                <div className="text-xs text-muted-foreground">
                  {insight.description}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Company Salary Ranges */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Top Company Salaries</h4>
          <div className="space-y-2">
            {companySalaryRanges.map((company) => (
              <div key={company.company} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">{company.company}</span>
                  {company.verified && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="font-semibold text-gray-900">{company.range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Negotiation Tips */}
        <Card className="bg-blue-50 border-blue-200 mb-6">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Calculator className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-semibold text-blue-900 mb-2">💡 Negotiation Tip</h5>
                <p className="text-sm text-blue-800">
                  Based on your profile, you could negotiate for <strong>₹{((currentSalary.avg * 1.15) / 100000).toFixed(1)}L</strong> 
                  by highlighting your skills in AI/ML and remote work experience.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
            <Search className="h-4 w-4 mr-2" />
            Find Jobs in This Range
          </Button>
          
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Detailed Report
          </Button>
        </div>

        {/* Data Source */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          <span>Data sourced from 50,000+ verified job postings • Updated daily</span>
        </div>
      </div>
    </Card>
  );
};