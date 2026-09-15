// src/pages/claim1/RankingsHub.tsx
// /rankings — Public hub for all Claim #1 competitive leaderboards

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Brain, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getCategories, formatCurrency } from '@/services/claim1Service';
import { useFounding100Count } from '@/hooks/useClaim1';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Brain:  <Brain className="w-6 h-6" />,
  Trophy: <Trophy className="w-6 h-6" />,
};

const SCOPE_TABS = [
  { slug: 'global',    label: 'Global 🌍' },
  { slug: 'emerging',  label: 'Emerging ✨' },
  { slug: 'india',     label: '🇮🇳 India' },
  { slug: 'usa',       label: '🇺🇸 USA' },
  { slug: 'uae',       label: '🇦🇪 UAE' },
  { slug: 'uk',        label: '🇬🇧 UK' },
  { slug: 'singapore', label: '🇸🇬 Singapore' },
];

export default function RankingsHub() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['claim1-categories'],
    queryFn:  getCategories,
    staleTime: 10 * 60_000,
  });

  const { data: foundingCount = 0 } = useFounding100Count();
  const remainingFounding = Math.max(0, 100 - foundingCount);

  return (
    <>
      <Helmet>
        <title>Rankings — TalentXcel Claim #1</title>
        <meta name="description"
          content="Compete for #1 across verified global leaderboards. Real companies, transparent bidding, instant outbid notifications." />
        <link rel="canonical" href="https://talentxcel.com/rankings" />
        <meta property="og:title" content="TalentXcel Claim #1 — Global Rankings" />
        <meta property="og:url" content="https://talentxcel.com/rankings" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <Zap className="w-3.5 h-3.5" />
            Live Global Ranking Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            There can only be one <span className="text-primary">#1</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Companies, products, and founders compete on public category leaderboards.
            Outbid your competitors to claim the throne.
          </p>

          {/* Founding 100 Callout */}
          {remainingFounding > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Founding 100: First 100 profiles lock in 5% permanent fee ({remainingFounding} slots remaining)</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to="/claim1/enter">
              <Button size="lg" className="gap-2 font-bold shadow-sm">
                <Trophy className="w-4 h-4" />
                Claim Your Position
              </Button>
            </Link>
            <Link to="/claim1/watch">
              <Button size="lg" variant="outline" className="font-semibold">
                Watch the Board
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories Section */}
        {isLoading ? (
          <div className="space-y-4">
            {[1].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">Leaderboards Initializing</p>
            <p className="text-sm mt-1">The first categories will be available shortly.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <Card key={category.id} className="overflow-hidden border-border/80">
                <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-background">
                  <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {CATEGORY_ICONS[category.icon] ?? <Trophy className="w-6 h-6" />}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{category.name}</h2>
                        <p className="text-muted-foreground text-sm mt-0.5">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0 text-sm">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Starting Bid</p>
                      <p className="font-bold text-foreground text-base">
                        {formatCurrency(category.starting_bid_amount, category.default_currency || 'INR')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
                    Explore Geographic Boards
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SCOPE_TABS.map(({ slug, label }) => (
                      <Link
                        key={slug}
                        to={slug === 'global'
                          ? `/rankings/${category.slug}`
                          : `/rankings/${category.slug}/${slug}`}
                      >
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-1.5 px-3 text-xs sm:text-sm font-medium"
                        >
                          {label}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* How It Works Loop */}
        <div className="border rounded-2xl p-6 sm:p-8 bg-muted/20 space-y-5">
          <h3 className="font-bold text-lg">The Competitive Loop</h3>
          <div className="grid sm:grid-cols-3 gap-6 text-sm">
            {[
              { step: '1', title: 'Claim Profile', desc: 'Enter your company or product. Initial listing is 100% free with zero fees.' },
              { step: '2', title: 'Bid & Claim #1', desc: 'Place a verified bid via Razorpay to rise to #1 on the public board.' },
              { step: '3', title: 'Instant Outbid Reclaim', desc: 'When displaced, you receive an instant alert with the exact price to reclaim #1.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
