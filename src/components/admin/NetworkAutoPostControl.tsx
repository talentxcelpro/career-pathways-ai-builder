import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  Sparkles, 
  Clock, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Settings2, 
  FileText, 
  Sliders, 
  Layers, 
  History,
  XCircle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { networkAutoPostEngine } from '@/services/networkAutoPostEngine';
import { AutoPostConfig, AutoPostRecord } from '@/types/networkAutoPost';
import { NETWORK_AUTO_POST_SEEDS } from '@/data/networkAutoPostSeed';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const NetworkAutoPostControl: React.FC = () => {
  const [config, setConfig] = useState<AutoPostConfig | null>(null);
  const [auditLogs, setAuditLogs] = useState<AutoPostRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostingManual, setIsPostingManual] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [timeRemainingStr, setTimeRemainingStr] = useState<string>('');
  const [showSeedDialog, setShowSeedDialog] = useState(false);
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>('all');

  // Form states for settings
  const [minInterval, setMinInterval] = useState<number>(120);
  const [maxInterval, setMaxInterval] = useState<number>(180);
  const [maxDailyPosts, setMaxDailyPosts] = useState<number>(6);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentConfig = await networkAutoPostEngine.getConfig();
      const logs = await networkAutoPostEngine.getRecentAuditLogs(20);
      
      setConfig(currentConfig);
      setMinInterval(currentConfig.min_interval_minutes);
      setMaxInterval(currentConfig.max_interval_minutes);
      setMaxDailyPosts(currentConfig.max_daily_posts);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load auto post data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!config?.next_post_scheduled_at) return;

    const updateCountdown = () => {
      const targetTime = new Date(config.next_post_scheduled_at).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeRemainingStr('Due now');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemainingStr(`~${hours}h ${minutes}m`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 30000);
    return () => clearInterval(timer);
  }, [config?.next_post_scheduled_at]);

  const handleToggleAutomation = async (checked: boolean) => {
    if (!config) return;
    try {
      const updated = await networkAutoPostEngine.updateConfig({ enabled: checked });
      setConfig(updated);
      toast.success(checked ? 'Autonomous posting activated' : 'Autonomous posting paused');
    } catch {
      toast.error('Failed to update automation state');
    }
  };

  const handleSaveSettings = async () => {
    if (!config) return;
    if (minInterval >= maxInterval) {
      toast.error('Minimum interval must be less than maximum interval');
      return;
    }

    setIsSavingConfig(true);
    try {
      const updated = await networkAutoPostEngine.updateConfig({
        min_interval_minutes: minInterval,
        max_interval_minutes: maxInterval,
        max_daily_posts: maxDailyPosts
      });
      setConfig(updated);
      toast.success('Configuration saved successfully');
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleManualTrigger = async () => {
    if (!config) return;

    if (config.posts_today_count >= config.max_daily_posts) {
      toast.error(`Daily limit of ${config.max_daily_posts} posts reached for today.`);
      return;
    }

    setIsPostingManual(true);
    try {
      const result = await networkAutoPostEngine.publishMicroPost({ isManual: true });

      if (result.success) {
        toast.success(`Micro-post published: "${result.post?.content || 'Observation posted'}"`);
        await loadData();
      } else {
        toast.error(`Could not publish: ${result.error || result.rejectionReason}`);
      }
    } catch (err: any) {
      toast.error(`Execution error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsPostingManual(false);
    }
  };

  const getStatusBadge = () => {
    if (!config) return null;
    if (!config.enabled) {
      return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Paused</Badge>;
    }
    if (config.posts_today_count >= config.max_daily_posts) {
      return <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/30">Daily Cap Reached</Badge>;
    }
    return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Active & Scheduled</Badge>;
  };

  const remainingPosts = config ? Math.max(0, config.max_daily_posts - config.posts_today_count) : 0;
  const progressPercent = config ? Math.min(100, (config.posts_today_count / config.max_daily_posts) * 100) : 0;

  const filteredSeeds = selectedPillarFilter === 'all' 
    ? NETWORK_AUTO_POST_SEEDS 
    : NETWORK_AUTO_POST_SEEDS.filter(s => s.pillar === selectedPillarFilter);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="border-border/80 shadow-sm bg-card overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-black tracking-tight">
                    Network Micro-Post Autonomous Engine
                  </CardTitle>
                  {getStatusBadge()}
                </div>
                <CardDescription className="text-xs">
                  Authentic, human-style career observations published every 2–3 hours.
                </CardDescription>
              </div>
            </div>

            {/* Main Toggle Switch */}
            <div className="flex items-center gap-3 bg-card px-3.5 py-2 rounded-2xl border shadow-sm">
              <Label htmlFor="auto-post-toggle" className="text-xs font-bold cursor-pointer">
                {config?.enabled ? 'Engine Active' : 'Engine Off'}
              </Label>
              <Switch 
                id="auto-post-toggle"
                checked={config?.enabled ?? false}
                onCheckedChange={handleToggleAutomation}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Account Authorization */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Authorized Voice
              </span>
              <p className="text-sm font-extrabold text-foreground truncate">
                {config?.authorized_email || 'talentxcelpro@gmail.com'}
              </p>
              <p className="text-[11px] text-muted-foreground">Session verified via Supabase</p>
            </div>

            {/* Daily Quota Progress */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Today's Posts
                </span>
                <span className="text-xs font-extrabold text-foreground">
                  {config?.posts_today_count ?? 0} / {config?.max_daily_posts ?? 6}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-[11px] text-muted-foreground font-medium">
                {remainingPosts > 0 
                  ? `${remainingPosts} post${remainingPosts === 1 ? '' : 's'} remaining today` 
                  : 'Daily limit reached, paused until tomorrow'}
              </p>
            </div>

            {/* Next Post Countdown */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> Next Post Window
              </span>
              <p className="text-sm font-extrabold text-foreground">
                {timeRemainingStr || 'Calculating...'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Randomized interval ({config?.min_interval_minutes || 120}m–{config?.max_interval_minutes || 180}m)
              </p>
            </div>

            {/* Seed Concept Library */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-purple-600" /> Seed Concepts
                </span>
                <p className="text-sm font-extrabold text-foreground">
                  {NETWORK_AUTO_POST_SEEDS.length} Curated Seeds
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSeedDialog(true)}
                className="h-7 text-xs font-bold text-primary p-0 justify-start hover:bg-transparent"
              >
                <Eye className="h-3 w-3 mr-1" /> View Seed Library
              </Button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleManualTrigger}
                disabled={isPostingManual || (config?.posts_today_count ?? 0) >= (config?.max_daily_posts ?? 6)}
                className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
              >
                {isPostingManual ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Validating & Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Post Now (Manual Trigger)
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={isLoading}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh State
              </Button>
            </div>

            <span className="text-[11px] text-muted-foreground">
              {config?.last_post_timestamp 
                ? `Last published: ${new Date(config.last_post_timestamp).toLocaleTimeString()}`
                : 'No posts published today yet'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Settings & Configuration Accordion / Card */}
      <Card className="border-border/80 shadow-sm bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-extrabold flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-600" />
            Posting Parameters & Guardrails
          </CardTitle>
          <CardDescription className="text-xs">
            Fine-tune frequency bounds and daily ceilings. Changes take effect on the next scheduled cycle.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Daily Post Limit</Label>
              <Input 
                type="number" 
                min={1} 
                max={12} 
                value={maxDailyPosts} 
                onChange={(e) => setMaxDailyPosts(parseInt(e.target.value) || 6)}
                className="text-xs font-bold"
              />
              <p className="text-[10px] text-muted-foreground">Hard cap (Default: 6 posts/day)</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Min Interval (Minutes)</Label>
              <Input 
                type="number" 
                min={30} 
                max={300} 
                value={minInterval} 
                onChange={(e) => setMinInterval(parseInt(e.target.value) || 120)}
                className="text-xs font-bold"
              />
              <p className="text-[10px] text-muted-foreground">Default: 120 mins (2 hours)</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Max Interval (Minutes)</Label>
              <Input 
                type="number" 
                min={60} 
                max={480} 
                value={maxInterval} 
                onChange={(e) => setMaxInterval(parseInt(e.target.value) || 180)}
                className="text-xs font-bold"
              />
              <p className="text-[10px] text-muted-foreground">Default: 180 mins (3 hours)</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              onClick={handleSaveSettings}
              disabled={isSavingConfig}
              className="rounded-xl text-xs font-bold"
            >
              {isSavingConfig ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Execution & Rejection Audit Log */}
      <Card className="border-border/80 shadow-sm bg-card">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-extrabold flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Recent Execution & Quality Audit History
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">
              {auditLogs.length} Records Logged
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No auto-post activity recorded yet. Trigger a manual post to initialize the audit trail.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      {log.status === 'published' ? (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/30 text-[10px] font-bold">
                          <XCircle className="h-3 w-3 mr-1" /> {log.status}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                        {log.pillar}
                      </Badge>
                      <span className="text-muted-foreground font-mono text-[10px]">
                        {log.word_count} words
                      </span>
                    </div>

                    <p className="font-medium text-foreground text-xs leading-relaxed">
                      "{log.content}"
                    </p>

                    {log.rejection_reason && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                        Reason: {log.rejection_reason}
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] text-muted-foreground font-mono shrink-0 sm:text-right">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seed Concepts Inspector Dialog */}
      <Dialog open={showSeedDialog} onOpenChange={setShowSeedDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-600" />
              TalentXcel Human Seed Concepts Library ({NETWORK_AUTO_POST_SEEDS.length})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Filter pills */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-border/60">
              <Button
                variant={selectedPillarFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPillarFilter('all')}
                className="h-6 text-[10px] font-bold rounded-full"
              >
                All ({NETWORK_AUTO_POST_SEEDS.length})
              </Button>
              {['careers', 'jobs', 'skills', 'education', 'resumes', 'learning', 'passport', 'network', 'ecosystem'].map((p) => (
                <Button
                  key={p}
                  variant={selectedPillarFilter === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPillarFilter(p)}
                  className="h-6 text-[10px] font-bold rounded-full capitalize"
                >
                  {p}
                </Button>
              ))}
            </div>

            {/* Seed items */}
            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {filteredSeeds.map((seed) => {
                const words = seed.text.trim().split(/\s+/).filter(Boolean).length;
                return (
                  <div key={seed.id} className="p-3 rounded-xl bg-muted/20 border border-border/60 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <Badge variant="outline" className="capitalize font-bold text-[9px] py-0 px-1.5">
                        {seed.pillar}
                      </Badge>
                      <span className="font-mono text-emerald-600 font-bold">
                        {words} words
                      </span>
                    </div>
                    <p className="text-xs text-foreground font-medium">
                      "{seed.text}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
