
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Calendar, Bell, TrendingUp, UserPlus, Sparkles, MessageSquare, Search } from "lucide-react";
import { Link } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Network = () => {
  // Fetch real stats
  const { data: stats } = useQuery({
    queryKey: ['network-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get connections count
      const { data: connections } = await supabase
        .from('connections')
        .select('id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      // Get unread messages count
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      // Get upcoming events count
      const { data: events } = await supabase
        .from('events')
        .select('id')
        .gte('start_time', new Date().toISOString());

      // Get unread notifications count
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_read', false);

      return {
        connections: connections?.length || 0,
        messages: messages?.length || 0,
        events: events?.length || 0,
        notifications: notifications?.length || 0
      };
    }
  });

  const quickStats = [
    { 
      label: "Connections", 
      value: stats?.connections || "0", 
      icon: Users, 
      href: "/network/people",
      color: "text-blue-600" 
    },
    { 
      label: "Messages", 
      value: stats?.messages || "0", 
      icon: MessageCircle, 
      href: "/network/messages",
      color: "text-green-600" 
    },
    { 
      label: "Events", 
      value: stats?.events || "0", 
      icon: Calendar, 
      href: "/network/events",
      color: "text-purple-600" 
    },
    { 
      label: "Notifications", 
      value: stats?.notifications || "0", 
      icon: Bell, 
      href: "/network/notifications",
      color: "text-red-600" 
    },
  ];

  const recentActivity = [
    { type: "connection", message: "New connection requests pending", time: "2h ago", action: "View", href: "/network/requests" },
    { type: "post", message: "Your latest post is trending", time: "4h ago", action: "View", href: "/network/posts" },
    { type: "event", message: "React Conference 2024 starts soon", time: "1d ago", action: "RSVP", href: "/network/events" },
    { type: "group", message: "New discussion in your groups", time: "2d ago", action: "Join", href: "/network/groups" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Professional Network</h1>
          <p className="text-xl text-gray-600">Connect, collaborate, and grow your professional network</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => (
            <Link key={stat.label} to={stat.href}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100`}>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Jump to the most common networking activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/network/people">
                    <Button variant="outline" className="w-full flex flex-col items-center p-6 h-auto hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      <Search className="h-8 w-8 mb-3 text-blue-600" />
                      <span className="text-sm font-medium">Find People</span>
                    </Button>
                  </Link>
                  <Link to="/network/posts">
                    <Button variant="outline" className="w-full flex flex-col items-center p-6 h-auto hover:bg-green-50 hover:border-green-200 transition-colors">
                      <MessageSquare className="h-8 w-8 mb-3 text-green-600" />
                      <span className="text-sm font-medium">Share Post</span>
                    </Button>
                  </Link>
                  <Link to="/network/groups">
                    <Button variant="outline" className="w-full flex flex-col items-center p-6 h-auto hover:bg-purple-50 hover:border-purple-200 transition-colors">
                      <Users className="h-8 w-8 mb-3 text-purple-600" />
                      <span className="text-sm font-medium">Join Groups</span>
                    </Button>
                  </Link>
                  <Link to="/network/events">
                    <Button variant="outline" className="w-full flex flex-col items-center p-6 h-auto hover:bg-orange-50 hover:border-orange-200 transition-colors">
                      <Calendar className="h-8 w-8 mb-3 text-orange-600" />
                      <span className="text-sm font-medium">Find Events</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions Preview */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Sparkles className="h-6 w-6 mr-2 text-blue-600" />
                  AI-Powered Suggestions
                </CardTitle>
                <CardDescription>Personalized recommendations to grow your network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <UserPlus className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">3 new people to connect with</span>
                    </div>
                    <Link to="/network/suggestions">
                      <Button size="sm" variant="outline">View All</Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">2 groups match your interests</span>
                    </div>
                    <Link to="/network/suggestions">
                      <Button size="sm" variant="outline">Explore</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>Stay updated with your network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                      <Link to={activity.href}>
                        <Button size="sm" variant="outline">
                          {activity.action}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connection Requests */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Pending Requests</CardTitle>
                <CardDescription>Connection requests awaiting response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">P{i}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Professional User {i}</p>
                        <p className="text-xs text-gray-500">Software Engineer</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/network/requests">
                  <Button variant="outline" className="w-full mt-4">
                    <UserPlus className="h-4 w-4 mr-2" />
                    View All Requests
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Network Growth */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Network Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">+12%</p>
                    <p className="text-sm text-gray-600">This month</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Profile views</span>
                      <span className="font-medium">+8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>New connections</span>
                      <span className="font-medium">+5</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Post engagement</span>
                      <span className="font-medium">+15</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Trending in Tech</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['AI & Machine Learning', 'Remote Work', 'Web3 Technologies', 'Career Growth'].map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm">{topic}</span>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Network;
