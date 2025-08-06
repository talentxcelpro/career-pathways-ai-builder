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
      console.log('🧪 Testing SMTP email system...');
      
      const emailPayload = {
        to: "talentxcelpro@gmail.com",
        from: "TalentXcel <noreply@talentxcel.in>",
        subject: "Test Email from TalentXcel",
        html: "<h1>✅ SMTP Test Email</h1><p>This is a test email to verify the SMTP email system is working correctly.</p><p>Sent at: " + new Date().toLocaleString() + "</p>",
        smtp: {
          host: "email-smtp.eu-north-1.amazonaws.com",
          port: "587",
          user: "", // Will be populated from Supabase secrets
          pass: ""  // Will be populated from Supabase secrets
        }
      };
      
      console.log('📧 SMTP Email payload:', emailPayload);
      
      // Use the working SMTP function
      const { data, error } = await supabase.functions.invoke('send-email-smtp', {
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
          description: `Test email sent successfully via SMTP. Message ID: ${data.messageId}`,
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