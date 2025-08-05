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
      console.log('🧪 Testing AWS SES email system...');
      
      const emailPayload = {
        to: "nexgennwelfare@gmail.com",
        subject: "Test Email from TalentXcel Platform",
        html: "<h2>✅ AWS SES Test Email</h2><p>This test email was successfully sent via AWS SES from TalentXcel platform!</p><p>Timestamp: " + new Date().toLocaleString() + "</p>"
      };
      
      console.log('📧 Email payload:', emailPayload);
      console.log('📏 Payload size:', JSON.stringify(emailPayload).length, 'bytes');
      
      // Use Supabase client to ensure proper authentication
      const { data, error } = await supabase.functions.invoke('send-email-aws-ses', {
        body: emailPayload
      });
      
      console.log('📨 Raw response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase invoke error:', error);
        throw error;
      }

      if (data?.success) {
        toast({
          title: "✅ Email Test Successful!",
          description: `Test email sent via ${data.provider}. Response time: ${data.responseTime}ms`,
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
      {isTesting ? "Testing..." : "🧪 Test Email System"}
    </Button>
  );
};