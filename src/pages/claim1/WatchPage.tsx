// src/pages/claim1/WatchPage.tsx
// /claim1/watch — Zero-friction email lead capture for real-time leaderboard notifications

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWatchScope, useScopeBySlug, useLeaderboard } from '@/hooks/useClaim1';
import { formatCurrency } from '@/services/claim1Service';

const SCOPES = [
  { catSlug: 'ai-products', scopeSlug: 'global',    label: '🌍 Global' },
  { catSlug: 'ai-products', scopeSlug: 'emerging',  label: '✨ Emerging' },
  { catSlug: 'ai-products', scopeSlug: 'india',     label: '🇮🇳 India' },
  { catSlug: 'ai-products', scopeSlug: 'usa',       label: '🇺🇸 USA' },
  { catSlug: 'ai-products', scopeSlug: 'uae',       label: '🇦🇪 UAE' },
  { catSlug: 'ai-products', scopeSlug: 'uk',        label: '🇬🇧 UK' },
  { catSlug: 'ai-products', scopeSlug: 'singapore', label: '🇸🇬 Singapore' },
];

function ScopePreview({ catSlug, scopeSlug }: { catSlug: string; scopeSlug: string }) {
  const { data: scope } = useScopeBySlug(catSlug, scopeSlug);
  const { data: leaderboard, isLoading } = useLeaderboard(scope?.id, 1);
  const top = leaderboard?.listings?.[0];
  const currency = top?.currency || 'INR';

  if (isLoading) return <Skeleton className="h-16 w-full rounded-lg" />;
  if (!top) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">No listings on this board yet — be the first.</p>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/40 border">
      <span className="text-2xl">🥇</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{top.entity?.name}</p>
        <p className="text-xs text-muted-foreground">{formatCurrency(top.current_bid_amount, currency)} current bid</p>
      </div>
      <Link to={`/rankings/${catSlug}${scopeSlug !== 'global' ? '/' + scopeSlug : ''}`}>
        <Button size="sm" variant="ghost" className="text-xs gap-1 font-medium">
          View Board <ChevronRight className="w-3 h-3" />
        </Button>
      </Link>
    </div>
  );
}

export default function WatchPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [email, setEmail]             = useState('');
  const [done, setDone]               = useState(false);
  const watchMutation = useWatchScope();

  const { data: scope } = useScopeBySlug(
    SCOPES[selectedIdx].catSlug,
    SCOPES[selectedIdx].scopeSlug
  );

  const handleWatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scope?.id || !email.trim()) return;
    await watchMutation.mutateAsync({ scopeId: scope.id, email: email.trim() });
    setDone(true);
  };

  return (
    <>
      <Helmet>
        <title>Watch the Leaderboard — TalentXcel Rankings</title>
        <meta name="description"
          content="Get notified when #1 changes on TalentXcel's global AI product leaderboard. No account needed." />
      </Helmet>

      <div className="max-w-lg mx-auto px-4 py-16 space-y-8">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Eye className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Watch the Leaderboard</h1>
          <p className="text-muted-foreground text-sm">
            Receive an instant notification whenever #1 changes. Zero spam. No account required.
          </p>
        </div>

        {/* Scope Selector */}
        <div className="flex gap-2 flex-wrap justify-center">
          {SCOPES.map((s, i) => (
            <button
              key={s.scopeSlug}
              type="button"
              onClick={() => setSelectedIdx(i)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedIdx === i
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Current #1 Preview */}
        <Card className="p-4 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Current #1 — {SCOPES[selectedIdx].label}
          </p>
          <ScopePreview catSlug={SCOPES[selectedIdx].catSlug} scopeSlug={SCOPES[selectedIdx].scopeSlug} />
        </Card>

        {/* Watch Form / Success Message */}
        {done ? (
          <Card className="p-8 text-center space-y-3 border-green-500/30 bg-green-500/5">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
            <p className="font-bold text-green-800 dark:text-green-300 text-lg">You're Watching This Board!</p>
            <p className="text-muted-foreground text-xs">
              We will send you an email the exact moment the #1 position changes on {SCOPES[selectedIdx].label}.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" size="sm" onClick={() => { setDone(false); setEmail(''); }}>
                Watch Another Board
              </Button>
              <Link to="/rankings">
                <Button size="sm">Explore Rankings</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleWatch} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Your Email Address
              </label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="founder@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={watchMutation.isPending || !email.trim()}>
                  {watchMutation.isPending ? 'Subscribing...' : 'Watch'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                No account required. Unsubscribe anytime in one click.
              </p>
            </div>
          </form>
        )}

        {/* CTA to Participate */}
        <div className="text-center text-sm text-muted-foreground">
          Want to compete for #1?{' '}
          <Link to="/claim1/enter" className="text-primary font-semibold hover:underline">
            Claim your profile →
          </Link>
        </div>

      </div>
    </>
  );
}
