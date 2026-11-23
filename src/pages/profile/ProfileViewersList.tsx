import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, Lock, RefreshCw, Building2, MapPin, Users, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { useProfileVisitors, ProfileVisitor } from '@/hooks/useProfileVisitors';
import { formatVisitTimestamp } from '@/utils/visitorDateFormatter';
import { PresenceIndicator } from '@/components/network/PresenceIndicator';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileViewersList() {
  const { user, isAuthenticated, loading: authLoading } = useOptimizedAuth();
  const navigate = useNavigate();

  const {
    visitors,
    totalViews,
    uniqueVisitors,
    anonymousViews,
    isLoading,
    isFetching,
    error,
    hasMore,
    loadMore,
    reset
  } = useProfileVisitors(Boolean(user?.id));

  // Redirect if unauthenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated && !user) {
      navigate('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  if (authLoading || (!user && isLoading)) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-8 space-y-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl space-y-6">
      {/* Top Navigation Back Link */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border/50">
          <Lock className="h-3.5 w-3.5 text-emerald-500" />
          <span>Only you can see this list.</span>
        </div>
      </div>

      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <CardHeader className="p-6 border-b border-border/60 bg-muted/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Eye className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold">Who viewed your profile</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Private analytics of identifiable members who visited your TalentXcel profile.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-bold px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
                {totalViews} {totalViews === 1 ? 'total view' : 'total views'}
              </Badge>
              <Badge variant="outline" className="text-xs font-bold px-3 py-1 border-primary/40 text-primary">
                {uniqueVisitors} unique {uniqueVisitors === 1 ? 'visitor' : 'visitors'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Error State */}
          {error && (
            <div className="text-center py-10 px-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
              <p className="text-sm font-semibold text-foreground">Failed to load profile visitors</p>
              <p className="text-xs text-muted-foreground">{(error as Error)?.message}</p>
              <Button variant="outline" size="sm" onClick={reset} className="gap-1.5 text-xs font-semibold">
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!error && visitors.length === 0 && (
            <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-border/80 bg-muted/10 space-y-3">
              <div className="h-14 w-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Users className="h-7 w-7 opacity-80" />
              </div>
              <h4 className="text-base font-bold text-foreground">No profile views yet</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Your profile views will appear here when people visit your profile.
              </p>
              {anonymousViews > 0 && (
                <div className="pt-2">
                  <Badge variant="secondary" className="text-xs text-muted-foreground bg-muted/60">
                    +{anonymousViews} anonymous / private views recorded
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Visitor List */}
          {!error && visitors.length > 0 && (
            <div className="space-y-3">
              {visitors.map((visitor: ProfileVisitor) => {
                const timeInfo = formatVisitTimestamp(visitor.last_visited_at);
                const profileUrl = `/u/${visitor.profile_slug}`;

                return (
                  <div
                    key={visitor.visitor_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/60 hover:border-primary/40 bg-card hover:bg-muted/15 transition-all shadow-2xs"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12 border border-border/70">
                          <AvatarImage src={visitor.profile_picture_url || undefined} alt={visitor.full_name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {visitor.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <PresenceIndicator
                            isOnline={visitor.is_online}
                            lastSeen={visitor.last_seen}
                            lastHeartbeatAt={visitor.last_heartbeat_at}
                            visibility={visitor.presence_visibility}
                            variant="dot"
                          />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={profileUrl}
                            className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate focus:outline-hidden focus:underline"
                          >
                            {visitor.full_name}
                          </Link>
                          {visitor.visit_count > 1 && (
                            <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0 bg-muted text-muted-foreground">
                              {visitor.visit_count} visits
                            </Badge>
                          )}
                        </div>

                        {visitor.headline && (
                          <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5" title={visitor.headline}>
                            {visitor.headline}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/80 mt-1.5">
                          {visitor.company && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <Building2 className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                              <span className="truncate">{visitor.company}</span>
                            </span>
                          )}

                          {visitor.location && (
                            <span className="flex items-center gap-1 truncate max-w-[160px]">
                              <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                              <span className="truncate">{visitor.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-medium border-border/70 text-foreground/80 flex items-center gap-1 py-0.5 px-2.5 bg-muted/30"
                        title={`Visited on ${timeInfo.exactDateTime}`}
                      >
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{timeInfo.relativeText}</span>
                      </Badge>

                      <Link
                        to={profileUrl}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <span>View profile</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={isFetching}
                className="text-xs font-semibold px-6 rounded-full"
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Loading more...
                  </>
                ) : (
                  'Load more visitors'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
