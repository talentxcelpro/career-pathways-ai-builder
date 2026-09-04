import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { TestNewsAutomation } from '@/components/news/TestNewsAutomation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Newspaper, 
  Rss, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  Layers, 
  ExternalLink, 
  Activity, 
  ShieldCheck,
  Zap,
  BookOpen,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { newsService } from '@/services/newsService';
import { ARCHETYPE_CONFIG, getDaysUntilNextRefresh, CURRENT_PLATFORM_TELEMETRY } from '@/services/news/newsFreshnessEngine';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const NewsAutomationPage = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all 20 publication articles
  const { data: articles = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-news-publications'],
    queryFn: () => newsService.getArticles(),
    staleTime: 30 * 1000,
  });

  const handleTriggerCycle = async (force = true) => {
    setIsRefreshing(true);
    try {
      const result = await newsService.triggerFreshnessCycle(force);
      toast.success(`15-Day Freshness Cycle Executed! Refreshed ${result.refreshedCount} of ${result.totalArticles} publications.`);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
    } catch {
      toast.error('Failed to trigger freshness cycle');
    } finally {
      setIsRefreshing(false);
    }
  };

  const publicationsWithArchetype = articles.filter(a => !!a.archetype);

  return (
    <UnifiedAdminLayout 
      title="News & Content Automation" 
      description="15-Day rolling publication freshness engine and automated RSS/external feeds"
    >
      <div className="space-y-8">
        {/* 15-DAY HIGH-AUTHORITY FRESHNESS ENGINE HIGHLIGHT PANEL */}
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-primary/[0.02] to-background p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Autonomous Content Freshness Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                20-Publication In-House Authority Suite
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Systematically rewrites metrics, updates edition versions, and refreshes search schemas across 5 strategic archetypes every 15 days.
              </p>
            </div>

            <Button
              onClick={() => handleTriggerCycle(true)}
              disabled={isRefreshing}
              className="gap-2 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Rewriting & Refreshing...' : 'Run 15-Day Refresh Cycle Now'}
            </Button>
          </div>

          {/* Metrics & Architecture Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-card/70 border-border/70">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Suite Size</span>
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-black mt-2 text-foreground">20 Articles</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">5 distinct PR archetypes</p>
              </CardContent>
            </Card>

            <Card className="bg-card/70 border-border/70">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Cadence</span>
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black mt-2 text-blue-600 dark:text-blue-400">15 Days</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Automated rolling rewrite</p>
              </CardContent>
            </Card>

            <Card className="bg-card/70 border-border/70">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Telemetry Synced</span>
                  <Activity className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">100% Live</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Real DB platform metrics</p>
              </CardContent>
            </Card>

            <Card className="bg-card/70 border-border/70">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Search Engine Ready</span>
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-black mt-2 text-purple-600 dark:text-purple-400">XML & RSS</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Google News & AI crawlers</p>
              </CardContent>
            </Card>
          </div>

          {/* Telemetry Snapshot Pill Row */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Live Synchronized Telemetry:
            </span>
            <div className="flex flex-wrap items-center gap-3 font-medium text-foreground text-[11px]">
              <span className="bg-card px-2.5 py-1 rounded-lg border border-border/60">
                Colleges: <strong>{CURRENT_PLATFORM_TELEMETRY.verifiedCollegesCount.toLocaleString()}</strong>
              </span>
              <span className="bg-card px-2.5 py-1 rounded-lg border border-border/60">
                Jobs: <strong>{CURRENT_PLATFORM_TELEMETRY.verifiedJobsInventory.toLocaleString()}</strong>
              </span>
              <span className="bg-card px-2.5 py-1 rounded-lg border border-border/60">
                ATS Accuracy: <strong>{CURRENT_PLATFORM_TELEMETRY.atsScanAccuracyRate}</strong>
              </span>
              <span className="bg-card px-2.5 py-1 rounded-lg border border-border/60">
                GCC Signals: <strong>{CURRENT_PLATFORM_TELEMETRY.activeGccHiringSignals}</strong>
              </span>
            </div>
          </div>

          {/* 20 Publication Inventory Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Active 20-Publication Catalog
              </h3>
              <span className="text-xs text-muted-foreground">
                Showing {publicationsWithArchetype.length} Native Publications
              </span>
            </div>

            <div className="border border-border/80 rounded-2xl overflow-hidden bg-card divide-y divide-border/60">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading publications...</div>
              ) : publicationsWithArchetype.map((pub, i) => {
                const archConfig = pub.archetype ? ARCHETYPE_CONFIG[pub.archetype] : null;
                const daysUntil = getDaysUntilNextRefresh(pub);
                return (
                  <div key={pub.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-muted-foreground w-6">
                          #{String(i + 1).padStart(2, '0')}
                        </span>
                        {archConfig && (
                          <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 border ${archConfig.badgeStyle}`}>
                            {pub.archetype}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px] font-medium bg-muted/70 text-muted-foreground">
                          {pub.category}
                        </Badge>
                        {pub.editionVersion && (
                          <span className="text-[10px] font-medium text-foreground bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                            {pub.editionVersion}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-xl">
                        {pub.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right text-[11px] text-muted-foreground">
                        <div>Next cycle in <strong className="text-foreground">{daysUntil} days</strong></div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Freshness Verified</div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 px-2.5 text-xs rounded-lg gap-1.5"
                      >
                        <Link to={`/news/${pub.slug}`} target="_blank" rel="noopener noreferrer">
                          <span>View</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Feed Automation Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                External news ingestion ready
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Ingestion Run</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manual</div>
              <p className="text-xs text-muted-foreground">
                Triggered via admin panel
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feed Syndication</CardTitle>
              <Rss className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">
                RSS 2.0 & Sitemap XML Live
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Manual Trigger for External NewsAPI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              External News Feed Ingestion (NewsAPI)
            </CardTitle>
            <CardDescription>
              Fetch external industry updates from NewsAPI and syndicate micro-updates to the network social feed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TestNewsAutomation />
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>Automated Content Freshness Architecture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. 15-Day Cadence Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Evaluates elapsed time against rolling 15-day threshold. Articles due are rewritten with updated timestamps and advanced version numbers.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">2. Live Telemetry Metric Injection</h4>
                <p className="text-sm text-muted-foreground">
                  Injects fresh platform verification counters (10,250+ colleges, 14,200+ verified jobs, 98.4% ATS rate) directly into article copies.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">3. Google News & RSS Syndication</h4>
                <p className="text-sm text-muted-foreground">
                  Generates compliant XML sitemaps and RSS 2.0 feeds signaling immediate freshness to Google, Bing, Perplexity, and OpenAI crawlers.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">4. 5 Archetype Editorial Rigor</h4>
                <p className="text-sm text-muted-foreground">
                  Maintains high-authority coverage across Sector Reports, Career Guides, Industry Insiders, Professional Journals, and Trade Publications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedAdminLayout>
  );
};

export default NewsAutomationPage;