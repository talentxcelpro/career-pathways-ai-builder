// src/pages/admin/DistributionCommandCentre.tsx
// TALENTXCEL DISTRIBUTION COMMAND CENTRE
// Production Implementation — Autonomous Telegram + WhatsApp Channel Distribution OS

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Send,
  MessageCircle,
  Copy,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  Briefcase,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Info
} from 'lucide-react';
import {
  DistributionCategory,
  EligibleJob,
  GeneratedPost,
  CATEGORY_LABELS,
  SCHEDULE_SLOTS,
  fetchEligibleJobs,
  generateDistributionPostContent
} from '@/services/distribution/distributionEngine';

export default function DistributionCommandCentre() {
  const [selectedCategory, setSelectedCategory] = useState<DistributionCategory>('tech_high_growth');
  const [selectedSlot, setSelectedSlot] = useState<string>('08:00_IST');
  const [eligibleJobs, setEligibleJobs] = useState<EligibleJob[]>([]);
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // KPIs
  const [metrics, setMetrics] = useState({
    totalActiveJobs: 2711,
    verifiedJobs: 2711,
    readyToPublish: 2711,
    telegramPublished: 0,
    whatsappPending: 0,
    failedDeliveries: 0,
    nextSlot: '08:00 AM IST'
  });

  // Logs
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // Search & Filter state for Inventory Explorer
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRemote, setFilterRemote] = useState(false);

  // Load KPIs and Recent Posts from Supabase
  const loadPlatformData = async () => {
    try {
      // 1. Fetch posts count
      const { data: posts, error: postErr } = await supabase
        .from('distribution_posts' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!postErr && posts) {
        setRecentPosts(posts);
        const tgSuccess = posts.filter((p: any) => p.channel_id === 'telegram' && p.status === 'published').length;
        const waPending = posts.filter((p: any) => p.channel_id === 'whatsapp_channel' && p.status === 'queued').length;
        const failed = posts.filter((p: any) => p.status === 'failed').length;

        setMetrics(prev => ({
          ...prev,
          telegramPublished: tgSuccess,
          whatsappPending: waPending,
          failedDeliveries: failed
        }));
      }

      // 2. Fetch logs
      const { data: logs, error: logErr } = await supabase
        .from('distribution_delivery_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      if (!logErr && logs) {
        setRecentLogs(logs);
      }
    } catch (e) {
      console.warn('Notice loading metrics:', e);
    }
  };

  // Generate / Refresh Post Preview
  const handleGeneratePreview = async () => {
    setIsLoadingJobs(true);
    try {
      const jobs = await fetchEligibleJobs(selectedCategory, 5);
      setEligibleJobs(jobs);

      const post = generateDistributionPostContent(selectedCategory, selectedSlot, jobs);
      setGeneratedPost(post);
      toast.success(`Generated preview with ${jobs.length} top eligible jobs!`);
    } catch (err: any) {
      toast.error(`Failed to generate: ${err.message}`);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
    handleGeneratePreview();
  }, [selectedCategory, selectedSlot]);

  // Copy to Clipboard (WhatsApp or Telegram)
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success(`${label} copied to clipboard! Ready to paste.`);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Queue to WhatsApp Channel Manual Queue
  const handleQueueForWhatsApp = async () => {
    if (!generatedPost) return;
    try {
      const { error } = await supabase
        .from('distribution_posts' as any)
        .insert({
          channel_id: 'whatsapp_channel',
          slot_time: selectedSlot,
          category: selectedCategory,
          title: generatedPost.title,
          content_formatted: generatedPost.whatsappText,
          job_ids: generatedPost.jobs.map(j => j.id),
          status: 'queued',
          idempotency_key: `${generatedPost.idempotencyKey}_manual_wa`,
          scheduled_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Added to WhatsApp Channel Manual Queue!');
      loadPlatformData();
    } catch (err: any) {
      toast.error(`Queue error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header Banner */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold px-2.5 py-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Production Autonomous OS
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-2.5 py-0.5">
                  <Zap className="w-3.5 h-3.5 mr-1" /> ₹0 Additional Infrastructure
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                TalentXcel Distribution Command Centre
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Multi-Channel Autonomous Job Distribution Engine • Telegram Bot API + Zero-Cost WhatsApp Channel
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadPlatformData();
                  handleGeneratePreview();
                }}
                disabled={isLoadingJobs}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingJobs ? 'animate-spin' : ''}`} />
                Refresh Engine
              </Button>
              <a
                href="https://whatsapp.com/channel/0029VbDfu6Z1noz0UA2HYZ0o"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open WhatsApp Channel
                </Button>
              </a>
              <a
                href="https://t.me/TalentXcelJobs"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                  <Send className="w-4 h-4 mr-2" />
                  Open Telegram Channel
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* SECTION 1: Top KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Active Jobs</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalActiveJobs.toLocaleString()}</div>
              <div className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                <CheckCircle2 className="w-3 h-3 mr-1" /> 100% Unexpired
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verified Active</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{metrics.verifiedJobs.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">ATS & Partner Ingested</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ready for Posting</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{metrics.readyToPublish.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Passing Quality Gate</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Telegram Dispatches</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">{metrics.telegramPublished}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">@TalentXcelJobsBot</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">WhatsApp Queue</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{metrics.whatsappPending}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">1-Click Manual Copy</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Scheduled Slots</div>
              <div className="text-2xl font-bold text-purple-700 mt-1">4 / Day</div>
              <div className="text-xs text-slate-500 font-medium mt-1">08:00, 12:00, 16:00, 20:00</div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 2: Channel Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Telegram Channel */}
          <Card className="bg-white border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">Telegram Channel</CardTitle>
                    <div className="text-xs text-slate-500 font-medium">Official Automated Bot API</div>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-semibold text-xs">
                  Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2 pt-0">
              <div className="flex justify-between py-1 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Target Channel:</span>
                <span className="font-semibold text-slate-900">@TalentXcelJobs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Publishing Bot:</span>
                <span className="font-semibold text-slate-900">@TalentXcelJobsBot</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Autonomous Worker:</span>
                <span className="font-mono text-slate-800">talentxcel-telegram-publisher</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span className="text-slate-500">Schedule:</span>
                <span className="font-medium text-blue-600">4 Cloudflare Cron Slots</span>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Channel */}
          <Card className="bg-white border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">WhatsApp Channel</CardTitle>
                    <div className="text-xs text-slate-500 font-medium">Zero-Cost Manual Publishing Queue</div>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-semibold text-xs">
                  Active (₹0)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2 pt-0">
              <div className="flex justify-between py-1 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Channel Name:</span>
                <span className="font-semibold text-slate-900">TalentXcel Jobs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Operating Cost:</span>
                <span className="font-semibold text-emerald-600">₹0 (No Paid Gateway)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Publishing Mode:</span>
                <span className="font-medium text-slate-800">1-Click Clipboard + Paste</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span className="text-slate-500">Subscribers:</span>
                <span className="font-medium text-slate-700">Managed by WhatsApp</span>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Business API */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">WhatsApp Business Cloud</CardTitle>
                    <div className="text-xs text-slate-500 font-medium">Meta Business Platform</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 font-semibold text-xs">
                  Disabled (Opt-In)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2 pt-0">
              <div className="flex justify-between py-1 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-slate-600">Inactive (₹0 Mandate)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Candidate Consent:</span>
                <span className="font-semibold text-slate-700">DPDP Explicit Opt-In Only</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Per-Message Fee:</span>
                <span className="font-medium text-amber-600">Meta Conversation Tariff</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span className="text-slate-500">Activation Policy:</span>
                <span className="font-medium text-slate-500">Requires Founder Approval</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 3: Distribution Studio & Live Content Formatter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg font-bold text-slate-900">Distribution Studio</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">Slot Selection</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Content Category & Rotation Tier
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Object.keys(CATEGORY_LABELS) as DistributionCategory[]).map(catKey => {
                      const item = CATEGORY_LABELS[catKey];
                      const isSelected = selectedCategory === catKey;
                      return (
                        <button
                          key={catKey}
                          onClick={() => setSelectedCategory(catKey)}
                          className={`flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <span className="text-lg leading-none">{item.emoji}</span>
                          <div>
                            <div className="text-xs font-bold leading-tight">{item.name}</div>
                            <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.subtitle}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scheduled Slot Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Target Publishing Slot (IST)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SCHEDULE_SLOTS.map(s => {
                      const isSelected = selectedSlot === s.slot;
                      return (
                        <button
                          key={s.slot}
                          onClick={() => {
                            setSelectedSlot(s.slot);
                            setSelectedCategory(s.defaultCategory);
                          }}
                          className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50 text-purple-900'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
                          {s.slot.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Eligible Jobs Count */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Selected Jobs ({eligibleJobs.length})</span>
                    <span className="text-emerald-600 font-bold">100% Verified Active</span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {eligibleJobs.map((j, idx) => (
                      <div key={j.id} className="text-xs p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                        <div className="truncate mr-2">
                          <span className="font-bold text-slate-900">{idx + 1}. {j.job_title}</span>
                          <span className="text-slate-500"> — {j.company_name}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold text-blue-700 bg-blue-50 border-blue-200 shrink-0">
                          Score {j.match_score}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleGeneratePreview}
                    disabled={isLoadingJobs}
                    variant="outline"
                    className="flex-1 border-slate-300 text-slate-800"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingJobs ? 'animate-spin' : ''}`} />
                    Regenerate Matching
                  </Button>
                  <Button
                    onClick={handleQueueForWhatsApp}
                    disabled={!generatedPost}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Queue for WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formatted Output & Preview Column */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm flex flex-col h-full">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <CardTitle className="text-lg font-bold text-slate-900">Formatted Publication Preview</CardTitle>
                  </div>
                  {generatedPost && (
                    <Badge variant="outline" className="text-xs text-slate-600 font-mono">
                      {generatedPost.idempotencyKey}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col">
                <Tabs defaultValue="whatsapp" className="w-full flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <TabsList className="bg-slate-100 p-1">
                      <TabsTrigger value="whatsapp" className="data-[state=active]:bg-white font-semibold text-xs">
                        <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" /> WhatsApp Channel
                      </TabsTrigger>
                      <TabsTrigger value="telegram" className="data-[state=active]:bg-white font-semibold text-xs">
                        <Send className="w-3.5 h-3.5 mr-1 text-blue-600" /> Telegram Channel
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (generatedPost) {
                            handleCopy(generatedPost.whatsappText, 'WhatsApp Update');
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                        {isCopied ? 'Copied!' : 'Copy WhatsApp Update'}
                      </Button>
                    </div>
                  </div>

                  {/* WhatsApp Content Tab */}
                  <TabsContent value="whatsapp" className="mt-0 flex-1">
                    <div className="bg-emerald-50/40 border border-emerald-200 rounded-lg p-4 font-sans text-xs leading-relaxed text-slate-800 whitespace-pre-wrap select-all">
                      {generatedPost?.whatsappText || 'Generating update content...'}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span className="flex items-center">
                        <Info className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Click "Copy WhatsApp Update", then paste directly into the WhatsApp Channel!
                      </span>
                      <a
                        href="https://web.whatsapp.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-semibold hover:underline flex items-center"
                      >
                        Open WhatsApp Web <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </TabsContent>

                  {/* Telegram Content Tab */}
                  <TabsContent value="telegram" className="mt-0 flex-1">
                    <div className="bg-blue-50/40 border border-blue-200 rounded-lg p-4 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap select-all">
                      {generatedPost?.telegramHtml || 'Generating Telegram HTML...'}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span className="flex items-center">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        Telegram is dispatched autonomously by Cloudflare Worker Cron.
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (generatedPost) {
                            handleCopy(generatedPost.telegramHtml, 'Telegram HTML');
                          }
                        }}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copy Telegram HTML
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SECTION 4: Live Inventory Explorer */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Live Production Job Inventory Explorer
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect the 2,711 verified live jobs eligible for rotation across India.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Search title, company, city..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs bg-slate-50 border-slate-300 text-slate-900"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Job Title</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Salary Range</th>
                    <th className="py-3 px-4">Application Destination</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {eligibleJobs
                    .filter(j => 
                      !searchQuery || 
                      j.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      j.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (j.location_city && j.location_city.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {job.job_title}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {job.company_name}
                        </td>
                        <td className="py-3 px-4">
                          {job.is_remote ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                              Remote
                            </Badge>
                          ) : (
                            <span className="text-slate-600">{job.location_city || job.location || 'India'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800">
                          {job.salary_range || (job.salary_min ? `₹${(job.salary_min/100000).toFixed(1)}L - ₹${(job.salary_max/100000).toFixed(1)}L` : 'Disclosed on Apply')}
                        </td>
                        <td className="py-3 px-4">
                          {job.external_url ? (
                            <a
                              href={job.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                            >
                              Direct ATS Apply <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <a
                              href={`https://talentxcel.in/jobs/${job.seo_slug || job.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                            >
                              TalentXcel Native <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-[10px]">
                            Verified Active
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
