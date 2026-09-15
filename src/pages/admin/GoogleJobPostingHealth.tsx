// src/pages/admin/GoogleJobPostingHealth.tsx
// Real-time Health, Audit & Drift Reconciliation Dashboard for Google Job Postings

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Layers,
  Search,
  FileCheck
} from 'lucide-react';
import { auditGoogleJobPostingHealth, reconcileJobDrift, GoogleJobHealthReport } from '@/services/seo/googleJobPostingSync';
import { toast } from 'sonner';

export const GoogleJobPostingHealth: React.FC = () => {
  const [report, setReport] = useState<GoogleJobHealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const data = await auditGoogleJobPostingHealth();
      setReport(data);
    } catch (err: any) {
      toast.error('Failed to load Google Job Posting health metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async () => {
    try {
      setReconciling(true);
      const res = await reconcileJobDrift();
      toast.success(`Drift reconciled: checked ${res.reconciledCount} jobs`);
      await fetchHealth();
    } catch (err: any) {
      toast.error('Failed to run drift reconciliation');
    } finally {
      setReconciling(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Google Job Postings Health &amp; Sync
            </h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs py-0.5">
              Live Audit
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time validation against Google Search Console JobPosting rich result requirements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchHealth} 
            disabled={loading}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Re-Audit
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleReconcile} 
            disabled={reconciling}
            className="gap-2 text-xs bg-blue-600 hover:bg-blue-500 text-white"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {reconciling ? 'Reconciling...' : 'Run Drift Reconciliation'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Active Jobs</CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Layers className="h-6 w-6 text-blue-500" />
              {report?.totalJobsAudited || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">In database</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Google Eligible</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              {report?.googleEligibleCount || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-700/80">100% compliant schema emitted</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-600">Schema Blocked</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-600 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              {report?.schemaBlockedCount || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-amber-700/80">Fail-closed (no broken schema)</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Expired Still Live</CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-6 w-6 text-slate-400" />
              {report?.expiredStillLiveCount || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Target: 0</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Checklist */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-500" />
            Zero-Error Quality Gate Breakdown
          </CardTitle>
          <CardDescription>
            Verifies that critical Google Search Console requirements are strictly satisfied.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl border border-border/60 bg-card flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Missing Title</p>
                <p className="text-xl font-bold text-foreground">{report?.missingTitleCount || 0}</p>
              </div>
              {(report?.missingTitleCount || 0) === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-card flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Missing datePosted</p>
                <p className="text-xl font-bold text-foreground">{report?.missingDatePostedCount || 0}</p>
              </div>
              {(report?.missingDatePostedCount || 0) === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-card flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Missing Employer</p>
                <p className="text-xl font-bold text-foreground">{report?.missingEmployerCount || 0}</p>
              </div>
              {(report?.missingEmployerCount || 0) === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-card flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Missing Apply URL</p>
                <p className="text-xl font-bold text-foreground">{report?.missingApplyUrlCount || 0}</p>
              </div>
              {(report?.missingApplyUrlCount || 0) === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked / Non-Compliant Jobs Table */}
      {report && report.failedJobs.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Schema-Blocked Jobs (Fail-Closed Quarantine)
            </CardTitle>
            <CardDescription>
              These jobs are safe: their structured data is suppressed to prevent Google Search Console validation errors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Job Title</TableHead>
                    <TableHead>Reasons Blocked</TableHead>
                    <TableHead className="w-[100px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.failedJobs.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <span className="text-foreground block">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{item.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {item.reasons.map((r, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] bg-red-500/10 text-red-600 border-red-500/20">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          asChild 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                        >
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoogleJobPostingHealth;
