
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import { ActionCard } from "@/components/ui/action-card";
import { Users, MessageCircle, Calendar, TrendingUp, Sparkles, Bell, Activity, Network as NetworkIcon, Zap, Target } from "lucide-react";
import { Link } from 'react-router-dom';

const Network = () => {
  const stats = [
    { 
      title: "Connections", 
      value: "248", 
      subtitle: "Active network",
      icon: Users, 
      trend: { value: "+12 this week", isPositive: true },
      gradient: "from-blue-500 to-blue-600"
    },
    { 
      title: "Messages", 
      value: "12", 
      subtitle: "Unread",
      icon: MessageCircle, 
      trend: { value: "+3 today", isPositive: true },
      gradient: "from-green-500 to-emerald-600"
    },
    { 
      title: "Events", 
      value: "5", 
      subtitle: "This month",
      icon: Calendar, 
      trend: { value: "2 upcoming", isPositive: true },
      gradient: "from-purple-500 to-indigo-600"
    },
    { 
      title: "Profile Views", 
      value: "89", 
      subtitle: "This week",
      icon: TrendingUp, 
      trend: { value: "+24%", isPositive: true },
      gradient: "from-orange-500 to-red-500"
    },
  ];

  const quickActions = [
    {
      title: "Find People",
      description: "Discover and connect with professionals",
      icon: Users,
      path: "/network/people",
      gradient: "from-blue-500 to-purple-500",
      featured: true,
      badge: "Popular"
    },
    {
      title: "Browse Posts",
      description: "See what your network is sharing",
      icon: MessageCircle,
      path: "/network/posts",
      gradient: "from-green-500 to-teal-500"
    },
    {
      title: "Upcoming Events",
      description: "Join webinars and networking events",
      icon: Calendar,
      path: "/network/events",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "AI Suggestions",
      description: "Get personalized networking recommendations",
      icon: Sparkles,
      path: "/network/suggestions",
      gradient: "from-orange-500 to-yellow-500"
    }
  ];

  const recentConnections = [
    { name: "Sarah Chen", role: "Product Manager at TechCorp", avatar: "SC", time: "2h ago", mutual: 5 },
    { name: "Alex Rodriguez", role: "Software Engineer at DevCo", avatar: "AR", time: "1d ago", mutual: 3 },
    { name: "Emily Davis", role: "Designer at Creative Studio", avatar: "ED", time: "2d ago", mutual: 8 }
  ];

  const recentActivity = [
    { action: "liked your post about AI trends", user: "Sarah Johnson", time: "2 hours ago", type: "like" },
    { action: "commented on your article", user: "Mike Chen", time: "4 hours ago", type: "comment" },
    { action: "connected with you", user: "Emily Davis", time: "1 day ago", type: "connection" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 mb-8 shadow-xl">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <NetworkIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Professional Network Hub</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-6">
              Connect, collaborate, and grow with industry professionals worldwide
            </p>
            <div className="flex justify-center gap-3">
              <Button size="lg" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Zap className="h-4 w-4 mr-2" />
                Find Connections
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                <Activity className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600">Expand your professional network</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 text-xs">4 Features</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <ActionCard
                key={index}
                {...action}
                onClick={() => window.location.href = action.path}
              />
            ))}
          </div>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Connections */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Recent Connections
              </CardTitle>
              <CardDescription className="text-xs">Your latest professional connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentConnections.map((connection, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50/80 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {connection.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{connection.name}</p>
                      <p className="text-xs text-gray-500 truncate">{connection.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{connection.mutual} mutual</Badge>
                        <span className="text-xs text-gray-400">{connection.time}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      Message
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Link to="/network/people">
                  <Button variant="ghost" className="w-full text-xs h-8">
                    View All Connections
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Bell className="h-5 w-5 mr-2 text-orange-600" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs">Latest interactions in your network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50/80 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'like' ? 'bg-red-100' : 
                      activity.type === 'comment' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {activity.type === 'like' && <Target className="h-4 w-4 text-red-600" />}
                      {activity.type === 'comment' && <MessageCircle className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'connection' && <Users className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Link to="/network/notifications">
                  <Button variant="ghost" className="w-full text-xs h-8">
                    View All Notifications
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced CTA */}
        <Card className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white border-0 shadow-xl">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative z-10 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3">Supercharge Your Network</h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Discover AI-powered networking suggestions and connect with like-minded professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/network/suggestions">
                <Button size="lg" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Suggestions
                </Button>
              </Link>
              <Link to="/network/people">
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                  <Users className="h-4 w-4 mr-2" />
                  Explore People
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Network;
