import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Briefcase, 
  Users, 
  GraduationCap, 
  TrendingUp,
  Star,
  Clock,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SkillsMarketplace } from './SkillsMarketplace';
import { MicroGigs } from './MicroGigs';
import { MentorshipExchange } from './MentorshipExchange';
import { LearnToEarn } from './LearnToEarn';

const BusinessModelsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('skills');

  const businessModels = [
    {
      id: 'skills',
      title: 'Skills Marketplace',
      description: 'Monetize your expertise by teaching skills',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      earnings: '+₹15,000',
      growth: '+23%',
      badge: 'Popular'
    },
    {
      id: 'gigs',
      title: 'Micro Gigs',
      description: 'Quick tasks and project opportunities',
      icon: Briefcase,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      earnings: '+₹8,500',
      growth: '+45%',
      badge: 'Trending'
    },
    {
      id: 'mentorship',
      title: 'Mentorship Exchange',
      description: 'Connect with mentors and mentees',
      icon: Users,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      earnings: '+₹12,000',
      growth: '+18%',
      badge: 'Premium'
    },
    {
      id: 'learn',
      title: 'Learn & Earn',
      description: 'Get paid while learning new skills',
      icon: GraduationCap,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      earnings: '+₹6,200',
      growth: '+67%',
      badge: 'New'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-apple border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Business Models</h1>
              <p className="text-sm text-muted-foreground">Unlock multiple revenue streams</p>
            </div>
            <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Growing +35%
            </Badge>
          </div>
        </div>
      </div>

      {/* Business Models Overview */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {businessModels.map((model) => {
            const IconComponent = model.icon;
            const isActive = activeTab === model.id;
            
            return (
              <Card 
                key={model.id}
                className={cn(
                  "relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105",
                  "bg-card border-border/20",
                  isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                onClick={() => setActiveTab(model.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "p-2 rounded-lg text-white",
                      model.color
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {model.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold leading-tight">
                    {model.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {model.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {model.earnings}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-blue-600" />
                      <span className="text-xs text-muted-foreground">
                        {model.growth} this month
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden">
            {businessModels.map((model) => (
              <TabsTrigger key={model.id} value={model.id}>
                {model.title}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="skills" className="mt-0">
            <SkillsMarketplace />
          </TabsContent>

          <TabsContent value="gigs" className="mt-0">
            <MicroGigs />
          </TabsContent>

          <TabsContent value="mentorship" className="mt-0">
            <MentorshipExchange />
          </TabsContent>

          <TabsContent value="learn" className="mt-0">
            <LearnToEarn />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessModelsHub;