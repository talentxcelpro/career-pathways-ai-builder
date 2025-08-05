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
      console.log('Testing email system with AWS SES...');
      
      // Use direct fetch to ensure proper request formatting
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/send-email-aws-ses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc`,
        },
        body: JSON.stringify({
          to: "nexgennwelfare@gmail.com",
          subject: "Test Email from TalentXcel Platform",
          html: "<h2>✅ AWS SES Test Email</h2><p>This test email was successfully sent via AWS SES from TalentXcel platform!</p><p>Timestamp: " + new Date().toLocaleString() + "</p>"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Email API Response:', data);
      
      if (data.success) {
        toast({
          title: "✅ Email Test Successful!",
          description: `Test email sent to nexgennwelfare@gmail.com. Provider: ${data.provider}`,
        });
        console.log('Email test result:', data);
      } else {
        throw new Error(data.error || 'Email test failed');
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