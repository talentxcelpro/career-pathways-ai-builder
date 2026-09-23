import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { INDUSTRY_DOMAINS } from '@/config/jobs/industryDomains';

export default function GlobalJobsIndustries() {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">360+ Industry Domains Taxonomy Matrix</CardTitle>
        <p className="text-xs text-muted-foreground">Granular professional domains mapped to Level-1 Families with fresher compatibility</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {INDUSTRY_DOMAINS.map((d) => (
            <div key={d.id} className="p-3 bg-muted/20 rounded-lg border border-border/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs text-foreground">{d.name}</span>
                <Badge variant="outline" className="text-[10px]">{d.familyId}</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{d.description}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/20">
                <span>Fresher: {d.fresherFriendly ? 'Yes' : 'Mid+'}</span>
                <span>{d.typicalOccupations[0] || 'Specialist'}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
