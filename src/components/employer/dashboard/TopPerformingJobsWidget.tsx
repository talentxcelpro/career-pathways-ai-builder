
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Eye, Users, ExternalLink } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface JobPerformance {
  id: string;
  title: string;
  views: number;
  applications: number;
  conversionRate: number;
  postedDays: number;
  status: 'trending' | 'hot' | 'stable';
}

export const TopPerformingJobsWidget = () => {
  const navigate = useNavigate();
  
  const topJobs: JobPerformance[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      views: 1245,
      applications: 89,
      conversionRate: 7.1,
      postedDays: 5,
      status: 'hot'
    },
    {
      id: '2',
      title: 'Product Manager',
      views: 892,
      applications: 45,
      conversionRate: 5.0,
      postedDays: 12,
      status: 'trending'
    },
    {
      id: '3',
      title: 'UX Designer',
      views: 678,
      applications: 34,
      conversionRate: 5.0,
      postedDays: 8,
      status: 'stable'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-500';
      case 'trending': return 'bg-orange-500';
      case 'stable': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hot': return '🔥';
      case 'trending': return '📈';
      case 'stable': return '✅';
      default: return '📊';
    }
  };

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Top Performing Jobs</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                Based on views, applications & conversion rates
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/analytics')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {topJobs.map((job, index) => (
          <div 
            key={job.id}
            className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/jobs/manage/${job.id}`)}
          >
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${getStatusColor(job.status)} flex items-center justify-center text-xs`}>
                {index + 1}
              </div>
              <span className="text-lg">{getStatusIcon(job.status)}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800 truncate">{job.title}</h4>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {job.conversionRate}% CVR
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{job.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{job.applications}</span>
                </div>
                <span>Posted {job.postedDays}d ago</span>
              </div>
            </div>
            
            <ExternalLink className="h-4 w-4 text-slate-400" />
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs font-semibold"
            onClick={() => navigate('/employer/analytics')}
          >
            View Detailed Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
