import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function TestEmailSender() {
  const [sending, setSending] = useState(false);

  const sendAll = async () => {
    setSending(true);
    try {
      const recipients = [
        { recipient_email: 'arsh.wani@gmail.com', user_name: 'Arshid Hussain Wani' },
        { recipient_email: 'Arshid.wani@icloud.com', user_name: 'Arshid Hussain Wani' },
      ];

      const events = [
        'welcome_email',
        'profile_completion_reminder',
        'job_recommendation',
        'monthly_digest',
      ];

      for (const event_name of events) {
        const { data, error } = await supabase.functions.invoke('send-email-notification', {
          body: { event_name, recipients },
        });
        if (error || !data?.success) {
          console.error('Send failed for', event_name, error || data);
          throw new Error(data?.error || error?.message || `Failed: ${event_name}`);
        }
        console.log('Sent', event_name, data);
      }

      toast.success('Test emails sent to both recipients.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to send test emails');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={sendAll}
        disabled={sending}
        className="rounded-md px-4 py-2 bg-primary text-primary-foreground shadow-sm disabled:opacity-50"
        aria-label="Send test emails"
      >
        {sending ? 'Sending…' : 'Send Test Emails'}
      </button>
    </div>
  );
}
