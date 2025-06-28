
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, Star, BookOpen, Users, AlertCircle, Calendar } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'overdue';
  category: 'skill' | 'certification' | 'experience' | 'network' | 'project';
  estimatedDuration: string;
  resources: {
    type: 'course' | 'book' | 'certification' | 'project';
    title: string;
    url?: string;
    provider?: string;
  }[];
  dependencies?: string[];
  priority: 'high' | 'medium' | 'low';
}

interface InteractiveTimelineProps {
  milestones: Milestone[];
  onMilestoneUpdate: (milestoneId: string, status: Milestone['status']) => void;
}

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({
  milestones,
  onMilestoneUpdate
}) => {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  const getMilestoneIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'overdue': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: Milestone['category']) => {
    switch (category) {
      case 'skill': return <Star className="h-4 w-4" />;
      case 'certification': return <Badge className="h-4 w-4" />;
      case 'experience': return <Clock className="h-4 w-4" />;
      case 'network': return <Users className="h-4 w-4" />;
      case 'project': return <BookOpen className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Milestone['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const progressPercentage = (completedMilestones / milestones.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Career Roadmap Progress
            </div>
            <Badge variant="secondary">
              {completedMilestones}/{milestones.length} Complete
            </Badge>
          </CardTitle>
          <CardDescription>
            Track your progress toward your career goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Timeline</CardTitle>
          <CardDescription>
            Click on milestones to view details and track resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`border-l-4 ${getPriorityColor(milestone.priority)} pl-4 pb-4`}
              >
                <Collapsible
                  open={expandedMilestone === milestone.id}
                  onOpenChange={(open) => setExpandedMilestone(open ? milestone.id : null)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        {getMilestoneIcon(milestone.status)}
                        <div>
                          <h4 className="font-medium">{milestone.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              {getCategoryIcon(milestone.category)}
                              <span className="capitalize">{milestone.category}</span>
                            </div>
                            <Badge className={`text-xs ${getStatusColor(milestone.status)}`}>
                              {milestone.status}
                            </Badge>
                            <span className="text-xs text-gray-500">{milestone.targetDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {milestone.priority} priority
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-4">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <p className="text-sm text-gray-700">{milestone.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Details</h5>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Duration: {milestone.estimatedDuration}</div>
                            <div>Target: {milestone.targetDate}</div>
                            {milestone.dependencies && milestone.dependencies.length > 0 && (
                              <div>
                                Dependencies: {milestone.dependencies.length} items
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm mb-2">Resources ({milestone.resources.length})</h5>
                          <div className="space-y-2">
                            {milestone.resources.slice(0, 3).map((resource, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                {getCategoryIcon(resource.type as any)}
                                <span className="truncate">{resource.title}</span>
                                {resource.provider && (
                                  <Badge variant="outline" className="text-xs">
                                    {resource.provider}
                                  </Badge>
                                )}
                              </div>
                            ))}
                            {milestone.resources.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{milestone.resources.length - 3} more resources
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        {milestone.status !== 'completed' && (
                          <Button
                            size="sm"
                            onClick={() => onMilestoneUpdate(milestone.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        )}
                        {milestone.status === 'upcoming' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onMilestoneUpdate(milestone.id, 'in-progress')}
                          >
                            Start Working
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Resources
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
