import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowUpDown, ExternalLink } from 'lucide-react';

export interface DemandEntity {
  entity_id: string;
  query: string;
  normalized_query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avg_position: number;
  country: string;
  intent?: string;
  audience?: string;
  business_segment?: string;
  supply_page?: string;
}

interface Props {
  entities: DemandEntity[];
  totalCount: number;
}

export const DemandQueriesTable: React.FC<Props> = ({ entities, totalCount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntent, setSelectedIntent] = useState('ALL');
  const [sortBy, setSortBy] = useState<'impressions' | 'clicks' | 'position' | 'ctr'>('impressions');
  const [sortAsc, setSortAsc] = useState(false);

  const intentCategories = ['ALL', 'JOB_SEARCH', 'RESUME_ATS', 'CAREER_INTEL', 'INTERVIEW_PREP', 'SKILL_LEARNING', 'DISCOVERY'];

  const filtered = entities
    .filter(e => {
      const matchIntent = selectedIntent === 'ALL' || e.intent === selectedIntent;
      const matchSearch = !searchTerm || e.query.toLowerCase().includes(searchTerm.toLowerCase());
      return matchIntent && matchSearch;
    })
    .sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'impressions') { valA = a.impressions || 0; valB = b.impressions || 0; }
      else if (sortBy === 'clicks') { valA = a.clicks || 0; valB = b.clicks || 0; }
      else if (sortBy === 'ctr') { valA = a.ctr || 0; valB = b.ctr || 0; }
      else if (sortBy === 'position') { valA = a.avg_position || 999; valB = b.avg_position || 999; }
      return sortAsc ? valA - valB : valB - valA;
    });

  const handleSort = (field: 'impressions' | 'clicks' | 'position' | 'ctr') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono text-slate-400 uppercase mr-1">Intent:</span>
          {intentCategories.map(i => (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIntent(i)}
              className={`text-xs px-2.5 py-1 h-7 rounded-lg font-mono transition-colors ${
                selectedIntent === i
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white'
              }`}
            >
              {i}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={`Filter ${totalCount} queries...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-8 bg-slate-950 border-slate-800 text-xs text-slate-200"
          />
        </div>
      </div>

      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Query</th>
                  <th className="py-3 px-4">Intent</th>
                  <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('impressions')}>
                    <div className="flex items-center gap-1">
                      Impressions
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('clicks')}>
                    <div className="flex items-center gap-1">
                      Clicks
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('ctr')}>
                    <div className="flex items-center gap-1">
                      CTR
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('position')}>
                    <div className="flex items-center gap-1">
                      Position
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Supply Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500 text-sm">
                      No demand entities found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.slice(0, 100).map((entity, idx) => (
                    <tr key={entity.entity_id || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-white">{entity.query}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs font-mono border-slate-800 bg-slate-900 text-indigo-300">
                          {entity.intent || 'DISCOVERY'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-200">
                        {entity.impressions?.toLocaleString() ?? 0}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-400">
                        {entity.clicks?.toLocaleString() ?? 0}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {((entity.ctr || 0) * 100).toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {entity.avg_position ? entity.avg_position.toFixed(1) : '—'}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-400 max-w-xs truncate" title={entity.supply_page}>
                        {entity.supply_page || '/jobs'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 100 && (
            <div className="p-3 bg-slate-950/60 text-center text-xs font-mono text-slate-500 border-t border-slate-800">
              Showing top 100 of {filtered.length} matched queries
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
