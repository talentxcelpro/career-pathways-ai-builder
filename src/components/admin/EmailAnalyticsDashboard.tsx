
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Mail, Send, Eye, MousePointer } from 'lucide-react';

const emailStats = [
  { name: 'Mon', sent: 120, opened: 85, clicked: 23 },
  { name: 'Tue', sent: 150, opened: 110, clicked: 35 },
  { name: 'Wed', sent: 200, opened: 140, clicked: 42 },
  { name: 'Thu', sent: 180, opened: 125, clicked: 38 },
  { name: 'Fri', sent: 220, opened: 165, clicked: 55 },
  { name: 'Sat', sent: 80, opened: 45, clicked: 12 },
  { name: 'Sun', sent: 90, opened: 55, clicked: 15 },
];

export const EmailAnalyticsDashboard: React.FC = () => {
  const totalSent = emailStats.reduce((sum, day) => sum + day.sent, 0);
  const totalOpened = emailStats.reduce((sum, day) => sum + day.opened, 0);
  const totalClicked = emailStats.reduce((sum, day) => sum + day.clicked, 0);
  
  const openRate = ((totalOpened / totalSent) * 100).toFixed(1);
  const clickRate = ((totalClicked / totalSent) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">{totalSent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">{openRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MousePointer className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">{clickRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-gray-900">98.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emailStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                <Bar dataKey="opened" fill="#10b981" name="Opened" />
                <Bar dataKey="clicked" fill="#8b5cf6" name="Clicked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emailStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="opened" stroke="#10b981" strokeWidth={2} name="Opens" />
                <Line type="monotone" dataKey="clicked" stroke="#8b5cf6" strokeWidth={2} name="Clicks" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
