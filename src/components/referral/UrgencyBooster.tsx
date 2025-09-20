import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { 
  Clock, 
  Zap, 
  Flame, 
  AlertTriangle, 
  Gift,
  Sparkles,
  Timer,
  TrendingUp,
  Target,
  Rocket,
  Star,
  Crown
} from 'lucide-react';

interface UrgencyOffer {
  id: string;
  title: string;
  description: string;
  multiplier: number;
  timeLeft: number; // in minutes
  minReferrals: number;
  maxClaims: number;
  currentClaims: number;
  type: 'limited_time' | 'flash_bonus' | 'streak_multiplier';
  animation: 'pulse' | 'bounce' | 'glow';
}

const mockOffers: UrgencyOffer[] = [
  {
    id: '1',
    title: '⚡ Flash TXC Multiplier',
    description: 'Next 3 referrals earn 3x TXC!',
    multiplier: 3,
    timeLeft: 45,
    minReferrals: 1,
    maxClaims: 50,
    currentClaims: 23,
    type: 'flash_bonus',
    animation: 'pulse'
  },
  {
    id: '2',
    title: '🔥 Hot Streak Bonus',
    description: 'Get 5 referrals in 2 hours for 5,000 TXC bonus!',
    multiplier: 1,
    timeLeft: 87,
    minReferrals: 5,
    maxClaims: 20,
    currentClaims: 7,
    type: 'streak_multiplier',
    animation: 'bounce'
  },
  {
    id: '3',
    title: '⏰ Last Chance Pro Boost',
    description: '2 referrals = Instant 1-week Pro access!',
    multiplier: 1,
    timeLeft: 23,
    minReferrals: 2,
    maxClaims: 15,
    currentClaims: 12,
    type: 'limited_time',
    animation: 'glow'
  }
];

export const UrgencyBooster: React.FC = () => {
  const { referralData, copyReferralLink } = useReferralSystem();
  const [offers, setOffers] = useState<UrgencyOffer[]>(mockOffers);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  const formatTimeLeft = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.floor(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getUrgencyLevel = (timeLeft: number, currentClaims: number, maxClaims: number) => {
    const timeUrgency = timeLeft < 30 ? 'critical' : timeLeft < 60 ? 'high' : 'medium';
    const claimUrgency = (currentClaims / maxClaims) > 0.8 ? 'critical' : 'medium';
    
    if (timeUrgency === 'critical' || claimUrgency === 'critical') return 'critical';
    if (timeUrgency === 'high') return 'high';
    return 'medium';
  };

  const getUrgencyColors = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white border-red-600';
      case 'high': return 'bg-orange-500 text-white border-orange-600';
      default: return 'bg-yellow-500 text-white border-yellow-600';
    }
  };

  const getAnimationClass = (animation: string, urgency: string) => {
    const baseClass = urgency === 'critical' ? 'animate-pulse' : '';
    switch (animation) {
      case 'pulse': return `${baseClass} hover:animate-pulse`;
      case 'bounce': return `${baseClass} hover:animate-bounce`;
      case 'glow': return `${baseClass} hover:shadow-glow`;
      default: return baseClass;
    }
  };

  const LiveTimer: React.FC<{ timeLeft: number, onExpire: () => void }> = ({ timeLeft, onExpire }) => {
    const [time, setTime] = useState(timeLeft);

    useEffect(() => {
      const interval = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            onExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 60000);

      return () => clearInterval(interval);
    }, [onExpire]);

    return (
      <div className="flex items-center gap-2">
        <Timer className={`h-4 w-4 ${time < 30 ? 'text-red-500 animate-ping' : 'text-orange-500'}`} />
        <span className={`font-mono font-bold ${time < 30 ? 'text-red-600' : 'text-orange-600'}`}>
          {formatTimeLeft(time)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-full blur-lg animate-pulse"></div>
            <div className="relative p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-500 animate-bounce" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Limited Time Offers
          </h2>
        </div>
        <p className="text-muted-foreground">
          Act fast! These exclusive bonuses won't last long ⏰
        </p>
      </div>

      {/* Urgency Offers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => {
          const urgencyLevel = getUrgencyLevel(offer.timeLeft, offer.currentClaims, offer.maxClaims);
          const urgencyColors = getUrgencyColors(urgencyLevel);
          const animationClass = getAnimationClass(offer.animation, urgencyLevel);
          const availability = ((offer.maxClaims - offer.currentClaims) / offer.maxClaims) * 100;
          
          return (
            <Card 
              key={offer.id}
              className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${animationClass} hover:scale-105`}
              onClick={() => setSelectedOffer(selectedOffer === offer.id ? null : offer.id)}
            >
              {/* Urgency Indicator */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
              
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 opacity-50"></div>
              
              {/* Urgency Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge className={`${urgencyColors} animate-pulse text-xs font-bold`}>
                  {urgencyLevel === 'critical' ? '🚨 URGENT' : 
                   urgencyLevel === 'high' ? '⚡ HOT' : '🔥 LIMITED'}
                </Badge>
              </div>

              <CardContent className="relative p-6 space-y-4">
                {/* Title */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">
                    {offer.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {offer.description}
                  </p>
                </div>

                {/* Multiplier Display */}
                {offer.multiplier > 1 && (
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                    <Sparkles className="h-5 w-5 text-primary animate-spin" />
                    <span className="font-bold text-primary text-lg">
                      {offer.multiplier}x TXC Multiplier!
                    </span>
                  </div>
                )}

                {/* Time Left */}
                <div className="flex items-center justify-between p-3 bg-background/80 rounded-lg border">
                  <span className="text-sm font-medium">Time Remaining:</span>
                  <LiveTimer 
                    timeLeft={offer.timeLeft} 
                    onExpire={() => {
                      setOffers(prev => prev.filter(o => o.id !== offer.id));
                    }}
                  />
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Availability</span>
                    <span className="text-sm font-bold">
                      {offer.maxClaims - offer.currentClaims}/{offer.maxClaims} left
                    </span>
                  </div>
                  <Progress value={availability} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {offer.currentClaims} people claimed this offer
                  </div>
                </div>

                {/* Requirements */}
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Need {offer.minReferrals} referral{offer.minReferrals > 1 ? 's' : ''} to claim
                  </span>
                </div>

                {/* Action Button */}
                <Button 
                  className={`w-full font-bold ${
                    urgencyLevel === 'critical' 
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 animate-pulse' 
                      : 'bg-gradient-to-r from-primary to-secondary'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyReferralLink();
                  }}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  {urgencyLevel === 'critical' ? 'CLAIM NOW!' : 'Start Referring'}
                </Button>

                {/* Expanded Details */}
                {selectedOffer === offer.id && (
                  <div className="border-t pt-4 space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="font-bold text-primary">
                          {((referralData?.successful_referrals || 0) / offer.minReferrals * 100).toFixed(0)}%
                        </div>
                        <div className="text-muted-foreground">Progress</div>
                      </div>
                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="font-bold text-green-600">
                          {Math.max(0, offer.minReferrals - (referralData?.successful_referrals || 0))}
                        </div>
                        <div className="text-muted-foreground">More Needed</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-center text-muted-foreground p-2 bg-yellow-50 rounded border border-yellow-200">
                      💡 Share your link now to maximize your chances!
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Global Urgency Alert */}
      <Card className="gradient-card border-orange-500/50 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full animate-bounce">
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-2">
                🚨 Flash Sale Alert: All Bonuses End Soon!
              </h3>
              <p className="text-muted-foreground">
                Don't miss out on these limited-time multipliers. Start referring now to maximize your rewards!
              </p>
            </div>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold animate-pulse hover:animate-none"
              onClick={copyReferralLink}
            >
              <Zap className="h-5 w-5 mr-2" />
              Get Link Now!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};