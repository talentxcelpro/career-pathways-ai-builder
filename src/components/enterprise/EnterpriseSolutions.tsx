import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Search, 
  Brain,
  Target,
  BarChart3,
  Shield,
  UserPlus,
  Award,
  Briefcase,
  Globe,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Settings,
  Calendar,
  FileText,
  Download,
  Upload,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [metrics, setMetrics] = useState<TalentMetric[]>([]);
  const [loading, setLoading] = useState(true);

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
        },
        {
          id: '3',
          title: 'Leadership Excellence',
          provider: 'Business Leaders Institute',
          duration: '4 weeks',
          cost: 950,
          participants: 8,
          completionRate: 95,
          status: 'completed'
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

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-gray-600">Generate insights and export data</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Workforce Analytics
            </CardTitle>
            <CardDescription>Comprehensive workforce insights</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Career Progression
            </CardTitle>
            <CardDescription>Internal mobility trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Skill Gap Report
            </CardTitle>
            <CardDescription>Skills analysis across teams</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>Automate your reporting workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Weekly Workforce Summary', frequency: 'Weekly', nextRun: 'Monday 9:00 AM' },
              { name: 'Monthly Skills Assessment', frequency: 'Monthly', nextRun: '1st of next month' },
              { name: 'Quarterly Performance Review', frequency: 'Quarterly', nextRun: 'Jan 1, 2024' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-gray-600">{report.frequency} • Next: {report.nextRun}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Enterprise Solutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
            Enterprise Solutions Platform
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive talent management and workforce optimization tools
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">{renderDashboard()}</TabsContent>
          <TabsContent value="employees">{renderEmployeeManagement()}</TabsContent>
          <TabsContent value="training">{renderTrainingHub()}</TabsContent>
          <TabsContent value="reports">{renderReports()}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};