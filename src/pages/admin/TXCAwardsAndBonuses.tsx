import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Gift, 
  Award, 
  Users, 
  Settings,
  Calendar,
  Star,
  Heart,
  MessageSquare,
  UserPlus,
  Briefcase,
  Edit,
  Save
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TXCAwardsAndBonuses = () => {
  const { data: bonusData, isLoading } = useQuery({
    queryKey: ['txc-bonus-config'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('txc-bonus-config');
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const bonusSettings = bonusData?.bonusSettings || [];
  const specialBonuses = bonusData?.specialBonuses || [];
  const recentAwards = bonusData?.recentAwards || [];

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'welcome': return 'default';
      case 'streak': return 'secondary';
      case 'achievement': return 'outline';
      default: return 'default';
    }
  };

  const getActivityIcon = (activity: string) => {
    if (activity.includes('Login')) return Calendar;
    if (activity.includes('Post')) return MessageSquare;
    if (activity.includes('Connect')) return UserPlus;
    if (activity.includes('Job')) return Briefcase;
    if (activity.includes('Recommend')) return Heart;
    return Star;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Settings className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">TXC Awards & Bonuses</h1>
        <p className="text-muted-foreground">
          Configure reward amounts, manage bonus systems, and track award distribution
        </p>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Bonus Settings</TabsTrigger>
          <TabsTrigger value="special">Special Bonuses</TabsTrigger>
          <TabsTrigger value="recent">Recent Awards</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Bonus Configuration</CardTitle>
              <CardDescription>
                Manage TXC reward amounts and cooldown periods for user activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bonusSettings?.map((setting) => {
                  const IconComponent = getActivityIcon(setting.activity);
                  return (
                    <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{setting.activity}</p>
                          <p className="text-sm text-muted-foreground">
                            Cooldown: {setting.cooldown}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            value={setting.amount} 
                            className="w-20"
                          />
                          <span className="text-sm font-medium">TXC</span>
                        </div>
                        <Switch checked={setting.enabled} />
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-end pt-4">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Special Bonus Programs</CardTitle>
              <CardDescription>
                Manage milestone rewards, welcome bonuses, and achievement awards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {specialBonuses?.map((bonus) => (
                  <div key={bonus.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{bonus.name}</h3>
                      <Badge variant={getBadgeVariant(bonus.type)}>
                        {bonus.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{bonus.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {bonus.amount} TXC
                      </span>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline">
                  Add New Bonus
                </Button>
                <Button>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Award History</CardTitle>
              <CardDescription>
                Track recently distributed bonuses and special awards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAwards?.map((award) => (
                  <div key={award.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                        <Award className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{award.user}</p>
                        <p className="text-sm text-muted-foreground">{award.activity}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(award.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{award.amount} TXC</p>
                      <Badge variant={getBadgeVariant(award.type)} className="mt-1">
                        {award.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Award Bonuses</CardTitle>
                <CardDescription>
                  Award TXC tokens to multiple users at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-criteria">User Criteria</Label>
                  <select id="user-criteria" className="w-full p-2 border rounded">
                    <option>All Active Users</option>
                    <option>Premium Users</option>
                    <option>New Users (Last 7 days)</option>
                    <option>Top Performers</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonus-amount">Bonus Amount</Label>
                  <Input id="bonus-amount" type="number" placeholder="Enter TXC amount" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonus-reason">Reason</Label>
                  <Input id="bonus-reason" placeholder="Special promotion, milestone, etc." />
                </div>
                <Button className="w-full">
                  <Gift className="h-4 w-4 mr-2" />
                  Award Bulk Bonus
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automated Bonus Rules</CardTitle>
                <CardDescription>
                  Set up recurring and conditional bonus awards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Monthly Login Bonus</p>
                      <p className="text-sm text-muted-foreground">500 TXC for 30-day streak</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Weekend Double Rewards</p>
                      <p className="text-sm text-muted-foreground">2x TXC on weekends</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Holiday Bonus</p>
                      <p className="text-sm text-muted-foreground">Special event rewards</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Rules
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TXCAwardsAndBonuses;