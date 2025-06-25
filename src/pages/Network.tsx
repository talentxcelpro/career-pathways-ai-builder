
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Calendar, Bell, TrendingUp, UserPlus } from "lucide-react";
import { Link } from 'react-router-dom';

const Network = () => {
  const quickStats = [
    { label: "Connections", value: "1,247", icon: Users, href: "/network/people" },
    { label: "Messages", value: "23", icon: MessageCircle, href: "/network/messages" },
    { label: "Events", value: "5", icon: Calendar, href: "/network/events" },
    { label: "Notifications", value: "8", icon: Bell, href: "/network/notifications" },
  ];

  const recentActivity = [
    { type: "connection", message: "Sarah Johnson accepted your connection request", time: "2h ago" },
    { type: "post", message: "Your post got 15 new likes", time: "4h ago" },
    { type: "event", message: "React Developers Meetup starts tomorrow", time: "1d ago" },
    { type: "group", message: "New discussion in Frontend Developers group", time: "2d ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Professional Network</h1>
          <p className="text-gray-600 mt-2">Connect, collaborate, and grow your professional network</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => (
            <Link key={stat.label} to={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <stat.icon className="h-8 w-8 text-blue-600" />
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
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump to the most common networking activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/network/people">
                    <Button variant="outline" className="w-full flex flex-col items-center p-4 h-auto">
                      <Users className="h-6 w-6 mb-2" />
                      <span className="text-sm">Find People</span>
                    </Button>
                  </Link>
                  <Link to="/network/posts">
                    <Button variant="outline" className="w-full flex flex-col items-center p-4 h-auto">
                      <MessageCircle className="h-6 w-6 mb-2" />
                      <span className="text-sm">Create Post</span>
                    </Button>
                  </Link>
                  <Link to="/network/groups">
                    <Button variant="outline" className="w-full flex flex-col items-center p-4 h-auto">
                      <Users className="h-6 w-6 mb-2" />
                      <span className="text-sm">Join Groups</span>
                    </Button>
                  </Link>
                  <Link to="/network/events">
                    <Button variant="outline" className="w-full flex flex-col items-center p-4 h-auto">
                      <Calendar className="h-6 w-6 mb-2" />
                      <span className="text-sm">Find Events</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Stay updated with your network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connection Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>3 connection requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Person {i}</p>
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

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>People You May Know</CardTitle>
                <CardDescription>Based on your connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Suggested Person {i}</p>
                        <p className="text-xs text-gray-500">2 mutual connections</p>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                  ))}
                </div>
                <Link to="/network/suggestions">
                  <Button variant="outline" className="w-full mt-4">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View All Suggestions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Network;
