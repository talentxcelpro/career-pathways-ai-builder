import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye,
  Users,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Lock,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfileVisitors, ProfileVisitor } from '@/hooks/useProfileVisitors';
import { formatVisitTimestamp } from '@/utils/visitorDateFormatter';
import { PresenceIndicator } from '@/components/network/PresenceIndicator';

interface ProfileVisitorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileVisitorsDialog: React.FC<ProfileVisitorsDialogProps> = ({
  open,
  onOpenChange,
}) => {
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
  } = useProfileVisitors(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden border-border/80 shadow-2xl bg-card">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  Who viewed your profile
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Lock className="h-3 w-3 text-emerald-500" />
                  <span>Only you can see this list.</span>
                </DialogDescription>
              </div>
            </div>

            {/* Quick Metrics Pills */}
            {!isLoading && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
                  {totalViews} {totalViews === 1 ? 'view' : 'views'}
                </Badge>
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/30 text-primary">
                  {uniqueVisitors} unique
                </Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* Loading State */}
          {isLoading && visitors.length === 0 && (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-xl border border-border/40 bg-muted/10">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-60" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="text-center py-10 px-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
              <p className="text-sm font-semibold text-foreground">Failed to load visitor analytics</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {(error as Error)?.message || 'An unexpected error occurred while fetching your profile visitors.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && visitors.length === 0 && (
            <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-border/80 bg-muted/10 my-4 space-y-3">
              <div className="h-14 w-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Users className="h-7 w-7 opacity-80" />
              </div>
              <h4 className="text-base font-bold text-foreground">No identifiable profile visits yet</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Your profile views will appear here when people visit your profile.
              </p>
              {anonymousViews > 0 && (
                <div className="pt-2">
                  <Badge variant="secondary" className="text-xs text-muted-foreground font-normal bg-muted/60">
                    +{anonymousViews} anonymous / private views recorded
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Visitor List */}
          {!isLoading && !error && visitors.length > 0 && (
            <div className="space-y-2.5">
              {visitors.map(visitor => (
                <VisitorCard key={visitor.visitor_id} visitor={visitor} />
              ))}
            </div>
          )}

          {/* Anonymous Views Note */}
          {!isLoading && !error && anonymousViews > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-muted-foreground/80 shrink-0" />
                <span>
                  <strong>{anonymousViews}</strong> {anonymousViews === 1 ? 'view was' : 'views were'} from non-logged in or private visitors.
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/60">
                Private
              </Badge>
            </div>
          )}

          {/* Pagination / Load More */}
          {!isLoading && hasMore && (
            <div className="text-center pt-2 pb-1">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={isFetching}
                className="text-xs font-semibold px-4 rounded-full"
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
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/60 bg-muted/10 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>Private &amp; confidential to your profile account.</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-7 text-xs font-medium px-2.5 text-muted-foreground hover:text-foreground"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface VisitorCardProps {
  visitor: ProfileVisitor;
}

const VisitorCard: React.FC<VisitorCardProps> = ({ visitor }) => {
  const timeInfo = formatVisitTimestamp(visitor.last_visited_at);
  const profileUrl = `/u/${visitor.profile_slug}`;

  return (
    <div className="group relative flex items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 hover:border-primary/40 bg-card hover:bg-muted/15 transition-all shadow-2xs">
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        {/* Avatar with Presence Dot */}
        <div className="relative shrink-0">
          <Avatar className="h-11 w-11 border border-border/70">
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

        {/* User Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              to={profileUrl}
              className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate focus:outline-hidden focus:underline"
            >
              {visitor.full_name}
            </Link>
            {visitor.visit_count > 1 && (
              <Badge variant="secondary" className="text-[10px] font-semibold px-1.5 py-0 h-4 bg-muted text-muted-foreground">
                {visitor.visit_count} visits
              </Badge>
            )}
          </div>

          {visitor.headline && (
            <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5" title={visitor.headline}>
              {visitor.headline}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/80 mt-1">
            {visitor.company && (
              <span className="flex items-center gap-1 truncate max-w-[180px]">
                <Building2 className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                <span className="truncate">{visitor.company}</span>
              </span>
            )}

            {visitor.location && (
              <span className="flex items-center gap-1 truncate max-w-[150px]">
                <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                <span className="truncate">{visitor.location}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timestamp & Action */}
      <div className="flex flex-col items-end gap-1.5 shrink-0 self-start sm:self-center">
        <Badge
          variant="outline"
          className="text-[11px] font-medium border-border/70 text-foreground/80 flex items-center gap-1 py-0.5 px-2 bg-muted/30"
          title={`Visited on ${timeInfo.exactDateTime}`}
        >
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>{timeInfo.relativeText}</span>
        </Badge>

        <Link
          to={profileUrl}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors opacity-90 group-hover:opacity-100"
        >
          <span>View profile</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};
