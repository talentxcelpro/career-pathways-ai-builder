import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, MapPin, Briefcase, Users, Award } from 'lucide-react';

interface SalaryInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SalaryData {
  role: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  experience: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export const SalaryInsightsDialog: React.FC<SalaryInsightsDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [selectedRole, setSelectedRole] = useState('software-engineer');
  const [selectedLocation, setSelectedLocation] = useState('mumbai');
  const [selectedExperience, setSelectedExperience] = useState('mid-level');

  const salaryData: Record<string, SalaryData[]> = {
    'software-engineer': [
      {
        role: 'Software Engineer',
        location: 'Mumbai',
        minSalary: 600000,
        maxSalary: 1200000,
        avgSalary: 900000,
        experience: 'Mid Level (3-5 years)',
        trend: 'up',
        trendPercentage: 12
      },
      {
        role: 'Software Engineer',
        location: 'Bangalore',
        minSalary: 700000,
        maxSalary: 1400000,
        avgSalary: 1050000,
        experience: 'Mid Level (3-5 years)',
        trend: 'up',
        trendPercentage: 15
      },
      {
        role: 'Software Engineer',
        location: 'Delhi',
        minSalary: 650000,
        maxSalary: 1300000,
        avgSalary: 975000,
        experience: 'Mid Level (3-5 years)',
        trend: 'up',
        trendPercentage: 10
      }
    ],
    'product-manager': [
      {
        role: 'Product Manager',
        location: 'Mumbai',
        minSalary: 1200000,
        maxSalary: 2500000,
        avgSalary: 1850000,
        experience: 'Mid Level (3-5 years)',
        trend: 'up',
        trendPercentage: 18
      },
      {
        role: 'Product Manager',
        location: 'Bangalore',
        minSalary: 1400000,
        maxSalary: 2800000,
        avgSalary: 2100000,
        experience: 'Mid Level (3-5 years)',
        trend: 'up',
        trendPercentage: 20
      }
    ],
    'data-scientist': [
      {
        role: 'Data Scientist',
        location: 'Mumbai',
        minSalary: 800000,
        maxSalary: 1800000,
        avgSalary: 1300000,
        experience: 'Mid Level (3-5 years)',
        trend: 'up',
        trendPercentage: 25
      },
      {
        role: 'Data Scientist',
        location: 'Bangalore',
        minSalary: 900000,
        maxSalary: 2000000,
        avgSalary: 1450000,
        experience: 'Mid Level (3-5 years)',
        trend: 'up',
        trendPercentage: 30
      }
    ]
  };

  const roles = [
    { value: 'software-engineer', label: 'Software Engineer' },
    { value: 'product-manager', label: 'Product Manager' },
    { value: 'data-scientist', label: 'Data Scientist' },
    { value: 'ui-ux-designer', label: 'UI/UX Designer' },
    { value: 'marketing-manager', label: 'Marketing Manager' }
  ];

  const locations = [
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'pune', label: 'Pune' },
    { value: 'hyderabad', label: 'Hyderabad' }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid-level', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior (6-8 years)' },
    { value: 'lead', label: 'Lead (8+ years)' }
  ];

  const currentData = salaryData[selectedRole] || [];
  const selectedLocationData = currentData.find(data => 
    data.location.toLowerCase() === selectedLocation
  ) || currentData[0];

  const formatSalary = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const salaryBenchmarks = [
    { title: '25th Percentile', amount: selectedLocationData?.minSalary || 0, description: 'Entry level salaries' },
    { title: '50th Percentile (Median)', amount: selectedLocationData?.avgSalary || 0, description: 'Average market rate' },
    { title: '75th Percentile', amount: selectedLocationData?.maxSalary || 0, description: 'Top performer salaries' }
  ];

  const marketInsights = [
    {
      icon: TrendingUp,
      title: 'Market Trend',
      value: `+${selectedLocationData?.trendPercentage || 0}%`,
      description: 'Salary growth vs last year',
      color: 'text-green-600'
    },
    {
      icon: Users,
      title: 'Demand',
      value: 'High',
      description: 'Job market demand',
      color: 'text-blue-600'
    },
    {
      icon: Award,
      title: 'Competition',
      value: 'Medium',
      description: 'Application competition',
      color: 'text-yellow-600'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Salary Insights & Market Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Job Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Experience Level</label>
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Salary Info */}
          {selectedLocationData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {selectedLocationData.role} in {selectedLocationData.location}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatSalary(selectedLocationData.avgSalary)}
                    </div>
                    <div className="text-sm text-gray-600">Average Salary</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {formatSalary(selectedLocationData.minSalary)} - {formatSalary(selectedLocationData.maxSalary)}
                    </div>
                    <div className="text-sm text-gray-600">Salary Range</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-semibold text-green-600">
                        +{selectedLocationData.trendPercentage}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">YoY Growth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Salary Benchmarks */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Salary Benchmarks</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {salaryBenchmarks.map((benchmark, index) => (
                <Card key={index}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatSalary(benchmark.amount)}
                    </div>
                    <div className="font-medium">{benchmark.title}</div>
                    <div className="text-sm text-gray-600">{benchmark.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Market Insights */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Market Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {marketInsights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-8 w-8 ${insight.color}`} />
                        <div>
                          <div className={`text-xl font-bold ${insight.color}`}>
                            {insight.value}
                          </div>
                          <div className="font-medium">{insight.title}</div>
                          <div className="text-sm text-gray-600">{insight.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Salary Negotiation Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Research market rates thoroughly before negotiations</li>
                <li>• Consider total compensation including benefits, equity, and perks</li>
                <li>• Highlight your unique skills and achievements</li>
                <li>• Be prepared to justify your salary expectations</li>
                <li>• Consider non-salary benefits if base salary is fixed</li>
                <li>• Time your negotiation appropriately (after job offer)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};