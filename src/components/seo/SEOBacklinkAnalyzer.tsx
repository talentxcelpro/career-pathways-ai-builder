import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link, TrendingUp, Shield, Globe, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const SEOBacklinkAnalyzer = () => {
  const [domain, setDomain] = useState('');

  const backlinkData = [
    { domain: 'techcrunch.com', authority: 95, type: 'dofollow', anchor: 'AI resume builder', traffic: 12500 },
    { domain: 'forbes.com', authority: 92, type: 'dofollow', anchor: 'career platform', traffic: 8900 },
    { domain: 'linkedin.com', authority: 98, type: 'nofollow', anchor: 'job search', traffic: 15600 },
    { domain: 'indeed.com', authority: 88, type: 'dofollow', anchor: 'resume tools', traffic: 6700 }
  ];

  const handleAnalyze = () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain');
      return;
    }
    toast.success('Backlink analysis completed!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            Backlink Analysis
          </CardTitle>
          <CardDescription>Analyze your backlink profile and find new opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter domain (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <Button onClick={handleAnalyze}>Analyze Backlinks</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">12.5K</div>
            <div className="text-sm text-muted-foreground">Total Backlinks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">1,247</div>
            <div className="text-sm text-muted-foreground">Referring Domains</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">72</div>
            <div className="text-sm text-muted-foreground">Domain Authority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">+23</div>
            <div className="text-sm text-muted-foreground">New This Month</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Backlinks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backlinkData.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-semibold">{link.domain}</div>
                    <div className="text-sm text-muted-foreground">Anchor: {link.anchor}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={link.type === 'dofollow' ? 'default' : 'secondary'}>
                    {link.type}
                  </Badge>
                  <div className="text-sm">DA: {link.authority}</div>
                  <div className="text-sm text-muted-foreground">{link.traffic} traffic</div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};