import React from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useNavigate } from 'react-router-dom';
import {
  Coins,
  Clock,
  Star,
  Rocket,
  CheckCircle,
  TrendingUp,
  Bell,
  Gift,
  ArrowRight
} from 'lucide-react';

interface ComingSoonFeature {
  id: string;
  name: string;
  description: string;
  estimatedCost: number;
  category: string;
  icon: React.ReactNode;
  benefits: string[];
  launchDate: string;
  earlyAccess?: boolean;
  detailedDescription?: string;
}

interface TXCComingSoonModalProps {
  feature: ComingSoonFeature | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TXCComingSoonModal: React.FC<TXCComingSoonModalProps> = ({
  feature,
  isOpen,
  onClose
}) => {
  const { availableBalance } = useTokenBalance();
  const navigate = useNavigate();

  if (!feature) return null;

  const canAfford = availableBalance >= feature.estimatedCost;
  const progressPercentage = Math.min((availableBalance / feature.estimatedCost) * 100, 100);
  const needed = Math.max(feature.estimatedCost - availableBalance, 0);

  const handleEarnMore = () => {
    onClose();
    navigate('/gamification?tab=mining');
  };

  const handleNotifyMe = () => {
    // In a real app, this would set up notifications
    onClose();
    // Could show a toast or trigger an edge function to store notification preferences
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {feature.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{feature.name}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                {feature.description}
              </DialogDescription>
            </div>
            {feature.earlyAccess && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Early Access
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Detailed Description */}
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm leading-relaxed">
              {feature.detailedDescription || 
                `${feature.name} will revolutionize how you use TalentXcel. This premium feature is designed to give you a competitive edge in your career journey.`
              }
            </p>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              What You'll Get
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {feature.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-200/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pricing & Affordability */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10">
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-600" />
                  Estimated Cost
                </h4>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                  {feature.estimatedCost.toLocaleString()} TXC
                </p>
                <p className="text-xs text-amber-600/80">
                  Approximately ₹{feature.estimatedCost.toLocaleString()} when purchase options launch
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-xl font-bold">
                  {availableBalance.toLocaleString()} TXC
                </p>
                {canAfford ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Ready to Purchase!
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    Need {needed.toLocaleString()} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Saving Progress</span>
                <span className={canAfford ? 'text-green-600 font-medium' : 'text-amber-600'}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              {!canAfford && (
                <p className="text-xs text-muted-foreground">
                  Keep earning TXC to reach your goal! At current earning rate, you'll be ready in no time.
                </p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/30">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Launch Timeline
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Expected Launch</span>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {feature.launchDate}
                </Badge>
              </div>
              {feature.earlyAccess && (
                <div className="flex items-center gap-2 text-sm text-purple-600">
                  <Gift className="h-4 w-4" />
                  <span>Early access available for active users</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {!canAfford ? (
              <Button 
                onClick={handleEarnMore}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Earn More TXC
              </Button>
            ) : (
              <Button 
                disabled
                className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-not-allowed"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Ready to Purchase
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={handleNotifyMe}
              className="border-primary/20 hover:bg-primary/5"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notify When Available
            </Button>
          </div>

          {/* Bottom CTA */}
          <motion.div 
            className="p-4 rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <Rocket className="h-6 w-6 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium text-purple-700 dark:text-purple-400">
                  Help Shape TalentXcel's Future
                </p>
                <p className="text-xs text-purple-600/80">
                  Your activity and feedback help us prioritize which features to launch first.
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  onClose();
                  navigate('/gamification');
                }}
                className="text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20"
              >
                Get Active <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};