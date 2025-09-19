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

const TXCAwardsAndBonuses = () => {
  const { data: bonusSettings } = useQuery({
    queryKey: ['txc-bonus-settings'],
    queryFn: async () => [
      { id: '1', activity: 'Daily Login', amount: 75, enabled: true, cooldown: '24h' },
      { id: '2', activity: 'Create Post', amount: 150, enabled: true, cooldown: '1h' },
      { id: '3', activity: 'Connect with Someone', amount: 75, enabled: true, cooldown: '1h' },
      { id: '4', activity: 'Complete Profile', amount: 300, enabled: true, cooldown: '24h' },
      { id: '5', activity: 'Create Resume', amount: 225, enabled: true, cooldown: '4h' },
      { id: '6', activity: 'Apply to Job', amount: 90, enabled: true, cooldown: '1h' },
      { id: '7', activity: 'Give Recommendation', amount: 120, enabled: true, cooldown: '2h' },
      { id: '8', activity: 'Add Skills', amount: 60, enabled: true, cooldown: '3h' },
      { id: '9', activity: 'Complete Course', amount: 600, enabled: true, cooldown: '1h' },
      { id: '10', activity: 'Provide Feedback', amount: 45, enabled: true, cooldown: '1h' },
      { id: '11', activity: 'Social Activity Bonus', amount: 300, enabled: true, cooldown: '7d' },
      { id: '12', activity: 'Refer Friend', amount: 1000, enabled: true, cooldown: 'none' },
      { id: '13', activity: 'Like Post', amount: 20, enabled: true, cooldown: 'none' },
      { id: '14', activity: 'Comment on Post', amount: 20, enabled: true, cooldown: 'none' },
      { id: '15', activity: 'Post Article', amount: 500, enabled: true, cooldown: '4h' }
    ]
  });

  const { data: specialBonuses } = useQuery({
    queryKey: ['txc-special-bonuses'],
    queryFn: async () => [
      { id: '1', name: 'Welcome Bonus', amount: 500, description: 'One-time bonus for new users', type: 'welcome' },
      { id: '2', name: 'Weekly Streak', amount: 250, description: 'Login 7 days in a row', type: 'streak' },
      { id: '3', name: 'Profile Champion', amount: 400, description: '100% profile completion', type: 'achievement' },
      { id: '4', name: 'Networking Master', amount: 350, description: 'Connect with 50 professionals', type: 'achievement' },
      { id: '5', name: 'Job Hunter', amount: 300, description: 'Apply to 25 jobs', type: 'achievement' }
    ]
  });

  const { data: recentAwards } = useQuery({
    queryKey: ['txc-recent-awards'],
    queryFn: async () => [
      { id: '1', user: 'Rajesh Kumar', activity: 'Daily Login Streak (7 days)', amount: 250, timestamp: '2024-01-20T10:30:00Z', type: 'streak' },
      { id: '2', user: 'Priya Sharma', activity: 'Welcome Bonus', amount: 500, timestamp: '2024-01-20T09:15:00Z', type: 'welcome' },
      { id: '3', user: 'Amit Singh', activity: 'Profile Champion', amount: 400, timestamp: '2024-01-20T08:45:00Z', type: 'achievement' },
      { id: '4', user: 'Neha Gupta', activity: 'Networking Master', amount: 350, timestamp: '2024-01-20T08:20:00Z', type: 'achievement' },
      { id: '5', user: 'Vikram Patel', activity: 'Job Hunter', amount: 300, timestamp: '2024-01-19T17:30:00Z', type: 'achievement' }
    ]
  });

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