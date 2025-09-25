import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Send, 
  Receipt, 
  History, 
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle
} from 'lucide-react';
import { TXCPlatformHeader } from './TXCPlatformHeader';
import { TXCPlatformStats } from './TXCPlatformStats';

/**
 * TXC Application UI - Clean, modern design inspired by top applications
 */
export const TXCApplicationUI: React.FC = () => {
  const recentTransactions = [
    {
      id: '1',
      type: 'received',
      amount: 1500,
      description: 'Profile Completion Reward',
      status: 'completed',
      timestamp: '2 hours ago'
    },
    {
      id: '2', 
      type: 'spent',
      amount: 500,
      description: 'Premium Feature Unlock',
      status: 'completed',
      timestamp: '1 day ago'
    },
    {
      id: '3',
      type: 'received',
      amount: 2000,
      description: 'Job Application Bonus',
      status: 'pending',
      timestamp: '2 days ago'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <TXCPlatformHeader />
      
      <div className="container py-8 space-y-8">
        {/* Platform Statistics */}
        <TXCPlatformStats />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    TXC Wallet
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-12 bg-gradient-to-r from-primary to-primary-light">
                    <Send className="h-4 w-4 mr-2" />
                    Send TXC
                  </Button>
                  <Button variant="outline" className="h-12">
                    <Receipt className="h-4 w-4 mr-2" />
                    Request TXC
                  </Button>
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 bg-muted/30 border-border/50">
                    <div className="text-center space-y-2">
                      <div className="p-2 bg-primary/10 rounded-lg w-fit mx-auto">
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm font-medium">Earn TXC</p>
                      <p className="text-xs text-muted-foreground">Complete tasks</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-muted/30 border-border/50">
                    <div className="text-center space-y-2">
                      <div className="p-2 bg-accent/10 rounded-lg w-fit mx-auto">
                        <History className="h-4 w-4 text-accent" />
                      </div>
                      <p className="text-sm font-medium">History</p>
                      <p className="text-xs text-muted-foreground">View all</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-muted/30 border-border/50">
                    <div className="text-center space-y-2">
                      <div className="p-2 bg-info/10 rounded-lg w-fit mx-auto">
                        <Receipt className="h-4 w-4 text-info" />
                      </div>
                      <p className="text-sm font-medium">Rewards</p>
                      <p className="text-xs text-muted-foreground">Claim</p>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Transaction History */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      tx.type === 'received' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {tx.type === 'received' 
                        ? <ArrowDownLeft className="h-4 w-4" />
                        : <ArrowUpRight className="h-4 w-4" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      tx.type === 'received' ? 'text-success' : 'text-foreground'
                    }`}>
                      {tx.type === 'received' ? '+' : '-'}{tx.amount.toLocaleString()} TXC
                    </p>
                    <Badge 
                      variant={tx.status === 'completed' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {tx.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              <Button variant="ghost" className="w-full">
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* TXC Platform Features */}
        <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-semibold mb-4">Experience the Future of Career Blockchain</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              TXC powers every aspect of your career journey - from profile enhancements to job applications, 
              skill verifications to networking opportunities.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-primary text-white">1 TXC = ₹1</Badge>
              <Badge className="bg-accent text-black">1 TXC = $0.012</Badge>
              <Badge variant="outline">Trading Q2 2026</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};