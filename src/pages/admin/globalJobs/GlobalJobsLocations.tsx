import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function GlobalJobsLocations() {
  const sampleLocations = [
    { city: 'Mumbai', region: 'Maharashtra', country: 'India', aliases: ['Bombay', 'BOM'], tier: 'Tier 1', confidence: '1.00 (Exact)' },
    { city: 'Bengaluru', region: 'Karnataka', country: 'India', aliases: ['Bangalore', 'BLR'], tier: 'Tier 1', confidence: '1.00 (Exact)' },
    { city: 'New Delhi', region: 'Delhi', country: 'India', aliases: ['Delhi NCR', 'NCR'], tier: 'Tier 1', confidence: '1.00 (Exact)' },
    { city: 'Washington DC', region: 'District of Columbia', country: 'United States', aliases: ['DC', 'Washington'], tier: 'Global Hub', confidence: '1.00 (Exact)' },
    { city: 'London', region: 'Greater London', country: 'United Kingdom', aliases: ['LON'], tier: 'Global Hub', confidence: '1.00 (Exact)' },
    { city: 'Noida', region: 'Uttar Pradesh', country: 'India', aliases: ['Gautam Buddha Nagar'], tier: 'Tier 2', confidence: '1.00 (Exact)' },
  ];

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">10,000–20,000 Normalized Locations & Aliases</CardTitle>
        <p className="text-xs text-muted-foreground">Database-backed location graph with alias resolution and strict confidence gating</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sampleLocations.map((loc) => (
            <div key={loc.city} className="p-3 bg-muted/20 rounded-lg border border-border/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">{loc.city}</span>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">{loc.tier}</Badge>
              </div>
              <div className="text-[11px] text-muted-foreground">{loc.region}, {loc.country}</div>
              <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/20 flex justify-between">
                <span>Aliases: {loc.aliases.join(', ')}</span>
                <span className="text-emerald-500 font-medium">{loc.confidence}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
