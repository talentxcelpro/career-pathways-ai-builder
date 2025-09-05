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
      // First try the trigger function (function-to-function)
      const { data: triggerData, error: triggerError } = await supabase.functions.invoke('trigger-news-now', {
        body: { trigger: 'manual', timestamp: new Date().toISOString() }
      });

      if (triggerError) {
        console.error('trigger-news-now error:', triggerError, triggerData);
        throw triggerError;
      }

      // Prefer nested result if present
      const payload = (triggerData as any)?.result ?? triggerData;
      const processed = payload?.articlesProcessed ?? 0;
      toast.success(`News automation completed! ${processed} articles processed`);
      console.log('News automation result:', payload);
    } catch (err1) {
      console.warn('Primary trigger failed, trying direct news-feed-automation...', err1);
      try {
        const { data: directData, error: directError } = await supabase.functions.invoke('news-feed-automation', {
          body: { trigger: 'manual-fallback', timestamp: new Date().toISOString() }
        });

        if (directError) {
          console.error('news-feed-automation error:', directError, directData);
          throw directError;
        }

        const processed = (directData as any)?.articlesProcessed ?? 0;
        toast.success(`News automation (fallback) completed! ${processed} articles processed`);
        console.log('News automation fallback result:', directData);
      } catch (err2) {
        const msg = (err2 as any)?.message || (err1 as any)?.message || 'Unknown error';
        console.error('Error triggering news automation (both attempts failed):', { err1, err2 });
        toast.error(`Failed to trigger news automation: ${msg}`);
      }
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