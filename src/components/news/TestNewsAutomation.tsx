import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const TestNewsAutomation: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const triggerNewsAutomation = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('trigger-news-now', {
        body: { trigger: 'manual', timestamp: new Date().toISOString() }
      });

      if (error) throw error;
      
      toast.success(`News automation completed! ${data.articlesProcessed || 0} articles processed`);
      console.log('News automation result:', data);
    } catch (error) {
      console.error('Error triggering news automation:', error);
      toast.error('Failed to trigger news automation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Test News Automation</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={triggerNewsAutomation}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Running...' : '🗞️ Trigger News Feed'}
        </Button>
      </CardContent>
    </Card>
  );
};