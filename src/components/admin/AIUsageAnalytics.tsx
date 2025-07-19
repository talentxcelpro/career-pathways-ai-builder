
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock,
  Download
} from 'lucide-react';

const usageData = [
  { name: 'Mon', requests: 120, cost: 2.4, users: 45 },
  { name: 'Tue', requests: 190, cost: 3.8, users: 62 },
  { name: 'Wed', requests: 150, cost: 3.0, users: 58 },
  { name: 'Thu', requests: 210, cost: 4.2, users: 71 },
  { name: 'Fri', requests: 180, cost: 3.6, users: 65 },
  { name: 'Sat', requests: 95, cost: 1.9, users: 34 },
  { name: 'Sun', requests: 75, cost: 1.5, users: 28 }
];

const toolUsageData = [
  { name: 'Resume Enhancement', value: 45, color: '#8884d8' },
  { name: 'ATS Optimizer', value: 25, color: '#82ca9d' },
  { name: 'Career Advisor', value: 20, color: '#ffc658' },
  { name: 'Salary Analyzer', value: 10, color: '#ff7c7c' }
];

const responseTimeData = [
  { name: '00:00', time: 1200 },
  { name: '04:00', time: 1100 },
  { name: '08:00', time: 1800 },
  { name: '12:00', time: 2100 },
  { name: '16:00', time: 1900 },
  { name: '20:00', time: 1400 }
];

export const AIUsageAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const summaryCards = [
    {
      title: 'Total Requests',
      value: '12,543',
      change: '+12.3%',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Total Cost',
      value: '$248.60',
      change: '+8.7%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+15.2%',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Avg Response Time',
      value: '1.8s',
      change: '-12.4%',
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Usage Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics for AI service usage and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">{card.change}</span>
                  </div>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tool Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tool Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={toolUsageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {toolUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cost" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="time" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Users and Popular Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top AI Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'john.doe@example.com', requests: 234, cost: '$4.68' },
                { name: 'jane.smith@example.com', requests: 198, cost: '$3.96' },
                { name: 'bob.wilson@example.com', requests: 156, cost: '$3.12' },
                { name: 'alice.brown@example.com', requests: 134, cost: '$2.68' },
                { name: 'charlie.davis@example.com', requests: 112, cost: '$2.24' }
              ].map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.requests} requests</p>
                  </div>
                  <Badge variant="outline">{user.cost}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { feature: 'Resume Enhancement', usage: '45%', trend: '+5%' },
                { feature: 'ATS Optimization', usage: '25%', trend: '+12%' },
                { feature: 'Career Analysis', usage: '20%', trend: '-3%' },
                { feature: 'Salary Research', usage: '10%', trend: '+8%' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.feature}</p>
                    <p className="text-xs text-muted-foreground">Usage: {item.usage}</p>
                  </div>
                  <Badge variant={item.trend.startsWith('+') ? 'default' : 'secondary'}>
                    {item.trend}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
