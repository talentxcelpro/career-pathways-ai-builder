import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VideoCallButtonProps {
  targetUserId: string;
  userName?: string;
  variant?: 'video' | 'audio';
  size?: 'sm' | 'md' | 'lg';
}

export const VideoCallButton: React.FC<VideoCallButtonProps> = ({
  targetUserId,
  userName = 'User',
  variant = 'video',
  size = 'md'
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = React.useState(false);

  const handleStartCall = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start a video call",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // Create a unique room ID
      const roomId = `call_${user.id}_${targetUserId}_${Date.now()}`;
      
      // Create notification for the target user
      const { error } = await supabase.from('notifications').insert({
        user_id: targetUserId,
        type: 'video_call_invite',
        title: `${variant === 'video' ? 'Video' : 'Audio'} Call Invitation`,
        message: `${user.email} wants to start a ${variant} call with you`,
        data: {
          room_id: roomId,
          caller_id: user.id,
          caller_name: user.email,
          call_type: variant
        },
        action_url: `/video-call/${roomId}`
      });

      if (error) {
        console.error('Error creating call notification:', error);
        toast({
          title: "Error",
          description: "Failed to send call invitation",
          variant: "destructive"
        });
        return;
      }

      // Navigate to the call room
      navigate(`/video-call/${roomId}`);
      
      toast({
        title: "Call Started",
        description: `${variant === 'video' ? 'Video' : 'Audio'} call invitation sent to ${userName}`,
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Failed to start the call",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  return (
    <Button
      onClick={handleStartCall}
      disabled={isCreating}
      size={buttonSize}
      variant="outline"
      className="flex items-center gap-2 hover:bg-primary/10"
    >
      {variant === 'video' ? (
        <Video className={iconSize} />
      ) : (
        <Phone className={iconSize} />
      )}
      {size !== 'sm' && (
        <span>{isCreating ? 'Starting...' : variant === 'video' ? 'Video Call' : 'Audio Call'}</span>
      )}
    </Button>
  );
};