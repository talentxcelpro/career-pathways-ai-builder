import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { useReferralContests } from '@/hooks/useReferralContests';
import { 
  Trophy, 
  Clock, 
  Target, 
  Zap, 
  Flame, 
  Award,
  Users,
  Calendar,
  Star,
  Gift,
  Crown,
  Rocket
} from 'lucide-react';

interface ContestData {
  id: string;
  title: string;
  description: string;
  targetReferrals: number;
  timeLeft: number; // in hours
  prize: string;
  participants: number;
  currentUserProgress: number;
  status: 'active' | 'ending_soon' | 'completed';
  type: 'weekly' | 'monthly' | 'special';
}

export const ReferralContest: React.FC = () => {
  const { referralData } = useReferralSystem();
  const { contests: realContests, loading, getUserContestProgress } = useReferralContests();
  const [selectedContest, setSelectedContest] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});

  // Use real contests only
  const contests: ContestData[] = realContests.map(contest => ({
    id: contest.id,
    title: contest.title,
    description: contest.description,
    targetReferrals: contest.target_referrals,
    timeLeft: Math.max(0, (new Date(contest.end_date).getTime() - Date.now()) / (1000 * 60 * 60)),
    prize: contest.prize_description,
    participants: contest.current_participants || 0,
    currentUserProgress: userProgress[contest.id] || 0,
    status: new Date(contest.end_date).getTime() - Date.now() < 24 * 60 * 60 * 1000 ? 'ending_soon' : 'active',
    type: contest.contest_type
  }));

  // Fetch user progress for all contests
  useEffect(() => {
    const fetchProgress = async () => {
      const progressMap: Record<string, number> = {};
      for (const contest of realContests) {
        progressMap[contest.id] = await getUserContestProgress(contest.id);
      }
      setUserProgress(progressMap);
    };

    if (realContests.length > 0) {
      fetchProgress();
    }
  }, [realContests, getUserContestProgress]);

  const formatTimeLeft = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.floor(hours * 60);
      return `${minutes}m`;
    }
    if (hours < 24) {
      return `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  const getContestIcon = (type: string) => {
    switch (type) {
      case 'weekly': return Trophy;
      case 'monthly': return Crown;
      case 'special': return Rocket;
      default: return Award;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ending_soon': return 'text-red-500 border-red-200 bg-red-50';
      case 'active': return 'text-green-500 border-green-200 bg-green-50';
      case 'completed': return 'text-gray-500 border-gray-200 bg-gray-50';
      default: return 'text-blue-500 border-blue-200 bg-blue-50';
    }
  };

  const LiveCountdown: React.FC<{ timeLeft: number }> = ({ timeLeft }) => {
    const [time, setTime] = useState(timeLeft);

    useEffect(() => {
      const interval = setInterval(() => {
        setTime(prev => prev > 0 ? prev - 0.0167 : 0); // Subtract 1 minute
      }, 60000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-orange-500 animate-pulse" />
        <span className="font-mono font-bold text-orange-600">
          {formatTimeLeft(time)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Contest Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full animate-pulse">
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Live Contests
          </h2>
        </div>
        <p className="text-muted-foreground">
          Compete with other users and win exclusive rewards! 🏆
        </p>
      </div>

      {/* Active Contests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests.map((contest) => {
          const Icon = getContestIcon(contest.type);
          const progress = (contest.currentUserProgress / contest.targetReferrals) * 100;
          
          return (
            <Card 
              key={contest.id}
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                contest.status === 'ending_soon' 
                  ? 'ring-2 ring-orange-500/50 animate-pulse' 
                  : 'hover:ring-2 hover:ring-primary/30'
              }`}
              onClick={() => setSelectedContest(selectedContest === contest.id ? null : contest.id)}
            >
              {/* Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5"></div>
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge className={`${getStatusColor(contest.status)} animate-bounce`}>
                  {contest.status === 'ending_soon' ? '🔥 ENDING SOON' : 
                   contest.status === 'active' ? '✨ ACTIVE' : '✅ COMPLETED'}
                </Badge>
              </div>

              <CardHeader className="relative pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {contest.type.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold leading-tight">
                  {contest.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {contest.description}
                </p>
              </CardHeader>

              <CardContent className="relative space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm font-bold text-primary">
                      {contest.currentUserProgress}/{contest.targetReferrals}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {contest.targetReferrals - contest.currentUserProgress} more to win!
                  </div>
                </div>

                {/* Prize */}
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <Gift className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-bold text-yellow-700">
                    {contest.prize}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <LiveCountdown timeLeft={contest.timeLeft} />
                    <div className="text-xs text-muted-foreground">Time Left</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="font-bold text-blue-600">{contest.participants}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Participants</div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedContest === contest.id && (
                  <div className="border-t pt-4 space-y-3 animate-fade-in">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your Rank:</span>
                        <Badge variant="secondary">Calculating...</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your Progress:</span>
                        <span className="font-bold">{contest.currentUserProgress} referrals</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Completion:</span>
                        <span className="font-bold text-primary">
                          {Math.round((contest.currentUserProgress / contest.targetReferrals) * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Join Contest
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leaderboard Preview */}
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <span>Weekly Contest Leaderboard</span>
            <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Top Referrer', referrals: 15, badge: '👑' },
              { rank: 2, name: 'Second Place', referrals: 12, badge: '🥈' },
              { rank: 3, name: 'Third Place', referrals: 10, badge: '🥉' },
              { rank: '?', name: 'You', referrals: referralData?.successful_referrals || 0, badge: '🎯' }
            ].map((user, index) => (
              <div 
                key={`user-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  user.name === 'You' 
                    ? 'bg-primary/10 ring-2 ring-primary/30 scale-105' 
                    : 'bg-background/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    typeof user.rank === 'number' && user.rank <= 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-muted'
                  }`}>
                    {typeof user.rank === 'number' && user.rank <= 3 ? user.badge : user.rank}
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {user.name}
                      {user.name === 'You' && <Badge variant="secondary">You</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.referrals} referrals
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{user.referrals}</div>
                  <div className="text-xs text-muted-foreground">refs</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};