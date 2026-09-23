import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GOVERNMENT_COUNTRIES } from '@/config/jobs/governmentCountries';

export default function GlobalJobsCoverage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {GOVERNMENT_COUNTRIES.map((c) => (
        <Card key={c.country_code} className="bg-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{c.country_name}</span>
              <Badge variant="outline" className="text-[10px]">{c.country_code}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              National Portal: <a href={c.national_portal_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{c.national_portal_name}</a>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/30">
              <span className="text-muted-foreground">Government Term:</span>
              <span className="font-medium">{c.government_job_term}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
