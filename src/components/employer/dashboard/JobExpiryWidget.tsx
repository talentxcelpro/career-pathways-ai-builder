
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, Calendar } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface ExpiringJob {
  id: string;
  title: string;
  daysLeft: number;
  applications: number;
  urgency: 'critical' | 'warning' | 'notice';
}

export const JobExpiryWidget = () => {
  const navigate = useNavigate();
  
  const expiringJobs: ExpiringJob[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      daysLeft: 2,
      applications: 45,
      urgency: 'critical'
    },
    {
      id: '2',
      title: 'Product Manager',
      daysLeft: 5,
      applications: 28,
      urgency: 'warning'
    },
    {
      id: '3',
      title: 'UX Designer',
      daysLeft: 8,
      applications: 19,
      urgency: 'notice'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'notice': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'notice': return 'secondary';
      default: return 'secondary';
    }
  };

  const criticalCount = expiringJobs.filter(job => job.urgency === 'critical').length;

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg relative">
              <Clock className="h-4 w-4 text-white" />
              {criticalCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{criticalCount}</span>
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Job Expiry Alerts</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {expiringJobs.length} jobs expiring soon
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/jobs/manage')}
          >
            Manage All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {expiringJobs.map((job) => (
          <div 
            key={job.id}
            className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/jobs/manage/${job.id}`)}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getUrgencyColor(job.urgency)}`}></div>
              {job.urgency === 'critical' && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800 truncate">{job.title}</h4>
                <Badge variant={getUrgencyBadge(job.urgency)} className="text-xs font-semibold">
                  {job.daysLeft} days left
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>{job.applications} applications</span>
                <span>•</span>
                <span className={job.urgency === 'critical' ? 'text-red-600 font-semibold' : ''}>
                  Expires in {job.daysLeft} day{job.daysLeft !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <Button 
                size="sm" 
                variant={job.urgency === 'critical' ? 'default' : 'outline'}
                className="text-xs h-6 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/jobs/manage/${job.id}/extend`);
                }}
              >
                Extend
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div 
            className="flex items-center justify-center gap-2 p-2 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
            onClick={() => navigate('/jobs/manage?filter=expiring')}
          >
            <span className="text-sm font-semibold text-orange-700">View All Expiring Jobs</span>
            <Calendar className="h-3 w-3 text-orange-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
