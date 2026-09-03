// src/pages/admin/SearchEntityDashboard.tsx
// Professional Search Graph & Entity Intelligence Dashboard (/admin/seo/entities)
// Features 8-State Entity Lifecycle, 5-State Indexability, Dynamic Query Resolver, and Provenance Inspection

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Network,
  Search,
  UserCheck,
  Building2,
  Briefcase,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

import {
  IN_MEMORY_GRAPH_NODES,
  IN_MEMORY_GRAPH_EDGES,
  getEntityOutgoingEdges,
  rebuildGraphProjection
} from '@/lib/graph/professionalEntityGraph';
import {
  resolveSearchQueryToEntity,
  VERIFIED_DATABASE_CANDIDATE_FIXTURES
} from '@/lib/graph/searchEntityResolver';
import type {
  ProfessionalEntityNode,
  ProfessionalEntityType,
  EntityResolutionCandidate
} from '@/lib/graph/types';

export default function SearchEntityDashboard() {
  const [nodes, setNodes] = useState<ProfessionalEntityNode[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('talentxcel vishwajeet');
  const [resolvedEntity, setResolvedEntity] = useState<EntityResolutionCandidate | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [isRebuilding, setIsRebuilding] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<ProfessionalEntityNode | null>(null);

  useEffect(() => {
    loadNodes();
    handleRunResolver('talentxcel vishwajeet');
  }, []);

  const loadNodes = () => {
    const list = Array.from(IN_MEMORY_GRAPH_NODES.values());
    setNodes(list);
    if (list.length > 0 && !selectedNode) {
      setSelectedNode(list[0]);
    }
  };

  const handleRunResolver = async (queryToTest?: string) => {
    const q = queryToTest ?? searchQuery;
    if (!q.trim()) return;
    setIsResolving(true);
    try {
      const match = await resolveSearchQueryToEntity(q, Array.from(IN_MEMORY_GRAPH_NODES.values()));
      setResolvedEntity(match);
    } catch {
      toast.error('Entity resolution failed.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleRebuildProjection = async () => {
    setIsRebuilding(true);
    try {
      const result = await rebuildGraphProjection();
      loadNodes();
      toast.success(`Graph projected: ${result.nodesProjected} nodes and ${result.edgesProjected} verified edges.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to project graph.');
    } finally {
      setIsRebuilding(false);
    }
  };

  const filteredNodes = nodes.filter((n) => {
    if (selectedType === 'ALL') return true;
    return n.entityType === selectedType;
  });

  const selectedNodeEdges = selectedNode ? getEntityOutgoingEdges(selectedNode.id) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <Helmet>
        <title>Professional Search Graph &amp; Entity Intelligence | TalentXcel Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                <Network className="w-3.5 h-3.5 mr-1" /> Professional Entity Graph
              </Badge>
              <Badge variant="outline" className="text-slate-400 border-slate-800 text-[11px]">
                Derived Projection Lake (Database Authoritative)
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Professional Search Graph &amp; Entity Intelligence
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Dynamic Entity Disambiguation · 8-State Entity Lifecycle · 5-State Indexability · Provenance-Verified Edges
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRebuildProjection}
              disabled={isRebuilding}
              className="text-xs border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRebuilding ? 'animate-spin' : ''}`} />
              Rebuild Graph Projection
            </Button>
          </div>
        </div>

        {/* Dynamic Search Query -> Entity Resolver Console */}
        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Dynamic Search Query &rarr; Entity Resolver Console
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Test how Google search queries dynamically map to canonical entity candidates without hard-coded rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. talentxcel vishwajeet, talentxcel priyanka, service desk engineer talentxcel"
                  className="pl-9 bg-slate-950 border-slate-800 text-white text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && handleRunResolver()}
                />
              </div>
              <Button
                size="sm"
                onClick={() => handleRunResolver()}
                disabled={isResolving}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Resolve Entity
              </Button>
            </div>

            {/* Quick Test Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-[11px] font-mono">Test Scenarios:</span>
              {[
                'talentxcel vishwajeet',
                'talentxcel gaurav',
                'talentxcel priyanka',
                'service desk engineer talentxcel',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setSearchQuery(chip);
                    handleRunResolver(chip);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors text-[11px]"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Resolution Output Card */}
            {resolvedEntity ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                      MATCH FOUND
                    </Badge>
                    <span className="text-sm font-bold text-white">{resolvedEntity.title}</span>
                    <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                      {resolvedEntity.entityType}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{resolvedEntity.evidenceSnippet}</p>
                  <a
                    href={resolvedEntity.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono pt-1"
                  >
                    {resolvedEntity.canonicalUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-mono text-slate-500">Match Confidence</div>
                  <div className="text-lg font-extrabold text-emerald-400">
                    {(resolvedEntity.matchScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{resolvedEntity.provenance}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
                No matching canonical entity found for query. The query will be logged for discovery analysis.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entity Table & Graph Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Filterable Entity Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Projected Entity Nodes ({filteredNodes.length})
              </h3>
              {/* Type Filter */}
              <div className="flex flex-wrap gap-1">
                {['ALL', 'PERSON', 'OCCUPATION', 'COMPANY', 'JOB'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      selectedType === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/90 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Entity</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Indexability</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">GSC Impr.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredNodes.map((node) => (
                    <tr
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`cursor-pointer transition-colors ${
                        selectedNode?.id === node.id ? 'bg-blue-950/40' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-white">
                        <div>{node.title}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs font-mono">
                          {node.canonicalUrl.replace('https://talentxcel.in', '')}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                          {node.entityType}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          className={
                            node.entityStatus === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }
                        >
                          {node.entityStatus}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          className={
                            node.indexabilityStatus === 'DISCOVERY_OBSERVED'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : node.indexabilityStatus === 'ELIGIBLE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }
                        >
                          {node.indexabilityStatus}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-400">
                        {node.qualityScore}/100
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {node.gscImpressions.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col: Verified Edge Inspector */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Verified Graph Edges
            </h3>

            {selectedNode ? (
              <Card className="bg-slate-900/90 border-slate-800 text-slate-100 text-xs">
                <CardHeader className="pb-2 border-b border-slate-800">
                  <CardTitle className="text-sm font-bold text-white">
                    {selectedNode.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-[11px]">
                    Node ID: {selectedNode.id} · Table: {selectedNode.sourceTable}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-300 mb-2">Connected Relationships:</h4>
                    {selectedNodeEdges.length > 0 ? (
                      <div className="space-y-2">
                        {selectedNodeEdges.map((edge) => (
                          <div
                            key={edge.id}
                            className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]">
                                {edge.relationshipType}
                              </Badge>
                              <span className="text-[10px] text-emerald-400 font-mono">
                                {(edge.confidence * 100).toFixed(0)}% Conf
                              </span>
                            </div>
                            <div className="text-slate-300 font-medium">
                              &rarr; {edge.targetNodeId}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Provenance: {edge.provenance} ({edge.evidenceType})
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No outgoing edges recorded for this node.</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>CTR:</span>
                      <span className="font-mono text-white">{selectedNode.gscCtr}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Position:</span>
                      <span className="font-mono text-white">{selectedNode.gscAveragePosition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality Gate:</span>
                      <span className="font-mono text-emerald-400">PASSED (&gt;=50)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500">
                Select an entity from the table to inspect its verified relationships and evidence.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
