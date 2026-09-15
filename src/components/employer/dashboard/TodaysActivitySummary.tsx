
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, Star, TrendingUp, ArrowUpRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface ActivityItem {
  id: string;
  type: 'application' | 'interview' | 'hire' | 'view';
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  count?: number;
}

export const TodaysActivitySummary = () => {
  const navigate = useNavigate();
  
  const todaysActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'application',
      title: 'New Applications',
      description: 'Senior Frontend Developer',
      time: '9:30 AM',
      priority: 'high',
      count: 8
    },
    {
      id: '2',  
      type: 'interview',
      title: 'Upcoming Interview',
      description: 'Sarah Johnson - Product Manager',
      time: '2:00 PM',
      priority: 'high'
    },
    {
      id: '3',
      type: 'view',
      title: 'Job Views Spike',
      description: 'UX Designer position trending',
      time: '11:45 AM',
      priority: 'medium',
      count: 24
    },
    {
      id: '4',
      type: 'hire',
      title: 'Offer Accepted',
      description: 'John Doe - Full Stack Developer',
      time: '10:15 AM',
      priority: 'high'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'application': return <Users className="h-4 w-4" />;
      case 'interview': return <Clock className="h-4 w-4" />;
      case 'hire': return <Star className="h-4 w-4" />;
      case 'view': return <TrendingUp className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'application': return 'bg-blue-500';
      case 'interview': return 'bg-purple-500';
      case 'hire': return 'bg-green-500';
      case 'view': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const highPriorityCount = todaysActivity.filter(a => a.priority === 'high').length;
  const totalActivities = todaysActivity.length;

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Today's Activity</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {totalActivities} activities • {highPriorityCount} urgent
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <ArrowUpRight className="h-3 w-3" />
            <span className="text-xs font-semibold">+23%</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {todaysActivity.map((activity) => (
          <div 
            key={activity.id}
            className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
            onClick={() => navigate('/employer/crm/candidates')}
          >
            <div className={`w-8 h-8 rounded-lg ${getActivityColor(activity.type)} flex items-center justify-center`}>
              {getIcon(activity.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800">{activity.title}</h4>
                <div className="flex items-center gap-2">
                  {activity.count && (
                    <Badge variant="secondary" className="text-xs font-semibold">
                      +{activity.count}
                    </Badge>
                  )}
                  <span className="text-xs text-slate-500 font-medium">{activity.time}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">{activity.description}</p>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs font-semibold"
              onClick={() => navigate('/employer/crm/candidates')}
            >
              View All Activity
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs font-semibold"
              onClick={() => navigate('/employer/analytics')}
            >
              Activity Reports
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
