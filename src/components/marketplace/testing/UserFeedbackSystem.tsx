import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Users,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle2,
  Filter
} from "lucide-react";

interface Feedback {
  id: string;
  user: string;
  rating: number;
  category: string;
  feedback: string;
  feature: string;
  status: 'new' | 'in-review' | 'implemented' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  votes: number;
  created_at: string;
}

interface FeedbackStats {
  total_feedback: number;
  average_rating: number;
  satisfaction_score: number;
  response_rate: number;
}

export const UserFeedbackSystem = () => {
  const [feedbackList] = useState<Feedback[]>([
    {
      id: '1',
      user: 'sarah_designer',
      rating: 4,
      category: 'Feature Request',
      feedback: 'Would love to see advanced filtering options for services by skill level and project duration.',
      feature: 'Service Filters',
      status: 'in-review',
      priority: 'high',
      votes: 23,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      user: 'tech_recruiter',
      rating: 5,
      category: 'Improvement',
      feedback: 'The messaging system could benefit from file sharing capabilities for project briefs.',
      feature: 'Messaging',
      status: 'new',
      priority: 'medium',
      votes: 15,
      created_at: '2024-01-14'
    },
    {
      id: '3',
      user: 'startup_founder',
      rating: 3,
      category: 'Bug Report',
      feedback: 'Payment processing sometimes fails on mobile devices during checkout.',
      feature: 'Payments',
      status: 'implemented',
      priority: 'critical',
      votes: 8,
      created_at: '2024-01-13'
    }
  ]);

  const [stats] = useState<FeedbackStats>({
    total_feedback: 156,
    average_rating: 4.2,
    satisfaction_score: 84,
    response_rate: 23
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'in-review': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'implemented': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Feedback System</h2>
          <p className="text-muted-foreground">Collect and iterate based on user feedback</p>
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Create Feedback Survey
        </Button>
      </div>

      {/* Feedback Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{stats.total_feedback}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.average_rating}</p>
                  <div className="flex">{renderStars(Math.round(stats.average_rating))}</div>
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction Score</p>
                <p className="text-2xl font-bold">{stats.satisfaction_score}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{stats.response_rate}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback">All Feedback</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="responses">Response Management</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Badge variant="outline">All Categories</Badge>
            <Badge variant="outline">All Priorities</Badge>
            <Badge variant="outline">All Status</Badge>
          </div>

          <div className="grid gap-4">
            {feedbackList.map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">@{feedback.user}</span>
                        <div className="flex">{renderStars(feedback.rating)}</div>
                        <span className="text-sm text-muted-foreground">
                          {feedback.created_at}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{feedback.feature}</CardTitle>
                      <CardDescription>{feedback.category}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(feedback.status)}>
                        {feedback.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(feedback.priority)}>
                        {feedback.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{feedback.feedback}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {feedback.votes}
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {feedback.status === 'new' && (
                        <>
                          <Button size="sm" variant="outline">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                          <Button size="sm">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="surveys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Survey</CardTitle>
              <CardDescription>Design targeted surveys to gather specific feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Survey Title" />
              <Textarea placeholder="Survey Description" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Target Audience" />
                <Input placeholder="Survey Duration (days)" type="number" />
              </div>
              <Button>Create Survey</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Service Discovery Experience</h4>
                    <p className="text-sm text-muted-foreground">42 responses • Ends in 5 days</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Payment Process Feedback</h4>
                    <p className="text-sm text-muted-foreground">18 responses • Ends in 2 days</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Feature Requests</span>
                  <div className="flex items-center gap-2">
                    <Progress value={45} className="w-20 h-2" />
                    <span className="text-sm">45%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bug Reports</span>
                  <div className="flex items-center gap-2">
                    <Progress value={30} className="w-20 h-2" />
                    <span className="text-sm">30%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">UI/UX Improvements</span>
                  <div className="flex items-center gap-2">
                    <Progress value={25} className="w-20 h-2" />
                    <span className="text-sm">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex">{renderStars(1)}</div>
                    <span className="text-sm w-3">{rating}</span>
                    <Progress value={rating === 5 ? 45 : rating === 4 ? 35 : rating === 3 ? 15 : rating === 2 ? 3 : 2} className="flex-1 h-2" />
                    <span className="text-sm w-8">{rating === 5 ? '45%' : rating === 4 ? '35%' : rating === 3 ? '15%' : rating === 2 ? '3%' : '2%'}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Templates</CardTitle>
              <CardDescription>Quick responses for common feedback types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start">
                  Thank you for the feedback - Under Review
                </Button>
                <Button variant="outline" className="justify-start">
                  Feature implemented in latest update
                </Button>
                <Button variant="outline" className="justify-start">
                  Bug fix scheduled for next release
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};