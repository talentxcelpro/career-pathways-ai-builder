import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Users, ArrowLeft, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { AchievementsSection } from '@/components/gamification/AchievementsSection';
import { LeaderboardsWidget } from '@/components/gamification/LeaderboardsWidget';

const GamificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/30 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 h-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gamification</h1>
              <p className="text-sm text-muted-foreground">Your gaming hub</p>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/txc/mining')}
            size="sm"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-8"
          >
            <Coins className="h-4 w-4 mr-1" />
            Mine TXC
          </Button>
        </div>

        {/* Compact Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs">
              <Trophy className="h-3 w-3" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2 text-xs">
              <Star className="h-3 w-3" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2 text-xs">
              <Users className="h-3 w-3" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <GamificationDashboard />
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <AchievementsSection />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-4">
            <LeaderboardsWidget />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GamificationCenter;