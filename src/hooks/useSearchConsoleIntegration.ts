
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SearchConsoleData {
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  queries: Array<{
    query: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }>;
  pages: Array<{
    page: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }>;
}

export const useSearchConsoleIntegration = () => {
  const [data, setData] = useState<SearchConsoleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSearchConsoleData = async (dateRange: string = '30d') => {
    setLoading(true);
    setError(null);

    try {
      // Call the real Google Search Console API through edge function
      const { data: consoleData, error: consoleError } = await supabase.functions.invoke('google-search-console', {
        body: { 
          siteUrl: window.location.hostname,
          dateRange 
        }
      });

      if (consoleError) throw consoleError;

      // Transform the data to match our interface
      const transformedData: SearchConsoleData = {
        impressions: consoleData.summary.totalImpressions,
        clicks: consoleData.summary.totalClicks,
        ctr: consoleData.summary.averageCTR,
        position: consoleData.summary.averagePosition,
        queries: consoleData.topQueries.map((q: any) => ({
          query: q.query,
          impressions: q.impressions,
          clicks: q.clicks,
          ctr: q.ctr,
          position: q.position
        })),
        pages: consoleData.topPages.map((p: any) => ({
          page: p.page,
          impressions: p.impressions,
          clicks: p.clicks,
          ctr: p.ctr,
          position: p.position
        }))
      };

      setData(transformedData);
      toast.success('Search Console data updated successfully');
    } catch (err) {
      setError('Failed to fetch Search Console data');
      toast.error('Failed to fetch Search Console data');
      console.error('Search Console integration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchSearchConsoleData();
  };

  useEffect(() => {
    // Auto-fetch data on mount
    fetchSearchConsoleData();
  }, []);

  return {
    data,
    loading,
    error,
    refreshData,
    fetchSearchConsoleData
  };
};
