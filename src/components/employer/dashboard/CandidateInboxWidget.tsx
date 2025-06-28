
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Clock, Reply, MoreHorizontal } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  candidateName: string;
  candidateAvatar?: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'normal' | 'low';
  jobTitle: string;
}

export const CandidateInboxWidget = () => {
  const navigate = useNavigate();
  
  const messages: Message[] = [
    {
      id: '1',
      candidateName: 'Sarah Johnson',
      subject: 'Question about Frontend Developer role',
      preview: 'Hi, I wanted to ask about the tech stack mentioned in the job description...',
      timestamp: '2 hours ago',
      isRead: false,
      priority: 'high',
      jobTitle: 'Senior Frontend Developer'
    },
    {
      id: '2',
      candidateName: 'Mike Chen',
      subject: 'Interview availability',
      preview: 'Thank you for considering my application. I am available for an interview...',
      timestamp: '5 hours ago',
      isRead: false,
      priority: 'normal',
      jobTitle: 'Product Manager'
    },
    {
      id: '3',
      candidateName: 'Emily Davis',
      subject: 'Portfolio samples',
      preview: 'As requested, I am attaching my latest portfolio samples for your review...',
      timestamp: '1 day ago',
      isRead: true,
      priority: 'normal',
      jobTitle: 'UX Designer'
    }
  ];

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg relative">
              <MessageSquare className="h-4 w-4 text-white" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Candidate Inbox</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {unreadCount} unread messages
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/crm/candidates')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex items-start gap-3 p-3 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer ${!message.isRead ? 'bg-blue-50/50 border border-blue-100' : 'bg-slate-50/50'}`}
            onClick={() => navigate(`/employer/crm/candidates/${message.id}`)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.candidateAvatar} />
              <AvatarFallback className="text-xs">{message.candidateName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800">{message.candidateName}</h4>
                  {!message.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-500">{message.timestamp}</span>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-700 mb-1">{message.subject}</p>
              <p className="text-xs text-slate-600 truncate mb-2">{message.preview}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {message.jobTitle}
                </Badge>
                <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                  {message.priority}
                </Badge>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Reply className="h-3 w-3" />
            </Button>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div 
            className="flex items-center justify-center gap-2 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            onClick={() => navigate('/employer/crm/candidates')}
          >
            <span className="text-sm font-semibold text-blue-700">View All Messages</span>
            <MessageSquare className="h-3 w-3 text-blue-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
