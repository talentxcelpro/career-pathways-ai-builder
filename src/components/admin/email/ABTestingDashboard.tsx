import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const ABTestingDashboard = () => {
  const { data: tests, isLoading } = useQuery({
    queryKey: ['email-ab-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_ab_tests')
        .select('*')
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const calculateMetrics = (test: any) => {
    const variantAOpenRate = test.variant_a_sent > 0 
      ? ((test.variant_a_opened / test.variant_a_sent) * 100).toFixed(1) 
      : '0';
    const variantBOpenRate = test.variant_b_sent > 0 
      ? ((test.variant_b_opened / test.variant_b_sent) * 100).toFixed(1) 
      : '0';
    const variantAClickRate = test.variant_a_sent > 0 
      ? ((test.variant_a_clicked / test.variant_a_sent) * 100).toFixed(1) 
      : '0';
    const variantBClickRate = test.variant_b_sent > 0 
      ? ((test.variant_b_clicked / test.variant_b_sent) * 100).toFixed(1) 
      : '0';
    
    return { variantAOpenRate, variantBOpenRate, variantAClickRate, variantBClickRate };
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading A/B tests...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>A/B Testing ({tests?.length || 0})</span>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create A/B Test
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tests?.map((test) => {
          const metrics = calculateMetrics(test);
          
          return (
            <Card key={test.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold">{test.test_name}</h4>
                    <p className="text-sm text-muted-foreground">{test.event_key}</p>
                  </div>
                  <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                    {test.status}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Variant A */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold">Variant A</h5>
                      {test.winner === 'a' && (
                        <Badge variant="default" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          Winner
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {test.variant_a_subject}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sent</span>
                        <span className="font-semibold">{test.variant_a_sent}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Open Rate</span>
                        <span className="font-semibold">{metrics.variantAOpenRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Click Rate</span>
                        <span className="font-semibold">{metrics.variantAClickRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Variant B */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold">Variant B</h5>
                      {test.winner === 'b' && (
                        <Badge variant="default" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          Winner
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {test.variant_b_subject}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sent</span>
                        <span className="font-semibold">{test.variant_b_sent}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Open Rate</span>
                        <span className="font-semibold">{metrics.variantBOpenRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Click Rate</span>
                        <span className="font-semibold">{metrics.variantBClickRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Split: {test.split_percentage}% / {100 - test.split_percentage}%
                  </p>
                  {test.status === 'running' && (
                    <Button variant="outline" size="sm">
                      End Test
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {tests?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No A/B tests created yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
