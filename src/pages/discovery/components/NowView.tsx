import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Briefcase, 
  CheckCircle2, 
  ExternalLink, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  Layers,
  Search,
  Filter
} from 'lucide-react';
import { TalentXcelTruth, VerifiedLocationSupply } from '@/lib/udx/domains/career/TalentXcelTruth';
import { DemandQueriesTable, DemandEntity } from './DemandQueriesTable';

interface Opportunity {
  opportunity_id: string;
  opportunity_type: string;
  priority: string;
  quadrant: string;
  opportunity_score: number;
  status: string;
  recommended_action: string;
  created_at: string;
  udx_demand_entities?: DemandEntity;
}

interface NowViewProps {
  opportunities: Opportunity[];
  entities: DemandEntity[];
  totalEntitiesCount: number;
  totalOpportunitiesCount: number;
  selectedQuadrant: string;
  setSelectedQuadrant: (q: string) => void;
  oppSearch: string;
  setOppSearch: (s: string) => void;
}

export const NowView: React.FC<NowViewProps> = ({
  opportunities,
  entities,
  totalEntitiesCount,
  totalOpportunitiesCount,
  selectedQuadrant,
  setSelectedQuadrant,
  oppSearch,
  setOppSearch,
}) => {
  const [activeLocation, setActiveLocation] = useState<string>('GLOBAL');
  const supply: VerifiedLocationSupply = TalentXcelTruth.evaluateLocationSupply(activeLocation);

  const filteredOpps = opportunities.filter(o => {
    const matchesQuadrant = selectedQuadrant === 'ALL' || o.quadrant === selectedQuadrant;
    const query = o.udx_demand_entities?.query?.toLowerCase() || '';
    const matchesSearch = !oppSearch || query.includes(oppSearch.toLowerCase()) || o.opportunity_type.toLowerCase().includes(oppSearch.toLowerCase());
    return matchesQuadrant && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Pillar Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-800/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              PILLAR 2: NOW (FIRST-PARTY REALITY & VERIFIED TRUTH)
            </span>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-2xs font-mono">
              Epistemic Status: VERIFIED_TRUTH
            </Badge>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
            Verified Inventory & The Absolute Truth Invariant
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
            "No page may claim to offer something that the underlying system cannot actually deliver."
            Every active opening has a verified employer, transparent salary, and guaranteed 48-hour response.
          </p>
        </div>

        {/* Location Simulator */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl self-start md:self-auto">
          {['GLOBAL', 'India', 'United States', 'Varanasi'].map(loc => (
            <button
              key={loc}
              onClick={() => setActiveLocation(loc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeLocation === loc
                  ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {loc} {loc === 'GLOBAL' ? '(34 Countries)' : loc === 'Varanasi' ? '(5 Local)' : '(0 Verified)'}
            </button>
          ))}
        </div>
      </div>

      {/* First-Party Reality Box */}
      <Card className="bg-slate-900/90 border-slate-800">
        <CardHeader className="p-5 pb-3 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <div>
                <CardTitle className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                  <span>First-Party Reality for: <strong className="text-emerald-400">{supply.location}</strong></span>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 font-mono text-2xs">
                    {supply.epistemicStatus}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  {supply.truthStatement}
                </CardDescription>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              Verified Openings: <strong className="text-emerald-400">{supply.verifiedJobsCount}</strong>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 md:p-6 space-y-4">
          {supply.verifiedJobsCount > 0 ? (
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                ACTIVE VERIFIED EMPLOYER OPENINGS ({supply.verifiedJobs.length})
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {supply.verifiedJobs.map(job => (
                  <div
                    key={job.jobId}
                    className="p-4 bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/50 rounded-xl transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-2xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                          VERIFIED EMPLOYER
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          ₹{job.minSalaryLPA}–{job.maxSalaryLPA} LPA
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-2">
                        {job.title}
                      </h4>

                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        {job.isRemote && (
                          <Badge className="bg-purple-950/80 text-purple-300 border-none text-2xs font-mono">
                            Remote Option
                          </Badge>
                        )}
                      </p>

                      <p className="text-2xs font-mono text-slate-500 mt-2">
                        Auth: {job.verificationSource}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-2xs font-mono text-emerald-400">
                        SLA: 48h Response
                      </span>
                      <Button
                        size="sm"
                        onClick={() => window.open(job.applyUrl, '_blank')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        Apply Directly
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Strict Truth Invariant Active (0 Fake Listings)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    TalentXcel will never populate generic programmatic SEO content or scrape unverified aggregator listings.
                    Because 0 employers have verified on-site roles in {supply.location} today, we provide 4 verified fallback pathways:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {supply.fallbackPathways.map(fb => (
                  <div
                    key={fb.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 font-mono text-2xs">
                          {fb.type.replace('_', ' ')}
                        </Badge>
                        {fb.availableCount && (
                          <span className="text-xs font-mono text-emerald-400">
                            {fb.availableCount} Available
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mt-2">
                        {fb.title}
                      </h4>

                      <p className="text-xs text-slate-400 mt-1">
                        {fb.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <Button
                        size="sm"
                        onClick={() => window.open(fb.actionUrl, '_blank')}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs justify-between"
                      >
                        <span>{fb.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opportunity Scoring Queue Section */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="p-5 pb-3 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Live Opportunity Queue ({totalOpportunitiesCount})
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Multi-factor scoring heuristic classifying demand into execution quadrants
              </CardDescription>
            </div>

            {/* Quadrant Filters */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap">
              {['ALL', 'WIN_NOW', 'ATTACK', 'CREATE', 'FIX', 'EXPAND'].map(quad => (
                <button
                  key={quad}
                  onClick={() => setSelectedQuadrant(quad)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    selectedQuadrant === quad
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {quad}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search opportunity by query or type (e.g. 'varanasi', 'resume', 'FIX_CTR')..."
              value={oppSearch}
              onChange={(e) => setOppSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Opportunities Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Query / Demand Anchor</th>
                    <th className="p-3">Quadrant</th>
                    <th className="p-3 text-right">Impressions</th>
                    <th className="p-3 text-right">Position</th>
                    <th className="p-3 text-right">Score</th>
                    <th className="p-3">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOpps.slice(0, 15).map(opp => (
                    <tr key={opp.opportunity_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-white font-sans font-medium">
                        "{opp.udx_demand_entities?.query || 'Unknown Query'}"
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={`font-mono text-2xs ${
                          opp.quadrant === 'WIN_NOW' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/40' :
                          opp.quadrant === 'ATTACK' ? 'border-amber-500/50 text-amber-400 bg-amber-950/40' :
                          opp.quadrant === 'FIX' ? 'border-rose-500/50 text-rose-400 bg-rose-950/40' :
                          'border-slate-700 text-slate-300'
                        }`}>
                          {opp.quadrant}
                        </Badge>
                      </td>
                      <td className="p-3 text-right text-slate-300">
                        {opp.udx_demand_entities?.impressions || 0}
                      </td>
                      <td className="p-3 text-right text-indigo-300 font-bold">
                        {opp.udx_demand_entities?.avg_position || '-'}
                      </td>
                      <td className="p-3 text-right text-emerald-400 font-bold">
                        {opp.opportunity_score}
                      </td>
                      <td className="p-3 text-slate-300 font-sans text-2xs max-w-xs truncate">
                        {opp.recommended_action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
