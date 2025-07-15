import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Target, 
  BookOpen, 
  Award,
  BarChart3,
  Calculator,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Equal,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  price: number;
  category: 'certification' | 'bootcamp' | 'degree' | 'online_course';
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  completionRate: number;
}

interface ROIAnalysis {
  courseId: string;
  course: Course;
  investment: {
    totalCost: number;
    timeCost: number; // in hours
    opportunityCost: number;
  };
  projectedReturns: {
    salaryIncrease: {
      immediate: number;
      oneYear: number;
      threeYear: number;
      fiveYear: number;
    };
    jobOpportunities: {
      current: number;
      afterCourse: number;
      percentageIncrease: number;
    };
    promotionChance: number;
  };
  roiMetrics: {
    breakEvenMonths: number;
    threeYearROI: number;
    fiveYearROI: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  marketData: {
    averageSalaryBefore: number;
    averageSalaryAfter: number;
    demandGrowth: number;
    industryTrend: 'growing' | 'stable' | 'declining';
  };
}

interface SalaryProjection {
  currentSalary: number;
  projectedSalaries: Array<{
    year: number;
    withoutLearning: number;
    withLearning: number;
    difference: number;
  }>;
  cumulativeBenefit: number;
  careerTrajectory: {
    currentLevel: string;
    targetLevel: string;
    probabilityOfPromotion: number;
  };
}

const LearningROIEngine: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [currentSalary, setCurrentSalary] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [roiAnalysis, setRoiAnalysis] = useState<ROIAnalysis | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  // Mock course data
  const courses: Course[] = [
    {
      id: '1',
      title: 'AWS Cloud Practitioner Certification',
      provider: 'Amazon Web Services',
      duration: '40 hours',
      price: 299,
      category: 'certification',
      skills: ['Cloud Computing', 'AWS', 'Cloud Security', 'Cost Optimization'],
      difficulty: 'beginner',
      rating: 4.7,
      completionRate: 78
    },
    {
      id: '2',
      title: 'Full Stack Web Development Bootcamp',
      provider: 'Tech Academy',
      duration: '24 weeks',
      price: 12999,
      category: 'bootcamp',
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'HTML/CSS'],
      difficulty: 'intermediate',
      rating: 4.5,
      completionRate: 89
    },
    {
      id: '3',
      title: 'Data Science Professional Certificate',
      provider: 'IBM via Coursera',
      duration: '6 months',
      price: 468,
      category: 'certification',
      skills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'Pandas', 'Scikit-learn'],
      difficulty: 'intermediate',
      rating: 4.6,
      completionRate: 72
    },
    {
      id: '4',
      title: 'Google UX Design Certificate',
      provider: 'Google via Coursera',
      duration: '6 months',
      price: 468,
      category: 'certification',
      skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping', 'Wireframing'],
      difficulty: 'beginner',
      rating: 4.8,
      completionRate: 85
    }
  ];

  const calculateROI = async () => {
    if (!selectedCourse || !currentSalary) {
      toast({
        title: "Missing Information",
        description: "Please select a course and enter your current salary.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      // Simulate AI calculation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const course = courses.find(c => c.id === selectedCourse)!;
      const salary = parseInt(currentSalary.replace(/[^0-9]/g, ''));
      
      // Mock ROI calculation based on course type and market data
      const mockAnalysis: ROIAnalysis = {
        courseId: course.id,
        course,
        investment: {
          totalCost: course.price,
          timeCost: course.category === 'bootcamp' ? 960 : 160, // hours
          opportunityCost: course.category === 'bootcamp' ? 25000 : 5000
        },
        projectedReturns: {
          salaryIncrease: {
            immediate: course.category === 'certification' ? 8000 : 15000,
            oneYear: course.category === 'certification' ? 12000 : 25000,
            threeYear: course.category === 'certification' ? 20000 : 45000,
            fiveYear: course.category === 'certification' ? 30000 : 65000
          },
          jobOpportunities: {
            current: 150,
            afterCourse: course.category === 'certification' ? 225 : 400,
            percentageIncrease: course.category === 'certification' ? 50 : 167
          },
          promotionChance: course.category === 'certification' ? 35 : 65
        },
        roiMetrics: {
          breakEvenMonths: course.category === 'certification' ? 8 : 18,
          threeYearROI: course.category === 'certification' ? 450 : 280,
          fiveYearROI: course.category === 'certification' ? 750 : 420,
          riskLevel: course.category === 'certification' ? 'low' : 'medium'
        },
        marketData: {
          averageSalaryBefore: salary,
          averageSalaryAfter: salary + (course.category === 'certification' ? 15000 : 30000),
          demandGrowth: 24,
          industryTrend: 'growing'
        }
      };

      setRoiAnalysis(mockAnalysis);
      toast({
        title: "ROI Analysis Complete",
        description: "Your learning investment analysis is ready!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate ROI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const generateSalaryProjection = (): SalaryProjection => {
    if (!roiAnalysis) return {} as SalaryProjection;
    
    const currentSal = parseInt(currentSalary.replace(/[^0-9]/g, ''));
    const projections = [];
    let cumulativeBenefit = 0;

    for (let year = 1; year <= 10; year++) {
      const withoutLearning = currentSal * Math.pow(1.03, year); // 3% annual growth
      const learningBoost = year === 1 ? roiAnalysis.projectedReturns.salaryIncrease.oneYear :
                          year <= 3 ? roiAnalysis.projectedReturns.salaryIncrease.threeYear :
                          roiAnalysis.projectedReturns.salaryIncrease.fiveYear;
      const withLearning = (currentSal + learningBoost) * Math.pow(1.05, year); // 5% growth after upskilling
      const difference = withLearning - withoutLearning;
      
      cumulativeBenefit += difference;
      
      projections.push({
        year,
        withoutLearning: Math.round(withoutLearning),
        withLearning: Math.round(withLearning),
        difference: Math.round(difference)
      });
    }

    return {
      currentSalary: currentSal,
      projectedSalaries: projections,
      cumulativeBenefit: Math.round(cumulativeBenefit),
      careerTrajectory: {
        currentLevel: 'Mid-Level',
        targetLevel: 'Senior',
        probabilityOfPromotion: roiAnalysis.projectedReturns.promotionChance
      }
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'stable': return <Equal className="h-4 w-4 text-yellow-600" />;
      case 'declining': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Equal className="h-4 w-4 text-gray-600" />;
    }
  };

  const salaryProjection = roiAnalysis ? generateSalaryProjection() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning ROI Engine</h1>
          <p className="text-lg text-gray-600 mt-2">
            Calculate the return on investment for your learning journey
          </p>
        </div>
      </div>

      {!roiAnalysis ? (
        /* ROI Calculator Form */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Calculate Learning ROI
            </CardTitle>
            <CardDescription>
              Enter your details to get personalized ROI analysis for courses and certifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="course">Select Course/Certification</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} - {formatCurrency(course.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currentSalary">Current Annual Salary</Label>
                <Input
                  id="currentSalary"
                  placeholder="e.g., $75,000"
                  value={currentSalary}
                  onChange={(e) => setCurrentSalary(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  placeholder="e.g., Software Developer"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {selectedCourse && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  {(() => {
                    const course = courses.find(c => c.id === selectedCourse)!;
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Provider:</span>
                            <div className="font-medium">{course.provider}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <div className="font-medium">{course.duration}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Price:</span>
                            <div className="font-medium">{formatCurrency(course.price)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Rating:</span>
                            <div className="font-medium">{course.rating}/5.0</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-gray-600 text-sm">Skills:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {course.skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={calculateROI}
              disabled={isCalculating || !selectedCourse || !currentSalary}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600"
              size="lg"
            >
              {isCalculating ? (
                <>
                  <Calculator className="h-4 w-4 mr-2 animate-spin" />
                  Calculating ROI...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Learning ROI
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ROI Analysis Results */
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {roiAnalysis.roiMetrics.breakEvenMonths}
                </div>
                <div className="text-sm text-gray-600 mt-1">Months to Break Even</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {roiAnalysis.roiMetrics.threeYearROI}%
                </div>
                <div className="text-sm text-gray-600 mt-1">3-Year ROI</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(roiAnalysis.projectedReturns.salaryIncrease.fiveYear)}
                </div>
                <div className="text-sm text-gray-600 mt-1">5-Year Salary Boost</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {roiAnalysis.projectedReturns.jobOpportunities.percentageIncrease}%
                </div>
                <div className="text-sm text-gray-600 mt-1">More Job Opportunities</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="analysis" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analysis">ROI Analysis</TabsTrigger>
              <TabsTrigger value="projection">Salary Projection</TabsTrigger>
              <TabsTrigger value="market">Market Data</TabsTrigger>
              <TabsTrigger value="comparison">Compare Options</TabsTrigger>
            </TabsList>

            {/* ROI Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Investment Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Course Cost</span>
                      <span className="font-semibold">{formatCurrency(roiAnalysis.investment.totalCost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Time Investment</span>
                      <span className="font-semibold">{roiAnalysis.investment.timeCost} hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Opportunity Cost</span>
                      <span className="font-semibold">{formatCurrency(roiAnalysis.investment.opportunityCost)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total Investment</span>
                        <span>{formatCurrency(roiAnalysis.investment.totalCost + roiAnalysis.investment.opportunityCost)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Projected Returns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Immediate (Year 1)</span>
                      <span className="font-semibold text-green-600">
                        +{formatCurrency(roiAnalysis.projectedReturns.salaryIncrease.immediate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>3-Year Increase</span>
                      <span className="font-semibold text-green-600">
                        +{formatCurrency(roiAnalysis.projectedReturns.salaryIncrease.threeYear)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>5-Year Increase</span>
                      <span className="font-semibold text-green-600">
                        +{formatCurrency(roiAnalysis.projectedReturns.salaryIncrease.fiveYear)}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span>Promotion Chance</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {roiAnalysis.projectedReturns.promotionChance}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium">Risk Level</span>
                    <Badge className={getRiskColor(roiAnalysis.roiMetrics.riskLevel)}>
                      {roiAnalysis.roiMetrics.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <Progress 
                    value={roiAnalysis.roiMetrics.riskLevel === 'low' ? 25 : 
                           roiAnalysis.roiMetrics.riskLevel === 'medium' ? 60 : 90} 
                    className="mb-2" 
                  />
                  <p className="text-sm text-gray-600">
                    Based on market demand, skill relevance, and career trajectory analysis
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Salary Projection Tab */}
            <TabsContent value="projection" className="space-y-6">
              {salaryProjection && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <LineChart className="h-5 w-5 mr-2" />
                        10-Year Salary Projection
                      </CardTitle>
                      <CardDescription>
                        Compare your earning potential with and without this learning investment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {salaryProjection.projectedSalaries.slice(0, 5).map((projection) => (
                          <div key={projection.year} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="text-sm font-medium text-gray-900">
                                Year {projection.year}
                              </div>
                            </div>
                            <div className="flex items-center space-x-6 text-sm">
                              <div className="text-gray-600">
                                Without: {formatCurrency(projection.withoutLearning)}
                              </div>
                              <div className="text-green-600 font-semibold">
                                With: {formatCurrency(projection.withLearning)}
                              </div>
                              <div className="text-blue-600 font-bold">
                                +{formatCurrency(projection.difference)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(salaryProjection.cumulativeBenefit)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Total additional earnings over 10 years
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Career Trajectory</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {salaryProjection.careerTrajectory.currentLevel}
                          </div>
                          <div className="text-sm text-gray-600">Current Level</div>
                        </div>
                        <ArrowRight className="h-6 w-6 text-blue-600" />
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {salaryProjection.careerTrajectory.targetLevel}
                          </div>
                          <div className="text-sm text-gray-600">Target Level</div>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <Progress value={salaryProjection.careerTrajectory.probabilityOfPromotion} className="mb-2" />
                        <div className="text-sm text-gray-600">
                          {salaryProjection.careerTrajectory.probabilityOfPromotion}% promotion probability
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Market Data Tab */}
            <TabsContent value="market" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Current Average Salary</span>
                      <span className="font-semibold">
                        {formatCurrency(roiAnalysis.marketData.averageSalaryBefore)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Post-Training Average</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(roiAnalysis.marketData.averageSalaryAfter)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Industry Trend</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(roiAnalysis.marketData.industryTrend)}
                        <span className="capitalize">{roiAnalysis.marketData.industryTrend}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Demand Growth</span>
                      <Badge className="bg-green-100 text-green-800">
                        +{roiAnalysis.marketData.demandGrowth}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="h-5 w-5 mr-2" />
                      Job Market Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Current Opportunities</span>
                      <span className="font-semibold">
                        {roiAnalysis.projectedReturns.jobOpportunities.current.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>After Training</span>
                      <span className="font-semibold text-green-600">
                        {roiAnalysis.projectedReturns.jobOpportunities.afterCourse.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Increase</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        +{roiAnalysis.projectedReturns.jobOpportunities.percentageIncrease}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Course Comparison Tab */}
            <TabsContent value="comparison" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compare Learning Options</CardTitle>
                  <CardDescription>
                    See how different courses and certifications stack up in terms of ROI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.map((course) => {
                      const isSelected = course.id === selectedCourse;
                      return (
                        <div 
                          key={course.id} 
                          className={`p-4 border rounded-lg ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{course.title}</h3>
                              <p className="text-sm text-gray-600">{course.provider}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span>{course.duration}</span>
                                <span>{formatCurrency(course.price)}</span>
                                <Badge variant="outline">{course.difficulty}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              {isSelected ? (
                                <Badge className="bg-green-100 text-green-800">Selected</Badge>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedCourse(course.id)}
                                >
                                  Analyze ROI
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setRoiAnalysis(null)}
              className="flex-1"
            >
              Calculate New ROI
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600">
              Enroll in Course
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningROIEngine;