import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Coins, Target, Flame, Sparkles, Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface JobGamificationHeaderProps {
  userLevel: number;
  experience: number;
  nextLevelExp: number;
  txcBalance: number;
  dailyStreak: number;
  weeklyTarget: number;
  applicationsThisWeek: number;
  dailyChallenges: Array<{
    id: number;
    title: string;
    reward: number;
    progress: number;
    target: number;
    completed: boolean;
  }>;
}

export const JobGamificationHeader: React.FC<JobGamificationHeaderProps> = ({
  userLevel,
  experience,
  nextLevelExp,
  txcBalance,
  dailyStreak,
  weeklyTarget,
  applicationsThisWeek,
  dailyChallenges
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Experience Progress Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-blue-600/10 backdrop-blur-sm border-white/10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-apple-bold text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Career Progress
            </h3>
            <Badge variant="secondary" className="bg-primary/20 text-primary font-apple-bold">
              Level {userLevel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-apple-semibold">
              <span className="text-slate-500">Experience Points</span>
              <span className="text-primary">{experience} / {nextLevelExp} XP</span>
            </div>
            <Progress value={(experience / nextLevelExp) * 100} className="h-2" />
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-apple-medium uppercase tracking-wider">
              <Flame className="h-3 w-3 text-orange-500" />
              {dailyStreak} Day Hot Streak!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Quick Look */}
      <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm border-slate-100">
        <CardHeader className="pb-2">
          <h3 className="font-apple-bold text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Performance Stats
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-apple-bold">TXC Balance</p>
              <div className="flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-lg font-apple-heavy text-slate-900">{txcBalance.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-apple-bold">Weekly Goal</p>
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-lg font-apple-heavy text-slate-900">{applicationsThisWeek}/{weeklyTarget}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenges Card */}
      <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Gamepad2 className="h-12 w-12 text-primary" />
        </div>
        <CardHeader className="pb-2">
          <h3 className="font-apple-bold text-sm">Daily Challenges</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyChallenges.map((challenge) => (
              <div key={challenge.id} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={challenge.completed ? 'line-through text-slate-400 font-apple-medium' : 'text-slate-700 font-apple-bold'}>
                    {challenge.title}
                  </span>
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-yellow-500" />
                    <span className="text-yellow-600 font-apple-heavy">+{challenge.reward}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1">
                  <div 
                    className="bg-primary h-1 rounded-full transition-all duration-500"
                    style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
