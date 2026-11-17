// src/pages/admin/WhatsAppAlertsAdmin.tsx
// TalentXcel Distribution Centre — Zero-Cost WhatsApp Channel Alerts Admin Module
// Generates, reviews, approves, and manages daily broadcasts for the TalentXcel Jobs WhatsApp Channel.

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  MessageCircle,
  Copy,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Send,
  ShieldCheck,
  Zap,
  Calendar,
  Eye,
  Edit3,
  Clock,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { generateWhatsAppDailyDigest } from '@/services/jobs/whatsappDigestGenerator';

export default function WhatsAppAlertsAdmin() {
  const channelUrl = (import.meta.env.VITE_WHATSAPP_CHANNEL_URL as string) || 'https://whatsapp.com/channel/0029VbDfu6Z1noz0UA2HYZ0o';

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<any | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Load existing campaigns from database
  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_alert_campaigns')
        .select('*')
        .order('campaign_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
      if (data && data.length > 0) {
        setActiveCampaign(data[0]);
        setEditedText(data[0].message_text || '');
      }
    } catch (err: any) {
      toast.error(`Error loading campaigns: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Handle generating fresh digest for today
  const handleGenerateDigest = async () => {
    setIsGenerating(true);
    try {
      const res = await generateWhatsAppDailyDigest();
      toast.success(`🎉 Generated digest with ${res.jobCount} verified jobs!`);
      await loadCampaigns();
    } catch (err: any) {
      toast.error(`Failed to generate digest: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy WhatsApp-formatted message to clipboard
  const handleCopyMessage = () => {
    if (!editedText) return;
    navigator.clipboard.writeText(editedText);
    setIsCopied(true);
    toast.success('WhatsApp digest copied to clipboard! Ready to paste into Channel.');
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Approve campaign
  const handleApprove = async () => {
    if (!activeCampaign?.id) return;
    try {
      const { error } = await supabase
        .from('job_alert_campaigns')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          message_text: editedText,
        })
        .eq('id', activeCampaign.id);

      if (error) throw error;
      toast.success('Campaign authorized and approved!');
      await loadCampaigns();
    } catch (err: any) {
      toast.error(`Approval failed: ${err.message}`);
    }
  };

  // Mark as published
  const handleMarkPublished = async () => {
    if (!activeCampaign?.id) return;
    try {
      const { error } = await supabase
        .from('job_alert_campaigns')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          message_text: editedText,
        })
        .eq('id', activeCampaign.id);

      if (error) throw error;
      toast.success('Campaign marked as PUBLISHED! Timestamp recorded.');
      await loadCampaigns();
    } catch (err: any) {
      toast.error(`Update failed: ${err.message}`);
    }
  };

  const pendingApprovalsCount = campaigns.filter(c => c.status === 'draft').length;
  const publishedCount = campaigns.filter(c => c.status === 'published').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 sm:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 fill-emerald-100" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              TalentXcel Distribution Centre
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold text-xs py-0.5 rounded-full">
              Zero-Cost Mode (₹0 Budget)
            </Badge>
          </div>
          <p className="text-sm text-slate-600">
            Automated verified job matching with zero-cost manual broadcasting to the official TalentXcel Jobs WhatsApp Channel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleGenerateDigest}
            disabled={isGenerating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Matching Jobs...' : "Generate Today's Digest"}</span>
          </Button>

          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs h-10 px-4 rounded-xl shadow-2xs transition-colors"
          >
            <span>Open WhatsApp Channel</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white border-2 border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potential Job Hubs</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">150+</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Tier 1, 2 & 3 Indian cities</p>
        </Card>

        <Card className="bg-white border-2 border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid WhatsApp APIs</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">₹0</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Zero API / Gateway bills</p>
        </Card>

        <Card className="bg-white border-2 border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{pendingApprovalsCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Drafts awaiting authorization</p>
        </Card>

        <Card className="bg-white border-2 border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Published Digests</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{publishedCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Archived broadcasts</p>
        </Card>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Active Digest Editor & Publisher */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-2 border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-600" />
                  <span>{activeCampaign?.title || "Today's Broadcast Digest"}</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review and customize the broadcast message before publishing.
                </p>
              </div>

              {activeCampaign && (
                <Badge
                  variant="outline"
                  className={`text-xs font-bold py-0.5 px-2.5 rounded-full ${
                    activeCampaign.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : activeCampaign.status === 'approved'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                >
                  {activeCampaign.status.toUpperCase()}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span className="font-mono">
                  Jobs included: <strong className="text-slate-900">{activeCampaign?.job_count || 0}</strong>
                </span>
                <span>
                  Date: <strong className="text-slate-900">{activeCampaign?.campaign_date || 'Today'}</strong>
                </span>
              </div>

              {/* Message Editor Textarea */}
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={16}
                placeholder="Click 'Generate Today's Digest' above to build broadcast text..."
                className="w-full font-mono text-xs p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 leading-relaxed resize-y"
              />

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <Button
                  onClick={handleCopyMessage}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopied ? 'Copied! 🎉' : '1. Copy WhatsApp Message'}</span>
                </Button>

                <div className="flex items-center gap-2">
                  {activeCampaign?.status !== 'approved' && activeCampaign?.status !== 'published' && (
                    <Button
                      variant="outline"
                      onClick={handleApprove}
                      className="border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold text-xs h-10 px-4 rounded-xl"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      2. Authorize &amp; Approve
                    </Button>
                  )}

                  {activeCampaign?.status !== 'published' && (
                    <Button
                      variant="outline"
                      onClick={handleMarkPublished}
                      className="border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs h-10 px-4 rounded-xl"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      3. Mark as Published
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Workflow Guide & Recent Broadcasts */}
        <div className="space-y-6">
          {/* Operating Protocol Card */}
          <Card className="bg-white border-2 border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero-Cost Operating Workflow</span>
            </h3>
            <ol className="text-xs text-slate-600 space-y-2.5 list-decimal list-inside leading-relaxed">
              <li>
                <strong className="text-slate-800">Generate:</strong> Engine aggregates verified unexpired jobs across Varanasi, NCR, Bangalore &amp; top hubs.
              </li>
              <li>
                <strong className="text-slate-800">Review &amp; Edit:</strong> Verify salary, roles, and direct apply links in the draft box.
              </li>
              <li>
                <strong className="text-slate-800">Copy &amp; Paste:</strong> Click <em>"Copy WhatsApp Message"</em>, open WhatsApp Channel, and paste directly.
              </li>
              <li>
                <strong className="text-slate-800">Mark Published:</strong> Click <em>"Mark as Published"</em> to audit the timestamp and maintain historical tracking.
              </li>
            </ol>
          </Card>

          {/* Historical Campaigns List */}
          <Card className="bg-white border-2 border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Recent Campaigns</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
              {campaigns.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No campaigns created yet. Click "Generate Today's Digest" to start.
                </div>
              ) : (
                campaigns.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveCampaign(c);
                      setEditedText(c.message_text || '');
                    }}
                    className={`w-full p-3.5 text-left transition-colors flex items-center justify-between hover:bg-slate-50 ${
                      activeCampaign?.id === c.id ? 'bg-emerald-50/60 font-semibold' : ''
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {c.campaign_date} &bull; {c.job_count} jobs
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold py-0 px-2 rounded-full ${
                        c.status === 'published'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                          : c.status === 'approved'
                          ? 'text-blue-700 bg-blue-50 border-blue-300'
                          : 'text-amber-700 bg-amber-50 border-amber-300'
                      }`}
                    >
                      {c.status}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
