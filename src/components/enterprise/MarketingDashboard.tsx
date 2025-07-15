import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Share2,
  Target,
  BarChart3,
  Megaphone,
  Calendar,
  DollarSign
} from 'lucide-react';

interface CampaignMetrics {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpa: number;
}

const mockCampaigns: CampaignMetrics[] = [
  {
    id: '1',
    name: 'Q4 Talent Acquisition',
    status: 'active',
    impressions: 125000,
    clicks: 3200,
    conversions: 145,
    spend: 8500,
    ctr: 2.56,
    cpa: 58.62
  },
  {
    id: '2',
    name: 'HR Tech Summit Promotion',
    status: 'active',
    impressions: 89000,
    clicks: 2100,
    conversions: 89,
    spend: 4200,
    ctr: 2.36,
    cpa: 47.19
  },
  {
    id: '3',
    name: 'Employee Benefits Campaign',
    status: 'completed',
    impressions: 156000,
    clicks: 4800,
    conversions: 234,
    spend: 12000,
    ctr: 3.08,
    cpa: 51.28
  }
];

export const MarketingDashboard: React.FC = () => {
  const [campaigns] = useState<CampaignMetrics[]>(mockCampaigns);

  const totalMetrics = campaigns.reduce((acc, campaign) => ({
    impressions: acc.impressions + campaign.impressions,
    clicks: acc.clicks + campaign.clicks,
    conversions: acc.conversions + campaign.conversions,
    spend: acc.spend + campaign.spend
  }), { impressions: 0, clicks: 0, conversions: 0, spend: 0 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Marketing Dashboard</h2>
          <p className="text-muted-foreground">Track campaign performance and engagement metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Campaign
          </Button>
          <Button>
            <Megaphone className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.impressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.clicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.7%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.conversions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMetrics.spend.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+5.2%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 ${getStatusColor(campaign.status)} rounded-full`}></div>
                      <Badge variant="secondary" className="capitalize">
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                    <p className="text-sm font-medium">{campaign.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                    <p className="text-sm font-medium">{campaign.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                    <p className="text-sm font-medium">{campaign.conversions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Spend</p>
                    <p className="text-sm font-medium">${campaign.spend.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CTR</p>
                    <p className="text-sm font-medium">{campaign.ctr}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CPA</p>
                    <p className="text-sm font-medium">${campaign.cpa}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Live Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Real-time Visitors</span>
                <span className="text-lg font-bold text-green-600">147</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Campaigns</span>
                <span className="text-lg font-bold text-blue-600">
                  {campaigns.filter(c => c.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Today's Conversions</span>
                <span className="text-lg font-bold text-purple-600">24</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Social Media Reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">LinkedIn Followers</span>
                <span className="text-lg font-bold">12.4K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Twitter Engagement</span>
                <span className="text-lg font-bold">8.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Content Shares</span>
                <span className="text-lg font-bold">156</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};