import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, MessageCircle, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConnectionActionsProps {
  userId: string;
  isConnected?: boolean;
  className?: string;
  size?: 'sm' | 'lg';
}

export const ConnectionActions: React.FC<ConnectionActionsProps> = ({
  userId,
  isConnected = false,
  className = '',
  size = 'sm'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState(isConnected ? 'connected' : 'none');

  const handleConnect = async () => {
    if (!user?.id || isLoading) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: userId,
          status: 'pending'
        });

      if (error) throw error;

      setConnectionStatus('pending');
      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent successfully."
      });
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      if (error.message?.includes('duplicate')) {
        toast({
          title: "Already sent",
          description: "Connection request already sent to this user.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Failed to connect",
          description: "Unable to send connection request. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = () => {
    // Navigate to messages
    window.location.href = `/mobile/messages?userId=${userId}`;
  };

  if (connectionStatus === 'connected') {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          size={size}
          variant="outline"
          className="flex-1 gap-1"
          onClick={handleMessage}
        >
          <MessageCircle className="h-3 w-3" />
          Message
        </Button>
      </div>
    );
  }

  if (connectionStatus === 'pending') {
    return (
      <Button
        size={size}
        variant="outline"
        className={`gap-1 ${className}`}
        disabled
      >
        <Check className="h-3 w-3" />
        Sent
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant="outline"
      className={`gap-1 ${className}`}
      onClick={handleConnect}
      disabled={isLoading}
    >
      <UserPlus className="h-3 w-3" />
      Connect
    </Button>
  );
};