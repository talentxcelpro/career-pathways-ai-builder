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
      // Primary: call trigger function via supabase-js
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
      console.warn('Primary trigger failed, trying direct fetch...', err1);
      try {
        // Fallback 1: direct HTTP call to edge function (public)
        const res = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/trigger-news-now', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
            'x-client-info': 'lovable-app'
          },
          body: JSON.stringify({ trigger: 'manual-direct', timestamp: new Date().toISOString() })
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        const triggerData = await res.json();
        const payload = (triggerData as any)?.result ?? triggerData;
        const processed = payload?.articlesProcessed ?? 0;
        toast.success(`News automation (direct) completed! ${processed} articles processed`);
        console.log('News automation direct result:', payload);
      } catch (errDirect) {
        console.warn('Direct trigger failed, trying direct news-feed-automation...', errDirect);
        try {
          // Fallback 2: direct HTTP call to automation function
          const res = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/news-feed-automation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
              'x-client-info': 'lovable-app'
            },
            body: JSON.stringify({ trigger: 'manual-fallback', timestamp: new Date().toISOString() })
          });
          if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
          const directData = await res.json();
          const processed = (directData as any)?.articlesProcessed ?? 0;
          toast.success(`News automation (fallback) completed! ${processed} articles processed`);
          console.log('News automation fallback result:', directData);
        } catch (err2) {
          const msg = (err2 as any)?.message || (errDirect as any)?.message || (err1 as any)?.message || 'Unknown error';
          console.error('Error triggering news automation (all attempts failed):', { err1, errDirect, err2 });
          toast.error(`Failed to trigger news automation: ${msg}`);
        }
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