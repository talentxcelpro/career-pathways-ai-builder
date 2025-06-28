
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Play, Pause, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface WorkflowAutomation {
  id: string;
  name: string;
  type: 'email_sequence' | 'screening' | 'scheduling' | 'followup' | 'rejection';
  status: 'active' | 'paused' | 'draft';
  triggeredToday: number;
  successRate: number;
  lastTriggered: string;
  description: string;
}

export const AutomatedWorkflowWidget = () => {
  const navigate = useNavigate();
  
  const workflows: WorkflowAutomation[] = [
    {
      id: '1',
      name: 'Application Acknowledgment',
      type: 'email_sequence',
      status: 'active',
      triggeredToday: 12,
      successRate: 98,
      lastTriggered: '5 mins ago',
      description: 'Auto-send welcome email to new applicants'
    },
    {
      id: '2',
      name: 'Initial Screening',
      type: 'screening',
      status: 'active',
      triggeredToday: 8,
      successRate: 87,
      lastTriggered: '15 mins ago',
      description: 'Automated qualification screening for candidates'
    },
    {
      id: '3',
      name: 'Interview Scheduling',
      type: 'scheduling',
      status: 'paused',
      triggeredToday: 0,
      successRate: 92,
      lastTriggered: '2 hours ago',
      description: 'Auto-schedule interviews with qualified candidates'
    },
    {
      id: '4',
      name: 'Follow-up Reminders',
      type: 'followup',
      status: 'active',
      triggeredToday: 5,
      successRate: 76,
      lastTriggered: '1 hour ago',
      description: 'Send follow-up emails to pending candidates'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3 text-green-600" />;
      case 'paused': return <Pause className="h-3 w-3 text-yellow-600" />;
      case 'draft': return <Settings className="h-3 w-3 text-gray-600" />;
      default: return <Settings className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email_sequence': return <CheckCircle className="h-3 w-3" />;
      case 'screening': return <AlertTriangle className="h-3 w-3" />;
      case 'scheduling': return <Clock className="h-3 w-3" />;
      case 'followup': return <Settings className="h-3 w-3" />;
      default: return <Settings className="h-3 w-3" />;
    }
  };

  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const totalTriggered = workflows.reduce((acc, w) => acc + w.triggeredToday, 0);

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Automated Workflows</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {activeWorkflows} active • {totalTriggered} triggered today
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/automation')}
          >
            Manage
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {workflows.map((workflow) => (
          <div 
            key={workflow.id}
            className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/employer/automation/${workflow.id}`)}
          >
            <div className="p-1.5 bg-cyan-100 rounded-md">
              {getTypeIcon(workflow.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800">{workflow.name}</h4>
                <div className="flex items-center gap-1">
                  {getStatusIcon(workflow.status)}
                  <Badge className={`text-xs ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </Badge>
                </div>
              </div>
              
              <p className="text-xs text-slate-600 mb-2">{workflow.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">Today: {workflow.triggeredToday}</span>
                  <span className="text-xs text-green-600">Success: {workflow.successRate}%</span>
                </div>
                <span className="text-xs text-slate-500">{workflow.lastTriggered}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div 
            className="flex items-center justify-center gap-2 p-2 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors cursor-pointer"
            onClick={() => navigate('/employer/automation')}
          >
            <span className="text-sm font-semibold text-cyan-700">Workflow Builder</span>
            <Settings className="h-3 w-3 text-cyan-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
