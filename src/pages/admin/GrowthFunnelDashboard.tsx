import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GrowthFunnelDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFunnelData() {
      try {
        // Fetch baseline data (October 2026)
        const { count: totalSignups } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: totalResumes } = await supabase.from('resumes').select('*', { count: 'exact', head: true });
        const { count: totalApplications } = await supabase.from('job_applications').select('*', { count: 'exact', head: true });
        const { count: totalRequirements } = await supabase.from('requirements').select('*', { count: 'exact', head: true });
        const { count: totalShortlists } = await supabase.from('shortlists').select('*', { count: 'exact', head: true });

        // For funnel events, we query user_behavior_events
        const { data: events } = await supabase
          .from('user_behavior_events')
          .select('event_type, count')
          .limit(1000);

        setData({
          baseline: {
            signups: totalSignups || 0,
            resumes: totalResumes || 0,
            applications: totalApplications || 0,
            requirements: totalRequirements || 0,
            shortlists: totalShortlists || 0,
          }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFunnelData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading Growth Dashboard...</div>;
  }

  const candidateFunnelData = [
    { name: 'Signups', count: data?.baseline?.signups || 0 },
    { name: 'Resumes', count: data?.baseline?.resumes || 0 },
    { name: 'Applications', count: data?.baseline?.applications || 0 },
  ];

  const employerFunnelData = [
    { name: 'Requirements', count: data?.baseline?.requirements || 0 },
    { name: 'Shortlists', count: data?.baseline?.shortlists || 0 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Growth OS Funnel Dashboard</h1>
        <p className="text-muted-foreground mt-2">Baseline: October 2026</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.baseline?.signups}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Job Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.baseline?.applications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Employer Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.baseline?.requirements}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Candidate Funnel (Live Data)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candidateFunnelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Employer Funnel (Live Data)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employerFunnelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Quality Warning</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-600">
            INSUFFICIENT DATA for advanced funnel cohorts (Matches, Interviews, Hires, Retention).
            Tracking has just been activated. Real cohort data will populate as users navigate the fixed architecture.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
