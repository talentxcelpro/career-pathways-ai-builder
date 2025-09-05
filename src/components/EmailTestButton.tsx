import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const EmailTestButton = () => {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const testEmailSystem = async () => {
    setIsTesting(true);
    try {
      console.log('🧪 Testing unified email notification...');

      const payload = {
        event_name: 'welcome_email',
        recipients: [
          { recipient_email: 'arsh.wani@gmail.com', user_name: 'Arshid Hussain Wani' },
          { recipient_email: 'Arshid.wani@icloud.com', user_name: 'Arshid Hussain Wani' },
        ],
      };

      console.log('📧 Notification payload:', payload);

      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: payload,
      });

      console.log('📨 Raw response:', { data, error });

      if (error) {
        console.error('❌ Supabase invoke error:', error);
        throw error;
      }

      if (data?.success) {
        toast({
          title: '✅ Email Test Successful!',
          description: `Processed ${data.stats?.successful || 0}/${data.stats?.total || 0} emails.`,
        });
        console.log('✅ Email test successful:', data);
      } else {
        console.error('❌ Email function returned error:', data);
        throw new Error(data?.error || 'Email test failed');
      }
    } catch (error: any) {
      console.error('Email test error:', error);
      toast({
        title: "❌ Email Test Failed",
        description: error.message || 'Failed to send test email',
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button 
      onClick={testEmailSystem}
      disabled={isTesting}
      className="bg-green-600 hover:bg-green-700"
    >
      {isTesting ? "Testing..." : "🧪 Test SMTP Email"}
    </Button>
  );
};