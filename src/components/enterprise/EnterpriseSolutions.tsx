import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Brain,
  Target,
  BarChart3,
  UserPlus,
  Award,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  DollarSign,
  AlertTriangle,
  GitBranch,
  Network,
  Layers,
  Database,
  MessageSquare,
  Workflow,
  BookOpen,
  Zap,
  Plus,
  Filter,
  Eye,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { updateMetaTags } from '@/utils/metaTags';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  skills: string[];
  careerScore: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'on_leave';
}

interface TrainingProgram {
  id: string;
  title: string;
  provider: string;
  duration: string;
  cost: number;
  participants: number;
  completionRate: number;
  status: 'active' | 'planned' | 'completed';
}

interface TalentMetric {
  metric: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

export const EnterpriseSolutions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [metrics, setMetrics] = useState<TalentMetric[]>([]);
  const [loading, setLoading] = useState(true);

  // SEO Setup
  useEffect(() => {
    updateMetaTags({
      title: 'Enterprise Solutions - AI-Powered Talent Management | TalentXcel',
      description: 'Transform your workforce with AI-powered internal mobility, skill gap analysis, talent analytics, and specialized recruitment solutions. Reduce costs by 60% and improve retention by 40%.',
      keywords: ['enterprise talent management', 'AI recruitment', 'internal mobility', 'skill gap analysis', 'workforce analytics', 'corporate training', 'talent retention'],
      url: `${window.location.origin}/enterprise/solutions`,
      type: 'website',
      image: '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png'
    });

    // Add structured data for Enterprise Solutions
    const enterpriseSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "TalentXcel Enterprise Solutions",
      "description": "AI-powered talent management platform for enterprises",
      "provider": {
        "@type": "Organization",
        "name": "TalentXcel",
        "url": "https://talentxcel.in"
      },
      "serviceType": "Enterprise Talent Management",
      "areaServed": "IN",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Enterprise Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "AI-Powered Internal Mobility"
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Service",
              "name": "Skill Gap Analysis"
            }
          }
        ]
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(enterpriseSchema);
    script.id = 'enterprise-schema';
    
    const existing = document.getElementById('enterprise-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);

    return () => {
      const schemaScript = document.getElementById('enterprise-schema');
      if (schemaScript) schemaScript.remove();
    };
  }, []);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setEmployees([
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.j@company.com',
          department: 'Engineering',
          role: 'Senior Developer',
          skills: ['React', 'Node.js', 'AWS'],
          careerScore: 85,
          lastActivity: '2 hours ago',
          status: 'active'
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.c@company.com',
          department: 'Data Science',
          role: 'Data Scientist',
          skills: ['Python', 'ML', 'SQL'],
          careerScore: 92,
          lastActivity: '1 day ago',
          status: 'active'
        },
        {
          id: '3',
          name: 'Emily Davis',
          email: 'emily.d@company.com',
          department: 'Marketing',
          role: 'Marketing Manager',
          skills: ['SEO', 'Analytics', 'Content'],
          careerScore: 78,
          lastActivity: '3 hours ago',
          status: 'active'
        }
      ]);

      setTrainingPrograms([
        {
          id: '1',
          title: 'Advanced React Development',
          provider: 'TechEd Pro',
          duration: '6 weeks',
          cost: 1200,
          participants: 15,
          completionRate: 87,
          status: 'active'
        },
        {
          id: '2',
          title: 'Machine Learning Fundamentals',
          provider: 'AI Academy',
          duration: '8 weeks',
          cost: 1800,
          participants: 12,
          completionRate: 73,
          status: 'active'
        }
      ]);

      setMetrics([
        { metric: 'Employee Retention', current: 94, target: 95, trend: 'up', change: '+2%' },
        { metric: 'Internal Mobility', current: 23, target: 30, trend: 'up', change: '+15%' },
        { metric: 'Skill Gap Coverage', current: 78, target: 85, trend: 'up', change: '+8%' },
        { metric: 'Training ROI', current: 340, target: 300, trend: 'up', change: '+12%' }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  // Hero Section with detailed B2B value proposition
  const renderOverview = () => (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-2xl">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-6 font-display">
            Transform Your Workforce with AI-Powered Enterprise Solutions
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Unlock your organization's potential through intelligent talent management, 
            internal mobility, and strategic workforce planning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Schedule Demo
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Download ROI Calculator
            </Button>
          </div>
        </div>
      </div>

      {/* Core Enterprise Solutions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI-Powered Internal Mobility */}
        <Card className="p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">AI-Powered Internal Mobility & Career Pathing</h3>
              <p className="text-gray-600 text-lg">Connect your existing talent with internal opportunities through intelligent matching</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Input (For Your Company)
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="text-sm">• <strong>HRIS Integration:</strong> Anonymized employee data including skills, work history, performance reviews, and career interests</p>
                <p className="text-sm">• <strong>Career Passport Profiles:</strong> Employee's self-reported competencies and aspirations</p>
                <p className="text-sm">• <strong>Internal Job Listings:</strong> Current and future role requirements</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Workflow className="h-5 w-5 text-green-600" />
                The Process (TalentXcel's Role)
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <GitBranch className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Skill Graphing</p>
                    <p className="text-sm text-gray-600">Create comprehensive "Skill Graphs" for each employee based on HRIS data and Career Passport profiles</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Network className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Intelligent Matching Engine</p>
                    <p className="text-sm text-gray-600">Continuously scan internal opportunities and match with best-fit employees using advanced algorithms</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Personalized Recommendations</p>
                    <p className="text-sm text-gray-600">Employees receive tailored notifications for relevant roles, skill-building courses, and mentorship programs</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Output (For Your Company)
              </h4>
              <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                <p className="text-sm">• <strong>Talent Pipeline Dashboard:</strong> Clear view of internal talent readiness for key roles</p>
                <p className="text-sm">• <strong>Cost Reduction:</strong> 60% reduction in recruitment costs through internal hiring</p>
                <p className="text-sm">• <strong>Future Readiness:</strong> Strategic workforce planning aligned with business goals</p>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/enterprise/internal-mobility')} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Explore Internal Mobility Solution
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Skill Gap Analysis */}
        <Card className="p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Brain className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Skill Gap Analysis & Corporate Training Marketplace</h3>
              <p className="text-gray-600 text-lg">Proactively address skills shortages with curated training solutions</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Input
              </h4>
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <p className="text-sm">• <strong>Strategic Business Goals:</strong> Future skills needed for growth (AI, cloud security, data analytics)</p>
                <p className="text-sm">• <strong>Performance Management Integration:</strong> Current workforce capabilities assessment</p>
                <p className="text-sm">• <strong>Industry Benchmarks:</strong> Competitive skill requirements analysis</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                The Process
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Gap Identification</p>
                    <p className="text-sm text-gray-600">Analyze workforce skills against future needs, generating detailed reports at individual and department levels</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Marketplace Curation</p>
                    <p className="text-sm text-gray-600">Recommend relevant training from vetted providers (Coursera, Udacity, specialized centers)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Automated Enrollment</p>
                    <p className="text-sm text-gray-600">HR managers can enroll employees directly from the dashboard with one-click automation</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                Output
              </h4>
              <div className="bg-orange-50 p-4 rounded-lg space-y-2">
                <p className="text-sm">• <strong>Clear Upskilling Roadmap:</strong> Strategic workforce development plan</p>
                <p className="text-sm">• <strong>Competitive Advantage:</strong> Stay ahead in fast-changing markets</p>
                <p className="text-sm">• <strong>ROI Tracking:</strong> Measure training effectiveness and business impact</p>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/enterprise/skill-gap')} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Explore Skill Gap Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Additional Enterprise Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold">Talent Analytics & Reporting</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Real-time workforce insights, predictive analytics, and executive dashboards for data-driven talent decisions.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/enterprise/analytics')}
            className="w-full"
          >
            View Analytics Suite <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold">Specialized Recruitment</h3>
          </div>
          <p className="text-gray-600 mb-4">
            AI-powered recruitment for niche roles, executive search, and high-volume hiring with advanced matching algorithms.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/enterprise/recruitment')}
            className="w-full"
          >
            Explore Recruitment <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </div>

      {/* ROI & Benefits Section */}
      <Card className="p-8 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Measurable Business Impact</h2>
          <p className="text-xl text-gray-600">See the transformation our enterprise clients have achieved</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">60%</div>
            <p className="text-sm text-gray-600">Reduction in recruitment costs</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">40%</div>
            <p className="text-sm text-gray-600">Improvement in employee retention</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">75%</div>
            <p className="text-sm text-gray-600">Faster internal role fills</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">3.4x</div>
            <p className="text-sm text-gray-600">ROI on training investments</p>
          </div>
        </div>
      </Card>

      {/* CTA Section */}
      <Card className="p-8 bg-gradient-to-r from-primary to-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Workforce?</h2>
        <p className="text-xl mb-6 opacity-90">
          Join 500+ enterprises already using TalentXcel's AI-powered solutions
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
            Schedule Your Demo
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
            Download Case Studies
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-blue-600">
              Training initiatives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skill Gaps Closed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">187</div>
            <p className="text-xs text-green-600">
              This quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$234K</div>
            <p className="text-xs text-green-600">
              vs external hiring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Track your talent management KPIs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {metric.current}{metric.metric.includes('ROI') ? '%' : metric.metric.includes('Retention') ? '%' : ''}
                    </span>
                    <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'}>
                      {metric.change}
                    </Badge>
                  </div>
                </div>
                <Progress value={(metric.current / metric.target) * 100} />
                <div className="text-xs text-gray-500">
                  Target: {metric.target}{metric.metric.includes('ROI') ? '%' : metric.metric.includes('Retention') ? '%' : ''}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/enterprise/internal-mobility')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Internal Mobility
            </CardTitle>
            <CardDescription>Identify and develop internal talent</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Access Tool <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/enterprise/skill-gap')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-600" />
              Skill Gap Analysis
            </CardTitle>
            <CardDescription>Analyze and close skill gaps</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Access Tool <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/enterprise/analytics')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Talent Analytics
            </CardTitle>
            <CardDescription>Real-time workforce insights</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Access Tool <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderEmployeeManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-gray-600">Manage your workforce and career development</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search employees..." className="flex-1" />
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.role} • {employee.department}</p>
                    <p className="text-xs text-gray-500">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Career Score</div>
                    <div className="text-2xl font-bold text-green-600">{employee.careerScore}%</div>
                  </div>
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                    {employee.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Skills:</span>
                  <div className="flex gap-1">
                    {employee.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {employee.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{employee.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Last activity: {employee.lastActivity}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTrainingHub = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Training Hub</h2>
          <p className="text-gray-600">Manage training programs and skill development</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Program
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainingPrograms.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{program.title}</CardTitle>
                <Badge variant={program.status === 'active' ? 'default' : program.status === 'completed' ? 'secondary' : 'outline'}>
                  {program.status}
                </Badge>
              </div>
              <CardDescription>{program.provider}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <div className="font-medium">{program.duration}</div>
                </div>
                <div>
                  <span className="text-gray-600">Cost:</span>
                  <div className="font-medium">${program.cost}</div>
                </div>
                <div>
                  <span className="text-gray-600">Participants:</span>
                  <div className="font-medium">{program.participants}</div>
                </div>
                <div>
                  <span className="text-gray-600">Completion:</span>
                  <div className="font-medium">{program.completionRate}%</div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm">{program.completionRate}%</span>
                </div>
                <Progress value={program.completionRate} />
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading Enterprise Solutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Enterprise Solutions
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="employees" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Employee Management
            </TabsTrigger>
            <TabsTrigger value="training" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Training Hub
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            {renderEmployeeManagement()}
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            {renderTrainingHub()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};