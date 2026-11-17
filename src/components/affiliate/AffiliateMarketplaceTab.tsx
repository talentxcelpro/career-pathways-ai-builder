// src/components/affiliate/AffiliateMarketplaceTab.tsx
// TalentXcel Affiliate Marketplace — Production UI & Commission Hub
// Seamlessly integrated into /network?tab=affiliate-marketplace

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Store,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ShieldCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Send,
  Linkedin,
  MessageCircle,
  FileText,
  Sparkles,
  Building2,
  CheckCircle2,
  Zap,
  Tag,
  CreditCard,
  Lock,
  Percent,
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AffiliateProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  badge: string | null;
  image_url: string | null;
  destination_path: string;
  selling_price_paise: number;
  currency: string;
  commission_type: 'percentage' | 'fixed';
  commission_rate: number;
  attribution_window_days: number;
  refund_grace_days: number;
  is_active: boolean;
  promotional_copy: {
    headline?: string;
    bullet_1?: string;
    bullet_2?: string;
    bullet_3?: string;
  };
}

export interface AffiliateProfileState {
  status: 'applied' | 'approved' | 'suspended' | 'rejected';
  payout_method: string | null;
  payout_details: Record<string, any>;
  total_earnings_paise: number;
  pending_earnings_paise: number;
  paid_earnings_paise: number;
  total_clicks: number;
  total_conversions: number;
}

export interface AffiliateConversion {
  id: string;
  product_id: string;
  order_id: string;
  payment_id: string;
  gross_amount_paise: number;
  commission_amount_paise: number;
  commission_type: string;
  commission_rate: number;
  status: 'pending' | 'approved' | 'payable' | 'paid' | 'reversed' | 'rejected' | 'cancelled';
  attributed_at: string;
  payable_after: string;
  paid_at: string | null;
  reversal_reason: string | null;
  affiliate_products?: {
    name: string;
    slug: string;
  };
}

export interface AffiliatePayout {
  id: string;
  amount_paise: number;
  status: 'requested' | 'approved' | 'processing' | 'completed' | 'rejected';
  payout_method: string;
  payout_details: Record<string, any>;
  reference_number: string | null;
  requested_at: string;
  processed_at: string | null;
}

const formatINR = (paise: number) => {
  const rupees = (paise || 0) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees);
};

