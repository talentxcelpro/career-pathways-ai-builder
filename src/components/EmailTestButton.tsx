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
      console.log('Testing email system...');
      
      const { data, error } = await supabase.functions.invoke('test-email-system');
      
      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "✅ Email Test Successful!",
          description: `Test email sent to nexgennwelfare@gmail.com. Message ID: ${data.messageId}`,
        });
        console.log('Email test result:', data);
      } else {
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