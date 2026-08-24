import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ExternalLink,
  Trophy,
  Zap,
  Globe,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  MessageSquare,
  Building2,
  Calendar,
  MapPin,
  Users,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEntity, useEntityListings, useRankingHistory } from '@/hooks/useClaim1';
import { formatCurrency } from '@/services/claim1Service';
import { useAuth } from '@/contexts/AuthContext';
import { EditEntityProfileModal } from '@/components/claim1/EditEntityProfileModal';

const EVENT_LABELS: Record<string, string> = {
  entered:    '🟢 Entered Leaderboard',
  moved_up:   '⬆️ Moved Up',
  moved_down: '⬇️ Displaced Down',
  reached_1:  '🥇 Claimed #1',
  lost_1:     '📉 Lost #1',
  reclaimed:  '🔥 Reclaimed #1',
  outbid:     '⚔️ Outbid',
};

export default function CompanyRankingProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const { data: entity, isLoading: entityLoading } = useEntity(slug);
  const { data: listings = [], isLoading: listingsLoading } = useEntityListings(entity?.id);
  const { data: history = [] }  = useRankingHistory(entity?.id);

  if (entityLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="flex gap-4">
          <Skeleton className="w-20 h-20 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground text-sm">This company has not been registered on the leaderboard yet.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link to="/rankings"><Button variant="outline">View Rankings</Button></Link>
          <Link to="/claim1/enter"><Button>Claim a Profile</Button></Link>
        </div>
      </div>
    );
  }

  const isOwner = user && (user.id === entity.owner_user_id || !entity.owner_user_id);
  const topListing = listings[0];
  const totalSpent = listings.reduce((s, l) => s + (l.total_spent_amount || 0), 0);
  const currency = topListing?.currency || 'INR';
  const isFounding = entity.is_founding_100 || entity.founding_fee_locked;
  const socials = entity.social_links || {};

  const pageTitle = `${entity.name} — TalentXcel Rankings`;
  const pageDesc  = entity.tagline || entity.description
    || `${entity.name} is competing on TalentXcel's global AI product leaderboard. View live rankings, bid history, and challenge for the top position.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <link rel="canonical" href={`https://talentxcel.com/company/${entity.slug}`} />
      </Helmet>

      {editOpen && (
        <EditEntityProfileModal
          entity={entity}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Breadcrumbs & Owner Edit CTA */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link to="/rankings" className="hover:text-primary">Rankings</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{entity.name}</span>
          </div>
          {isOwner && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditOpen(true)}
              className="gap-1.5 text-xs h-8"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </Button>
          )}
        </div>

        {/* Header Profile Section */}
        <Card className="p-6">
          <div className="flex items-start gap-5 flex-wrap sm:flex-nowrap">
            <div className="w-20 h-20 rounded-2xl border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
              {entity.logo_url ? (
                <img src={entity.logo_url} alt={entity.name} className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-3xl font-bold text-muted-foreground">{entity.name.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{entity.name}</h1>
                {entity.verified && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <ShieldCheck className="w-3 h-3 text-primary" /> Verified
                  </Badge>
                )}
                {isFounding && (
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 text-xs gap-1">
                    <Sparkles className="w-3 h-3" /> Founding 100
                  </Badge>
                )}
              </div>

              {entity.tagline && (
                <p className="text-sm font-medium text-foreground/90 mt-1">
                  {entity.tagline}
                </p>
              )}

              {/* Quick Fact Badges */}
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                {entity.city && (
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {entity.city}
                  </span>
                )}
                {entity.country_name && !entity.city && (
                  <span className="flex items-center gap-1 font-medium">
                    <Globe className="w-3.5 h-3.5 text-primary" /> {entity.country_name}
                  </span>
                )}
                {entity.founded_year && (
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Founded {entity.founded_year}
                  </span>
                )}
                {entity.company_size && (
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" /> {entity.company_size}
                  </span>
                )}
              </div>

              {/* Industry Tags */}
              {entity.industry_tags && entity.industry_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {entity.industry_tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[11px] px-2 py-0.5 font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Social & Web Links Bar */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t flex-wrap">
                {entity.website_url && (
                  <a
                    href={entity.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
                {socials.twitter && (
                  <a
                    href={socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>Twitter / X</span>
                  </a>
                )}
                {socials.linkedin && (
                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {socials.github && (
                  <a
                    href={socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {socials.youtube && (
                  <a
                    href={socials.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                    <span>YouTube</span>
                  </a>
                )}
                {socials.discord && (
                  <a
                    href={socials.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Discord / Community</span>
                  </a>
                )}
              </div>

            </div>
          </div>

          {/* Full Description / About */}
          {entity.description && (
            <div className="mt-5 pt-4 border-t space-y-1">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">About {entity.name}</h3>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line mt-1">
                {entity.description}
              </p>
            </div>
          )}
        </Card>

        {/* Metric Highlight Cards */}
        {listings.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active Boards', value: listings.length },
              { label: 'Highest Rank',  value: topListing?.highest_rank ? `#${topListing.highest_rank}` : '—' },
              { label: 'Total Invested', value: formatCurrency(totalSpent, currency) },
            ].map(({ label, value }) => (
              <Card key={label} className="p-4 text-center">
                <p className="text-xl sm:text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Current Active Rankings */}
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/20">
            <h2 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Active Board Positions</h2>
          </div>
          {listingsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded" />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm space-y-3">
              <p>Not competing on any active boards yet.</p>
              <Link to="/claim1/enter">
                <Button size="sm" className="gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Enter Leaderboards Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {listings.map((listing) => {
                const scope = listing.scope as any;
                const catSlug = scope?.category?.slug || 'ai-products';
                const scopeSlug = scope?.slug || 'global';
                const listCurr = listing.currency || 'INR';

                return (
                  <div key={listing.id} className="px-5 py-3.5 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    <div className="w-8 text-center font-bold text-base">
                      {listing.current_rank === 1 ? '🥇' :
                       listing.current_rank === 2 ? '🥈' :
                       listing.current_rank === 3 ? '🥉' :
                       `#${listing.current_rank ?? '—'}`}
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <Link
                        to={scopeSlug === 'global' ? `/rankings/${catSlug}` : `/rankings/${catSlug}/${scopeSlug}`}
                        className="text-sm font-semibold hover:text-primary transition-colors"
                      >
                        {scope?.scope_type === 'global' ? '🌍 Global AI Products' :
                         scope?.scope_type === 'emerging' ? '✨ Emerging AI Products' :
                         `${scope?.country_name || scopeSlug} AI Products`}
                      </Link>
                    </div>
                    <div className="text-right text-sm flex-shrink-0">
                      <p className="font-bold">{formatCurrency(listing.current_bid_amount, listCurr)}</p>
                      <p className="text-[10px] text-muted-foreground">{listing.bid_count} bids placed</p>
                    </div>
                    <Link to={`/claim1/bid/${listing.id}`}>
                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                        <Zap className="w-3 h-3" /> Challenge
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Historical Event Timeline */}
        {history.length > 0 && (
          <Card className="overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/20">
              <h2 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Position Event History</h2>
            </div>
            <div className="divide-y max-h-64 overflow-y-auto">
              {history.slice(0, 15).map((event) => (
                <div key={event.id} className="px-5 py-3 flex items-center gap-3 text-sm">
                  <span className="flex-1 font-medium">{EVENT_LABELS[event.event_type] || event.event_type}</span>
                  {event.old_rank && event.new_rank && (
                    <span className="text-xs text-muted-foreground font-mono">#{event.old_rank} → #{event.new_rank}</span>
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(event.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Bottom CTAs */}
        <div className="flex gap-3">
          {!entity.owner_user_id && (
            <Link to="/claim1/enter" className="flex-1">
              <Button variant="default" className="w-full font-semibold">Claim This Profile</Button>
            </Link>
          )}
          <Link to="/rankings" className="flex-1">
            <Button variant="outline" className="w-full font-semibold">Explore All Leaderboards</Button>
          </Link>
        </div>

      </div>
    </>
  );
}
