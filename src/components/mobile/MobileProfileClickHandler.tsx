import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface MobileProfileClickHandlerProps {
  children: React.ReactElement;
  userId: string;
  username?: string;
}

export const MobileProfileClickHandler: React.FC<MobileProfileClickHandlerProps> = ({
  children,
  userId,
  username
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Get username if not provided
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-username', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId && !username
  });

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const profileUsername = username || userProfile?.username;
    
    if (isMobile) {
      // On mobile, navigate to username-based profile for better UX
      if (profileUsername) {
        navigate(`/@${profileUsername}`);
      } else {
        // Fallback to ID-based profile
        navigate(`/profile/${userId}`);
      }
    } else {
      // On desktop, use standard profile routing
      if (profileUsername) {
        navigate(`/@${profileUsername}`);
      } else {
        navigate(`/profile/${userId}`);
      }
    }
  };

  return React.cloneElement(children, {
    onClick: handleProfileClick,
    style: { cursor: 'pointer', ...children.props.style }
  });
};