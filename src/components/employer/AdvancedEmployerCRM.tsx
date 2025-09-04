import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Phone,
  FileText,
  Clock,
  Star,
  Filter,
  Search,
  Download,
  Upload,
  Settings,
  Plus,
  CheckCircle,
  AlertTriangle,
  Activity,
  BarChart3
} from 'lucide-react';
import { TieredAccessGuard } from '@/components/access/TieredAccessGuard';
import { UsageMeter } from '@/components/ui/usage-meter';

interface CandidateData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  status: 'new' | 'contacted' | 'interview' | 'offer' | 'hired' | 'rejected';
  score: number;
  lastContact: Date;
  source: string;
  experience: number;
  expectedSalary?: number;
  notes: string[];
  tags: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
}

interface CRMStats {
  totalCandidates: number;
  activePipeline: number;
  monthlyHires: number;
  conversionRate: number;
  avgTimeToHire: number;
  responseRate: number;
}

export const AdvancedEmployerCRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real app this would come from your CRM API
  const crmStats: CRMStats = {
    totalCandidates: 247,
    activePipeline: 64,
    monthlyHires: 8,
    conversionRate: 12.5,
    avgTimeToHire: 21,
    responseRate: 78.3
  };

  const mockCandidates: CandidateData[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh.k@example.com',
      phone: '+91 98765 43210',
      position: 'Senior React Developer',
      status: 'interview',
      score: 94,
      lastContact: new Date('2024-01-15'),
      source: 'LinkedIn',
      experience: 5,
      expectedSalary: 1200000,
      notes: ['Strong technical skills', 'Available in 30 days'],
      tags: ['React', 'TypeScript', 'Leadership'],
      resumeUrl: '/mock-resume.pdf',
      linkedinUrl: 'https://linkedin.com/in/rajeshk'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya.s@example.com',
      position: 'DevOps Engineer',
      status: 'offer',
      score: 88,
      lastContact: new Date('2024-01-14'),
      source: 'TalentXcel',
      experience: 4,
      expectedSalary: 1000000,
      notes: ['Excellent problem-solving', 'Team player'],
      tags: ['AWS', 'Docker', 'Kubernetes']
    },
    {
      id: '3',
      name: 'Arjun Patel',
      email: 'arjun.p@example.com',
      position: 'Frontend Developer',
      status: 'contacted',
      score: 76,
      lastContact: new Date('2024-01-13'),
      source: 'Referral',
      experience: 3,
      expectedSalary: 800000,
      notes: ['Quick learner', 'Good cultural fit'],
      tags: ['Vue.js', 'JavaScript', 'UI/UX']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for candidates:`, selectedCandidates);
    // Implement bulk actions like email, status update, etc.
  };

  return (
    <TieredAccessGuard
      feature="advanced_crm"
      requiredTier="pro"
      fallback={
        <Card className="p-8 text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Advanced CRM</h3>
          <p className="text-muted-foreground mb-4">
            Upgrade to Pro to access advanced candidate relationship management features.
          </p>
          <Button>Upgrade to Pro</Button>
        </Card>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Advanced CRM</h1>
            <p className="text-muted-foreground">
              Manage your candidate pipeline with AI-powered insights
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          </div>
        </div>

        {/* Usage Meters */}
        <div className="grid md:grid-cols-3 gap-4">
          <UsageMeter
            type="monthlyJobApplications"
            currentUsage={156}
            label="CRM Contacts This Month"
          />
          <UsageMeter
            type="dailyAIRequests"
            currentUsage={23}
            label="AI Insights Used Today"
          />
          <UsageMeter
            type="storageGB"
            currentUsage={4.2}
            label="File Storage Used"
          />
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Candidates</p>
                  <p className="text-2xl font-bold">{crmStats.totalCandidates}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Pipeline</p>
                  <p className="text-2xl font-bold">{crmStats.activePipeline}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Hires</p>
                  <p className="text-2xl font-bold">{crmStats.monthlyHires}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{crmStats.conversionRate}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Time to Hire</p>
                  <p className="text-2xl font-bold">{crmStats.avgTimeToHire}d</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">{crmStats.responseRate}%</p>
                </div>
                <Mail className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main CRM Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Candidate Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-6 gap-4">
                  {['new', 'contacted', 'interview', 'offer', 'hired', 'rejected'].map((status) => {
                    const statusCandidates = mockCandidates.filter(c => c.status === status);
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold capitalize">{status}</h3>
                          <Badge variant="outline">{statusCandidates.length}</Badge>
                        </div>
                        <div className="space-y-2 min-h-[200px]">
                          {statusCandidates.map((candidate) => (
                            <Card key={candidate.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm">{candidate.name}</h4>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs">{candidate.score}</span>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{candidate.position}</p>
                                <div className="flex flex-wrap gap-1">
                                  {candidate.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    All Candidates
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Bulk Actions */}
                {selectedCandidates.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">
                        {selectedCandidates.length} candidate(s) selected
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleBulkAction('email')}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkAction('status')}>
                          <Activity className="h-4 w-4 mr-2" />
                          Update Status
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkAction('tag')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Tag
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Candidates Table */}
                <div className="space-y-3">
                  {mockCandidates.map((candidate) => (
                    <Card key={candidate.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCandidates([...selectedCandidates, candidate.id]);
                              } else {
                                setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <div>
                            <h3 className="font-semibold">{candidate.name}</h3>
                            <p className="text-sm text-muted-foreground">{candidate.position}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(candidate.status)}>
                                {candidate.status}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{candidate.score}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Communication Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Email Templates</h3>
                    <div className="space-y-2">
                      <Card className="p-3 cursor-pointer hover:shadow-md">
                        <h4 className="font-medium">Interview Invitation</h4>
                        <p className="text-sm text-muted-foreground">Standard interview invitation template</p>
                      </Card>
                      <Card className="p-3 cursor-pointer hover:shadow-md">
                        <h4 className="font-medium">Follow-up</h4>
                        <p className="text-sm text-muted-foreground">Post-interview follow-up template</p>
                      </Card>
                      <Card className="p-3 cursor-pointer hover:shadow-md">
                        <h4 className="font-medium">Offer Letter</h4>
                        <p className="text-sm text-muted-foreground">Job offer template</p>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Recent Communications</h3>
                    <div className="space-y-2">
                      <Card className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Interview scheduled with Rajesh</h4>
                            <p className="text-sm text-muted-foreground">2 hours ago</p>
                          </div>
                          <Mail className="h-4 w-4 text-blue-500" />
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Follow-up sent to Priya</h4>
                            <p className="text-sm text-muted-foreground">1 day ago</p>
                          </div>
                          <MessageSquare className="h-4 w-4 text-green-500" />
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  CRM Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Pipeline Conversion</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">New → Contacted</span>
                        <div className="flex items-center gap-2">
                          <Progress value={85} className="w-20" />
                          <span className="text-sm">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Contacted → Interview</span>
                        <div className="flex items-center gap-2">
                          <Progress value={45} className="w-20" />
                          <span className="text-sm">45%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Interview → Offer</span>
                        <div className="flex items-center gap-2">
                          <Progress value={30} className="w-20" />
                          <span className="text-sm">30%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Offer → Hired</span>
                        <div className="flex items-center gap-2">
                          <Progress value={70} className="w-20" />
                          <span className="text-sm">70%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Source Performance</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">TalentXcel</span>
                        <Badge>42%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">LinkedIn</span>
                        <Badge>28%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Referral</span>
                        <Badge>20%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Other</span>
                        <Badge>10%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  CRM Automation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Active Workflows</h3>
                    <div className="space-y-3">
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">New Candidate Welcome</h4>
                            <p className="text-sm text-muted-foreground">
                              Automatically send welcome email to new candidates
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Active</Badge>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Interview Reminder</h4>
                            <p className="text-sm text-muted-foreground">
                              Send reminders 24 hours before interview
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Active</Badge>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Available Automations</h3>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Workflow
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="p-4 cursor-pointer hover:shadow-md border-dashed">
                        <div className="text-center">
                          <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <h4 className="font-medium">Interview Scheduling</h4>
                          <p className="text-sm text-muted-foreground">
                            Auto-schedule interviews based on availability
                          </p>
                        </div>
                      </Card>
                      
                      <Card className="p-4 cursor-pointer hover:shadow-md border-dashed">
                        <div className="text-center">
                          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <h4 className="font-medium">Follow-up Sequences</h4>
                          <p className="text-sm text-muted-foreground">
                            Create automated follow-up sequences
                          </p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TieredAccessGuard>
  );
};