
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'new_application' | 'interview_reminder' | 'job_expiry' | 'candidate_update';
  title: string;
  message: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export const SmartNotificationsPanel = () => {
  const navigate = useNavigate();
  
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'new_application',
      title: 'New Applications',
      message: '5 new applications for Senior Frontend Developer',
      time: '2 minutes ago',
      priority: 'high',
      actionUrl: '/jobs/manage'
    },
    {
      id: '2',
      type: 'interview_reminder',
      title: 'Interview Today',
      message: 'Interview with Sarah Johnson at 2:00 PM',
      time: '1 hour',
      priority: 'high',
      actionUrl: '/employer/crm/candidates'
    },
    {
      id: '3',
      type: 'job_expiry',
      title: 'Job Expiring Soon',
      message: 'Product Manager position expires in 3 days',
      time: '3 days',
      priority: 'medium',
      actionUrl: '/jobs/manage'
    },
    {
      id: '4',
      type: 'candidate_update',
      title: 'Candidate Status Update',
      message: 'John Doe accepted your job offer',
      time: '1 day ago',
      priority: 'low',
      actionUrl: '/employer/crm/candidates'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_application': return <Users className="h-4 w-4" />;
      case 'interview_reminder': return <Clock className="h-4 w-4" />;
      case 'job_expiry': return <AlertTriangle className="h-4 w-4" />;
      case 'candidate_update': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg relative">
              <Bell className="h-4 w-4 text-white" />
              {highPriorityCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{highPriorityCount}</span>
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Smart Notifications</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {notifications.length} updates • {highPriorityCount} urgent
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            Mark all read
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {notifications.slice(0, 4).map((notification) => (
          <div 
            key={notification.id}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${getPriorityColor(notification.priority)}`}
            onClick={() => notification.actionUrl && navigate(notification.actionUrl)}
          >
            <div className="mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold truncate">{notification.title}</h4>
                <Badge 
                  variant="outline" 
                  className={`text-xs capitalize ${notification.priority === 'high' ? 'border-red-300 text-red-700' : ''}`}
                >
                  {notification.priority}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mb-1">{notification.message}</p>
              <span className="text-xs text-slate-500 font-medium">{notification.time}</span>
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t border-slate-100">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs font-semibold"
            onClick={() => navigate('/employer/notifications')}
          >
            View All Notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