export const AffiliateMarketplaceTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Affiliate State
  const [profile, setProfile] = useState<AffiliateProfileState | null>(null);
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);

  // UI & Dialog States
  const [campaignId, setCampaignId] = useState<string>('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Payout Form States
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [payoutAmountRupees, setPayoutAmountRupees] = useState<string>('1000');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Mature payable calculation
  const maturePayablePaise = useMemo(() => {
    return conversions
      .filter(c => c.status === 'payable' || c.status === 'approved')
      .reduce((sum, c) => sum + (c.commission_amount_paise || 0), 0);
  }, [conversions]);

  // Load everything
  const loadMarketplaceData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setRefreshing(true);

      // 1. Get or create affiliate profile RPC
      const { data: profData, error: profError } = await supabase.rpc('get_or_create_affiliate_profile');
      if (profError) {
        console.warn('Profile RPC error:', profError.message);
      } else if (profData && profData.success) {
        setReferralCode(profData.referral_code);
        setProfile({
          status: profData.status || 'approved',
          payout_method: profData.payout_method,
          payout_details: profData.payout_details || {},
          total_earnings_paise: profData.total_earnings_paise || 0,
          pending_earnings_paise: profData.pending_earnings_paise || 0,
          paid_earnings_paise: profData.paid_earnings_paise || 0,
          total_clicks: profData.total_clicks || 0,
          total_conversions: profData.total_conversions || 0,
        });

        if (profData.payout_method === 'bank_transfer') {
          setPayoutMethod('bank_transfer');
          setBankAccount(profData.payout_details?.account_number || '');
          setBankIfsc(profData.payout_details?.ifsc || '');
          setBankHolder(profData.payout_details?.holder_name || '');
        } else if (profData.payout_details?.upi_id) {
          setPayoutMethod('upi');
          setUpiId(profData.payout_details.upi_id);
        }
      }

      // 2. Fetch active products catalogue
      const { data: prodData } = await supabase
        .from('affiliate_products')
        .select('*')
        .eq('is_active', true)
        .order('selling_price_paise', { ascending: false });

      if (prodData) {
        setProducts(prodData as AffiliateProduct[]);
      }

      // 3. Fetch conversions ledger
      const { data: convData } = await supabase
        .from('affiliate_conversions')
        .select('*, affiliate_products(name, slug)')
        .eq('affiliate_id', user.id)
        .order('created_at', { ascending: false })
        .limit(25);

      if (convData) {
        setConversions(convData as any);
      }

      // 4. Fetch payout requests
      const { data: payoutData } = await supabase
        .from('affiliate_payouts')
        .select('*')
        .eq('affiliate_id', user.id)
        .order('requested_at', { ascending: false })
        .limit(10);

      if (payoutData) {
        setPayouts(payoutData as AffiliatePayout[]);
      }

    } catch (err) {
      console.error('Error hydrating affiliate marketplace:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMarketplaceData();
  }, [loadMarketplaceData]);

  // Construct product affiliate link
  const buildProductLink = useCallback((destinationPath: string, productSlug: string) => {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const base = isLocal ? 'https://talentxcel.in' : (typeof window !== 'undefined' ? window.location.origin : 'https://talentxcel.in');
    const code = referralCode || (user?.id ? 'TXC' + user.id.replace(/-/g, '').slice(0, 8).toUpperCase() : 'TXC');
    const campParam = campaignId.trim() ? `&utm_campaign=${encodeURIComponent(campaignId.trim())}` : '';
    
    // Clean path
    const path = destinationPath.startsWith('/') ? destinationPath : `/${destinationPath}`;
    const separator = path.includes('?') ? '&' : '?';
    return `${base}${path}${separator}ref=${encodeURIComponent(code)}&aff_prod=${encodeURIComponent(productSlug)}&utm_source=affiliate&utm_medium=partner${campParam}`;
  }, [referralCode, user?.id, campaignId]);

  // Handle Copy Link
  const handleCopy = (url: string, slug: string) => {
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success('Affiliate product tracking link copied!');
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  // Save Payout Settings
  const handleSavePayoutSettings = async () => {
    if (!user?.id) return;
    setSavingSettings(true);
    try {
      let details: Record<string, any> = {};
      if (payoutMethod === 'upi') {
        if (!upiId.trim() || !upiId.includes('@')) {
          toast.error('Please enter a valid UPI ID (e.g. yourname@okaxis)');
          setSavingSettings(false);
          return;
        }
        details = { upi_id: upiId.trim() };
      } else {
        if (!bankAccount.trim() || !bankIfsc.trim() || !bankHolder.trim()) {
          toast.error('Please complete all bank transfer fields');
          setSavingSettings(false);
          return;
        }
        details = {
          account_number: bankAccount.trim(),
          ifsc: bankIfsc.trim().toUpperCase(),
          holder_name: bankHolder.trim(),
        };
      }

      const { data, error } = await supabase.rpc('update_affiliate_payout_settings', {
        p_payout_method: payoutMethod,
        p_payout_details: details,
      });

      if (error || !data?.success) {
        toast.error(data?.error || error?.message || 'Failed to update payout settings');
      } else {
        toast.success('Payout destination updated successfully!');
        setSettingsModalOpen(false);
        loadMarketplaceData();
      }
    } catch (e: any) {
      toast.error(e.message || 'Error updating settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Request Payout
  const handleRequestPayout = async () => {
    if (!user?.id) return;
    const amountRupees = parseFloat(payoutAmountRupees);
    if (isNaN(amountRupees) || amountRupees < 1000) {
      toast.error('Minimum payout request is ₹1,000');
      return;
    }

    const amountPaise = Math.round(amountRupees * 100);
    if (amountPaise > maturePayablePaise) {
      toast.error(`Requested amount exceeds your payable balance of ${formatINR(maturePayablePaise)}`);
      return;
    }

    setSubmittingPayout(true);
    try {
      const { data, error } = await supabase.rpc('request_affiliate_payout', {
        p_amount_paise: amountPaise,
      });

      if (error || !data?.success) {
        toast.error(data?.error || error?.message || 'Failed to submit payout request');
      } else {
        toast.success(data.message || 'Payout request submitted successfully!');
        setPayoutModalOpen(false);
        loadMarketplaceData();
      }
    } catch (e: any) {
      toast.error(e.message || 'Error processing payout');
    } finally {
      setSubmittingPayout(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600" />
        <p className="text-xs font-semibold text-muted-foreground">Loading TalentXcel Affiliate Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. HERO HEADER BANNER ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 shadow-xl border border-blue-500/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-wide">
              <Store className="h-3.5 w-3.5 text-cyan-300" />
              <span>TalentXcel Official Partner Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              TalentXcel Affiliate Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Earn real cash commissions promoting authentic TalentXcel products. All referrals are server-verified against genuine Razorpay payments, with automatic hybrid commission payouts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
            <Button
              variant="outline"
              onClick={() => setSettingsModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold h-9 rounded-xl backdrop-blur-md gap-1.5"
            >
              <CreditCard className="h-4 w-4" />
              Payout Settings
            </Button>
            <Button
              onClick={() => setPayoutModalOpen(true)}
              disabled={maturePayablePaise < 100000}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 gap-1.5"
            >
              <Wallet className="h-4 w-4" />
              Withdraw Funds
            </Button>
          </div>
        </div>

        {/* Affiliate ID Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Your Partner ID:</span>
            <code className="px-2.5 py-1 rounded-lg bg-black/40 text-cyan-300 font-mono font-bold text-xs border border-white/10 select-all">
              {referralCode || 'TXC...'}
            </code>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Server-Verified Attribution
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-cyan-400" /> 30-Day Cookie Attribution
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2. REVENUE METRICS OVERVIEW ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="rounded-xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Clicks</span>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-foreground">
              {profile?.total_clicks || 0}
            </div>
            <p className="text-[10px] text-muted-foreground">Unique link impressions</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Conversions</span>
              <UserCheck className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-foreground">
              {profile?.total_conversions || 0}
            </div>
            <p className="text-[10px] text-muted-foreground">Paid purchases attributed</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pending</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatINR(profile?.pending_earnings_paise || 0)}
            </div>
            <p className="text-[10px] text-muted-foreground">14-day refund grace period</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Payable</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {formatINR(maturePayablePaise)}
            </div>
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Available for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1 rounded-xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Paid Out</span>
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-300">
              {formatINR(profile?.paid_earnings_paise || 0)}
            </div>
            <p className="text-[10px] text-muted-foreground">Disbursed to your UPI / Bank</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── 3. PRODUCT CATALOGUE SECTION ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              Eligible TalentXcel Products &amp; Services
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct links to high-converting TalentXcel products with real-time attribution and custom campaign tagging.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Tag campaign (e.g. linkedin-post)"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="text-xs h-8 w-full sm:w-56 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((prod) => {
            const trackingLink = buildProductLink(prod.destination_path, prod.slug);
            const isPercentage = prod.commission_type === 'percentage';
            const commissionLabel = isPercentage
              ? `${prod.commission_rate}% commission (${formatINR(Math.round((prod.selling_price_paise * prod.commission_rate) / 100))})`
              : `${formatINR(prod.commission_rate)} fixed cash`;

            return (
              <Card key={prod.id} className="rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-sm flex flex-col justify-between overflow-hidden hover:border-blue-400/60 transition-all duration-200">
                <div>
                  <div className="p-4 border-b border-slate-100 dark:border-border/40 bg-slate-50/50 dark:bg-muted/20">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold bg-white dark:bg-card border-slate-200 text-slate-700 dark:text-slate-300">
                        {prod.category}
                      </Badge>
                      {prod.badge && (
                        <Badge className="text-[10px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                          {prod.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-extrabold text-base text-foreground mt-2">{prod.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{prod.description}</p>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-muted-foreground font-semibold">Selling Price:</span>
                        <div className="text-lg font-black text-foreground">
                          {formatINR(prod.selling_price_paise)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-muted-foreground font-semibold">Your Commission:</span>
                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          {commissionLabel}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-slate-100 dark:border-border/40">
                      <div>
                        <span className="font-medium">Window:</span> {prod.attribution_window_days} Days
                      </div>
                      <div>
                        <span className="font-medium">Grace Lock:</span> {prod.refund_grace_days} Days
                      </div>
                    </div>

                    {prod.promotional_copy?.headline && (
                      <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-[11px] space-y-1">
                        <p className="font-bold text-blue-900 dark:text-blue-300">
                          {prod.promotional_copy.headline}
                        </p>
                        {prod.promotional_copy.bullet_1 && (
                          <p className="text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                            <Zap className="h-3 w-3 text-cyan-500 shrink-0" /> {prod.promotional_copy.bullet_1}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Input
                      readOnly
                      value={trackingLink}
                      className="text-[11px] font-mono h-8 bg-muted/50 rounded-lg select-all"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleCopy(trackingLink, prod.slug)}
                      className="h-8 px-3 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shrink-0"
                    >
                      {copiedSlug === prod.slug ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const shareText = `${prod.promotional_copy?.headline || prod.name} on TalentXcel: ${trackingLink}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                      }}
                      className="h-7 text-[11px] flex-1 rounded-lg gap-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(trackingLink)}`, '_blank');
                      }}
                      className="h-7 text-[11px] flex-1 rounded-lg gap-1 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      <Linkedin className="h-3 w-3" /> LinkedIn
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(trackingLink, '_blank')}
                      className="h-7 px-2 text-[11px] rounded-lg text-muted-foreground hover:text-foreground"
                      title="Preview Product Landing Page"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ─── 4. COMMISSION LEDGER & AUDIT TRAIL ────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-border/40 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Affiliate Commission Ledger
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time verified purchases attributed to your partner code.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMarketplaceData}
              disabled={refreshing}
              className="h-7 text-xs rounded-lg gap-1"
            >
              <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {conversions.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Store className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="text-xs font-semibold text-muted-foreground">No conversions attributed yet</p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                Share your affiliate product links on LinkedIn, WhatsApp groups, or your tech blog. Your commissions will appear here instantly when verified.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-muted/40 text-[11px] font-bold text-muted-foreground border-b border-slate-100 dark:border-border/40">
                  <tr>
                    <th className="p-3 pl-4">Date</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Transaction</th>
                    <th className="p-3 text-right">Order Gross</th>
                    <th className="p-3 text-right">Commission</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-4">Payable Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border/40 font-medium">
                  {conversions.map((conv) => {
                    const statusBadgeClass =
                      conv.status === 'payable' || conv.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : conv.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : conv.status === 'paid'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300';

                    return (
                      <tr key={conv.id} className="hover:bg-slate-50/60 dark:hover:bg-muted/20 transition-colors">
                        <td className="p-3 pl-4 text-muted-foreground whitespace-nowrap">
                          {new Date(conv.attributed_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-3 font-bold text-foreground">
                          {conv.affiliate_products?.name || 'TalentXcel Product'}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground">
                          {conv.payment_id ? `${conv.payment_id.slice(0, 10)}…` : '—'}
                        </td>
                        <td className="p-3 text-right font-semibold text-foreground">
                          {formatINR(conv.gross_amount_paise)}
                        </td>
                        <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {formatINR(conv.commission_amount_paise)}
                        </td>
                        <td className="p-3">
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full capitalize", statusBadgeClass)}>
                            {conv.status}
                          </span>
                        </td>
                        <td className="p-3 pr-4 text-muted-foreground whitespace-nowrap text-[11px]">
                          {conv.status === 'paid'
                            ? 'Disbursed'
                            : new Date(conv.payable_after).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short'
                              })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── 5. PAYOUT MODAL ──────────────────────────────────────────────── */}
      <Dialog open={payoutModalOpen} onOpenChange={setPayoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              Withdraw Affiliate Earnings
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mature commissions available for withdrawal. Disbursed within 2 business days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">Available Balance:</span>
              <span className="font-black text-base text-emerald-700 dark:text-emerald-200">
                {formatINR(maturePayablePaise)}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Withdrawal Amount (₹)</Label>
              <Input
                type="number"
                min="1000"
                max={(maturePayablePaise / 100).toString()}
                value={payoutAmountRupees}
                onChange={(e) => setPayoutAmountRupees(e.target.value)}
                className="text-sm font-bold"
              />
              <p className="text-[10px] text-muted-foreground">Minimum withdrawal threshold: ₹1,000</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/30 border border-slate-200 dark:border-border/60 text-xs space-y-1">
              <p className="font-bold text-foreground">Destination Payout Details:</p>
              {profile?.payout_method === 'upi' ? (
                <p className="font-mono text-blue-600 dark:text-blue-400">UPI: {profile.payout_details?.upi_id || 'Not configured'}</p>
              ) : profile?.payout_method === 'bank_transfer' ? (
                <p className="text-muted-foreground">
                  A/C: {profile.payout_details?.account_number} ({profile.payout_details?.ifsc})
                </p>
              ) : (
                <p className="text-amber-600 font-medium">Please configure your UPI or Bank details first.</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setPayoutModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRequestPayout}
              disabled={submittingPayout || maturePayablePaise < 100000 || !profile?.payout_method}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              {submittingPayout ? 'Submitting…' : 'Confirm Withdrawal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 6. PAYOUT SETTINGS MODAL ─────────────────────────────────────── */}
      <Dialog open={settingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Configure Payout Destination
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide your verified UPI ID or Indian bank account for monthly disbursements.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={payoutMethod === 'upi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPayoutMethod('upi')}
                className="flex-1 text-xs font-bold"
              >
                UPI ID (Instant)
              </Button>
              <Button
                type="button"
                variant={payoutMethod === 'bank_transfer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPayoutMethod('bank_transfer')}
                className="flex-1 text-xs font-bold"
              >
                NEFT / IMPS Bank Transfer
              </Button>
            </div>

            {payoutMethod === 'upi' ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Your UPI ID</Label>
                <Input
                  placeholder="e.g. yourname@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="text-xs"
                />
                <p className="text-[10px] text-muted-foreground">Compatible with GPay, PhonePe, Paytm, and BHIM.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Account Holder Name</Label>
                  <Input
                    placeholder="Full name as on bank account"
                    value={bankHolder}
                    onChange={(e) => setBankHolder(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Bank Account Number</Label>
                  <Input
                    placeholder="e.g. 50100234567890"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Bank IFSC Code</Label>
                  <Input
                    placeholder="e.g. HDFC0001234"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    className="text-xs uppercase"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setSettingsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSavePayoutSettings}
              disabled={savingSettings}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              {savingSettings ? 'Saving…' : 'Save Details'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AffiliateMarketplaceTab;
