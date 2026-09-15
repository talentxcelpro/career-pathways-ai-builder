import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Gift, Share2, Target, TrendingUp } from "lucide-react";

export const UserAcquisitionHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState("referrals");

  const referralStats = {
    totalReferrals: 248,
    successfulReferrals: 164,
    pendingReferrals: 84,
    totalRewards: 2480,
    conversionRate: 66.1
  };

  const leaderboard = [
    { rank: 1, name: "Priya Sharma", referrals: 45, rewards: 450 },
    { rank: 2, name: "Rajesh Kumar", referrals: 38, rewards: 380 },
    { rank: 3, name: "Anita Singh", referrals: 32, rewards: 320 },
    { rank: 4, name: "Vikram Patel", referrals: 28, rewards: 280 },
    { rank: 5, name: "Sneha Gupta", referrals: 25, rewards: 250 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{referralStats.conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rewards</p>
                <p className="text-2xl font-bold">₹{referralStats.totalRewards}</p>
              </div>
              <Gift className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((referralStats.successfulReferrals / referralStats.totalReferrals) * 100)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="referrals">Referral System</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Your Referral Link
                </CardTitle>
                <CardDescription>
                  Share this link to start earning rewards for successful referrals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-muted rounded border font-mono text-sm">
                    https://talentxcel.in/ref/ABC123
                  </div>
                  <Button size="sm">Copy</Button>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share on LinkedIn
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share on WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Referral Progress</CardTitle>
                <CardDescription>
                  Your progress towards the next reward tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Level: Silver</span>
                    <span>12/20 referrals</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    8 more successful referrals to reach Gold level
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-muted rounded">
                    <Badge variant="secondary" className="mb-1">Bronze</Badge>
                    <p className="text-xs">₹5/referral</p>
                  </div>
                  <div className="p-2 bg-primary/10 border-2 border-primary rounded">
                    <Badge className="mb-1">Silver</Badge>
                    <p className="text-xs">₹10/referral</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <Badge variant="outline" className="mb-1">Gold</Badge>
                    <p className="text-xs">₹15/referral</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Referrers This Month
              </CardTitle>
              <CardDescription>
                Leading contributors to our community growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div key={user.rank} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {user.rank}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.referrals} referrals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{user.rewards}</p>
                      <p className="text-sm text-muted-foreground">earned</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>
                  Current referral campaigns and challenges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">New Year Boost</h4>
                    <Badge>Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Double rewards for all referrals until January 31st
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Progress: 45/100 referrals</span>
                    <span>Ends in 12 days</span>
                  </div>
                  <Progress value={45} className="h-2 mt-2" />
                </div>

                <div className="p-4 border rounded-lg opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Spring Challenge</h4>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Special rewards for tech referrals starting March 1st
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rewards Center</CardTitle>
                <CardDescription>
                  Redeem your earned points for exclusive rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-lg font-bold">Available Points: 1,250</p>
                  <p className="text-sm text-muted-foreground">₹12.50 cash equivalent</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">₹500 Amazon Voucher</span>
                    <Button size="sm" variant="outline">5000 pts</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">₹100 Paytm Cash</span>
                    <Button size="sm" variant="outline">1000 pts</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Premium Badge</span>
                    <Button size="sm">250 pts</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};