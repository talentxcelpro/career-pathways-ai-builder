import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mail, User, Target } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCompletionReminderProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  completionPercentage: number;
  onReminderSent?: () => void;
}

export const ProfileCompletionReminder: React.FC<ProfileCompletionReminderProps> = ({
  isOpen,
  onClose,
  user,
  completionPercentage,
  onReminderSent
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const defaultMessage = `Hi ${user?.full_name || 'there'},

We noticed your profile is ${completionPercentage}% complete. A complete profile helps you:

• Get discovered by more employers
• Receive better job recommendations  
• Build credibility with your network
• Showcase your full professional story

Complete your profile now to unlock these benefits and more!

Best regards,
The TalentXcel Team`;

  const handleSendReminder = async () => {
    if (!user?.email) {
      toast.error('User email not found');
      return;
    }

    setIsLoading(true);
    try {
      // Call edge function to send email
      const { error } = await supabase.functions.invoke('send-profile-reminder-email', {
        body: {
          userEmail: user.email,
          userName: user.full_name || 'User',
          completionPercentage,
          customMessage: customMessage || defaultMessage
        }
      });

      if (error) {
        console.error('Error sending reminder:', error);
        toast.error('Failed to send reminder email');
        return;
      }

      // Log the reminder activity
      const { error: logError } = await supabase.from('admin_activity_log').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'profile_reminder_sent',
        target_user_id: user.id,
        details: {
          completion_percentage: completionPercentage,
          email_sent_to: user.email,
          custom_message: !!customMessage
        }
      });

      if (logError) {
        console.error('Error logging activity:', logError);
      }

      toast.success('Profile completion reminder sent successfully');
      onReminderSent?.();
      onClose();
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Profile Completion Reminder
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.full_name || 'Unknown User'}</span>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {completionPercentage}% Complete
            </Badge>
          </div>

          {/* Email Preview */}
          <div className="space-y-2">
            <Label htmlFor="message">Email Message</Label>
            <Textarea
              id="message"
              value={customMessage || defaultMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={8}
              className="text-sm"
              placeholder="Customize the reminder message..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendReminder} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Send Reminder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};