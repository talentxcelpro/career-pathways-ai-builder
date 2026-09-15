import React from 'react';
import { WorldObservatoryView } from './WorldObservatoryView';
import { WorldObservatoryPayload } from '@/lib/discovery/world/types';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

interface WorldViewProps {
  payload: WorldObservatoryPayload | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectTalentXcelView: () => void;
}

export const WorldView: React.FC<WorldViewProps> = ({
  payload,
  loading,
  onRefresh,
  onSelectTalentXcelView,
}) => {
  return (
    <div className="space-y-6">
      {/* Pillar 1 Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-800/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
              PILLAR 1: WORLD (GLOBAL INTENT UNIVERSE & EXTERNAL REALITY)
            </span>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-2xs font-mono">
              Market Intent Model
            </Badge>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
            External Entities, Incumbent Failure Modes & Demand Landscape
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
            Surveys the complete universe of human intent, incumbent search platforms (Naukri, Indeed, Apna),
            and structural friction points in legacy search engines.
          </p>
        </div>
      </div>

      <WorldObservatoryView
        payload={payload}
        loading={loading}
        onRefresh={onRefresh}
        onSelectTalentXcelView={onSelectTalentXcelView}
      />
    </div>
  );
};
