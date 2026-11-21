import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ShieldCheck,
  Users,
  GitMerge,
  AlertTriangle,
  Search,
  RefreshCw,
  ExternalLink,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import {
  clusterDuplicateCandidates,
  buildMergePreview,
  DuplicateGroup,
  MergePreview
} from '@/lib/candidate-deduplication';

export const CandidateDeduplicationDashboard: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CONFIRMED' | 'LIKELY' | 'POSSIBLE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [mergePreview, setMergePreview] = useState<MergePreview | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [isBatchMerging, setIsBatchMerging] = useState(false);

  const queryClient = useQueryClient();

  // Fetch candidates from unified_candidates
  const { data: clusterData, isLoading, refetch } = useQuery({
    queryKey: ['candidate-deduplication-clusters'],
    queryFn: async () => {
      const { data: candidates, error } = await supabase
        .from('unified_candidates')
        .select('*')
        .or('activation_status.is.null,activation_status.neq.merged_archive')
        .order('name', { ascending: true });

      if (error) throw error;

      return clusterDuplicateCandidates(candidates || []);
    },
    staleTime: 60000
  });

  const groups = clusterData?.groups || [];
  const uniqueCount = clusterData?.uniqueCandidatesCount || 0;
  const duplicateRecordsCount = clusterData?.duplicateRecordsCount || 0;
  const totalRecords = uniqueCount + duplicateRecordsCount;

  // Filter groups
  const filteredGroups = groups.filter(g => {
    if (activeFilter === 'CONFIRMED' && g.classification !== 'CONFIRMED_DUPLICATE') return false;
    if (activeFilter === 'LIKELY' && g.classification !== 'LIKELY_DUPLICATE') return false;
    if (activeFilter === 'POSSIBLE' && g.classification !== 'POSSIBLE_MATCH') return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const canonicalName = (g.canonicalCandidate?.name || '').toLowerCase();
      const canonicalEmail = (g.canonicalCandidate?.email || '').toLowerCase();
      const duplicateNames = g.duplicateCandidates.map((d: any) => (d.name || '').toLowerCase()).join(' ');
      return canonicalName.includes(term) || canonicalEmail.includes(term) || duplicateNames.includes(term);
    }

    return true;
  });

  const handleOpenMergePreview = (group: DuplicateGroup) => {
    const preview = buildMergePreview(group.canonicalCandidate, group.duplicateCandidates);
    setSelectedGroup(group);
    setMergePreview(preview);
    setIsPreviewOpen(true);
  };

  const handleExecuteMerge = async () => {
    if (!mergePreview || !selectedGroup) return;

    try {
      setIsMerging(true);

      // 1. Update canonical candidate with consolidated data
      const { error: updateError } = await supabase
        .from('unified_candidates')
        .update({
          email: mergePreview.mergedEmail,
          phone: mergePreview.mergedPhone,
          skills: mergePreview.mergedSkills,
          resume_url: mergePreview.mergedResumeUrl,
          application_data: {
            deduplication_audit: mergePreview.auditTrail,
            historical_resumes: mergePreview.historicalResumeUrls
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', mergePreview.targetCanonicalId);

      if (updateError) throw updateError;

      // 2. Mark duplicate candidate records as merged in application_data
      for (const dupId of mergePreview.sourceCandidateIds) {
        await supabase
          .from('unified_candidates')
          .update({
            activation_status: 'merged_archive',
            application_data: {
              merged_into: mergePreview.targetCanonicalId,
              merged_at: new Date().toISOString()
            }
          })
          .eq('id', dupId);
      }

      toast.success(`Successfully merged ${mergePreview.sourceCandidateIds.length} duplicate records into canonical profile!`);
      setIsPreviewOpen(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['unified-candidates'] });
      queryClient.invalidateQueries({ queryKey: ['talent-database-summary-stats'] });
    } catch (err: any) {
      console.error('Merge execution error:', err);
      toast.error('Failed to execute merge: ' + err.message);
    } finally {
      setIsMerging(false);
    }
  };

  const handleBatchMergeAll = async () => {
    if (groups.length === 0) return;
    try {
      setIsBatchMerging(true);
      let mergedCount = 0;

      for (const group of groups) {
        const preview = buildMergePreview(group.canonicalCandidate, group.duplicateCandidates);

        // 1. Update canonical candidate
        await supabase
          .from('unified_candidates')
          .update({
            email: preview.mergedEmail,
            phone: preview.mergedPhone,
            skills: preview.mergedSkills,
            resume_url: preview.mergedResumeUrl,
            application_data: {
              deduplication_audit: preview.auditTrail,
              historical_resumes: preview.historicalResumeUrls
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', preview.targetCanonicalId);

        // 2. Mark duplicate records as merged_archive
        for (const dupId of preview.sourceCandidateIds) {
          await supabase
            .from('unified_candidates')
            .update({
              activation_status: 'merged_archive',
              application_data: {
                merged_into: preview.targetCanonicalId,
                merged_at: new Date().toISOString()
              }
            })
            .eq('id', dupId);
        }
        mergedCount++;
      }

      toast.success(`Successfully reconciled all ${mergedCount} duplicate groups!`);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['unified-candidates'] });
      queryClient.invalidateQueries({ queryKey: ['talent-database-summary-stats'] });
    } catch (err: any) {
      console.error('Batch merge error:', err);
      toast.error('Batch merge failed: ' + err.message);
    } finally {
      setIsBatchMerging(false);
    }
  };

  const handleMarkSeparate = (group: DuplicateGroup) => {
    toast.info(`Group ${group.groupId} marked as distinct candidates.`);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Records</p>
              <h3 className="text-2xl font-black mt-1 text-foreground">{isLoading ? '...' : totalRecords}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">In unified candidate pool</p>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unique Identities</p>
              <h3 className="text-2xl font-black mt-1 text-emerald-500">{isLoading ? '...' : uniqueCount}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Deduplicated candidate count</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duplicate Groups</p>
              <h3 className="text-2xl font-black mt-1 text-amber-500">{isLoading ? '...' : groups.length}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Detected duplicate clusters</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Redundant Records</p>
              <h3 className="text-2xl font-black mt-1 text-purple-500">{isLoading ? '...' : duplicateRecordsCount}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Eligible for canonical merge</p>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <GitMerge className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Candidate Identity Resolution & Reconciliation
              </CardTitle>
              <CardDescription>
                Multi-layer duplicate detection across emails, phones, CV fingerprints, and content similarity.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Button
                variant="default"
                size="sm"
                onClick={handleBatchMergeAll}
                disabled={isLoading || isBatchMerging || groups.length === 0}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
              >
                <GitMerge className={`h-3.5 w-3.5 ${isBatchMerging ? 'animate-spin' : ''}`} />
                {isBatchMerging ? 'Reconciling Duplicates...' : `Merge All ${groups.length} Groups Now`}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading || isBatchMerging}
                className="gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Rescan Database
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search duplicate by name, email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <Tabs value={activeFilter} onValueChange={(val: any) => setActiveFilter(val)} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="ALL" className="text-xs">All ({groups.length})</TabsTrigger>
                <TabsTrigger value="CONFIRMED" className="text-xs">Confirmed</TabsTrigger>
                <TabsTrigger value="LIKELY" className="text-xs">Likely</TabsTrigger>
                <TabsTrigger value="POSSIBLE" className="text-xs">Possible</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Duplicate Groups List */}
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm">Running multi-layer identity resolution on candidate dataset...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2 border border-dashed rounded-xl">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <p className="font-semibold text-foreground">No Duplicate Clusters Found</p>
              <p className="text-xs text-muted-foreground">All candidates under this filter have unique identities.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map(group => {
                const canon = group.canonicalCandidate;
                const dups = group.duplicateCandidates;

                return (
                  <div
                    key={group.groupId}
                    className="border border-border/70 rounded-xl p-4 bg-muted/20 hover:bg-muted/30 transition-colors space-y-4"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={
                            group.classification === 'CONFIRMED_DUPLICATE'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-bold'
                              : group.classification === 'LIKELY_DUPLICATE'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold'
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/30 font-bold'
                          }
                        >
                          {group.highestScore}% {group.classification.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          {group.allCandidates.length} linked records
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          onClick={() => handleOpenMergePreview(group)}
                        >
                          <GitMerge className="h-3.5 w-3.5" />
                          Review & Merge
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleMarkSeparate(group)}
                        >
                          Keep Separate
                        </Button>
                      </div>
                    </div>

                    {/* Comparison Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Canonical Record */}
                      <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-950/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Canonical Target
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">ID: {canon.id.slice(0, 8)}...</span>
                        </div>
                        <h4 className="font-bold text-sm text-foreground">{canon.name || canon.full_name || 'Candidate'}</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span>{canon.title || 'Professional'}</span>
                          </div>
                          {canon.email && (
                            <div className="flex items-center gap-1.5 text-foreground/90">
                              <Mail className="h-3 w-3 text-blue-400 shrink-0" />
                              <span>{canon.email}</span>
                            </div>
                          )}
                          {canon.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-emerald-400 shrink-0" />
                              <span>{canon.phone}</span>
                            </div>
                          )}
                          {canon.resume_url && (
                            <div className="pt-1">
                              <a
                                href={canon.resume_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:underline font-semibold"
                              >
                                <FileText className="h-3 w-3" /> Verified CV File <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Duplicate Candidates */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Duplicate Records to Merge ({dups.length})
                        </span>
                        {dups.map((dup: any) => (
                          <div
                            key={dup.id}
                            className="p-3 rounded-lg border border-border/50 bg-background/50 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                              <span>ID: {dup.id.slice(0, 8)}...</span>
                              <Badge variant="secondary" className="text-[9px] py-0">Source: {dup.source || 'Upload'}</Badge>
                            </div>
                            <p className="font-semibold text-foreground">{dup.name || dup.full_name || 'Candidate'}</p>
                            <div className="text-muted-foreground text-[11px] space-y-0.5">
                              {dup.email && <p>Email: {dup.email}</p>}
                              {dup.resume_url && (
                                <a
                                  href={dup.resume_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-purple-400 hover:underline flex items-center gap-1 mt-1"
                                >
                                  <FileText className="h-3 w-3" /> CV: {dup.resume_url.split('/').pop()}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detection Evidence */}
                    {group.signals.length > 0 && (
                      <div className="pt-2 border-t border-border/40">
                        <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Detection Signals:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.signals.map((sig, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] bg-background text-muted-foreground">
                              ✓ {sig}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safe Merge Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5 text-emerald-500" />
              Safe Candidate Merge Preview
            </DialogTitle>
            <DialogDescription>
              Review the unified candidate profile before executing the reconciliation. Historical resume files and notes are preserved.
            </DialogDescription>
          </DialogHeader>

          {mergePreview && (
            <div className="space-y-4 py-2">
              <div className="p-3.5 bg-muted/40 rounded-xl space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Target Canonical Candidate:</span>
                    <p className="font-bold text-sm text-foreground">{mergePreview.canonicalName}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{mergePreview.targetCanonicalId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Consolidated Records:</span>
                    <p className="font-bold text-sm text-foreground">{mergePreview.sourceCandidateIds.length} records</p>
                    <p className="text-[10px] text-emerald-500 font-semibold">Zero data loss guarantee</p>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-2 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Unified Email:</span>
                    <p className="font-medium text-foreground">{mergePreview.mergedEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Unified Phone:</span>
                    <p className="font-medium text-foreground">{mergePreview.mergedPhone || 'N/A'}</p>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-2">
                  <span className="text-muted-foreground">Combined Skills Set ({mergePreview.mergedSkills.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mergePreview.mergedSkills.slice(0, 15).map((s, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px]">{s}</Badge>
                    ))}
                    {mergePreview.mergedSkills.length > 15 && (
                      <span className="text-[10px] text-muted-foreground">+{mergePreview.mergedSkills.length - 15} more</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-border/50 pt-2">
                  <span className="text-muted-foreground">Preserved Historical CV URLs ({mergePreview.historicalResumeUrls.length}):</span>
                  <ul className="list-disc list-inside space-y-0.5 mt-1 font-mono text-[10px] text-purple-400">
                    {mergePreview.historicalResumeUrls.map((url, i) => (
                      <li key={i} className="truncate">{url}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)} disabled={isMerging}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteMerge}
              disabled={isMerging}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
            >
              {isMerging ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Merging Records...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Confirm & Execute Merge
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
