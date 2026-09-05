// src/pages/admin/SocialMarketingCalendar.tsx
// Phase 25.10: Content Review Calendar UI for TalentXcel Admin
// Interactive 15/30-day visual social schedule, day/item approval, and batch generation controls.

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  AlertCircle,
  Play,
  Layers,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  RefreshCw,
  FolderLock,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import {
  getCalendarSlots,
  planCalendar,
  approveCalendarSlot,
  approveCalendarDay,
  executeBatchProduction,
} from '@/lib/social-marketing/contentCalendarEngine';
import { publishFromVault } from '@/lib/social-marketing/socialPublishingGateway';
import type { ContentCalendarSlot, BatchProductionProgress, SocialPlatform } from '@/lib/social-marketing/types';

export default function SocialMarketingCalendar() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<ContentCalendarSlot[]>([]);
  const [generating, setGenerating] = useState(false);
  const [publishingSlotId, setPublishingSlotId] = useState<string | null>(null);
  const [progress, setProgress] = useState<BatchProductionProgress | null>(null);

  useEffect(() => {
    setSlots(getCalendarSlots());
  }, []);

  // Group slots by scheduled_date
  const groupedDays = slots.reduce<Record<string, ContentCalendarSlot[]>>((acc, slot) => {
    if (!acc[slot.scheduled_date]) acc[slot.scheduled_date] = [];
    acc[slot.scheduled_date].push(slot);
    return acc;
  }, {});

  const handleGenerateBatch = async (days: 15 | 30) => {
    setGenerating(true);
    toast.info(`Generating ${days}-day complete physical content reserve in local vault...`);
    try {
      const res = await executeBatchProduction(days, {
        onProgress: p => setProgress(p),
      });
      setSlots(getCalendarSlots());
      toast.success(`${days}-Day Content Reserve successfully rendered and stored in C:\\TalentXcel\\SocialContentVault!`);
    } catch (err: any) {
      toast.error(`Batch generation error: ${err.message}`);
    } finally {
      setGenerating(false);
      setProgress(null);
    }
  };

  const handleApproveDay = (dateStr: string) => {
    approveCalendarDay(dateStr);
    setSlots([...getCalendarSlots()]);
    toast.success(`Approved all scheduled posts for ${dateStr}!`);
  };

  const handleApproveSlot = (slotId: string) => {
    approveCalendarSlot(slotId);
    setSlots([...getCalendarSlots()]);
    toast.success('Post slot approved for scheduled publishing.');
  };

  const handlePublishFromVault = async (slot: ContentCalendarSlot) => {
    setPublishingSlotId(slot.id);
    toast.info(`Publishing ${slot.platform} from local vault...`);
    try {
      const res = await publishFromVault({
        scheduledDate: slot.scheduled_date,
        campaignSlug: slot.campaign_id,
        contentId: slot.content_id,
        platform: slot.platform,
        executionPolicyOverride: 'AUTO',
      });

      if (res.status === 'PUBLISHED') {
        toast.success(`Published to ${slot.platform}! ${res.publishedUrl}`);
        slot.calendar_status = 'PUBLISHED';
        slot.published_at = new Date().toISOString();
        setSlots([...slots]);
      } else if (res.status === 'BLOCKED_OFF') {
        toast.error('Publish blocked: Organization Master Killswitch is OFFLINE.');
      } else {
        toast.error(`Publish failed: ${res.rejectionReason}`);
      }
    } catch (err: any) {
      toast.error(`Publishing failed: ${err.message}`);
    } finally {
      setPublishingSlotId(null);
    }
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'YOUTUBE':
        return <Youtube className="w-4 h-4 text-rose-500" />;
      case 'INSTAGRAM':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'FACEBOOK':
        return <Facebook className="w-4 h-4 text-blue-500" />;
      case 'X':
        return <Twitter className="w-4 h-4 text-sky-400" />;
    }
  };

  const sortedDates = Object.keys(groupedDays).sort();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <Helmet>
        <title>Social Content Calendar — TalentXcel Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <Link to="/admin/social-marketing">
              <Button variant="outline" size="sm" className="border-slate-800 hover:bg-slate-900 text-slate-300">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-blue-400" />
                15/30-Day Social Content Calendar & Vault
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Pre-rendered physical media stored in <code className="text-sky-400 font-mono">C:\TalentXcel\SocialContentVault\</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => handleGenerateBatch(15)}
              disabled={generating}
              variant="outline"
              className="border-blue-700/60 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 text-xs font-semibold"
            >
              {generating ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" />}
              Generate Next 15 Days
            </Button>
            <Button
              onClick={() => handleGenerateBatch(30)}
              disabled={generating}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg"
            >
              {generating ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
              Generate Next 30 Days
            </Button>
          </div>
        </div>

        {/* Batch Progress Banner */}
        {generating && (
          <Card className="bg-blue-950/30 border-blue-800/60 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-blue-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                Batch Rendering Media to Local Vault (Day {progress?.currentDay || 1} of {progress?.totalDays || 15})...
              </span>
              <span className="font-mono text-slate-400">FFmpeg Video + WAV + WebP Slides</span>
            </div>
            <div className="grid grid-cols-5 gap-2 text-[11px] text-slate-400 pt-2 border-t border-blue-900/40">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Research</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Copy Draft</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> 5 Slides</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> WAV Voice</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> FFmpeg MP4</span>
            </div>
          </Card>
        )}

        {/* Day-by-Day Timeline */}
        <div className="space-y-6">
          {sortedDates.map((dateStr, dIdx) => {
            const daySlots = groupedDays[dateStr];
            const allApproved = daySlots.every(s => s.calendar_status === 'APPROVED' || s.calendar_status === 'PUBLISHED' || s.calendar_status === 'SKIPPED');
            const dateObj = new Date(dateStr);
            const dateFormatted = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <Card key={dateStr} className="bg-slate-900/60 border-slate-800 overflow-hidden">
                <CardHeader className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center font-mono font-bold text-xs text-blue-400">
                      {dIdx + 1}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                        {dateFormatted}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400 mt-0.5 truncate max-w-lg">
                        {daySlots[0]?.topic_title}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-700 bg-slate-800/60 text-slate-300 text-[11px]">
                      {daySlots.length} Slots
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveDay(dateStr)}
                      disabled={allApproved}
                      className={`h-7 text-xs ${allApproved ? 'border-emerald-800 text-emerald-400 bg-emerald-950/20' : 'border-slate-700 hover:bg-slate-800'}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {allApproved ? 'Day Approved' : 'Approve Day'}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4 divide-y divide-slate-800/60">
                  {daySlots.map(slot => (
                    <div key={slot.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start md:items-center gap-3.5">
                        <span className="font-mono text-xs text-slate-400 w-12 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {slot.scheduled_time}
                        </span>

                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-slate-950 border border-slate-800">
                            {getPlatformIcon(slot.platform)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white flex items-center gap-2">
                              <span>{slot.platform} {slot.format}</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-800 text-slate-300">
                                {slot.decision_mode}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-md">
                              {slot.topic_title}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        {/* Status Badge */}
                        {slot.calendar_status === 'APPROVED' && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px]">
                            ✓ Approved
                          </Badge>
                        )}
                        {slot.calendar_status === 'READY_FOR_REVIEW' && (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[11px]">
                            ○ Awaiting Review
                          </Badge>
                        )}
                        {slot.calendar_status === 'PUBLISHED' && (
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[11px]">
                            Published
                          </Badge>
                        )}
                        {slot.calendar_status === 'SKIPPED' && (
                          <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[11px]">
                            NO_ACTION
                          </Badge>
                        )}

                        {/* Inspect in Studio */}
                        <Link to={`/admin/social-marketing/studio`}>
                          <Button size="sm" variant="outline" className="h-7 px-2 border-slate-700 text-slate-300 text-xs">
                            <Eye className="w-3.5 h-3.5 mr-1" /> Inspect
                          </Button>
                        </Link>

                        {/* Approve Slot */}
                        {slot.calendar_status === 'READY_FOR_REVIEW' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveSlot(slot.id)}
                            className="h-7 px-2 border-emerald-700 text-emerald-400 hover:bg-emerald-950/40 text-xs"
                          >
                            Approve
                          </Button>
                        )}

                        {/* Publish from Vault */}
                        {slot.calendar_status === 'APPROVED' && (
                          <Button
                            size="sm"
                            onClick={() => handlePublishFromVault(slot)}
                            disabled={publishingSlotId === slot.id}
                            className="h-7 px-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Publish Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
