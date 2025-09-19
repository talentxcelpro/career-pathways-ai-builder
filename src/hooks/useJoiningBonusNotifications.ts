import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useJoiningBonusNotifications = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const notifyJoiningBonusRecipients = async () => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('notify-joining-bonus');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to send joining bonus notifications",
          variant: "destructive"
        });
        return false;
      }

      if (data?.success) {
        toast({
          title: "Success! 🎉",
          description: `Sent joining bonus notifications to ${data.total_notifications} users. ${data.errors > 0 ? `${data.errors} errors occurred.` : ''}`,
          variant: "default"
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: data?.error || "Failed to send notifications",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error sending joining bonus notifications:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    notifyJoiningBonusRecipients,
    isProcessing
  };
};