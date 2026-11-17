// src/components/admin/affiliate/AffiliateAdminCentre.tsx
// Admin Control Centre for TalentXcel Affiliate Marketplace
// Commission rates, product parameters, application approvals, payout management.

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Store,
  DollarSign,
  Wallet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Users,
  TrendingUp,
  CreditCard,
  Edit,
  Save,
  Clock,
  ShieldCheck,
  Check,
  Percent
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AffiliateProduct } from '@/components/affiliate/AffiliateMarketplaceTab';

const formatINR = (paise: number) => {
  const rupees = (paise || 0) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees);
};

export const AffiliateAdminCentre: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    activeAffiliates: 0,
    totalConversions: 0,
    grossSalesPaise: 0,
    commissionsIncurredPaise: 0,
    pendingPayoutsCount: 0,
    pendingPayoutsPaise: 0,
  });

  // Data lists
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [affiliateList, setAffiliateList] = useState<any[]>([]);
  const [conversionsList, setConversionsList] = useState<any[]>([]);

  // Product Edit Dialog
  const [editingProduct, setEditingProduct] = useState<AffiliateProduct | null>(null);
  const [editPricePaise, setEditPricePaise] = useState(0);
  const [editCommType, setEditCommType] = useState<'percentage' | 'fixed'>('percentage');
  const [editCommRate, setEditCommRate] = useState(0);
  const [editWindow, setEditWindow] = useState(30);
  const [editGrace, setEditGrace] = useState(14);
  const [editIsActive, setEditIsActive] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);

  // Payout Approval Dialog
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [payoutReference, setPayoutReference] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);

  // Hydrate admin data
  const loadAdminData = useCallback(async () => {
    try {
      setRefreshing(true);

      // 1. Fetch Products
      const { data: prods } = await supabase
        .from('affiliate_products')
        .select('*')
        .order('selling_price_paise', { ascending: false });

      if (prods) setProducts(prods as AffiliateProduct[]);

      // 2. Fetch Payout Requests
      const { data: payouts } = await supabase
        .from('affiliate_payouts')
        .select('*, profiles:affiliate_id(full_name, email, referral_code)')
        .order('requested_at', { ascending: false });

      if (payouts) setPayoutRequests(payouts);

      // 3. Fetch Affiliates
      const { data: affs } = await supabase
        .from('affiliate_profiles')
        .select('*, profiles:user_id(full_name, email, referral_code)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (affs) setAffiliateList(affs);

      // 4. Fetch Conversions
      const { data: convs } = await supabase
        .from('affiliate_conversions')
        .select('*, affiliate_products(name, slug), profiles:affiliate_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (convs) setConversionsList(convs);

      // Compute aggregates
      const totalAffs = affs?.length || 0;
      const activeAffs = affs?.filter(a => a.status === 'approved').length || 0;
      const totalConvs = convs?.length || 0;
      const grossSales = convs?.reduce((acc, c) => acc + (c.gross_amount_paise || 0), 0) || 0;
      const totalComms = convs?.reduce((acc, c) => acc + (c.commission_amount_paise || 0), 0) || 0;
      const pendingPayouts = payouts?.filter(p => p.status === 'requested') || [];
      const pendingPaise = pendingPayouts.reduce((acc, p) => acc + (p.amount_paise || 0), 0);

      setStats({
        totalAffiliates: totalAffs,
        activeAffiliates: activeAffs,
        totalConversions: totalConvs,
        grossSalesPaise: grossSales,
        commissionsIncurredPaise: totalComms,
        pendingPayoutsCount: pendingPayouts.length,
        pendingPayoutsPaise: pendingPaise,
      });

    } catch (e) {
      console.error('Error hydrating affiliate admin:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Open Edit Product Dialog
  const handleEditProduct = (prod: AffiliateProduct) => {
    setEditingProduct(prod);
    setEditPricePaise(prod.selling_price_paise);
    setEditCommType(prod.commission_type);
    setEditCommRate(prod.commission_rate);
    setEditWindow(prod.attribution_window_days);
    setEditGrace(prod.refund_grace_days);
    setEditIsActive(prod.is_active);
  };

  // Save Product Updates
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    setSavingProduct(true);
    try {
      const { error } = await supabase
        .from('affiliate_products')
        .update({
          selling_price_paise: editPricePaise,
          commission_type: editCommType,
          commission_rate: editCommRate,
          attribution_window_days: editWindow,
          refund_grace_days: editGrace,
          is_active: editIsActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingProduct.id);

      if (error) {
        toast.error(`Failed to update product: ${error.message}`);
      } else {
        toast.success(`Product ${editingProduct.name} commission configuration saved!`);
        setEditingProduct(null);
        loadAdminData();
      }
    } catch (e: any) {
      toast.error(e.message || 'Error updating product');
    } finally {
      setSavingProduct(false);
    }
  };

  // Process Payout Approval
  const handleApprovePayout = async (action: 'completed' | 'rejected') => {
    if (!selectedPayout) return;
    setProcessingPayout(true);
    try {
      const { error } = await supabase
        .from('affiliate_payouts')
        .update({
          status: action,
          reference_number: payoutReference.trim() || null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', selectedPayout.id);

      if (error) {
        toast.error(`Error updating payout: ${error.message}`);
      } else {
        if (action === 'completed') {
          // Increment paid_earnings on affiliate profile
          await supabase
            .from('affiliate_profiles')
            .update({
              paid_earnings_paise: (selectedPayout.amount_paise || 0),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', selectedPayout.affiliate_id);

          // Mark conversions as paid
          await supabase
            .from('affiliate_conversions')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('affiliate_id', selectedPayout.affiliate_id)
            .in('status', ['payable', 'approved']);
        }

        toast.success(`Payout marked as ${action}!`);
        setSelectedPayout(null);
        setPayoutReference('');
        loadAdminData();
      }
    } catch (e: any) {
      toast.error(e.message || 'Error updating payout status');
    } finally {
      setProcessingPayout(false);
    }
  };

  // Update Affiliate Status
  const handleToggleAffiliateStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('affiliate_profiles')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) toast.error(error.message);
      else {
        toast.success(`Affiliate status updated to ${newStatus}`);
        loadAdminData();
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-2">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600" />
        <p className="text-xs text-muted-foreground font-semibold">Loading Affiliate Admin Centre...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. TOP STATS ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            Affiliate Marketplace Admin Centre
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure product commission rules, review conversions, approve affiliate partners, and disburse payouts.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAdminData}
          disabled={refreshing}
          className="h-8 text-xs rounded-lg gap-1.5"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="rounded-xl border shadow-xs bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Affiliates</span>
            <div className="text-2xl font-black text-foreground">{stats.totalAffiliates}</div>
            <p className="text-[10px] text-muted-foreground">{stats.activeAffiliates} active partners</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Driven Sales</span>
            <div className="text-2xl font-black text-foreground">{formatINR(stats.grossSalesPaise)}</div>
            <p className="text-[10px] text-muted-foreground">{stats.totalConversions} verified orders</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Commissions Incurred</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatINR(stats.commissionsIncurredPaise)}
            </div>
            <p className="text-[10px] text-muted-foreground">Server-calculated obligations</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Pending Payouts</span>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
              {formatINR(stats.pendingPayoutsPaise)}
            </div>
            <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">{stats.pendingPayoutsCount} requests queued</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── 2. PRODUCT CATALOGUE COMMISSION CONFIGURATION ────────────────── */}
      <Card className="rounded-2xl border shadow-xs bg-card overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Settings className="h-4 w-4 text-blue-600" />
            Product Commission Rate Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Administrator-controlled commission rates and attribution parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-[11px] font-bold text-muted-foreground border-b">
                <tr>
                  <th className="p-3 pl-4">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Selling Price</th>
                  <th className="p-3">Commission Model</th>
                  <th className="p-3 text-center">Attribution Window</th>
                  <th className="p-3 text-center">Refund Grace</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium">
                {products.map((p) => {
                  const commText = p.commission_type === 'percentage'
                    ? `${p.commission_rate}% (${formatINR(Math.round((p.selling_price_paise * p.commission_rate) / 100))})`
                    : `${formatINR(p.commission_rate)} fixed`;

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 pl-4 font-bold text-foreground">
                        {p.name}
                        <div className="text-[10px] font-mono text-muted-foreground">{p.slug}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{p.category}</td>
                      <td className="p-3 text-right font-bold text-foreground">
                        {formatINR(p.selling_price_paise)}
                      </td>
                      <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        {commText}
                      </td>
                      <td className="p-3 text-center">{p.attribution_window_days} Days</td>
                      <td className="p-3 text-center">{p.refund_grace_days} Days</td>
                      <td className="p-3 text-center">
                        <Badge variant={p.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {p.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(p)}
                          className="h-7 text-xs rounded-lg gap-1"
                        >
                          <Edit className="h-3 w-3" /> Edit Rates
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── 3. PAYOUT REQUESTS REVIEW ────────────────────────────────────── */}
      <Card className="rounded-2xl border shadow-xs bg-card overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-600" />
            Pending &amp; Processed Payout Requests
          </CardTitle>
          <CardDescription className="text-xs">
            Review affiliate withdrawal requests, copy destination UPI / Bank details, and record bank UTR references.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {payoutRequests.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No payout requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-[11px] font-bold text-muted-foreground border-b">
                  <tr>
                    <th className="p-3 pl-4">Requested Date</th>
                    <th className="p-3">Partner</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3">Payout Method &amp; Details</th>
                    <th className="p-3">Reference / UTR</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium">
                  {payoutRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 pl-4 text-muted-foreground whitespace-nowrap">
                        {new Date(req.requested_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-foreground">{req.profiles?.full_name || 'Affiliate'}</div>
                        <div className="text-[10px] text-muted-foreground">{req.profiles?.email}</div>
                      </td>
                      <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatINR(req.amount_paise)}
                      </td>
                      <td className="p-3">
                        {req.payout_method === 'upi' ? (
                          <span className="font-mono text-blue-600">UPI: {req.payout_details?.upi_id}</span>
                        ) : (
                          <span className="text-[11px]">
                            A/C: {req.payout_details?.account_number} ({req.payout_details?.ifsc})
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-muted-foreground">
                        {req.reference_number || '—'}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={req.status === 'completed' ? 'default' : req.status === 'requested' ? 'destructive' : 'secondary'}
                          className="text-[10px] capitalize"
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="p-3 pr-4 text-right">
                        {req.status === 'requested' && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedPayout(req)}
                            className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                          >
                            Process
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── 4. EDIT PRODUCT DIALOG ───────────────────────────────────────── */}
      <Dialog open={Boolean(editingProduct)} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Configure: {editingProduct?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure selling price, commission type, rate, and attribution parameters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Selling Price (Paise)</Label>
              <Input
                type="number"
                value={editPricePaise}
                onChange={(e) => setEditPricePaise(parseInt(e.target.value, 10) || 0)}
                className="text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">{formatINR(editPricePaise)} INR</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Commission Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={editCommType === 'percentage' ? 'default' : 'outline'}
                  onClick={() => setEditCommType('percentage')}
                  className="flex-1 text-xs"
                >
                  Percentage (%)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={editCommType === 'fixed' ? 'default' : 'outline'}
                  onClick={() => setEditCommType('fixed')}
                  className="flex-1 text-xs"
                >
                  Fixed Cash (Paise)
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">
                {editCommType === 'percentage' ? 'Commission Percentage (%)' : 'Fixed Commission Amount (Paise)'}
              </Label>
              <Input
                type="number"
                value={editCommRate}
                onChange={(e) => setEditCommRate(parseFloat(e.target.value) || 0)}
                className="text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                {editCommType === 'percentage'
                  ? `Affiliate earns ${editCommRate}% of net purchase (${formatINR(Math.round((editPricePaise * editCommRate) / 100))})`
                  : `Affiliate earns flat ${formatINR(editCommRate)} per purchase`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Attribution Window (Days)</Label>
                <Input
                  type="number"
                  value={editWindow}
                  onChange={(e) => setEditWindow(parseInt(e.target.value, 10) || 30)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Refund Grace (Days)</Label>
                <Input
                  type="number"
                  value={editGrace}
                  onChange={(e) => setEditGrace(parseInt(e.target.value, 10) || 14)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="text-xs font-semibold">Product Active in Marketplace</Label>
              <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveProduct}
              disabled={savingProduct}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              {savingProduct ? 'Saving…' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 5. PROCESS PAYOUT DIALOG ─────────────────────────────────────── */}
      <Dialog open={Boolean(selectedPayout)} onOpenChange={(open) => !open && setSelectedPayout(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Disburse Payout: {formatINR(selectedPayout?.amount_paise || 0)}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm bank/UPI disbursement to {selectedPayout?.profiles?.full_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40 space-y-1 border">
              <p className="font-bold text-foreground">Destination:</p>
              {selectedPayout?.payout_method === 'upi' ? (
                <p className="font-mono text-blue-600">UPI: {selectedPayout?.payout_details?.upi_id}</p>
              ) : (
                <div className="space-y-0.5">
                  <p>A/C Holder: {selectedPayout?.payout_details?.holder_name}</p>
                  <p className="font-mono">Account No: {selectedPayout?.payout_details?.account_number}</p>
                  <p className="font-mono">IFSC Code: {selectedPayout?.payout_details?.ifsc}</p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Bank / UPI Reference Number (UTR / Ref ID)</Label>
              <Input
                placeholder="e.g. UTR1234567890"
                value={payoutReference}
                onChange={(e) => setPayoutReference(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleApprovePayout('rejected')}
              disabled={processingPayout}
            >
              Reject Payout
            </Button>
            <Button
              size="sm"
              onClick={() => handleApprovePayout('completed')}
              disabled={processingPayout}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              {processingPayout ? 'Recording…' : 'Confirm Disbursement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AffiliateAdminCentre;
