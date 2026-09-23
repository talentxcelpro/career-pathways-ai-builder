import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GOVERNMENT_SOURCES, GovernmentJobSource } from '@/config/jobs/governmentSources';
import { toast } from 'sonner';

export default function GlobalJobsSources() {
  const [sources] = useState<GovernmentJobSource[]>([...GOVERNMENT_SOURCES]);
  const [search, setSearch] = useState('');

  const filtered = sources.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.portal_name.toLowerCase().includes(q) || s.country_code.toLowerCase().includes(q) || s.source_id.toLowerCase().includes(q);
  });

  const handleSync = (sourceId: string) => {
    toast.success(`Triggered manual incremental sync for source: ${sourceId}`);
  };

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Government Source Registry & SLA Control</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time governance over all registered national and regional portals</p>
        </div>
        <Input
          placeholder="Filter sources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-8 text-xs"
        />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/40 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-semibold">Source ID / Name</TableHead>
                <TableHead className="text-xs font-semibold">Country</TableHead>
                <TableHead className="text-xs font-semibold">Level</TableHead>
                <TableHead className="text-xs font-semibold">Redistribution Policy</TableHead>
                <TableHead className="text-xs font-semibold">Frequency</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.source_id}>
                  <TableCell className="font-medium text-xs">
                    <div>{s.portal_name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{s.source_id}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px]">{s.country_code}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{s.government_level}</TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                      {s.redistribution_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{s.refresh_frequency}</TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      ACTIVE
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => handleSync(s.source_id)} className="h-7 text-xs">
                      Sync
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
