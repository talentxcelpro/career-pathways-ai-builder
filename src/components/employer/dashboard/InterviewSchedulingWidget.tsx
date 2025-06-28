
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, MapPin, Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Interview {
  id: string;
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  scheduledTime: string;
  duration: string;
  interviewType: 'video' | 'phone' | 'in-person';
  status: 'confirmed' | 'pending' | 'rescheduled';
  interviewer: string;
  location?: string;
}

export const InterviewSchedulingWidget = () => {
  const navigate = useNavigate();
  
  const upcomingInterviews: Interview[] = [
    {
      id: '1',
      candidateName: 'Sarah Johnson',
      jobTitle: 'Senior Frontend Developer',
      scheduledTime: 'Today, 2:00 PM',
      duration: '1 hour',
      interviewType: 'video',
      status: 'confirmed',
      interviewer: 'John Smith'
    },
    {
      id: '2',
      candidateName: 'Mike Chen',
      jobTitle: 'Product Manager',
      scheduledTime: 'Tomorrow, 10:30 AM',
      duration: '45 mins',
      interviewType: 'video',
      status: 'confirmed',
      interviewer: 'Sarah Wilson'
    },
    {
      id: '3',
      candidateName: 'Emily Davis',
      jobTitle: 'UX Designer',
      scheduledTime: 'Thu, 3:00 PM',
      duration: '1 hour',
      interviewType: 'in-person',
      status: 'pending',
      interviewer: 'Mike Davis',
      location: 'Conference Room A'
    }
  ];

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-3 w-3" />;
      case 'phone': return <Clock className="h-3 w-3" />;
      case 'in-person': return <MapPin className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rescheduled': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const todayInterviews = upcomingInterviews.filter(interview => 
    interview.scheduledTime.includes('Today')
  ).length;

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Interview Schedule</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {todayInterviews} interviews today
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/interviews/schedule')}
          >
            <Plus className="h-3 w-3 mr-1" />
            Schedule
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {upcomingInterviews.map((interview) => (
          <div 
            key={interview.id}
            className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/employer/interviews/${interview.id}`)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={interview.candidateAvatar} />
              <AvatarFallback className="text-xs">{interview.candidateName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800">{interview.candidateName}</h4>
                <Badge className={`text-xs ${getStatusColor(interview.status)}`}>
                  {interview.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {interview.jobTitle}
                </Badge>
                <div className="flex items-center gap-1">
                  {getInterviewTypeIcon(interview.interviewType)}
                  <span className="text-xs text-slate-600 capitalize">{interview.interviewType}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-600">{interview.scheduledTime}</span>
                  </div>
                  <span className="text-xs text-slate-500">({interview.duration})</span>
                </div>
                <span className="text-xs text-slate-500">with {interview.interviewer}</span>
              </div>
              
              {interview.location && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-600">{interview.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div 
            className="flex items-center justify-center gap-2 p-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
            onClick={() => navigate('/employer/interviews')}
          >
            <span className="text-sm font-semibold text-indigo-700">View Full Calendar</span>
            <Calendar className="h-3 w-3 text-indigo-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
