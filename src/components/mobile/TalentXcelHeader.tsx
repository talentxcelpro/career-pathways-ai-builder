import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const TalentXcelHeader: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get unread notifications count
  const { data: notificationCount = 0 } = useQuery<number>({
    queryKey: ['notifications-count', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) {
        console.warn('Failed to count notifications', error);
        return 0;
      }
      return count ?? 0;
    },
    enabled: !!user?.id
  });

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="safe-area-top" />
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">TalentXcel</h1>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 hover:bg-gray-100 rounded-full"
            onClick={() => navigate('/mobile/search')}
          >
            <Search className="w-5 h-5 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative w-9 h-9 hover:bg-gray-100 rounded-full"
            onClick={() => navigate('/mobile/notifications')}
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 text-xs bg-red-500 text-white border border-white rounded-full">
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};