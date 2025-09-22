import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTXCLeaderboard } from '@/hooks/useTXCLeaderboard';
import { Crown, Trophy, TrendingUp, Users } from 'lucide-react';

interface TXCUserRankDisplayProps {
  variant?: 'card' | 'compact' | 'inline';
  showFullLeaderboard?: boolean;
}

export const TXCUserRankDisplay: React.FC<TXCUserRankDisplayProps> = ({ 
  variant = 'card',
  showFullLeaderboard = false 
}) => {
  const { userRankInfo, isLoading } = useTXCLeaderboard();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!userRankInfo) {
    return (
      <div className="text-sm text-muted-foreground">
        Rank not available
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="outline" className="flex items-center gap-1">
          <Trophy className="h-3 w-3" />
          #{userRankInfo.rank}
        </Badge>
        <span className="text-muted-foreground">
          {userRankInfo.percentile}% Top percentile
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-600" />
          <div>
            <div className="font-semibold text-amber-800">Rank #{userRankInfo.rank}</div>
            <div className="text-xs text-amber-600">of {userRankInfo.totalUsers.toLocaleString()} users</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-amber-700">{userRankInfo.percentile}%</div>
          <div className="text-xs text-amber-600">Top percentile</div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-amber-800 flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Your Position
            </h3>
            {showFullLeaderboard && (
              <Badge variant="outline" className="text-xs">
                Full Leaderboard
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-700">#{userRankInfo.rank}</div>
              <div className="text-sm text-amber-600">
                Rank #{userRankInfo.rank} of {userRankInfo.totalUsers.toLocaleString()} users
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-700">{userRankInfo.percentile}%</div>
              <div className="text-sm text-amber-600">Top percentile</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm pt-3 border-t border-amber-200">
            <span className="text-amber-700 flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Current TXC: {userRankInfo.currentTxc.toLocaleString()}
            </span>
            <span className="text-amber-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Lifetime: {userRankInfo.lifetimeTxc.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};