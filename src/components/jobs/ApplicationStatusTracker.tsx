import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  Eye, 
  UserCheck, 
  Calendar, 
  Trophy,
  AlertCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface ApplicationStatus {
  id: string;
  job_title: string;
  company_name: string;
  status: 'applied' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
  applied_at: string;
  last_updated: string;
  interview_date?: string;
  notes?: string;
  application_data?: any;
}

interface ApplicationStatusTrackerProps {
  applications: ApplicationStatus[];
  onWithdraw?: (applicationId: string) => void;
  onFollowUp?: (applicationId: string) => void;
}

export const ApplicationStatusTracker: React.FC<ApplicationStatusTrackerProps> = ({
  applications,
  onWithdraw,
  onFollowUp
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <Clock className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'shortlisted': return <UserCheck className="h-4 w-4" />;
      case 'interviewed': return <MessageSquare className="h-4 w-4" />;
      case 'hired': return <Trophy className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shortlisted': return 'bg-green-100 text-green-800 border-green-200';
      case 'interviewed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hired': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'applied': return 20;
      case 'reviewed': return 40;
      case 'shortlisted': return 60;
      case 'interviewed': return 80;
      case 'hired': return 100;
      case 'rejected': return 0;
      default: return 20;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`;
  };

  const statusOrder = ['hired', 'interviewed', 'shortlisted', 'reviewed', 'applied', 'rejected'];
  const sortedApplications = applications.sort((a, b) => {
    const aIndex = statusOrder.indexOf(a.status);
    const bIndex = statusOrder.indexOf(b.status);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
  });

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
            <p>Start applying to jobs to track your progress here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Application Tracker</h2>
          <p className="text-muted-foreground">Track the progress of your job applications</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </div>
      </div>

      {sortedApplications.map((application) => (
        <Card key={application.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{application.job_title}</h3>
                    <p className="text-muted-foreground">{application.company_name}</p>
                  </div>
                  <Badge className={`${getStatusColor(application.status)} border`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(application.status)}
                      <span className="capitalize">{application.status}</span>
                    </div>
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{getProgressValue(application.status)}%</span>
                  </div>
                  <Progress 
                    value={getProgressValue(application.status)} 
                    className="h-2"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Applied {formatDate(application.applied_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Updated {getDaysAgo(application.last_updated)}</span>
                  </div>
                  {application.interview_date && (
                    <div className="flex items-center gap-1 text-primary">
                      <MessageSquare className="h-4 w-4" />
                      <span>Interview {formatDate(application.interview_date)}</span>
                    </div>
                  )}
                </div>

                {application.notes && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">{application.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 lg:w-40">
                {application.status === 'applied' && onFollowUp && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFollowUp(application.id)}
                  >
                    Follow Up
                  </Button>
                )}
                
                {application.status !== 'hired' && application.status !== 'rejected' && onWithdraw && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onWithdraw(application.id)}
                  >
                    Withdraw
                  </Button>
                )}

                {application.application_data?.company_website && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(application.application_data.company_website, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Company
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};