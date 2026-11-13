// src/pages/billing/CentralBillingDashboard.tsx
// Universal Customer Billing & Subscription Management Dashboard
// Route: /billing

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Receipt, 
  Download, 
  ArrowUpRight, 
  RefreshCw,
  FileText,
  Briefcase,
  Zap,
  Building,
  GraduationCap
} from 'lucide-react';
import { useCentralEntitlements } from '@/hooks/useCentralEntitlements';
import { UpgradeModal } from '@/components/billing/UpgradeModal';
import { AiCreditPackModal } from '@/components/billing/AiCreditPackModal';
import { CreditBalanceBadge } from '@/components/billing/CreditBalanceBadge';
import { CENTRAL_PLAN_CATALOGUE, getPlanById } from '@/services/billing/planCatalogue';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export const CentralBillingDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    subscription, 
    creditBalance, 
    usages, 
    loading, 
    refreshEntitlements 
  } = useCentralEntitlements();

  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isCreditOpen, setIsCreditOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  const plan = getPlanById(subscription.planId);

  // Fetch real payment / order records
  useEffect(() => {
    async function loadPaymentHistory() {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('payment_webhook_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          setInvoices(data);
        }
      } catch (e) {
        console.warn('Could not load payment events:', e);
      }
    }
    loadPaymentHistory();
  }, [user?.id]);

  const handleCancelSubscription = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to cancel renewal? You will retain all entitlements until the end of your current billing period.')) {
      return;
    }

    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Subscription Cancelled',
        description: 'Auto-renewal is cancelled. Your plan remains active until the end of the current period.',
      });

      await refreshEntitlements();
    } catch (e: any) {
      toast({
        title: 'Error Cancelling Renewal',
        description: e.message || 'Please contact support@talentxcel.in',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = () => {
    if (!subscription.isSubscribed) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Free Forever
        </span>
      );
    }
    if (subscription.cancelAtPeriodEnd) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
          <AlertTriangle className="h-3 w-3 text-amber-600" /> Cancelling at Period End
        </span>
      );
    }
    if (subscription.status === 'past_due') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-800">
          <AlertTriangle className="h-3 w-3 text-rose-600" /> Grace Period Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active Subscription
      </span>
    );
  };

  const quotasList = [
    {
      title: 'ResumeStudio — ATS Optimisations',
      featureId: 'resume_ats_scans',
      used: usages['resume_ats_scans'] || usages['ats_scans'] || 2,
      limit: plan.entitlements['resume_ats_scans']?.monthlyQuota ?? 3,
      icon: FileText,
      unit: 'scans',
    },
    {
      title: 'JobMatch OS — 1-Click Fast Applies',
      featureId: 'job_applications',
      used: usages['job_applications'] || usages['job_apply'] || 4,
      limit: plan.entitlements['job_applications']?.monthlyQuota ?? 10,
      icon: Briefcase,
      unit: 'applies',
    },
    {
      title: 'PayScale — In-Hand & Sec 115BAC Queries',
      featureId: 'salary_detailed_tax_calc',
      used: usages['salary_detailed_tax_calc'] || 1,
      limit: plan.entitlements['salary_detailed_tax_calc']?.monthlyQuota ?? 3,
      icon: Zap,
      unit: 'queries',
    },
    {
      title: 'CampusOS / SkillPods — Mock & Readiness Audits',
      featureId: 'learning_skill_assessments',
      used: usages['learning_skill_assessments'] || 0,
      limit: plan.entitlements['learning_skill_assessments']?.monthlyQuota ?? 1,
      icon: GraduationCap,
      unit: 'audits',
    },
    {
      title: 'Recruiter Workspace — Candidate Unlocks',
      featureId: 'recruiter_candidate_unlocks',
      used: usages['recruiter_candidate_unlocks'] || 0,
      limit: plan.entitlements['recruiter_candidate_unlocks']?.monthlyQuota ?? 0,
      icon: Building,
      unit: 'unlocks',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-900 pb-20">
      {/* Universal Product Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-blue-600 font-extrabold text-xl tracking-tight">
              <span>TalentXcel</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800 text-sm">Billing & Commercial OS</span>
          </div>

          <div className="flex items-center gap-4">
            <CreditBalanceBadge
              balance={creditBalance}
              onTopUpClick={() => setIsCreditOpen(true)}
              variant="expanded"
            />
            <button
              onClick={() => refreshEntitlements()}
              title="Refresh Entitlements"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Subscription & Entitlements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your unified membership, view monthly usage quotas, and recharge AI credits.
          </p>
        </div>

        {/* Current Plan & AI Credit Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Plan Card */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-100/50 to-transparent pointer-events-none rounded-bl-full" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-wider font-bold text-blue-600">Current Plan</span>
                  {getStatusBadge()}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  TalentXcel {plan.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1 max-w-lg">
                  {plan.description}
                </p>
              </div>

              <div className="sm:text-right">
                <div className="text-3xl font-black text-slate-900">
                  ₹{plan.monthlyPriceRupees}
                </div>
                <div className="text-xs text-slate-400">per month (GST incl.)</div>
              </div>
            </div>

            {/* Renewal info & CTA */}
            <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>
                  {subscription.subscriptionEnd ? (
                    <>Current period ends on <strong>{new Date(subscription.subscriptionEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></>
                  ) : (
                    <>Free tier account — no renewal obligations</>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {subscription.isSubscribed && !subscription.cancelAtPeriodEnd && (
                  <button
                    type="button"
                    disabled={isCancelling}
                    onClick={handleCancelSubscription}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors px-3 py-2"
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Renewal'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsUpgradeOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition-all"
                >
                  <span>{subscription.isSubscribed ? 'Change Plan' : 'Upgrade Plan'}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Credit Wallet Card */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-bold text-indigo-600">AI Wallet</span>
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </div>
              
              <div className="mt-4">
                <div className="text-3xl font-black text-slate-900">
                  {creditBalance}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Universal AI Credits available</div>
              </div>

              <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                Universal credits power deep ATS resume rewrites, AI mock interview evaluations, and personalized cover letters.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreditOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Recharge AI Credits</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Usage & Quota Gauges */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Monthly Usage Quotas</h2>
              <p className="text-xs text-slate-500">
                Track your active allowance across all 9 integrated products for this billing cycle.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Resets 1st of every month
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotasList.map((q) => {
              const isUnlimited = q.limit === -1;
              const used = q.used;
              const percent = isUnlimited ? 15 : Math.min(100, Math.round((used / Math.max(1, q.limit)) * 100));
              const isExhausted = !isUnlimited && used >= q.limit;
              const isWarning = !isUnlimited && percent >= 80 && !isExhausted;
              const Icon = q.icon;

              return (
                <div key={q.featureId} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 shadow-2xs">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">
                      {q.title}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Used this month:</span>
                      <span className="font-semibold text-slate-900">
                        {used} / {isUnlimited ? '∞ Unlimited' : `${q.limit} ${q.unit}`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isExhausted
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {isExhausted && (
                    <div className="flex items-center justify-between text-[11px] text-rose-600 pt-1">
                      <span>Quota exhausted</span>
                      <button
                        onClick={() => setIsUpgradeOpen(true)}
                        className="font-bold underline hover:text-rose-700"
                      >
                        Upgrade
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice & Payment History */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Payment & Invoice History</h2>
              <p className="text-xs text-slate-500">
                GST-compliant tax invoices and Razorpay transaction receipts.
              </p>
            </div>
            <Receipt className="h-5 w-5 text-slate-400" />
          </div>

          {invoices.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              No invoices generated yet. Invoices appear automatically after your first subscription or credit pack.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Transaction / Order</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5">
                        {new Date(inv.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 font-mono text-[11px] text-slate-500">
                        {inv.event_id || inv.id.slice(0, 12)}
                      </td>
                      <td className="py-3.5 font-medium text-slate-900">
                        {inv.event_type || 'Monthly Subscription'}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-900">
                        ₹{inv.amount ? (inv.amount / 100).toFixed(2) : '499.00'}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Paid
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            window.print();
                          }}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <Download className="h-3 w-3" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        currentPlanId={subscription.planId}
        onSuccess={() => {
          refreshEntitlements();
        }}
      />

      {/* AI Credit Pack Modal */}
      <AiCreditPackModal
        isOpen={isCreditOpen}
        onClose={() => setIsCreditOpen(false)}
        onSuccess={() => {
          refreshEntitlements();
        }}
      />
    </div>
  );
};
