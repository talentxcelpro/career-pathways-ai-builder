
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Calendar, TrendingUp, Sparkles, Bell } from "lucide-react";
import { Link } from 'react-router-dom';

const Network = () => {
  const stats = [
    { label: "Connections", value: "248", icon: Users },
    { label: "Messages", value: "12", icon: MessageCircle },
    { label: "Events", value: "5", icon: Calendar },
    { label: "Profile Views", value: "89", icon: TrendingUp },
  ];

  const quickActions = [
    {
      title: "Find People",
      description: "Discover and connect with professionals",
      icon: Users,
      href: "/network/people",
      color: "bg-blue-500"
    },
    {
      title: "Browse Posts",
      description: "See what your network is sharing",
      icon: MessageCircle,
      href: "/network/posts",
      color: "bg-green-500"
    },
    {
      title: "Upcoming Events",
      description: "Join webinars and networking events",
      icon: Calendar,
      href: "/network/events",
      color: "bg-purple-500"
    },
    {
      title: "AI Suggestions",
      description: "Get personalized networking recommendations",
      icon: Sparkles,
      href: "/network/suggestions",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Network</h1>
          <p className="text-gray-600 mt-2">Connect, share, and grow your professional network</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link key={index} to={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Connections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Recent Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Professional User {index + 1}</p>
                      <p className="text-sm text-gray-500">Software Engineer at TechCorp</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link to="/network/people">
                  <Button variant="ghost" className="w-full">
                    View All Connections
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "liked your post", user: "Sarah Johnson", time: "2 hours ago" },
                  { action: "commented on your article", user: "Mike Chen", time: "4 hours ago" },
                  { action: "connected with you", user: "Emily Davis", time: "1 day ago" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link to="/network/notifications">
                  <Button variant="ghost" className="w-full">
                    View All Notifications
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Network;
