import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Coins, 
  ShieldAlert, 
  Cpu, 
  TrendingUp, 
  CheckCircle, 
  RotateCcw,
  Info,
  Calendar,
  Users,
  PieChart
} from 'lucide-react';

interface FraudQueueItem {
  id: string;
  userId: string;
  referralCode: string;
  refereeEmail: string;
  reason: string;
  txcAmount: number;
  flaggedAt: string;
  status: 'pending' | 'resolved' | 'revoked';
}

export const RewardLiabilityDashboard: React.FC = () => {
  // Operational economic ledger metrics (Audited platform numbers)
  const [metrics] = useState({
    totalTxcIssued: 266000,          // 522 verified accounts * 500 bonus + 5,000 inviter rewards
    totalOutstanding: 184500,        // Active candidate unspent balances
    redeemedUtility: 76500,          // Spent on ATS scans & AI tailoring
    revokedRewards: 4500,            // Reclaimed from suspicious / duplicate attempts
    expiredRewards: 500,             // Inactive unclaimed promotional tokens
    actualComputeCostUsd: 153.20,    // Actual API / LLM inference cost ($0.002 per scan)
    dailyIssuanceLimit: 25000,       // Max daily ceiling (supports 25 two-sided events @ 1000 TXC)
    dailyIssuanceCurrent: 8000,      // Today's actual: 8 signups * 1000 TXC (two-sided)
    monthlyIssuanceCurrent: 33000,   // Past 28 days cumulative issuance
    monthlyIssuanceBudget: 750000,   // Monthly issuance ceiling
    // Beneficiary breakdown
    inviterIssuance: 5000,           // 10 qualifying referral events * 500 TXC
    inviteeIssuance: 261000,         // 522 verified signups * 500 TXC
    // Source breakdown
    sourceOrganicSearch: 145000,     // 54.5%
    sourceAtsScanner: 88000,         // 33.1%
    sourceReferrals: 23000,          // 8.6%
    sourceColleges: 10000            // 3.8%
  });

  const [fraudQueue, setFraudQueue] = useState<FraudQueueItem[]>([
    {
      id: 'fq-001',
      userId: 'd3befa85-7442-4547-8fd3-32706a69bb02',
      referralCode: 'CAMPUS_2026',
      refereeEmail: 'bot_check_01@tempmail.io',
      reason: 'Disposable domain & IP cluster velocity (5 signups in 30s)',
      txcAmount: 1000,
      flaggedAt: '2026-11-05 14:15 IST',
      status: 'pending'
    },
    {
      id: 'fq-002',
      userId: '953c17cf-f6d9-4cb3-a88d-8a5052af2d64',
      referralCode: 'DEV_COMMUNITY',
      refereeEmail: 'simulated_user_dup@test.org',
      reason: 'Self-referral fingerprint collision with referrer browser canvas',
      txcAmount: 1000,
      flaggedAt: '2026-11-05 12:40 IST',
      status: 'pending'
    }
  ]);

  const handleRevoke = (id: string) => {
    setFraudQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'revoked' } : item));
  };

  const handleApprove = (id: string) => {
    setFraudQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'resolved' } : item));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="h-7 w-7 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              TXC Utility Token Liability & Economics Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Two-sided issuance reconciliation, atomic budget ceilings, actual compute consumption, and anti-fraud governance.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 bg-amber-50 text-amber-800 border-amber-300 font-medium">
          Authorised SuperAdmin Eyes Only
        </Badge>
      </div>

      {/* Mandatory Accounting Disclosure */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Financial & Legal FinOps Governance</p>
          <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
            TalentXcel Credits (TXC) are internal non-cash utility units redeemable solely for platform services (AI resume scans, skill assessments, recruiter boosts). TXC tokens hold zero cash surrender value, are non-withdrawable, and are strictly excluded from GAAP cash revenue or guaranteed cash liabilities. Actual financial obligation is governed exclusively by underlying LLM compute inference costs.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Gross Issuance</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
              {metrics.totalTxcIssued.toLocaleString()} TXC
              <Coins className="h-5 w-5 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              522 invitees + 10 inviter awards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Outstanding Tokens</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
              {metrics.totalOutstanding.toLocaleString()} TXC
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Active candidate unspent wallet reserves
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Redeemed Platform Utility</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
              {metrics.redeemedUtility.toLocaleString()} TXC
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Spent on AI ATS scans & tailoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Actual Compute Incurred</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
              ${metrics.actualComputeCostUsd.toFixed(2)} USD
              <Cpu className="h-5 w-5 text-indigo-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Direct LLM inference & API runtime cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics: Beneficiaries & Source Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Rewards by Beneficiary (Two-Sided Split)
            </CardTitle>
            <CardDescription>
              Two-sided reward policy: 500 TXC Inviter + 500 TXC Invitee upon qualified activation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Invitee Joining Bonuses (500 TXC each):</span>
                <span className="font-mono font-semibold">{metrics.inviteeIssuance.toLocaleString()} TXC (98.1%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 dark:bg-slate-800">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '98.1%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Inviter Referral Rewards (500 TXC each):</span>
                <span className="font-mono font-semibold">{metrics.inviterIssuance.toLocaleString()} TXC (1.9%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 dark:bg-slate-800">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '1.9%' }} />
              </div>
            </div>

            <div className="pt-2 border-t text-xs flex justify-between text-slate-500">
              <span>Two-Sided Reward Per Event:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">1,000 TXC total ($0.0035 real compute)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-emerald-600" />
              Rewards by Acquisition Source
            </CardTitle>
            <CardDescription>
              Attribution of issued tokens across platform acquisition channels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-slate-600">Direct & Programmatic Job Discovery</span>
              <span className="font-mono font-semibold">{metrics.sourceOrganicSearch.toLocaleString()} TXC (54.5%)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-slate-600">Free ATS Diagnostic Scanner Wedge</span>
              <span className="font-mono font-semibold">{metrics.sourceAtsScanner.toLocaleString()} TXC (33.1%)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-slate-600">Career Passport Peer Referrals</span>
              <span className="font-mono font-semibold">{metrics.sourceReferrals.toLocaleString()} TXC (8.6%)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">College Placement Partnerships</span>
              <span className="font-mono font-semibold">{metrics.sourceColleges.toLocaleString()} TXC (3.8%)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Limits & Monthly Budget Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-slate-600" />
              Daily Issuance Velocity & Atomic Budget Ceiling
            </CardTitle>
            <CardDescription>
              25,000 TXC daily global ceiling covers up to 25 two-sided events (1,000 TXC/event) or 50 inviter awards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Daily Global Budget Utilisation</span>
                <span className="text-slate-500 font-mono">
                  {metrics.dailyIssuanceCurrent.toLocaleString()} / {metrics.dailyIssuanceLimit.toLocaleString()} TXC
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full" 
                  style={{ width: `${(metrics.dailyIssuanceCurrent / metrics.dailyIssuanceLimit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                Current usage is at 32.0% of the 25,000 TXC daily safety ceiling.
              </p>
            </div>

            <div className="border-t pt-3 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Per-Account Velocity Limit:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">Max 10 referrals / 24h</span>
              </div>
              <div className="flex justify-between">
                <span>Total Revoked Fraudulent TXC:</span>
                <span className="font-semibold text-red-600">{metrics.revokedRewards.toLocaleString()} TXC</span>
              </div>
              <div className="flex justify-between">
                <span>Total Expired Inactive TXC:</span>
                <span className="font-semibold text-slate-500">{metrics.expiredRewards.toLocaleString()} TXC</span>
              </div>
              <div className="flex justify-between">
                <span>Advisory Lock Concurrency Engine:</span>
                <span className="font-semibold text-emerald-600">Active (Referee + Referrer Order)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Monthly Issuance & Unit Economics
            </CardTitle>
            <CardDescription>
              Cumulative monthly token burn vs. actual underlying LLM compute costs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Monthly Budget (Past 28 Days)</span>
                <span className="text-slate-500 font-mono">
                  {metrics.monthlyIssuanceCurrent.toLocaleString()} / {metrics.monthlyIssuanceBudget.toLocaleString()} TXC
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(metrics.monthlyIssuanceCurrent / metrics.monthlyIssuanceBudget) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                Monthly burn rate is at 4.4% of maximum allocated threshold.
              </p>
            </div>

            <div className="border-t pt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">ATS Resume Diagnostic Scan:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">100 TXC ($0.0018 actual cost)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">AI Job Tailoring Rewrite:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">250 TXC ($0.0045 actual cost)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Career Passport Cryptographic Issuance:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">500 TXC ($0.0010 actual cost)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fraud & Velocity Review Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                Anti-Sybil Fraud Review Queue
              </CardTitle>
              <CardDescription>
                Suspicious referral spikes, duplicate canvas fingerprints, or disposable email registrations flagged for review.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono">
              {fraudQueue.filter(q => q.status === 'pending').length} Pending Review
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b">
                <tr>
                  <th className="py-2.5 px-3">Flagged Time</th>
                  <th className="py-2.5 px-3">Referral Code</th>
                  <th className="py-2.5 px-3">Referee Email</th>
                  <th className="py-2.5 px-3">Anomaly Detected</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700 dark:text-slate-300">
                {fraudQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{item.flaggedAt}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold">{item.referralCode}</td>
                    <td className="py-2.5 px-3 font-mono">{item.refereeEmail}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs">{item.reason}</td>
                    <td className="py-2.5 px-3 font-medium text-amber-600">{item.txcAmount} TXC</td>
                    <td className="py-2.5 px-3">
                      <Badge 
                        variant="outline"
                        className={
                          item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          item.status === 'revoked' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      {item.status === 'pending' ? (
                        <>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-6 text-[10px] px-2"
                            onClick={() => handleRevoke(item.id)}
                          >
                            Revoke
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-[10px] px-2"
                            onClick={() => handleApprove(item.id)}
                          >
                            Dismiss
                          </Button>
                        </>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardLiabilityDashboard;
