import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Send, 
  Eye, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  MessageSquare,
  Phone,
  Target,
  TrendingUp,
  AlertCircle,
  Plus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ApplicationTrackerProps {
  userId?: string;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ userId }) => {
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock application data
  const applications = [
    {
      id: '1',
      jobTitle: 'Senior Frontend Developer',
      company: { 
        name: 'TechCorp', 
        logo_url: '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png',
        industry: 'Technology'
      },
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'interview_scheduled',
      stage: 'Technical Interview',
      progress: 60,
      nextAction: 'Prepare for technical round',
      interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      salary: '₹8-12 LPA',
      location: 'Bangalore',
      priority: 'high'
    },
    {
      id: '2',
      jobTitle: 'Full Stack Engineer',
      company: { 
        name: 'StartupXYZ', 
        logo_url: '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png',
        industry: 'Fintech'
      },
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'under_review',
      stage: 'HR Review',
      progress: 30,
      nextAction: 'Follow up with HR',
      salary: '₹7-10 LPA',
      location: 'Mumbai',
      priority: 'medium'
    },
    {
      id: '3',
      jobTitle: 'React Developer',
      company: { 
        name: 'WebSolutions', 
        logo_url: '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png',
        industry: 'E-commerce'
      },
      appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'rejected',
      stage: 'Final Round',
      progress: 80,
      nextAction: 'Request feedback',
      feedback: 'Looking for more experience in backend technologies',
      salary: '₹6-9 LPA',
      location: 'Pune',
      priority: 'low'
    },
    {
      id: '4',
      jobTitle: 'Frontend Architect',
      company: { 
        name: 'BigTech Inc', 
        logo_url: '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png',
        industry: 'Technology'
      },
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'applied',
      stage: 'Application Submitted',
      progress: 10,
      nextAction: 'Wait for HR response',
      salary: '₹15-25 LPA',
      location: 'Hyderabad',
      priority: 'high'
    }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Applications', count: applications.length },
    { value: 'applied', label: 'Applied', count: applications.filter(app => app.status === 'applied').length },
    { value: 'under_review', label: 'Under Review', count: applications.filter(app => app.status === 'under_review').length },
    { value: 'interview_scheduled', label: 'Interview', count: applications.filter(app => app.status === 'interview_scheduled').length },
    { value: 'rejected', label: 'Closed', count: applications.filter(app => app.status === 'rejected').length }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <Send className="h-4 w-4 text-blue-500" />;
      case 'under_review': return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'interview_scheduled': return <Calendar className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'offered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'offered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      default: return 'border-l-gray-300';
    }
  };

  const filteredApplications = selectedStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === selectedStatus);

  const upcomingInterviews = applications.filter(app => 
    app.status === 'interview_scheduled' && app.interviewDate
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Application Tracker
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {applications.length} Total Applications
              </Badge>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Application
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Upcoming Interviews Alert */}
      {upcomingInterviews.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Upcoming Interviews</h3>
            </div>
            <div className="space-y-2">
              {upcomingInterviews.map((app) => (
                <div key={app.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div>
                    <p className="font-medium">{app.jobTitle} at {app.company.name}</p>
                    <p className="text-sm text-gray-600">
                      {app.interviewDate && formatDistanceToNow(app.interviewDate)} from now
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-1" />
                    Prepare
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedStatus === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(filter.value)}
            className="flex items-center gap-2"
          >
            {filter.label}
            <Badge variant="secondary" className="ml-1">
              {filter.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <Card 
            key={application.id} 
            className={`border-l-4 ${getPriorityColor(application.priority)} hover:shadow-md transition-all duration-200`}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(application.status)}
                    >
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.stage}</span>
                    </Badge>
                    {application.priority === 'high' && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        High Priority
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {application.jobTitle}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={application.company.logo_url} alt={application.company.name} />
                      <AvatarFallback className="text-xs">
                        {application.company.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{application.company.name}</p>
                      <p className="text-xs text-gray-500">{application.company.industry}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div>💼 {application.location}</div>
                    <div>💰 {application.salary}</div>
                    <div>📅 Applied {formatDistanceToNow(new Date(application.appliedAt))} ago</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Application Progress</span>
                  <span className="text-sm text-gray-600">{application.progress}%</span>
                </div>
                <Progress value={application.progress} className="h-2" />
              </div>

              {/* Next Action */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Next Action</span>
                </div>
                <p className="text-sm text-gray-700">{application.nextAction}</p>
              </div>

              {/* Feedback (for rejected applications) */}
              {application.feedback && (
                <div className="bg-red-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800">Feedback</span>
                  </div>
                  <p className="text-sm text-red-700">{application.feedback}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message
                </Button>
                {application.status === 'interview_scheduled' && (
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-1" />
                    Interview Prep
                  </Button>
                )}
                {application.status === 'rejected' && (
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Request Feedback
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedStatus === 'all' 
                ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                : `No applications with status: ${selectedStatus}`
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};