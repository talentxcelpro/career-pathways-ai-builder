import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTXCPurchase } from '@/hooks/useTXCPurchase';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { 
  TXC_PROFILE_UPGRADES, 
  TXC_JOB_POSTING, 
  TXC_TOOLS_PRICING, 
  TXC_SUBSCRIPTION_TIERS 
} from '@/types/txc-pricing';
import { 
  ShoppingCart, 
  Crown, 
  Zap, 
  Shield, 
  Star, 
  Briefcase, 
  Users, 
  Sparkles,
  Lock,
  Unlock,
  Gift,
  Check
} from 'lucide-react';

export const TXCMarketplace: React.FC = () => {
  const { purchaseFeature, canAfford, isProcessing, availableBalance } = useTXCPurchase();
  const { refreshBalance } = useTokenBalance();
  const [activeCategory, setActiveCategory] = useState('profiles');

  const handlePurchase = async (featureId: string, description: string) => {
    const success = await purchaseFeature(featureId, description);
    if (success) {
      refreshBalance();
    }
  };

  const getUpgradeIcon = (id: string) => {
    if (id.includes('premium')) return Crown;
    if (id.includes('elite')) return Star;
    if (id.includes('verification')) return Shield;
    if (id.includes('job')) return Briefcase;
    return Gift;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tools': return Zap;
      case 'premium': return Crown;
      case 'verification': return Shield;
      default: return Gift;
    }
  };

  return (
    <div className="space-y-8">
      {/* Marketplace Header */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-purple-700 mb-2">TXC Marketplace</h2>
            <p className="text-purple-600 mb-6">Spend your TXC tokens on premium features and career enhancements</p>
            
            <div className="flex justify-center">
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-700">{availableBalance.toLocaleString()} TXC</div>
                <div className="text-sm text-purple-600">Available to Spend</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profiles">Profile Upgrades</TabsTrigger>
          <TabsTrigger value="jobs">Job Posting</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TXC_PROFILE_UPGRADES.map((upgrade) => {
              const Icon = getUpgradeIcon(upgrade.id);
              const affordable = canAfford(upgrade.cost);
              
              return (
                <Card key={upgrade.id} className={`
                  relative overflow-hidden transition-all duration-300 hover:shadow-lg
                  ${upgrade.popular ? 'ring-2 ring-primary' : ''}
                  ${!affordable ? 'opacity-75' : ''}
                `}>
                  {upgrade.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-bold">
                      POPULAR
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{upgrade.name}</CardTitle>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {upgrade.duration}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {upgrade.cost.toLocaleString()} TXC
                        </div>
                      </div>

                      <ul className="space-y-2">
                        {upgrade.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase(upgrade.id, upgrade.name)}
                        disabled={isProcessing || !affordable}
                        variant={affordable ? "default" : "secondary"}
                      >
                        {affordable ? (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Purchase
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Insufficient TXC
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TXC_JOB_POSTING.map((posting) => {
              const affordable = canAfford(posting.cost);
              
              return (
                <Card key={posting.id} className={`
                  relative overflow-hidden transition-all duration-300 hover:shadow-lg
                  ${posting.popular ? 'ring-2 ring-primary' : ''}
                  ${!affordable ? 'opacity-75' : ''}
                `}>
                  {posting.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-bold">
                      POPULAR
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{posting.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {posting.cost.toLocaleString()} TXC
                        </div>
                      </div>

                      <ul className="space-y-2">
                        {posting.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase(posting.id, posting.name)}
                        disabled={isProcessing || !affordable}
                        variant={affordable ? "default" : "secondary"}
                      >
                        {affordable ? (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Post Job
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Insufficient TXC
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TXC_TOOLS_PRICING.map((tool) => {
              const Icon = getCategoryIcon(tool.category);
              const affordable = canAfford(tool.cost);
              
              return (
                <Card key={tool.feature} className={`
                  transition-all duration-300 hover:shadow-lg
                  ${!affordable ? 'opacity-75' : ''}
                `}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tool.description}</CardTitle>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {tool.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {tool.cost.toLocaleString()} TXC
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase(tool.feature, tool.description)}
                        disabled={isProcessing || !affordable}
                        variant={affordable ? "default" : "secondary"}
                      >
                        {affordable ? (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Purchase Tool
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Insufficient TXC
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TXC_SUBSCRIPTION_TIERS.map((subscription) => {
              const affordable = canAfford(subscription.cost);
              
              return (
                <Card key={subscription.id} className={`
                  relative overflow-hidden transition-all duration-300 hover:shadow-lg
                  ${subscription.popular ? 'ring-2 ring-primary' : ''}
                  ${!affordable ? 'opacity-75' : ''}
                `}>
                  {subscription.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-bold">
                      POPULAR
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{subscription.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {subscription.duration}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {subscription.cost.toLocaleString()} TXC
                        </div>
                        <div className="text-sm text-muted-foreground">per month</div>
                      </div>

                      <ul className="space-y-2">
                        {subscription.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase(subscription.id, subscription.name)}
                        disabled={isProcessing || !affordable}
                        variant={affordable ? "default" : "secondary"}
                      >
                        {affordable ? (
                          <>
                            <Crown className="h-4 w-4 mr-2" />
                            Subscribe
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Insufficient TXC
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};