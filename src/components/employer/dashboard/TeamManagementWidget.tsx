
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Settings, MoreHorizontal } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
  lastActive: string;
}

export const TeamManagementWidget = () => {
  const navigate = useNavigate();
  
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@company.com',
      role: 'Admin',
      status: 'active',
      lastActive: 'Online now'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@company.com',
      role: 'Recruiter',
      status: 'active',
      lastActive: '2 hours ago'
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike@company.com',
      role: 'Hiring Manager',
      status: 'pending',
      lastActive: 'Invitation sent'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'recruiter': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'hiring manager': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const activeMembers = teamMembers.filter(member => member.status === 'active').length;
  const pendingInvites = teamMembers.filter(member => member.status === 'pending').length;

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Team Management</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {activeMembers} active • {pendingInvites} pending
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/team')}
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Invite
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {teamMembers.map((member) => (
          <div 
            key={member.id}
            className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/employer/team/${member.id}`)}
          >
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-xs">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800">{member.name}</h4>
                <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                  {member.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">{member.email}</p>
                <span className="text-xs text-slate-500">{member.lastActive}</span>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2">
            <div 
              className="flex items-center justify-center gap-2 p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
              onClick={() => navigate('/employer/team')}
            >
              <span className="text-sm font-semibold text-purple-700">Manage Team</span>
              <Settings className="h-3 w-3 text-purple-700" />
            </div>
            <div 
              className="flex items-center justify-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => navigate('/employer/team/invite')}
            >
              <span className="text-sm font-semibold text-slate-700">Add Member</span>
              <UserPlus className="h-3 w-3 text-slate-700" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
