import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSocialTXCAward } from '@/hooks/useSocialTXCAward';
import { 
  Coins, 
  Users, 
  MessageSquare, 
  Award,
  TrendingUp,
  Clock
} from 'lucide-react';

const SocialTXCPanel: React.FC = () => {
  const { awardSocialTXC, isProcessing, lastResults } = useSocialTXCAward();

  const handleAwardTXC = async () => {
    await awardSocialTXC();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Social TXC Mining
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Award TXC based on social activity
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Posts: 5 TXC • Connections: 2 TXC • Comments: 1 TXC
              </p>
            </div>
            <Button 
              onClick={handleAwardTXC}
              disabled={isProcessing}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Award TXC
                </>
              )}
            </Button>
          </div>

          {lastResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Recent Awards:</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {lastResults.slice(0, 10).map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{result.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.posts} posts • {result.connections} connections
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      +{result.awarded} TXC
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {lastResults.reduce((sum, r) => sum + r.awarded, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Awarded</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{lastResults.length}</p>
                <p className="text-sm text-muted-foreground">Users Rewarded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialTXCPanel;