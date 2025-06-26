
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Clock,
  BarChart3,
  Lightbulb,
  Target,
  Zap,
  Shield,
  Briefcase
} from 'lucide-react';

interface CareerSwitchAnalysis {
  from_role: string;
  to_role: string;
  from_industry: string;
  to_industry: string;
  difficulty_score: number;
  time_estimate_months: number;
  salary_change_percentage: number;
  risk_factors: string[];
  opportunities: string[];
  required_skills: string[];
  recommended_steps: string[];
  market_demand_score: number;
}

const CareerSwitch = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    fromRole: '',
    toRole: '',
    fromIndustry: '',
    toIndustry: '',
    currentSalary: '',
    experienceYears: '',
    location: '',
    riskTolerance: '' // low, medium, high
  });
  const [analysis, setAnalysis] = useState<CareerSwitchAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeCareerSwitch = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis with mock data
      const mockAnalysis: CareerSwitchAnalysis = {
        from_role: formData.fromRole,
        to_role: formData.toRole,
        from_industry: formData.fromIndustry,
        to_industry: formData.toIndustry,
        difficulty_score: Math.floor(Math.random() * 10) + 1,
        time_estimate_months: Math.floor(Math.random() * 24) + 6,
        salary_change_percentage: Math.floor(Math.random() * 60) - 20, // -20% to +40%
        market_demand_score: Math.floor(Math.random() * 10) + 1,
        risk_factors: [
          'Significant skill gap in required technologies',
          'High competition in target industry',
          'Potential temporary salary reduction',
          'Need for additional certifications'
        ],
        opportunities: [
          'Growing market demand in target role',
          'Transferable skills from current position',
          'Better work-life balance prospects',
          'Higher long-term earning potential'
        ],
        required_skills: [
          'Python Programming',
          'Data Analysis',
          'Machine Learning',
          'SQL Databases',
          'Statistical Modeling',
          'Data Visualization'
        ],
        recommended_steps: [
          'Complete online courses in data science fundamentals',
          'Build a portfolio of data analysis projects',
          'Obtain relevant certifications (e.g., AWS, Google Cloud)',
          'Network with professionals in the target industry',
          'Consider a gradual transition through freelance projects',
          'Apply for entry-level positions or internships'
        ]
      };

      setAnalysis(mockAnalysis);
      setCurrentStep(3);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze career switch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysis = async () => {
    if (!analysis) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('career_switches')
        .insert({
          user_id: user.id,
          ...analysis
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Career switch analysis saved successfully.",
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: "Error",
        description: "Failed to save analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (score: number) => {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyLabel = (score: number) => {
    if (score <= 3) return 'Easy';
    if (score <= 6) return 'Moderate';
    return 'Challenging';
  };

  const getMarketDemandColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMarketDemandLabel = (score: number) => {
    if (score >= 8) return 'High Demand';
    if (score >= 5) return 'Moderate Demand';
    return 'Low Demand';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <ArrowRight className="h-8 w-8 text-blue-600 mr-3" />
            Career Switch Evaluator
          </h1>
          <p className="text-gray-600">Analyze the risks, opportunities, and roadmap for your career change</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Career Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Career Information
              </CardTitle>
              <CardDescription>Tell us about your current and target career</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Current Career</h3>
                  
                  <div>
                    <Label htmlFor="fromRole">Current Job Title</Label>
                    <Input
                      id="fromRole"
                      value={formData.fromRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, fromRole: e.target.value }))}
                      placeholder="e.g., Marketing Manager"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fromIndustry">Current Industry</Label>
                    <Select value={formData.fromIndustry} onValueChange={(value) => setFormData(prev => ({ ...prev, fromIndustry: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select current industry" />
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
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Target Career</h3>
                  
                  <div>
                    <Label htmlFor="toRole">Target Job Title</Label>
                    <Input
                      id="toRole"
                      value={formData.toRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, toRole: e.target.value }))}
                      placeholder="e.g., Data Scientist"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="toIndustry">Target Industry</Label>
                    <Select value={formData.toIndustry} onValueChange={(value) => setFormData(prev => ({ ...prev, toIndustry: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select target industry" />
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
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.fromRole || !formData.toRole || !formData.fromIndustry || !formData.toIndustry}
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Additional Details */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Additional Details
              </CardTitle>
              <CardDescription>Help us provide more accurate analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="experienceYears">Years of Experience</Label>
                  <Select value={formData.experienceYears} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceYears: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="11-15">11-15 years</SelectItem>
                      <SelectItem value="15+">15+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currentSalary">Current Salary Range (Optional)</Label>
                  <Select value={formData.currentSalary} onValueChange={(value) => setFormData(prev => ({ ...prev, currentSalary: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select salary range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30-50">$30,000 - $50,000</SelectItem>
                      <SelectItem value="50-75">$50,000 - $75,000</SelectItem>
                      <SelectItem value="75-100">$75,000 - $100,000</SelectItem>
                      <SelectItem value="100-150">$100,000 - $150,000</SelectItem>
                      <SelectItem value="150+">$150,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., San Francisco, CA"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select value={formData.riskTolerance} onValueChange={(value) => setFormData(prev => ({ ...prev, riskTolerance: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select risk tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Prefer gradual transition</SelectItem>
                      <SelectItem value="medium">Medium - Some risk acceptable</SelectItem>
                      <SelectItem value="high">High - Ready for big changes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Previous
                </Button>
                <Button 
                  onClick={analyzeCareerSwitch}
                  disabled={isAnalyzing || !formData.experienceYears || !formData.riskTolerance}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyze Career Switch
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Analysis Results */}
        {currentStep === 3 && analysis && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold mb-1 ${getDifficultyColor(analysis.difficulty_score)}`}>
                    {analysis.difficulty_score}/10
                  </div>
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className={`text-xs font-medium ${getDifficultyColor(analysis.difficulty_score)}`}>
                    {getDifficultyLabel(analysis.difficulty_score)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold mb-1 text-blue-600">
                    {analysis.time_estimate_months}
                  </div>
                  <p className="text-sm text-gray-600">Months</p>
                  <p className="text-xs font-medium text-blue-600">Timeline</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold mb-1 flex items-center justify-center ${
                    analysis.salary_change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analysis.salary_change_percentage >= 0 ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
                    {Math.abs(analysis.salary_change_percentage)}%
                  </div>
                  <p className="text-sm text-gray-600">Salary Change</p>
                  <p className={`text-xs font-medium ${analysis.salary_change_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.salary_change_percentage >= 0 ? 'Increase' : 'Decrease'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold mb-1 ${getMarketDemandColor(analysis.market_demand_score)}`}>
                    {analysis.market_demand_score}/10
                  </div>
                  <p className="text-sm text-gray-600">Market Demand</p>
                  <p className={`text-xs font-medium ${getMarketDemandColor(analysis.market_demand_score)}`}>
                    {getMarketDemandLabel(analysis.market_demand_score)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Career Transition Visual */}
            <Card>
              <CardHeader>
                <CardTitle>Career Transition Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <Briefcase className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">{analysis.from_role}</h3>
                    <p className="text-sm text-gray-600">{analysis.from_industry}</p>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <ArrowRight className="h-8 w-8 text-gray-400 mx-8" />
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold">{analysis.to_role}</h3>
                    <p className="text-sm text-gray-600">{analysis.to_industry}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors and Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.risk_factors.map((risk, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Shield className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{risk}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.opportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Zap className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{opportunity}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Required Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Required Skills
                </CardTitle>
                <CardDescription>Skills you'll need to develop for the transition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.required_skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Recommended Action Steps
                </CardTitle>
                <CardDescription>Your roadmap to making the career switch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.recommended_steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button onClick={() => setCurrentStep(1)} variant="outline">
                Analyze Another Switch
              </Button>
              <Button onClick={saveAnalysis}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Analysis
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerSwitch;
