import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Coins,
  ShoppingCart,
  Zap,
  Crown,
  Award,
  Target,
  BookOpen,
  BrainCircuit,
  FileText,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';

interface TXCStoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: string;
  icon: React.ReactNode;
  benefits: string[];
  expires?: number; // days
  popular?: boolean;
  recommended?: boolean;
}

export const TXCStore: React.FC = () => {
  const { user } = useAuth();
  const { availableBalance, refreshBalance } = useTokenBalance();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const storeItems: TXCStoreItem[] = [
    // AI Tools Category
    {
      id: 'ai_resume_optimization',
      name: 'AI Resume Optimizer',
      description: 'Let AI optimize your resume for maximum ATS compatibility and impact',
      cost: 750,
      category: 'ai_tools',
      icon: <BrainCircuit className="h-6 w-6" />,
      benefits: ['ATS Score Improvement', 'Keyword Optimization', 'Industry-Specific Tips'],
      popular: true
    },
    {
      id: 'ai_cover_letter',
      name: 'AI Cover Letter Generator',
      description: 'Generate personalized, compelling cover letters for any job application',
      cost: 400,
      category: 'ai_tools',
      icon: <FileText className="h-6 w-6" />,
      benefits: ['Job-Specific Content', 'Persuasive Language', 'Professional Formatting']
    },
    {
      id: 'ai_interview_prep',
      name: 'AI Interview Preparation',
      description: 'Practice interviews with AI and get personalized feedback',
      cost: 600,
      category: 'ai_tools',
      icon: <Users className="h-6 w-6" />,
      benefits: ['Mock Interviews', 'Feedback Analysis', 'Common Questions']
    },

    // Templates & Tools
    {
      id: 'premium_resume_template',
      name: 'Premium Resume Template',
      description: 'Access to exclusive, professionally designed resume templates',
      cost: 500,
      category: 'templates',
      icon: <Award className="h-6 w-6" />,
      benefits: ['20+ Premium Designs', 'ATS-Friendly', 'Industry-Specific'],
      recommended: true
    },
    {
      id: 'resume_ats_analysis',
      name: 'ATS Compatibility Check',
      description: 'Analyze your resume\'s compatibility with Applicant Tracking Systems',
      cost: 300,
      category: 'analysis',
      icon: <Target className="h-6 w-6" />,
      benefits: ['Compatibility Score', 'Improvement Suggestions', 'Keyword Analysis']
    },

    // Job Applications
    {
      id: 'priority_job_application',
      name: 'Priority Application',
      description: 'Make your job application stand out with priority placement',
      cost: 200,
      category: 'jobs',
      icon: <Zap className="h-6 w-6" />,
      benefits: ['Higher Visibility', 'Faster Review', 'Stand Out Badge']
    },
    {
      id: 'application_tracking',
      name: 'Enhanced Tracking',
      description: 'Advanced application tracking and analytics for 30 days',
      cost: 100,
      category: 'jobs',
      icon: <TrendingUp className="h-6 w-6" />,
      benefits: ['Application Analytics', 'Response Tracking', 'Success Metrics'],
      expires: 30
    },

    // Learning & Development
    {
      id: 'premium_course_access',
      name: 'Premium Course Access',
      description: 'Unlock all premium courses and learning content for 30 days',
      cost: 1000,
      category: 'learning',
      icon: <BookOpen className="h-6 w-6" />,
      benefits: ['All Premium Courses', 'Certificates', 'Expert Content'],
      expires: 30,
      popular: true
    },
    {
      id: 'mentor_session',
      name: '1-on-1 Mentor Session',
      description: 'Book a personalized mentoring session with industry experts',
      cost: 2000,
      category: 'mentoring',
      icon: <Users className="h-6 w-6" />,
      benefits: ['60-minute Session', 'Industry Expert', 'Personalized Advice']
    },

    // Profile & Networking
    {
      id: 'profile_boost',
      name: 'Profile Visibility Boost',
      description: 'Increase your profile visibility for 7 days',
      cost: 300,
      category: 'profile',
      icon: <Crown className="h-6 w-6" />,
      benefits: ['5x Visibility', 'Higher Rankings', 'More Connections'],
      expires: 7
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'ai_tools', name: 'AI Tools', icon: <BrainCircuit className="h-4 w-4" /> },
    { id: 'templates', name: 'Templates', icon: <FileText className="h-4 w-4" /> },
    { id: 'jobs', name: 'Job Tools', icon: <Target className="h-4 w-4" /> },
    { id: 'learning', name: 'Learning', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'profile', name: 'Profile', icon: <Crown className="h-4 w-4" /> }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? storeItems 
    : storeItems.filter(item => item.category === selectedCategory);

  const handlePurchase = async (item: TXCStoreItem) => {
    if (!user) {
      toast.error('Please log in to make purchases');
      return;
    }

    if (availableBalance < item.cost) {
      toast.error(`Insufficient TXC balance. You need ${item.cost} TXC but only have ${availableBalance} TXC.`);
      return;
    }

    setPurchasing(item.id);

    try {
      const { data, error } = await supabase.functions.invoke('txc-feature-purchase', {
        body: {
          featureId: item.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Successfully purchased ${item.name}!`);
        refreshBalance();
        
        // Show additional info if there's an expiration
        if (item.expires) {
          toast.info(`Your ${item.name} will be active for ${item.expires} days.`);
        }
      } else {
        throw new Error(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      if (error.message?.includes('already own')) {
        toast.info('You already have access to this feature!');
      } else {
        toast.error(error.message || 'Purchase failed. Please try again.');
      }
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">TXC Store</h1>
        <p className="text-muted-foreground">
          Enhance your career with premium features using TXC tokens
        </p>
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 rounded-full">
          <Coins className="h-5 w-5 text-primary" />
          <span className="font-medium">Your Balance: {availableBalance.toLocaleString()} TXC</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            {category.icon}
            {category.name}
          </Button>
        ))}
      </div>

      {/* Store Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <Card key={item.id} className={`relative overflow-hidden transition-all hover:shadow-lg ${
            item.popular ? 'ring-2 ring-primary/20' : ''
          }`}>
            {item.popular && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground">Popular</Badge>
              </div>
            )}
            {item.recommended && (
              <div className="absolute top-4 right-4">
                <Badge variant="secondary">Recommended</Badge>
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Benefits */}
              <div className="space-y-2">
                {item.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Duration */}
              {item.expires && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Valid for {item.expires} days</span>
                </div>
              )}

              {/* Cost and Purchase Button */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{item.cost.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">TXC</span>
                  </div>
                  {availableBalance >= item.cost && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Can Afford
                    </Badge>
                  )}
                </div>

                {/* Affordability Progress */}
                {availableBalance < item.cost && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{Math.round((availableBalance / item.cost) * 100)}%</span>
                    </div>
                    <Progress value={(availableBalance / item.cost) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Need {(item.cost - availableBalance).toLocaleString()} more TXC
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => handlePurchase(item)}
                  disabled={purchasing === item.id || availableBalance < item.cost}
                  variant={availableBalance >= item.cost ? 'default' : 'secondary'}
                >
                  {purchasing === item.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Purchasing...</span>
                    </div>
                  ) : availableBalance >= item.cost ? (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase Now
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4 mr-2" />
                      Earn More TXC
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No items in this category</h3>
          <p className="text-sm text-muted-foreground">Check back later for new features!</p>
        </div>
      )}
    </div>
  );
};