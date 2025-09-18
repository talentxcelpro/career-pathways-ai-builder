import React from 'react';
import { Helmet } from 'react-helmet-async';
import GamificationDashboard from '@/components/gamification/GamificationDashboard';
import { Trophy, Target, Flame } from 'lucide-react';

const GamificationCenter: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gamification Center - Achievements & Rewards | TalentXcel</title>
        <meta name="description" content="Track your achievements, streaks, and earn TXC tokens through gamified activities. Complete challenges, build streaks, and climb the leaderboards." />
        <link rel="canonical" href="https://talentxcel.in/gamification" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            Gamification Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete achievements, build streaks, and earn TXC tokens through engaging career activities.
          </p>
        </div>

        {/* How Gamification Works */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Complete Activities</h3>
              <p className="text-sm text-muted-foreground">
                Apply to jobs, complete your profile, make connections, and engage with the platform.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Earn Achievements</h3>
              <p className="text-sm text-muted-foreground">
                Unlock badges and achievements for reaching milestones and completing challenges.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Build Streaks</h3>
              <p className="text-sm text-muted-foreground">
                Maintain daily login and application streaks to maximize your TXC earnings.
              </p>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <GamificationDashboard />

        {/* Tips for Success */}
        <div className="mt-8 bg-muted/50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Tips for Maximum Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Daily Habits</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Log in daily to build your streak</li>
                <li>• Apply to at least one job per day</li>
                <li>• Update your profile regularly</li>
                <li>• Engage with community posts</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Growth Activities</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Connect with professionals in your field</li>
                <li>• Complete courses and add skills</li>
                <li>• Give recommendations to peers</li>
                <li>• Create high-quality content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationCenter;