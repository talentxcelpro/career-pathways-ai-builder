import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  Search,
  Volume2,
  VolumeX,
  CheckCircle,
  LayoutGrid,
  LayoutList,
  Sparkles
} from "lucide-react";
import { TalentXcelLogo } from "@/components/branding/TalentXcelLogo";
import { NotificationPillars, NOTIFICATION_PILLARS } from "@/components/notifications/NotificationsPillars";
import { SmartNotificationCard } from "@/components/notifications/SmartNotificationCard";
import { useNotifications } from "@/hooks/useNotifications"; // Using the old, stable hook
import { useNotificationStore } from "@/stores/useNotificationStore";

const Notifications = () => {
  console.log('Notifications component rendering - FIXED VERSION');
  
  const [activePillar, setActivePillar] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  
  // Use simple state for sound instead of store to avoid store issues
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Create stable filters object
  const filters = useMemo(() => {
    const result: any = {};
    
    if (activePillar !== 'all') {
      const pillarToModule: Record<string, string> = {
        network: 'network',
        jobs: 'jobs', 
        companies: 'companies',
        resume: 'resume',
        tools: 'tools',
        learning: 'learning',
        colleges: 'colleges',
        career_feed: 'network',
        discover: 'tools'
      };
      
      if (pillarToModule[activePillar]) {
        result.module = pillarToModule[activePillar];
      }
    }
    
    if (searchQuery.trim()) {
      result.search = searchQuery.trim();
    }
    
    return result;
  }, [activePillar, searchQuery]);

  // Use the old stable hook instead of the problematic one
  const {
    notifications,
    isLoading,
    error,
    stats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleSound,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeletingNotification
  } = useNotifications(filters);

  // Enhanced stats for pillars
  const pillarStats = useMemo(() => {
    const moduleStats = stats.byModule || {};
    return {
      all: stats.total || 0,
      network: moduleStats.network || 0,
      jobs: moduleStats.jobs || 0,
      companies: moduleStats.companies || 0,
      resume: moduleStats.resume || 0,
      tools: moduleStats.tools || 0,
      learning: moduleStats.learning || 0,
      colleges: moduleStats.colleges || 0,
      career_feed: moduleStats.network || 0,
      discover: moduleStats.tools || 0,
      employer: moduleStats.employer || 0
    };
  }, [stats]);

  // AI Summary for the week
  const aiSummary = useMemo(() => {
    const unreadCount = stats.unread || 0;
    const weekCount = stats.thisWeek || 0;
    
    if (unreadCount === 0) {
      return "🎉 You're all caught up! No new notifications.";
    } else if (unreadCount < 5) {
      return `📬 ${unreadCount} new updates waiting for you. Mostly career opportunities!`;
    } else if (weekCount > 20) {
      return `🔥 Busy week! ${weekCount} career updates. ${unreadCount} need your attention.`;
    } else {
      return `📈 ${unreadCount} new notifications. Your career is gaining momentum!`;
    }
  }, [stats]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="animate-bounce mb-4">
                <Bell className="h-12 w-12 text-destructive mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Error loading notifications</h3>
              <p className="text-muted-foreground">Please try refreshing the page.</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src="/lovable-uploads/d161b369-b5ef-40c6-8e1a-3c3912fad0cf.png" 
                  alt="TalentXcel Logo" 
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    TalentXcel Co-Pilot
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Your intelligent career co-pilot
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    toggleSound(!soundEnabled);
                  }}
                  className="gap-2"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {soundEnabled ? 'Sound On' : 'Sound Off'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                  className="gap-2"
                >
                  {viewMode === 'card' ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                  {viewMode === 'card' ? 'List View' : 'Card View'}
                </Button>
                
                <Button 
                  onClick={() => markAllAsRead(undefined)}
                  disabled={isMarkingAllAsRead || stats.unread === 0}
                  size="sm"
                  className="gap-2"
                >
                  {isMarkingAllAsRead ? (
                    <>
                      <CheckCircle className="h-4 w-4 animate-spin" />
                      Marking as read...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Mark all as read
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* AI Summary */}
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-primary">
                    🧠 AI Summary: {aiSummary}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars Navigation */}
        <NotificationPillars
          activePillar={activePillar}
          onPillarChange={setActivePillar}
          stats={pillarStats}
        />

        {/* Search and Filters */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b bg-background/50">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur-sm"
              />
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">
                  {stats.unread} Unread
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <Card className="shadow-lg border-2 border-dashed border-muted">
              <CardContent className="p-12 text-center">
                <div className="animate-bounce mb-4">
                  <Bell className="h-16 w-16 text-muted-foreground mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {searchQuery ? 'No matching notifications' : 'All caught up!'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? `No notifications found for "${searchQuery}"`
                    : "You're doing great! No new notifications to show."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={`
              space-y-4
              ${viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-3'}
            `}>
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={viewMode === 'list' ? 'transform hover:scale-[1.01] transition-transform' : ''}
                >
                  <SmartNotificationCard
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    showActions={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;