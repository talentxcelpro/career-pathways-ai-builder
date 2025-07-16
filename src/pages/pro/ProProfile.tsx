import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Crown, 
  Star, 
  MapPin, 
  Calendar,
  Award,
  Briefcase,
  Users,
  TrendingUp,
  Settings,
  Edit
} from "lucide-react";

export const ProProfile = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pro Profile</h1>
          <p className="text-muted-foreground">Manage your professional profile and Pro features</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <Crown className="h-3 w-3 mr-1" />
          Pro Member
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-lg">JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">John Doe</h2>
                    <p className="text-muted-foreground">Senior Full Stack Developer</p>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Mumbai, India</span>
                    </div>
                  </div>
                </div>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Experienced full-stack developer with expertise in React, Node.js, and cloud technologies. 
                Passionate about building scalable web applications and mentoring junior developers.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">Node.js</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">AWS</Badge>
                <Badge variant="secondary">Python</Badge>
                <Badge variant="secondary">MongoDB</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pro Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Pro Features & Benefits
              </CardTitle>
              <CardDescription>Your active Pro subscription benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h4 className="font-medium">Priority Support</h4>
                    <p className="text-sm text-muted-foreground">24/7 dedicated support</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">Advanced Analytics</h4>
                    <p className="text-sm text-muted-foreground">Detailed insights & reports</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Enhanced Networking</h4>
                    <p className="text-sm text-muted-foreground">Connect with Pro members</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                  <Award className="h-5 w-5 text-orange-500" />
                  <div>
                    <h4 className="font-medium">AI Tools Access</h4>
                    <p className="text-sm text-muted-foreground">Premium AI features</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest platform interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">Applied to Senior React Developer at TechCorp</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">Connected with Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Award className="h-5 w-5 text-purple-500" />
                  <div className="flex-1">
                    <p className="font-medium">Completed AI Resume Optimization</p>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pro Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Pro Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Profile Views</span>
                <Badge variant="outline">+245%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Job Matches</span>
                <Badge variant="outline">89</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Network Connections</span>
                <Badge variant="outline">156</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Credits Used</span>
                <Badge variant="outline">47/100</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Plan</span>
                <Badge className="bg-purple-500">Pro Annual</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Next Billing</span>
                <span className="text-sm">Jan 15, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Amount</span>
                <span className="text-sm font-medium">₹9,999/year</span>
              </div>
              <Button className="w-full" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </CardContent>
          </Card>

          {/* Member Since */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Member Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">March 2023</p>
              <p className="text-sm text-muted-foreground">Pro member for 10 months</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};