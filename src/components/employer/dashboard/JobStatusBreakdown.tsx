
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Play, Pause, FileText, Archive } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface JobStatus {
  status: string;
  count: number;
  color: string;
  icon: any;
  description: string;
}

export const JobStatusBreakdown = () => {
  const navigate = useNavigate();
  
  const jobStatuses: JobStatus[] = [
    { 
      status: "Active", 
      count: 8, 
      color: "bg-green-500", 
      icon: Play,
      description: "Currently accepting applications"
    },
    { 
      status: "Draft", 
      count: 3, 
      color: "bg-gray-500", 
      icon: FileText,
      description: "Not yet published"
    },
    { 
      status: "Paused", 
      count: 2, 
      color: "bg-yellow-500", 
      icon: Pause,
      description: "Temporarily stopped"
    },
    { 
      status: "Closed", 
      count: 12, 
      color: "bg-red-500", 
      icon: Archive,
      description: "No longer accepting applications"
    }
  ];

  const totalJobs = jobStatuses.reduce((sum, status) => sum + status.count, 0);
  const activeJobs = jobStatuses.find(s => s.status === "Active")?.count || 0;

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Job Status Overview</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {totalJobs} total jobs • {activeJobs} active
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/jobs/post')}
          >
            + New Job
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {jobStatuses.map((status) => {
            const IconComponent = status.icon;
            return (
              <div 
                key={status.status}
                className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/jobs/manage?status=${status.status.toLowerCase()}`)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${status.color} flex items-center justify-center`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">{status.status}</span>
                    <span className="text-xs text-slate-500">{status.description}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs font-bold group-hover:bg-slate-200">
                  {status.count}
                </Badge>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs font-semibold"
              onClick={() => navigate('/jobs/manage')}
            >
              Manage All Jobs
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs font-semibold"
              onClick={() => navigate('/employer/analytics')}
            >
              View Analytics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
