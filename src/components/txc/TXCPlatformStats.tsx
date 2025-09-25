import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Users, 
  Zap, 
  TrendingUp, 
  Shield, 
  Network 
} from 'lucide-react';

/**
 * TXC Platform Statistics - Modern blockchain dashboard
 */
export const TXCPlatformStats: React.FC = () => {
  const stats = [
    {
      label: 'Total TXC Supply',
      value: '1,000,000,000',
      subtext: 'TXC',
      icon: Coins,
      trend: '+2.4%',
      color: 'text-primary'
    },
    {
      label: 'Active Users',
      value: '125,847',
      subtext: 'Platform Users',
      icon: Users,
      trend: '+12.8%',
      color: 'text-info'
    },
    {
      label: 'Daily Transactions',
      value: '45,692',
      subtext: 'TXC Transfers',
      icon: Zap,
      trend: '+8.2%',
      color: 'text-accent'
    },
    {
      label: 'Network Security',
      value: '99.9%',
      subtext: 'Uptime',
      icon: Shield,
      trend: 'Secure',
      color: 'text-success'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.subtext}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <Badge 
                  variant="outline" 
                  className="border-success/20 bg-success/5 text-success text-xs"
                >
                  {stat.trend}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};