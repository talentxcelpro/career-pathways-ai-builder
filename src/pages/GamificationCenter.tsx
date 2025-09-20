import React from 'react';
import { Helmet } from 'react-helmet-async';
import GamificationDashboard from '@/components/gamification/GamificationDashboard';
import { DailyTaskTracker } from '@/components/automation/DailyTaskTracker';
import { WelcomeExperience } from '@/components/welcome/WelcomeExperience';
import { useAuth } from '@/contexts/AuthContext';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { TouchButton } from '@/components/mobile/TouchButton';
import { Trophy, Target, Flame, TrendingUp, Zap, Coins, Star, Sparkles } from 'lucide-react';

const GamificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { triggerHaptic } = useHapticFeedback();
  
  return (
    <div className="min-h-screen bg-background">
      <WelcomeExperience />
      
      <Helmet>
        <title>Gamification Center - Achievements & Rewards | TalentXcel</title>
        <meta name="description" content="Track your achievements, streaks, and earn TXC tokens through gamified activities. Complete challenges, build streaks, and climb the leaderboards." />
        <link rel="canonical" href="https://talentxcel.in/gamification" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="relative text-center mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/15 to-accent/20 rounded-3xl blur-3xl animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-background/90 to-background/50 backdrop-blur-xl rounded-3xl p-10 border border-border/30 shadow-2xl">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary via-secondary to-accent rounded-full mb-8 shadow-2xl animate-bounce">
              <Trophy className="h-12 w-12 text-white animate-pulse" />
            </div>
            
            {/* TXC Token Display */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm rounded-full px-6 py-3 border border-primary/30">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                  <Coins className="h-5 w-5 text-white font-bold" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">TXC</span>
                <span className="text-lg text-muted-foreground">Tokens</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
              Gamification Center
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Unlock your potential through achievements, build impressive streaks, and earn valuable 
              <span className="font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent"> TXC tokens </span>
              in our engaging career advancement ecosystem.
            </p>
            
            {/* Interactive Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <TouchButton 
                variant="primary" 
                size="lg"
                onClick={() => {
                  triggerHaptic('success');
                  document.getElementById('daily-tasks')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-gradient-to-r from-primary to-secondary text-white shadow-xl hover:shadow-2xl"
              >
                <Zap className="h-5 w-5 mr-2" />
                Start Earning TXC
                <Sparkles className="h-5 w-5 ml-2" />
              </TouchButton>
              
              <TouchButton 
                variant="ghost" 
                size="lg"
                onClick={() => {
                  triggerHaptic('light');
                  document.getElementById('tips')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-primary/30 hover:bg-primary/10"
              >
                <Star className="h-5 w-5 mr-2" />
                View Tips
              </TouchButton>
            </div>
          </div>
        </div>

        {/* How Gamification Works */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl"></div>
          <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/30">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group text-center hover-scale">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto border border-border/20 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Complete Activities</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Apply to jobs, complete your profile, make connections, and engage with the platform to unlock rewards.
                </p>
              </div>
              
              <div className="group text-center hover-scale">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-secondary/10 to-accent/10 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto border border-border/20 group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="h-10 w-10 text-secondary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Earn Achievements</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Unlock badges and achievements for reaching milestones and completing challenges.
                </p>
              </div>
              
              <div className="group text-center hover-scale">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto border border-border/20 group-hover:scale-110 transition-transform duration-300">
                    <Flame className="h-10 w-10 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Build Streaks</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Maintain daily login and application streaks to maximize your TXC earnings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Task Tracker */}
        <div id="daily-tasks">
          <DailyTaskTracker />
        </div>

        {/* Main Dashboard */}
        <GamificationDashboard />

        {/* Tips for Success */}
        <div id="tips" className="relative mt-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl"></div>
          <div className="relative bg-card/30 backdrop-blur-sm rounded-2xl p-8 border border-border/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Tips for Maximum Rewards
              </h3>
              <p className="text-muted-foreground mt-2">Optimize your strategy to earn more TXC tokens</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <Flame className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold text-primary">Daily Habits</h4>
                </div>
                <div className="space-y-3 pl-11">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">Log in daily to build your streak</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">Apply to at least one job per day</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">Update your profile regularly</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">Engage with community posts</span>
                  </div>
                </div>
              </div>
              
              <div className="group space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                  </div>
                  <h4 className="text-lg font-bold text-secondary">Growth Activities</h4>
                </div>
                <div className="space-y-3 pl-11">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-muted-foreground">Connect with professionals in your field</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-muted-foreground">Complete courses and add skills</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-muted-foreground">Give recommendations to peers</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-muted-foreground">Create high-quality content</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationCenter;