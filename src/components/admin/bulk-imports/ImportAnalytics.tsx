import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Mail, UserCheck, AlertTriangle } from 'lucide-react';

export function ImportAnalytics() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-500" />
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1">24,847</div>
            <div className="text-sm text-muted-foreground">Total Imported</div>
            <div className="text-xs text-green-600 mt-2">+2,341 this week</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Mail className="h-8 w-8 text-purple-500" />
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1">18,234</div>
            <div className="text-sm text-muted-foreground">Invitations Sent</div>
            <div className="text-xs text-green-600 mt-2">73.4% send rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="h-8 w-8 text-green-500" />
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1">12,456</div>
            <div className="text-sm text-muted-foreground">Activated Users</div>
            <div className="text-xs text-green-600 mt-2">68.3% activation</div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { stage: 'Imported', count: 24847, percent: 100 },
              { stage: 'Valid Emails', count: 23142, percent: 93.1 },
              { stage: 'Invitations Sent', count: 18234, percent: 73.4 },
              { stage: 'Emails Opened', count: 14587, percent: 58.7 },
              { stage: 'Clicked Link', count: 13456, percent: 54.1 },
              { stage: 'Activated', count: 12456, percent: 50.1 }
            ].map((step, index) => (
              <div key={step.stage}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{step.stage}</span>
                  <span className="text-sm text-muted-foreground">
                    {step.count.toLocaleString()} ({step.percent}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${step.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Import Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { source: 'LinkedIn Import', count: 12847, percent: 51.7 },
                { source: 'CSV Upload', count: 8234, percent: 33.1 },
                { source: 'API Integration', count: 2456, percent: 9.9 },
                { source: 'Manual Entry', count: 1310, percent: 5.3 }
              ].map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <span className="text-sm">{source.source}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{source.count.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {source.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Deliverability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: 'Delivered', count: 17234, color: 'text-green-600' },
                { status: 'Bounced (Hard)', count: 543, color: 'text-red-600' },
                { status: 'Bounced (Soft)', count: 234, color: 'text-yellow-600' },
                { status: 'Spam Reports', count: 23, color: 'text-orange-600' }
              ].map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm">{item.status}</span>
                  <span className={`text-sm font-medium ${item.color}`}>
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Common Import Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { error: 'Invalid Email Format', count: 1245, resolution: 'Manual review needed' },
              { error: 'Duplicate Entry', count: 823, resolution: 'Automatically skipped' },
              { error: 'Missing Required Field', count: 456, resolution: 'Enrichment pending' },
              { error: 'Invalid LinkedIn URL', count: 234, resolution: 'Manual correction' }
            ].map((error) => (
              <div
                key={error.error}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{error.error}</p>
                  <p className="text-xs text-muted-foreground">{error.resolution}</p>
                </div>
                <div className="text-sm font-medium text-red-600">
                  {error.count} occurrences
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
