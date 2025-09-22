import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const TestAlertSender = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendTestAlerts = async () => {
    setIsSending(true);
    try {
      console.log('🧪 Sending test alerts...');

      const testAlerts = [
        {
          alertType: 'low_job_count',
          title: 'Low Job Count Alert - TEST',
          message: 'Only 25 jobs added in the last 24 hours. This is below the expected threshold of 50 jobs.',
          severity: 'medium',
          metadata: { job_count: 25, period: '24h', test: true }
        },
        {
          alertType: 'high_duplicate_rate',
          title: 'High Duplicate Rate Detected - TEST',
          message: '35.2% duplicate jobs found today, exceeding the 20% threshold.',
          severity: 'high',
          metadata: { duplicate_rate: 35.2, total_scraped: 150, test: true }
        },
        {
          alertType: 'quality_drop',
          title: 'Job Quality Drop Alert - TEST',
          message: 'Average job quality score dropped to 4.8, below the acceptable threshold of 6.0.',
          severity: 'high',
          metadata: { average_quality: 4.8, sample_size: 50, test: true }
        },
        {
          alertType: 'system_failure',
          title: 'Critical System Failure - TEST',
          message: 'Job scraping service has failed multiple times. Immediate attention required.',
          severity: 'critical',
          metadata: { service: 'job_scraper', failure_count: 5, test: true }
        }
      ];

      let successCount = 0;
      for (const alert of testAlerts) {
        const { data, error } = await supabase.functions.invoke('system-alerts', {
          body: alert,
        });

        if (error) {
          console.error('❌ Failed to send alert:', alert.title, error);
        } else {
          console.log('✅ Sent alert:', alert.title, data);
          successCount++;
        }
        
        // Small delay between alerts
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast({
        title: '✅ Test Alerts Sent!',
        description: `Successfully sent ${successCount}/${testAlerts.length} test alerts to talentxcelpro@gmail.com`,
      });

    } catch (error: any) {
      console.error('Test alerts error:', error);
      toast({
        title: "❌ Test Failed",
        description: error.message || 'Failed to send test alerts',
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button 
        onClick={sendTestAlerts}
        disabled={isSending}
        className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
        size="lg"
      >
        {isSending ? "Sending Test Alerts..." : "🚨 Send Test Alerts"}
      </Button>
    </div>
  );
};