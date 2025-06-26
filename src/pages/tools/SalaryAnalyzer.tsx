
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, MapPin, Users, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SalaryAnalyzer = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    location: '',
    experienceLevel: '',
    industry: ''
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const experienceLevels = [
    { value: 'Entry', label: 'Entry Level (0-2 years)' },
    { value: 'Mid', label: 'Mid Level (3-5 years)' },
    { value: 'Senior', label: 'Senior Level (6-10 years)' },
    { value: 'Lead', label: 'Lead Level (10+ years)' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const analyzeSalary = async () => {
    if (!formData.jobTitle || !formData.location || !formData.experienceLevel) return;
    
    setAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-tools', {
        body: {
          tool: 'salary-analyzer',
          data: formData,
          userId: user?.id
        }
      });

      if (error) throw error;
      setResults(data);
    } catch (error) {
      console.error('Salary analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveResults = async () => {
    if (!results) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('saved_tool_results').insert({
        user_id: user.id,
        tool_name: 'salary-analyzer',
        title: `Salary Analysis: ${formData.jobTitle} in ${formData.location}`,
        content: { formData, results }
      });
      
      alert('Results saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Salary Analyzer</h1>
          <p className="text-gray-600">
            Get accurate salary insights and market data for your role and location
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Job Details
              </CardTitle>
              <CardDescription>
                Enter your job information to get salary insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div>
                <Label>Experience Level</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="industry">Industry (Optional)</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g., Technology"
                />
              </div>

              <Button 
                onClick={analyzeSalary}
                disabled={analyzing || !formData.jobTitle || !formData.location || !formData.experienceLevel}
                className="w-full"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Salary'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Salary Analysis
                </span>
                {results && (
                  <Button variant="outline" size="sm" onClick={saveResults}>
                    Save Results
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyzing ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing salary data...</p>
                </div>
              ) : results ? (
                <div className="space-y-6">
                  {/* Average Salary */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${results.averageSalary?.toLocaleString()}
                    </div>
                    <p className="text-gray-600">Average Annual Salary</p>
                  </div>

                  {/* Salary Range */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>${results.salaryRange?.min?.toLocaleString()}</span>
                      <span>${results.salaryRange?.max?.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={((results.averageSalary - results.salaryRange?.min) / (results.salaryRange?.max - results.salaryRange?.min)) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500 text-center">Salary Range</p>
                  </div>

                  {/* Insights */}
                  <div>
                    <h4 className="font-medium mb-3">Key Insights</h4>
                    <div className="space-y-2">
                      {results.insights?.map((insight: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <TrendingUp className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Market Data */}
                  {results.marketData && results.marketData.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Market Data Sources</h4>
                      <div className="space-y-2">
                        {results.marketData.slice(0, 3).map((data: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm">{data.location}</span>
                            </div>
                            <Badge variant="outline">
                              ${data.salary_range_min?.toLocaleString()} - ${data.salary_range_max?.toLocaleString()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter job details to see salary analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalaryAnalyzer;
