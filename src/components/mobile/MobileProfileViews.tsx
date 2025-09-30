import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ProfileView {
  viewer_id: string | null;
  viewed_at: string;
  view_type?: string;
  profiles?: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    title?: string;
  };
}

interface MobileProfileViewsProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
}

export const MobileProfileViews: React.FC<MobileProfileViewsProps> = ({
  isOpen,
  onClose,
  profileId
}) => {
  const [views, setViews] = useState<ProfileView[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && profileId) {
      fetchViews();
    }
  }, [isOpen, profileId]);

  const fetchViews = async () => {
    try {
      setLoading(true);
      
      // Fetch profile views
      const { data: viewsData, error: viewsError } = await supabase
        .from('profile_views')
        .select('viewer_id, viewed_at, view_type')
        .eq('profile_id', profileId)
        .order('viewed_at', { ascending: false })
        .limit(100);

      if (viewsError) throw viewsError;

      if (viewsData && viewsData.length > 0) {
        // Get unique viewer IDs (filter out nulls for anonymous views)
        const viewerIds = [...new Set(viewsData
          .map(view => view.viewer_id)
          .filter(Boolean) as string[])];

        if (viewerIds.length > 0) {
          // Fetch profiles for viewers
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, profile_picture_url, title')
            .in('id', viewerIds);

          if (profilesError) throw profilesError;

          // Combine views with profile data
          const viewsWithProfiles = viewsData.map(view => ({
            ...view,
            profiles: view.viewer_id 
              ? profilesData?.find(p => p.id === view.viewer_id)
              : undefined
          }));

          setViews(viewsWithProfiles);
        } else {
          setViews(viewsData);
        }
      } else {
        setViews([]);
      }
    } catch (error) {
      console.error('Error fetching profile views:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (viewerId: string | null) => {
    if (viewerId) {
      navigate(`/user/${viewerId}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Profile Views {views.length > 0 && `(${views.length})`}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Views List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : views.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No profile views yet</p>
              <p className="text-gray-400 text-xs mt-1">Share your profile to get more visibility</p>
            </div>
          ) : (
            views.map((view, index) => (
              <div
                key={`${view.viewer_id || 'anonymous'}-${view.viewed_at}-${index}`}
                onClick={() => handleUserClick(view.viewer_id)}
                className={`flex items-center space-x-3 p-3 rounded-2xl transition-colors ${
                  view.viewer_id ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60'
                }`}
              >
                <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                  {view.profiles?.profile_picture_url ? (
                    <AvatarImage src={view.profiles.profile_picture_url} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {view.profiles?.full_name || 'Anonymous Viewer'}
                  </h3>
                  {view.profiles?.title ? (
                    <p className="text-xs text-gray-500 truncate">
                      {view.profiles.title}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 truncate">
                      {view.view_type || 'profile'} view
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(view.viewed_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
