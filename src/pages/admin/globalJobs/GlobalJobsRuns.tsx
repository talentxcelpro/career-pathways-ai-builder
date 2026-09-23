import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function GlobalJobsRuns() {
  const mockRuns = [
    { id: 'run-892', wave: 'Wave 3 — India + Middle East', startedAt: '2026-09-23 08:00 UTC', duration: '18m 42s', jobsDiscovered: 48210, published: 12490, status: 'COMPLETED' },
    { id: 'run-891', wave: 'Wave 2 — Europe + Africa', startedAt: '2026-09-23 04:00 UTC', duration: '14m 10s', jobsDiscovered: 29400, published: 8120, status: 'COMPLETED' },
    { id: 'run-890', wave: 'Wave 1 — Americas', startedAt: '2026-09-23 00:00 UTC', duration: '22m 15s', jobsDiscovered: 64200, published: 15400, status: 'COMPLETED' },
    { id: 'run-889', wave: 'Wave 5 — Retries & Priorities', startedAt: '2026-09-22 20:00 UTC', duration: '08m 33s', jobsDiscovered: 12100, published: 2940, status: 'COMPLETED' },
  ];

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Historical Automation Wave Logs</CardTitle>
        <p className="text-xs text-muted-foreground">Execution history, cycle durations, and publication yields</p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/40 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-semibold">Run ID</TableHead>
                <TableHead className="text-xs font-semibold">Operational Wave</TableHead>
                <TableHead className="text-xs font-semibold">Started At</TableHead>
                <TableHead className="text-xs font-semibold">Duration</TableHead>
                <TableHead className="text-xs font-semibold">Discovered</TableHead>
                <TableHead className="text-xs font-semibold">Published</TableHead>
                <TableHead className="text-xs font-semibold text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRuns.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="text-xs font-medium">{r.wave}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.startedAt}</TableCell>
                  <TableCell className="text-xs">{r.duration}</TableCell>
                  <TableCell className="text-xs">{r.jobsDiscovered.toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-semibold text-emerald-500">{r.published.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      {r.status}
                    </Badge>
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
