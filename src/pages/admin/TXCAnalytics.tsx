import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart,
  Activity,
  Users,
  Coins,
  Calendar,
  ArrowUp,
  ArrowDown,
  Target
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

const TXCAnalytics = () => {
  const { data: tokenEconomics } = useQuery({
    queryKey: ['txc-token-economics'],
    queryFn: async () => ({
      totalEarned: 12500000,
      totalSpent: 2100000,
      circulationRate: 84.5,
      averageBalance: 1480,
      economicHealth: 92,
      inflationRate: 2.3
    })
  });

  const { data: usageAnalytics } = useQuery({
    queryKey: ['txc-usage-analytics'],
    queryFn: async () => ({
      dailyActiveEarners: 3245,
      weeklyGrowth: 12.5,
      topActivities: [
        { activity: 'Daily Login', percentage: 32, earnings: 485000 },
        { activity: 'Post Creation', percentage: 28, earnings: 420000 },
        { activity: 'Job Applications', percentage: 20, earnings: 300000 },
        { activity: 'Connections', percentage: 12, earnings: 180000 },
        { activity: 'Profile Updates', percentage: 8, earnings: 120000 }
      ]
    })
  });

  const { data: earningsChart } = useQuery({
    queryKey: ['txc-earnings-chart'],
    queryFn: async () => [
      { date: '2024-01-14', earnings: 45000, users: 2100 },
      { date: '2024-01-15', earnings: 52000, users: 2300 },
      { date: '2024-01-16', earnings: 48000, users: 2200 },
      { date: '2024-01-17', earnings: 58000, users: 2500 },
      { date: '2024-01-18', earnings: 61000, users: 2700 },
      { date: '2024-01-19', earnings: 67000, users: 2900 },
      { date: '2024-01-20', earnings: 72000, users: 3200 }
    ]
  });

  const { data: distributionData } = useQuery({
    queryKey: ['txc-distribution-data'],
    queryFn: async () => [
      { name: 'Daily Activities', value: 45, color: '#8884d8' },
      { name: 'Social Engagement', value: 25, color: '#82ca9d' },
      { name: 'Professional Activities', value: 20, color: '#ffc658' },
      { name: 'Bonuses & Rewards', value: 10, color: '#ff7300' }
    ]
  });

  const { data: roi_metrics } = useQuery({
    queryKey: ['txc-roi-metrics'],
    queryFn: async () => [
      { metric: 'User Engagement', value: '+34%', trend: 'up', description: 'Increased platform activity' },
      { metric: 'Retention Rate', value: '+28%', trend: 'up', description: 'Users staying longer' },
      { metric: 'Feature Adoption', value: '+45%', trend: 'up', description: 'More features being used' },
      { metric: 'Time on Platform', value: '+22%', trend: 'up', description: 'Extended session duration' }
    ]
  });

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">TXC Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive token economics analysis and usage insights
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economic Health</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenEconomics?.economicHealth || 0}%</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              +2.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Circulation Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenEconomics?.circulationRate || 0}%</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              Healthy circulation
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Earners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageAnalytics?.dailyActiveEarners?.toLocaleString() || '0'}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              +{usageAnalytics?.weeklyGrowth || 0}% this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inflation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenEconomics?.inflationRate || 0}%</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowDown className="h-3 w-3 mr-1" />
              Controlled inflation
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="economics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="economics">Token Economics</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="trends">Trends & Growth</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="economics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Token Flow Analysis</CardTitle>
                <CardDescription>
                  Total earned vs. spent tokens over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Total Earned</p>
                      <p className="text-2xl font-bold text-green-600">
                        {tokenEconomics?.totalEarned?.toLocaleString() || '0'} TXC
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Total Spent</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {tokenEconomics?.totalSpent?.toLocaleString() || '0'} TXC
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Net Circulation</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {((tokenEconomics?.totalEarned || 0) - (tokenEconomics?.totalSpent || 0)).toLocaleString()} TXC
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Distribution</CardTitle>
                <CardDescription>
                  How TXC tokens are distributed across activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Daily Earnings Trend</CardTitle>
                <CardDescription>
                  TXC tokens earned and active users over the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earningsChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="earnings" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Activities</CardTitle>
                <CardDescription>
                  Most popular earning activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usageAnalytics?.topActivities?.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{activity.activity}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.earnings.toLocaleString()} TXC earned
                        </p>
                      </div>
                      <Badge variant="secondary">{activity.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
              <CardDescription>
                Token earnings by activity type over the last month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={usageAnalytics?.topActivities}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="activity" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="earnings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>TXC System ROI Metrics</CardTitle>
              <CardDescription>
                Impact of the TXC token system on platform engagement and user behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {roi_metrics?.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{metric.metric}</h3>
                      <div className={`flex items-center text-sm ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.trend === 'up' ? (
                          <ArrowUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 mr-1" />
                        )}
                        {metric.value}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TXCAnalytics;