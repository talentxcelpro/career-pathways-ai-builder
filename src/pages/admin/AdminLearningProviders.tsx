import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { providerVerificationService, ProviderAuditSummary } from '@/services/providerVerificationService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Building2, 
  ShieldCheck, 
  RefreshCw, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter
} from 'lucide-react';

export const AdminLearningProviders: React.FC = () => {

  const { data: auditSummary, isLoading, refetch } = useQuery<ProviderAuditSummary>({
    queryKey: ['admin-provider-audit'],
    queryFn: () => providerVerificationService.runProviderAudit()
  });

  const handleReverify = async (providerId: string, name: string) => {
    toast.loading(`Re-verifying official domain for ${name}...`);
    await providerVerificationService.reverifyProviderDomain(providerId);
    toast.dismiss();
    toast.success(`Domain health verified for ${name}!`);
    refetch();
  };

  if (isLoading || !auditSummary) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-muted-foreground">Running Provider Health Audit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-6 sm:p-10 space-y-8 text-slate-900 dark:text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-blue-600" />
            <span>Learning Provider Directory & Verification Audit</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Real-time provider domain health, verified course counts, and lifecycle management.
          </p>
        </div>

        <Button
          onClick={() => refetch()}
          className="rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-xs cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Re-Run Provider Audit</span>
        </Button>
      </div>

      {/* 15. PROVIDER HEALTH STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'TOTAL PROVIDERS', val: auditSummary.totalProviders, color: 'text-slate-900 dark:text-white' },
          { label: 'VERIFIED', val: auditSummary.verifiedProviders, color: 'text-emerald-600' },
          { label: 'NEEDS REVIEW', val: auditSummary.needsReviewProviders, color: 'text-amber-600' },
          { label: 'INACTIVE', val: auditSummary.inactiveProviders, color: 'text-red-600' },
          { label: 'WITH COURSES', val: auditSummary.providersWithVerifiedCourses, color: 'text-blue-600' },
          { label: 'WITHOUT COURSES', val: auditSummary.providersWithoutCourses, color: 'text-purple-600' },
          { label: 'ORPHANED', val: auditSummary.orphanedCourseProviders, color: 'text-rose-600' },
          { label: 'DUPLICATES', val: auditSummary.duplicateProviders, color: 'text-slate-500' }
        ].map((stat, i) => (
          <Card key={i} className="p-3 text-center rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-2xs">
            <div className={`text-xl font-extrabold ${stat.color}`}>{stat.val}</div>
            <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pt-1">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* 16. PROVIDER HEALTH BREAKDOWN TABLE */}
      <Card className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-md overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-border/40 p-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-extrabold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <span>Verified Provider Directory & Domain Health</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs font-bold">
            {auditSummary.providerList.length} Providers Audited
          </Badge>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-extrabold">Provider Name</TableHead>
                <TableHead className="text-xs font-extrabold">Verification Status</TableHead>
                <TableHead className="text-xs font-extrabold">Verified Courses</TableHead>
                <TableHead className="text-xs font-extrabold">Official Domain</TableHead>
                <TableHead className="text-xs font-extrabold">Last Verified</TableHead>
                <TableHead className="text-xs font-extrabold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditSummary.providerList.map(p => (
                <TableRow key={p.id} className="hover:bg-slate-50 dark:hover:bg-muted/20">
                  
                  <TableCell className="font-extrabold text-xs text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>{p.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={
                      p.verification_status === 'VERIFIED' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px]' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold text-[10px]'
                    }>
                      {p.verification_status}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-extrabold text-xs text-blue-600">
                    {p.verified_course_count} Verified Courses
                  </TableCell>

                  <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 underline flex items-center gap-1">
                      <span className="truncate max-w-[180px]">{p.website}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </TableCell>

                  <TableCell className="text-xs font-medium text-slate-500">
                    {new Date(p.last_verified_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReverify(p.id, p.name)}
                      className="rounded-xl text-xs font-bold border-slate-300 dark:border-border cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" /> Re-verify
                    </Button>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

    </div>
  );
};

export default AdminLearningProviders;
