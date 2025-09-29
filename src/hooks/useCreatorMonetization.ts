import { useState, useEffect } from 'react';

interface Earnings {
  total: number;
  monthlyRevenue: number;
  subscribers: number;
  growth: number;
  subscriberGrowth: number;
  avgRevenuePerSubscriber: number;
  revenueSources: Array<{
    type: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    subscriber: string;
    amount: number;
    date: string;
  }>;
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  subscriberCount: number;
  isPopular: boolean;
}

interface Subscriptions {
  tiers: SubscriptionTier[];
}

interface TierConfig {
  name: string;
  price: number;
  description: string;
}

export const useCreatorMonetization = () => {
  const [earnings, setEarnings] = useState<Earnings>({
    total: 0,
    monthlyRevenue: 0,
    subscribers: 0,
    growth: 0,
    subscriberGrowth: 0,
    avgRevenuePerSubscriber: 0,
    revenueSources: [],
    recentTransactions: []
  });
  
  const [subscriptions, setSubscriptions] = useState<Subscriptions>({
    tiers: []
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock monetization data
    setTimeout(() => {
      setEarnings({
        total: 4250,
        monthlyRevenue: 1840,
        subscribers: 156,
        growth: 18.5,
        subscriberGrowth: 24,
        avgRevenuePerSubscriber: 11.79,
        revenueSources: [
          { type: 'Subscriptions', amount: 1480, percentage: 80, color: 'bg-blue-500' },
          { type: 'Tips', amount: 240, percentage: 13, color: 'bg-green-500' },
          { type: 'Sponsored Content', amount: 120, percentage: 7, color: 'bg-purple-500' }
        ],
        recentTransactions: [
          { id: '1', type: 'Monthly Subscription', subscriber: 'John D.', amount: 9.99, date: '2 hours ago' },
          { id: '2', type: 'One-time Tip', subscriber: 'Sarah M.', amount: 5.00, date: '5 hours ago' },
          { id: '3', type: 'Premium Tier', subscriber: 'Mike R.', amount: 19.99, date: '1 day ago' }
        ]
      });

      setSubscriptions({
        tiers: [
          {
            id: '1',
            name: 'Basic Support',
            price: 4.99,
            description: 'Support my content and get exclusive updates',
            features: ['Monthly newsletter', 'Early access to posts', 'Supporter badge'],
            subscriberCount: 89,
            isPopular: false
          },
          {
            id: '2',
            name: 'Premium Member',
            price: 9.99,
            description: 'Get premium content and direct access',
            features: ['All Basic features', 'Premium content library', 'Monthly Q&A sessions', 'Direct messaging'],
            subscriberCount: 52,
            isPopular: true
          },
          {
            id: '3',
            name: 'VIP Supporter',
            price: 19.99,
            description: 'Maximum support with exclusive perks',
            features: ['All Premium features', '1-on-1 monthly mentoring', 'Custom content requests', 'Priority support'],
            subscriberCount: 15,
            isPopular: false
          }
        ]
      });
      
      setIsLoading(false);
    }, 1000);
  }, []);

  const createSubscriptionTier = async (config: TierConfig) => {
    setIsLoading(true);
    try {
      // Mock creating a subscription tier
      const newTier: SubscriptionTier = {
        id: Date.now().toString(),
        name: config.name,
        price: config.price,
        description: config.description,
        features: ['Basic features', 'Email support'],
        subscriberCount: 0,
        isPopular: false
      };
      
      setSubscriptions(prev => ({
        tiers: [...prev.tiers, newTier]
      }));
    } catch (error) {
      console.error('Failed to create subscription tier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    earnings,
    subscriptions,
    createSubscriptionTier,
    isLoading
  };
};