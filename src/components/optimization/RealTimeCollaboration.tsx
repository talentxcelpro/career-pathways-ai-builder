import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Eye, 
  MessageSquare, 
  Share2,
  Clock,
  Wifi,
  UserCheck,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: Date;
  currentPage: string;
}

export const RealTimeCollaboration: React.FC = () => {
  const [onlineUsers] = useState<OnlineUser[]>([
    {
      id: '1',
      name: 'Arjun Mehta',
      status: 'online',
      lastSeen: new Date(),
      currentPage: '/jobs'
    },
    {
      id: '2', 
      name: 'Priya Sharma',
      status: 'away',
      lastSeen: new Date(Date.now() - 300000),
      currentPage: '/network'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500'; 
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Real-Time Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-green-600">Real-time sync active</span>
          </div>
          
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg border">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-gray-500">Viewing {user.currentPage}</div>
              </div>
              <Badge variant="outline" className="text-xs">
                {user.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};