import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BellOff, Trash2, Settings, Hash, User, Building, BookOpen } from "lucide-react";
import { useContentSubscriptions } from "@/hooks/useContentSubscriptions";
import { formatDistanceToNow } from "date-fns";

export function SubscriptionsManager() {
  const { 
    subscriptions, 
    isLoading, 
    unsubscribe 
  } = useContentSubscriptions();

  const groupedSubscriptions = subscriptions.reduce((groups, sub) => {
    if (!groups[sub.subscription_type]) {
      groups[sub.subscription_type] = [];
    }
    groups[sub.subscription_type].push(sub);
    return groups;
  }, {} as Record<string, any[]>);

  const getIcon = (type: string) => {
    switch (type) {
      case 'hashtag': return <Hash className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      case 'company': return <Building className="h-4 w-4" />;
      case 'topic': return <BookOpen className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hashtag': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      case 'company': return 'bg-purple-100 text-purple-800';
      case 'topic': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Content Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Content Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BellOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
            <p className="text-muted-foreground">
              Start following topics, hashtags, users, or companies to get personalized content updates.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Content Subscriptions
          <Badge variant="secondary" className="ml-auto">
            {subscriptions.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({subscriptions.length})</TabsTrigger>
            <TabsTrigger value="topic">Topics ({groupedSubscriptions.topic?.length || 0})</TabsTrigger>
            <TabsTrigger value="hashtag">Hashtags ({groupedSubscriptions.hashtag?.length || 0})</TabsTrigger>
            <TabsTrigger value="user">Users ({groupedSubscriptions.user?.length || 0})</TabsTrigger>
            <TabsTrigger value="company">Companies ({groupedSubscriptions.company?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getTypeColor(subscription.subscription_type)}`}>
                    {getIcon(subscription.subscription_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{subscription.subscription_value}</h4>
                      <Badge variant="outline" className="text-xs">
                        {subscription.subscription_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Subscribed {formatDistanceToNow(new Date(subscription.created_at))} ago
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => unsubscribe(subscription.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </TabsContent>

          {Object.entries(groupedSubscriptions).map(([type, subs]: [string, any[]]) => (
            <TabsContent key={type} value={type} className="space-y-4 mt-6">
              {subs.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getTypeColor(type)}`}>
                      {getIcon(type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{subscription.subscription_value}</h4>
                      <p className="text-sm text-muted-foreground">
                        Subscribed {formatDistanceToNow(new Date(subscription.created_at))} ago
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => unsubscribe(subscription.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}