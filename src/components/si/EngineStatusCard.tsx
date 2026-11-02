import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon, Play, Pause, Activity, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import type { SIEngine } from '@/agents/si/types';

interface EngineStatusCardProps {
  engine: SIEngine;
  icon: LucideIcon;
  color: string;
  onActivate?: () => void;
  onPause?: () => void;
  onTrigger?: () => void;
  isTriggering?: boolean;
}

export const EngineStatusCard: React.FC<EngineStatusCardProps> = ({
  engine,
  icon: Icon,
  color,
  onActivate,
  onPause,
  onTrigger,
  isTriggering = false,
}) => {
  const isRunning = engine.status === 'ACTIVE';
  const isPaused = engine.status === 'PAUSED';

  const statusBadge = () => {
    switch (engine.status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-3xs animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 inline-block" />
            OPERATIONAL (ACTIVE)
          </Badge>
        );
      case 'PAUSED':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-3xs">
            <Pause className="w-3 h-3 mr-1" />
            STANDBY (PAUSED)
          </Badge>
        );
      case 'ERROR':
        return (
          <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono text-3xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            INCIDENT DETECTED
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-800 text-slate-300 border border-slate-700 font-mono text-3xs">
            <Clock className="w-3 h-3 mr-1" />
            IDLE / READY
          </Badge>
        );
    }
  };

  const agentsCount = engine.assignedAgents?.length || engine.assignedAgentIds?.length || 0;

  return (
    <Card className="bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl bg-${color}-500/10 border border-${color}-500/30 text-${color}-400`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-white tracking-wide">
                {engine.name}
              </CardTitle>
              <CardDescription className="text-3xs text-slate-400 mt-0.5 line-clamp-1">
                {engine.description || 'TalentXcel Autonomous Engine'}
              </CardDescription>
            </div>
          </div>
          {statusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-3.5 pt-0">
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs font-mono">
          <div>
            <div className="text-4xs text-slate-400 uppercase tracking-wider">Agents</div>
            <div className="font-bold text-slate-200 mt-0.5">{agentsCount} Specialists</div>
          </div>
          <div>
            <div className="text-4xs text-slate-400 uppercase tracking-wider">Success Rate</div>
            <div className="font-bold text-emerald-400 mt-0.5">
              {engine.tasksCompleted > 0
                ? `${Math.round((engine.tasksCompleted / (engine.tasksCompleted + engine.tasksFailed)) * 100)}%`
                : '100%'}
            </div>
          </div>
          <div>
            <div className="text-4xs text-slate-400 uppercase tracking-wider">Cost</div>
            <div className="font-bold text-slate-200 mt-0.5">₹{engine.costINR.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-3xs font-mono text-slate-400 pt-1 border-t border-slate-800/60">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-slate-500" />
            Last run: {engine.lastExecutionAt ? new Date(engine.lastExecutionAt).toLocaleTimeString() : 'Awaiting trigger'}
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            Tasks: {engine.tasksCompleted} ok / {engine.tasksFailed} err
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {isRunning ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onPause}
              className="flex-1 h-7 text-xs bg-slate-950 border-slate-800 hover:bg-amber-950/30 hover:text-amber-400 text-slate-300"
            >
              <Pause className="w-3 h-3 mr-1.5" />
              Pause Engine
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onActivate}
              className="flex-1 h-7 text-xs bg-slate-950 border-slate-800 hover:bg-emerald-950/30 hover:text-emerald-400 text-slate-300"
            >
              <Play className="w-3 h-3 mr-1.5" />
              Engage Engine
            </Button>
          )}

          {onTrigger && (
            <Button
              size="sm"
              onClick={onTrigger}
              disabled={isTriggering}
              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-mono px-3"
            >
              <Zap className={`w-3 h-3 mr-1 ${isTriggering ? 'animate-spin' : ''}`} />
              Run Cycle
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
