import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  CheckCheck, 
  Trash2, 
  Search, 
  Filter, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Building, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const FILTER_TABS = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'recommended', label: 'Top Recommended', icon: TrendingUp },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'network', label: 'Networking', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'companies', label: 'Companies', icon: Building },
  { id: 'system', label: 'System', icon: Sparkles }
];

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isSubscribed,
    isLoading,
    permission,
    activeFilter,
    setActiveFilter,
    unreadOnly,
    setUnreadOnly,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    subscribeToPush,
    unsubscribeFromPush,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    trackInteraction,
    sendTestNotification,
    playNotificationSound
  } = useNotifications();

  const navigate = useNavigate();

  // Filtered and Scored notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // 1. Module / Category Filter
      if (activeFilter !== 'all') {
        const notifModule = (notif.module || '').toLowerCase();
        const notifCategory = (notif.category || '').toLowerCase();
        const notifType = (notif.event_type || notif.type || '').toLowerCase();

        if (activeFilter === 'recommended') {
          // Items with relevance score >= 0.70
          if ((notif.relevance_score || 0) < 0.70) return false;
        } else if (activeFilter === 'network' && !(notifModule === 'network' || notifType.includes('connection') || notifCategory.includes('social'))) {
          return false;
        } else if (activeFilter === 'jobs' && !(notifModule === 'jobs' || notifModule === 'employer' || notifType.includes('job') || notifCategory.includes('job') || notifCategory.includes('app'))) {
          return false;
        } else if (activeFilter === 'messages' && !(notifCategory === 'messages' || notifType.includes('message'))) {
          return false;
        } else if (activeFilter === 'companies' && !(notifModule === 'companies' || notifType.includes('company'))) {
          return false;
        } else if (activeFilter === 'system' && !(notifCategory === 'system_updates' || notifType.includes('system') || notifType.includes('platform'))) {
          return false;
        }
      }

      // 2. Unread filter
      if (unreadOnly && notif.is_read) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = notif.title?.toLowerCase().includes(query);
        const msgMatch = notif.message?.toLowerCase().includes(query);
        if (!titleMatch && !msgMatch) return false;
      }

      return true;
    });
  }, [notifications, activeFilter, unreadOnly, searchQuery]);

  const handleNotificationClick = (notif: Notification) => {
    trackInteraction(notif.id, 'click');
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
    let destination = notif.link || notif.action_url || notif.data?.url;
    if (destination && (destination.includes('feed?post=') || destination.startsWith('?post='))) {
      const match = destination.match(/[?&]post=([^&]+)/);
      if (match && match[1]) {
        destination = `/posts/${match[1]}`;
      }
    }
    if (destination) {
      navigate(destination);
    }
  };

  const getPriorityBadge = (priority: string = 'medium') => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0">High</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-[10px] text-muted-foreground px-1.5 py-0">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full border-border/60 shadow-lg rounded-2xl overflow-hidden bg-card/60 backdrop-blur-md">
      <CardHeader className="p-4 sm:p-6 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <span>Intelligent Notification Center</span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">
                      {unreadCount} new
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Personalized career recommendations, activity grouping, and real-time alerts.
                </CardDescription>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Sorting Toggle: Relevance vs Recent */}
            <Button
              variant={sortBy === 'relevance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(sortBy === 'relevance' ? 'recent' : 'relevance')}
              className="h-8 rounded-xl text-xs gap-1.5"
              title="Toggle AI relevance ordering"
            >
              {sortBy === 'relevance' ? (
                <>
                  <TrendingUp className="h-3.5 w-3.5 text-amber-300" />
                  <span>Top Match</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  <span>Latest First</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => playNotificationSound('high')}
              className="h-8 rounded-xl text-xs gap-1.5"
              title="Test Sound"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Audio</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={sendTestNotification}
              className="h-8 rounded-xl text-xs gap-1.5"
              title="Generate Test Notification"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden sm:inline">Test Alert</span>
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead()}
                className="h-8 rounded-xl text-xs gap-1.5"
              >
                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Mark all read</span>
              </Button>
            )}
          </div>
        </div>

        {/* Push Notification Permission Bar */}
        <div className="mt-4 pt-3 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Browser Push Delivery:</span>
            {permission === 'granted' ? (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 gap-1 text-[11px]">
                <ShieldCheck className="h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 gap-1 text-[11px]">
                <BellOff className="h-3 w-3" />
                Not Configured
              </Badge>
            )}
          </div>

          {permission !== 'granted' ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={subscribeToPush}
              disabled={isLoading}
              className="h-7 text-xs rounded-lg"
            >
              Enable Browser Push
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={unsubscribeFromPush}
              disabled={isLoading}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Turn off push
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 border-b border-border/50 bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {FILTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(tab.id)}
                className={`h-8 rounded-xl text-xs gap-1.5 px-3 flex-shrink-0 ${
                  isActive ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Unread Toggle & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant={unreadOnly ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`h-8 rounded-xl text-xs gap-1.5 flex-shrink-0 ${unreadOnly ? 'border-primary/50 text-primary font-semibold' : ''}`}
          >
            <Filter className="h-3 w-3" />
            <span>Unread Only</span>
          </Button>

          <div className="relative flex-1 md:w-56">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="h-8 pl-8 text-xs rounded-xl bg-background border-border/70"
            />
          </div>
        </div>
      </div>

      {/* Notification Stream Content */}
      <CardContent className="p-0 divide-y divide-border/40">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto mb-3 text-muted-foreground">
              <Bell className="h-6 w-6 opacity-40" />
            </div>
            <h4 className="font-semibold text-sm text-foreground">No notifications found</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {unreadOnly ? "You're all caught up! There are no unread notifications matching this filter." : "New activity from your network, applications, and messages will arrive here."}
            </p>
            {(activeFilter !== 'all' || unreadOnly || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveFilter('all');
                  setUnreadOnly(false);
                  setSearchQuery('');
                }}
                className="mt-4 text-xs h-8 rounded-xl"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 sm:p-5 transition-all duration-150 flex items-start gap-3.5 hover:bg-muted/40 cursor-pointer ${
                  !notification.is_read ? 'bg-primary/[0.03] border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Visual Icon */}
                <div className="h-10 w-10 rounded-xl bg-muted/60 border border-border/80 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                  {notification.category === 'messages' && <MessageSquare className="h-4 w-4 text-emerald-500" />}
                  {notification.category === 'applications' && <Briefcase className="h-4 w-4 text-indigo-500" />}
                  {notification.category === 'job_opportunities' && <Briefcase className="h-4 w-4 text-indigo-500" />}
                  {notification.category === 'social_interactions' && <Users className="h-4 w-4 text-blue-500" />}
                  {notification.category === 'career_growth' && <Sparkles className="h-4 w-4 text-amber-500" />}
                  {!['messages', 'applications', 'job_opportunities', 'social_interactions', 'career_growth'].includes(notification.category || '') && (
                    <Bell className="h-4 w-4 text-primary" />
                  )}
                </div>

                {/* Notification Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm ${!notification.is_read ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                      {/* Grouped badge if grouped */}
                      {Boolean(notification.group_count && notification.group_count > 1) && (
                        <Badge variant="secondary" className="text-[10px] bg-muted px-1.5 py-0 font-medium">
                          +{notification.group_count} grouped
                        </Badge>
                      )}
                      {/* Relevance badge */}
                      {Boolean(notification.relevance_score && notification.relevance_score >= 0.80) && (
                        <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30 bg-amber-500/10 px-1.5 py-0">
                          {Math.round(notification.relevance_score * 100)}% Match
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getPriorityBadge(notification.priority)}
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-3">
                    {notification.message}
                  </p>

                  {/* Actions Bar */}
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(notification.link || notification.action_url) && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                          <span>View record</span>
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg"
                        title="Dismiss notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
