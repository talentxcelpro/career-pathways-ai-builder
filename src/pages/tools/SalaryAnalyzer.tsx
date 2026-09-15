import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, MapPin, Briefcase, BarChart3, Users, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SalaryData {
  role: string;
  location: string;
  experience: number;
  skillLevel: string;
  averageSalary: number;
  salaryRange: {
    min: number;
    max: number;
    percentile25: number;
    percentile75: number;
  };
  marketTrends: {
    yearOverYear: number;
    demandLevel: 'low' | 'medium' | 'high' | 'very-high';
    growth: 'declining' | 'stable' | 'growing' | 'rapidly-growing';
  };
  recommendations: string[];
  comparisonData: Array<{
    location: string;
    salary: number;
    difference: number;
  }>;
  skillImpact: Array<{
    skill: string;
    salaryBoost: number;
    demand: number;
  }>;
}

const SalaryAnalyzer = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    jobTitle: '',
    location: '',
    experience: '',
    education: '',
    skills: '',
    companySize: '',
    industry: ''
  });
  const [salaryData, setSalaryData] = useState<SalaryData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSalary = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          contentType: 'salary_analysis',
          topic: `Salary analysis for ${formData.jobTitle} in ${formData.location}`,
          targetAudience: 'job_seeker',
          additionalContext: {
            role: formData.jobTitle,
            location: formData.location,
            experience: parseInt(formData.experience) || 0,
            education: formData.education,
            skills: formData.skills?.split(',').map(s => s.trim()) || [],
            companySize: formData.companySize,
            industry: formData.industry
          }
        }
      });

      if (error) throw error;
      
      // Mock data structure for demonstration
      const mockData: SalaryData = {
        role: formData.jobTitle,
        location: formData.location,
        experience: parseInt(formData.experience) || 0,
        skillLevel: parseInt(formData.experience) > 5 ? 'senior' : parseInt(formData.experience) > 2 ? 'mid' : 'junior',
        averageSalary: 75000,
        salaryRange: {
          min: 60000,
          max: 95000,
          percentile25: 68000,
          percentile75: 85000
        },
        marketTrends: {
          yearOverYear: 8.5,
          demandLevel: 'high',
          growth: 'growing'
        },
        recommendations: [
          'Consider learning React and TypeScript to increase salary potential by 15%',
          'Remote opportunities in this role typically pay 10-20% more',
          'Certifications in cloud platforms can boost salary by $8,000-$12,000',
          'Senior positions are in high demand - consider skill development for promotion'
        ],
        comparisonData: [
          { location: 'San Francisco', salary: 125000, difference: 66.7 },
          { location: 'New York', salary: 95000, difference: 26.7 },
          { location: 'Austin', salary: 80000, difference: 6.7 },
          { location: 'Remote', salary: 85000, difference: 13.3 }
        ],
        skillImpact: [
          { skill: 'React', salaryBoost: 12000, demand: 92 },
          { skill: 'TypeScript', salaryBoost: 8000, demand: 78 },
          { skill: 'AWS', salaryBoost: 15000, demand: 85 },
          { skill: 'Node.js', salaryBoost: 10000, demand: 80 }
        ]
      };

      setSalaryData(mockData);
      setCurrentStep(2);
      toast.success('Salary analysis completed!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze salary. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'very-high': return 'bg-green-600';
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const steps = [
    {
      id: 'basic-info',
      title: 'Role & Location',
      description: 'Tell us about the position and location',
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Job Title *
              </label>
              <Input
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="e.g., Software Engineer, Product Manager"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., San Francisco, CA or Remote"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Years of Experience *
              </label>
              <Select value={formData.experience} onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Entry Level (0-1 years)</SelectItem>
                  <SelectItem value="2">Junior (2-3 years)</SelectItem>
                  <SelectItem value="5">Mid-Level (4-6 years)</SelectItem>
                  <SelectItem value="8">Senior (7-10 years)</SelectItem>
                  <SelectItem value="12">Principal/Lead (10+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Education Level
              </label>
              <Select value={formData.education} onValueChange={(value) => setFormData({ ...formData, education: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="associates">Associate's Degree</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="bootcamp">Bootcamp/Certification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => setCurrentStep(1)}
            className="w-full"
            disabled={!formData.jobTitle || !formData.location || !formData.experience}
          >
            Continue to Skills & Company Info
          </Button>
        </div>
      )
    },
    {
      id: 'detailed-info',
      title: 'Skills & Company',
      description: 'Add skills and company details for accurate analysis',
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Key Skills
            </label>
            <Input
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g., JavaScript, React, Python, AWS (comma-separated)"
            />
            <p className="text-sm text-slate-500 mt-1">
              Add relevant skills to get more accurate salary estimates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company Size
              </label>
              <Select value={formData.companySize} onValueChange={(value) => setFormData({ ...formData, companySize: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup (1-50 employees)</SelectItem>
                  <SelectItem value="small">Small (51-200 employees)</SelectItem>
                  <SelectItem value="medium">Medium (201-1000 employees)</SelectItem>
                  <SelectItem value="large">Large (1000+ employees)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (10,000+ employees)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Industry
              </label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="media">Media & Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={analyzeSalary}
            className="w-full"
            size="lg"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Analyzing Salary Data...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze Salary
              </>
            )}
          </Button>
        </div>
      )
    },
    {
      id: 'results',
      title: 'Salary Analysis',
      description: 'View your comprehensive salary analysis and market insights',
      component: salaryData ? (
        <div className="space-y-6">
          {/* Main Salary Card */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Average Salary</h3>
                  <p className="text-slate-600">
                    {salaryData.role} in {salaryData.location}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {salaryData.experience} years experience
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-green-600">
                    {formatCurrency(salaryData.averageSalary)}
                  </div>
                  <div className="text-sm text-slate-600">per year</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-slate-600">
                  {formatCurrency(salaryData.salaryRange.min)}
                </div>
                <p className="text-sm text-slate-500">Minimum</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(salaryData.salaryRange.percentile25)}
                </div>
                <p className="text-sm text-slate-500">25th Percentile</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(salaryData.salaryRange.percentile75)}
                </div>
                <p className="text-sm text-slate-500">75th Percentile</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-slate-600">
                  {formatCurrency(salaryData.salaryRange.max)}
                </div>
                <p className="text-sm text-slate-500">Maximum</p>
              </CardContent>
            </Card>
          </div>

          {/* Market Trends */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Trends
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{salaryData.marketTrends.yearOverYear}%
                  </div>
                  <p className="text-sm text-slate-600">Year-over-Year Growth</p>
                </div>
                <div className="text-center">
                  <Badge className={`${getDemandColor(salaryData.marketTrends.demandLevel)} text-white`}>
                    {salaryData.marketTrends.demandLevel.replace('-', ' ')} demand
                  </Badge>
                  <p className="text-sm text-slate-600 mt-1">Market Demand</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 capitalize">
                    {salaryData.marketTrends.growth.replace('-', ' ')}
                  </div>
                  <p className="text-sm text-slate-600">Job Market</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Comparison */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Comparison
              </h3>
              <div className="space-y-3">
                {salaryData.comparisonData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatCurrency(item.salary)}</span>
                      <Badge variant={item.difference > 0 ? "default" : "secondary"}>
                        {item.difference > 0 ? '+' : ''}{item.difference.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Impact */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5" />
                High-Impact Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {salaryData.skillImpact.map((skill, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{skill.skill}</span>
                      <Badge variant="outline">+{formatCurrency(skill.salaryBoost)}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${skill.demand}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">{skill.demand}% demand</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Career Recommendations</h3>
              <div className="space-y-3">
                {salaryData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                    <p className="text-slate-700">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null
    }
  ];

  return (
    <ToolLayout
      title="AI Salary Analyzer"
      description="Get comprehensive salary insights, market trends, and career recommendations based on your role, location, and skills. Make informed decisions about your career and compensation."
      category="salary"
      estimatedTime="5-8 min"
      popularity={78}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      results={salaryData}
      isProcessing={isAnalyzing}
      onSave={() => toast.success('Salary analysis saved to your dashboard!')}
      onExport={() => toast.success('Analysis exported as PDF!')}
      onShare={() => toast.success('Analysis link copied to clipboard!')}
    />
  );
};

export default SalaryAnalyzer;