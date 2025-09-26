import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Zap, 
  Star, 
  MessageSquare, 
  Video, 
  Users, 
  Calendar,
  BarChart3,
  Shield,
  Sparkles 
} from 'lucide-react';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { useMobileAnalytics } from './MobileAnalytics';
import { PremiumGuard } from '@/components/premium/PremiumGuard';
import { formatTXC } from '@/types/txc-pricing';

export const PremiumMobileExperience: React.FC = () => {
  const { features, hasFeature } = usePremiumFeatures();
  const { trackFeatureUsage } = useMobileAnalytics();

  const premiumFeatures = [
    {
      key: 'unlimited_messaging',
      icon: MessageSquare,
      title: 'Unlimited Messaging',
      description: 'Connect with unlimited professionals',
      color: 'bg-blue-500',
    },
    {
      key: 'video_consultations',
      icon: Video,
      title: 'Video Consultations',
      description: 'Host and join video meetings',
      color: 'bg-purple-500',
    },
    {
      key: 'premium_networking',
      icon: Users,
      title: 'Premium Networking',
      description: 'Advanced networking features',
      color: 'bg-green-500',
    },
    {
      key: 'advanced_analytics',
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Detailed insights and metrics',
      color: 'bg-orange-500',
    },
    {
      key: 'priority_support',
      icon: Shield,
      title: 'Priority Support',
      description: '24/7 premium customer support',
      color: 'bg-red-500',
    },
    {
      key: 'event_hosting',
      icon: Calendar,
      title: 'Event Hosting',
      description: 'Create and manage events',
      color: 'bg-indigo-500',
    },
  ];

  const handleFeatureClick = (featureKey: string) => {
    trackFeatureUsage(`mobile_premium_${featureKey}_clicked`);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Premium Status Header */}
      <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 rounded-full bg-white/20 w-fit">
            <Crown className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl">Premium Experience</CardTitle>
          <p className="text-amber-100">
            Unlock powerful mobile features with TXC tokens
          </p>
        </CardHeader>
      </Card>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 gap-4">
        {premiumFeatures.map((feature) => {
          const featureData = features.find(f => f.feature_key === feature.key);
          const isOwned = hasFeature(feature.key);
          const IconComponent = feature.icon;

          return (
            <Card 
              key={feature.key}
              className={`relative transition-all duration-300 ${
                isOwned ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : 'hover:shadow-lg'
              }`}
              onClick={() => handleFeatureClick(feature.key)}
            >
              {isOwned && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                  Active
                </Badge>
              )}

              <CardContent className="p-4 text-center space-y-3">
                <div className={`mx-auto p-3 rounded-full ${feature.color} w-fit`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm leading-tight">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>

                {featureData && (
                  <div className="text-sm font-bold text-primary">
                    {formatTXC(featureData.txc_cost)}
                  </div>
                )}

                {!isOwned && (
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Unlock
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Premium Content Areas */}
      <div className="space-y-4">
        <PremiumGuard featureKey="unlimited_messaging">
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Premium Messaging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You have unlimited messaging access! Connect with professionals, 
                mentors, and employers without restrictions.
              </p>
            </CardContent>
          </Card>
        </PremiumGuard>

        <PremiumGuard featureKey="video_consultations">
          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-600" />
                Video Consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Schedule and host professional video consultations directly 
                from your mobile device.
              </p>
            </CardContent>
          </Card>
        </PremiumGuard>

        <PremiumGuard featureKey="advanced_analytics">
          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access detailed analytics about your profile performance, 
                networking activity, and career progress.
              </p>
            </CardContent>
          </Card>
        </PremiumGuard>
      </div>

      {/* Mobile-Specific Premium Features */}
      <Card className="border-gradient-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Mobile Exclusive Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Offline Mode</h4>
                <p className="text-xs text-muted-foreground">
                  Access content when offline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Push Notifications</h4>
                <p className="text-xs text-muted-foreground">
                  Smart career alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Enhanced Security</h4>
                <p className="text-xs text-muted-foreground">
                  Biometric authentication
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};