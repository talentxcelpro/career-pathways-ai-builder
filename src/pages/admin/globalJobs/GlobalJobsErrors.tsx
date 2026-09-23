import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function GlobalJobsErrors() {
  const mockErrors = [
    { id: 'err-104', sourceId: 'in-state-psc-sample', type: 'RATE_LIMIT_429', message: 'Target portal responded with 429 Too Many Requests', retryCount: 2, nextRetry: 'in 24 mins', status: 'RETRYING' },
    { id: 'err-103', sourceId: 'us-municipal-feed', type: 'SCHEMA_PARSE_ERROR', message: 'Missing required closingDate field in RSS entry', retryCount: 3, nextRetry: 'in 1h 45m', status: 'DEGRADED' },
  ];

  const handleRetry = (id: string) => {
    toast.success(`Error ${id} pushed to immediate retry queue.`);
  };

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Self-Healing Error & Dead-Letter Console</CardTitle>
        <p className="text-xs text-muted-foreground">Automatic exponential backoff tracking and dead-letter payloads</p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/40 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-semibold">Incident ID</TableHead>
                <TableHead className="text-xs font-semibold">Source ID</TableHead>
                <TableHead className="text-xs font-semibold">Error Type</TableHead>
                <TableHead className="text-xs font-semibold">Message</TableHead>
                <TableHead className="text-xs font-semibold">Retry Count</TableHead>
                <TableHead className="text-xs font-semibold">Next Retry</TableHead>
                <TableHead className="text-xs font-semibold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockErrors.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.id}</TableCell>
                  <TableCell className="font-medium text-xs">{e.sourceId}</TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                      {e.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.message}</TableCell>
                  <TableCell className="text-xs">{e.retryCount} / 3</TableCell>
                  <TableCell className="text-xs">{e.nextRetry}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => handleRetry(e.id)} className="h-7 text-xs">
                      Retry Now
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
