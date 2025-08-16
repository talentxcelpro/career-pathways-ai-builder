import React from 'react';
import { Search, Bell, Users, Plus, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface LinkedInMobileHeaderProps {
  onSearch?: () => void;
  showCreatePost?: boolean;
}

export const LinkedInMobileHeader: React.FC<LinkedInMobileHeaderProps> = ({
  onSearch,
  showCreatePost = true
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get unread notifications count
  const { data: notificationCount = 0 } = useQuery({
    queryKey: ['notifications-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      return count || 0;
    },
    enabled: !!user?.id
  });

  // Get pending connection requests count
  const { data: pendingRequests = 0 } = useQuery({
    queryKey: ['pending-connections-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('status', 'pending');
      
      return count || 0;
    },
    enabled: !!user?.id
  });

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="safe-area-top" />
      <div className="flex items-center justify-between px-5 py-4">
        {/* Left side - Search */}
        <div className="flex items-center space-x-3 flex-1">
          <Button
            variant="ghost"
            className="flex items-center space-x-2 bg-gray-100/80 hover:bg-gray-200/80 rounded-full px-4 py-3 h-10 flex-1 justify-start max-w-xs shadow-sm transition-all duration-200"
            onClick={() => navigate('/mobile/search')}
          >
            <Search className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500 truncate font-medium">Search people, jobs, companies...</span>
          </Button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* QR Code Scanner */}
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 hover:bg-gray-100/80 rounded-full transition-all duration-200"
            onClick={() => navigate('/mobile/qr-scanner')}
          >
            <QrCode className="w-4 h-4 text-gray-600" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative w-10 h-10 hover:bg-gray-100/80 rounded-full transition-all duration-200"
            onClick={() => navigate('/mobile/notifications')}
          >
            <Bell className="w-4 h-4 text-gray-600" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white border-2 border-white rounded-full shadow-sm animate-pulse">
                {notificationCount > 99 ? '99+' : notificationCount}
              </Badge>
            )}
          </Button>

          {/* Pending Connections */}
          <Button
            variant="ghost"
            size="icon"
            className="relative w-10 h-10 hover:bg-gray-100/80 rounded-full transition-all duration-200"
            onClick={() => navigate('/mobile/pending-connections')}
          >
            <Users className="w-4 h-4 text-gray-600" />
            {pendingRequests > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-2 border-white rounded-full shadow-sm animate-pulse">
                {pendingRequests > 99 ? '99+' : pendingRequests}
              </Badge>
            )}
          </Button>

          {/* Create Post */}
          {showCreatePost && (
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 hover:bg-primary/10 rounded-full transition-all duration-200"
              onClick={() => navigate('/mobile/create-post')}
            >
              <Plus className="w-4 h-4 text-primary" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};