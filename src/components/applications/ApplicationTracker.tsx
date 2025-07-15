import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Filter,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Phone,
  Video,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  FileText,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobApplication {
  id: string;
  job_title: string;
  company_name: string;
  status: 'draft' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  application_method: string;
  created_at: string;
  follow_up_date?: string;
  interview_date?: string;
  interview_type?: string;
  salary_offered?: number;
  response_received: boolean;
  ai_match_score?: number;
  job_url?: string;
}

interface TimelineEvent {
  id: string;
  application_id: string;
  event_type: string;
  title: string;
  description?: string;
  event_date: string;
  created_by: string;
}

interface ApplicationStats {
  total: number;
  pending: number;
  interviews: number;
  offers: number;
  response_rate: number;
}

export function ApplicationTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    interviews: 0,
    offers: 0,
    response_rate: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [applications]);

  const fetchApplications = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockApplications: JobApplication[] = [
        {
          id: '1',
          job_title: 'Senior Software Engineer',
          company_name: 'TechCorp Inc',
          status: 'interview',
          application_method: 'smart_apply',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          follow_up_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          interview_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          interview_type: 'video',
          response_received: true,
          ai_match_score: 87,
          job_url: 'https://techcorp.com/jobs/senior-engineer'
        },
        {
          id: '2',
          job_title: 'Product Manager',
          company_name: 'StartupXYZ',
          status: 'applied',
          application_method: 'website',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          follow_up_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          response_received: false,
          ai_match_score: 72,
          job_url: 'https://startupxyz.com/careers/pm'
        },
        {
          id: '3',
          job_title: 'Data Scientist',
          company_name: 'DataCorp',
          status: 'offer',
          application_method: 'smart_apply',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          salary_offered: 95000,
          response_received: true,
          ai_match_score: 91,
          job_url: 'https://datacorp.com/jobs/data-scientist'
        },
        {
          id: '4',
          job_title: 'Frontend Developer',
          company_name: 'WebAgency',
          status: 'rejected',
          application_method: 'email',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          response_received: true,
          ai_match_score: 68,
          job_url: 'https://webagency.com/jobs/frontend'
        },
        {
          id: '5',
          job_title: 'Full Stack Engineer',
          company_name: 'InnovateLab',
          status: 'screening',
          application_method: 'referral',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          response_received: true,
          ai_match_score: 84,
          job_url: 'https://innovatelab.com/careers/fullstack'
        }
      ];

      setApplications(mockApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeline = async (applicationId: string) => {
    try {
      // Mock timeline data
      const mockTimeline: TimelineEvent[] = [
        {
          id: '1',
          application_id: applicationId,
          event_type: 'applied',
          title: 'Application Submitted',
          description: 'Applied via Smart Apply with optimized resume',
          event_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 'system'
        },
        {
          id: '2',
          application_id: applicationId,
          event_type: 'viewed',
          title: 'Application Viewed',
          description: 'Hiring manager viewed your application',
          event_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 'system'
        },
        {
          id: '3',
          application_id: applicationId,
          event_type: 'interview_scheduled',
          title: 'Interview Scheduled',
          description: 'Video interview scheduled for next Tuesday',
          event_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 'system'
        }
      ];

      setTimeline(mockTimeline);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  };

  const calculateStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => 
      ['applied', 'screening'].includes(app.status)
    ).length;
    const interviews = applications.filter(app => 
      app.status === 'interview'
    ).length;
    const offers = applications.filter(app => 
      app.status === 'offer'
    ).length;
    const responded = applications.filter(app => 
      app.response_received
    ).length;
    const response_rate = total > 0 ? (responded / total) * 100 : 0;

    setStats({
      total,
      pending,
      interviews,
      offers,
      response_rate
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'screening': return <Eye className="w-4 h-4 text-orange-500" />;
      case 'interview': return <Video className="w-4 h-4 text-purple-500" />;
      case 'offer': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'withdrawn': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'screening': return 'bg-orange-100 text-orange-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'smart_apply': return '🤖';
      case 'website': return '🌐';
      case 'email': return '📧';
      case 'referral': return '👥';
      default: return '📄';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openApplicationDetails = (application: JobApplication) => {
    setSelectedApplication(application);
    fetchTimeline(application.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Application Tracker
          </h2>
          <p className="text-muted-foreground">
            Track and manage all your job applications in one place
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Job Title" />
              <Input placeholder="Company Name" />
              <Input placeholder="Job URL (optional)" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Application Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smart_apply">Smart Apply</SelectItem>
                  <SelectItem value="website">Company Website</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Notes (optional)" />
              <Button className="w-full">Add Application</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Applications</p>
              </div>
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Response</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.interviews}</p>
                <p className="text-xs text-muted-foreground">Interviews</p>
              </div>
              <Video className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.offers}</p>
                <p className="text-xs text-muted-foreground">Job Offers</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.response_rate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Response Rate</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search jobs or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="screening">Screening</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{application.job_title}</h3>
                    <Badge className={getStatusColor(application.status)}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.status}</span>
                    </Badge>
                    {application.ai_match_score && (
                      <Badge variant="outline">
                        {application.ai_match_score}% match
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {application.company_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Applied {new Date(application.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      {getMethodIcon(application.application_method)}
                      {application.application_method.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {application.interview_date && (
                      <div className="flex items-center gap-1 text-sm text-purple-600">
                        <Video className="w-4 h-4" />
                        Interview: {new Date(application.interview_date).toLocaleDateString()}
                      </div>
                    )}
                    
                    {application.follow_up_date && (
                      <div className="flex items-center gap-1 text-sm text-orange-600">
                        <Clock className="w-4 h-4" />
                        Follow up: {new Date(application.follow_up_date).toLocaleDateString()}
                      </div>
                    )}
                    
                    {application.salary_offered && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <DollarSign className="w-4 h-4" />
                        ${application.salary_offered.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openApplicationDetails(application)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No applications found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'Start tracking your job applications'
            }
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Application
          </Button>
        </div>
      )}

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedApplication?.job_title} at {selectedApplication?.company_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-4">
                  {timeline.map((event) => (
                    <div key={event.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {getStatusIcon(event.event_type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground mb-1">
                          {event.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.event_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge className={getStatusColor(selectedApplication.status)}>
                      {selectedApplication.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Applied Date</label>
                    <p className="text-sm">
                      {new Date(selectedApplication.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Application Method</label>
                    <p className="text-sm capitalize">
                      {selectedApplication.application_method.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">AI Match Score</label>
                    <p className="text-sm">
                      {selectedApplication.ai_match_score}%
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Documents feature coming soon
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}