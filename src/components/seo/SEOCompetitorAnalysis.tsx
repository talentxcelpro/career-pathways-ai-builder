import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Search, Target } from 'lucide-react';
import { toast } from 'sonner';

export const SEOCompetitorAnalysis = () => {
  const [competitor, setCompetitor] = useState('');

  const competitorData = [
    { domain: 'indeed.com', keywords: 245000, traffic: 89000000, authority: 88 },
    { domain: 'linkedin.com', keywords: 189000, traffic: 156000000, authority: 98 },
    { domain: 'glassdoor.com', keywords: 123000, traffic: 45000000, authority: 85 }
  ];

  const handleAnalyze = () => {
    if (!competitor.trim()) {
      toast.error('Please enter a competitor domain');
      return;
    }
    toast.success('Competitor analysis completed!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Competitor Analysis
          </CardTitle>
          <CardDescription>Analyze your competitors' SEO strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter competitor domain"
              value={competitor}
              onChange={(e) => setCompetitor(e.target.value)}
            />
            <Button onClick={handleAnalyze}>Analyze Competitor</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Competitors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitorData.map((comp, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">{comp.domain}</div>
                  <div className="text-sm text-muted-foreground">Domain Authority: {comp.authority}</div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{comp.keywords.toLocaleString()}</div>
                    <div className="text-muted-foreground">Keywords</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{(comp.traffic / 1000000).toFixed(1)}M</div>
                    <div className="text-muted-foreground">Traffic</div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};