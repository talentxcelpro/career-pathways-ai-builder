import React from 'react';
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Brain, 
  Target, 
  TrendingUp, 
  Sparkles,
  Zap,
  MessageSquare,
  BookOpen
} from 'lucide-react';

export default function AIFeaturesPage() {
  React.useEffect(() => {
    updateMetaTags({
      title: 'AI-Powered Learning Features | TalentXcel',
      description: 'Discover our advanced AI features that personalize your learning journey and accelerate skill development.'
    });
  }, []);

  const aiFeatures = [
    {
      title: 'AI Learning Assistant',
      description: 'Get instant help with concepts, coding problems, and project guidance',
      icon: MessageSquare,
      badge: 'Beta'
    },
    {
      title: 'Personalized Recommendations',
      description: 'AI curates courses based on your goals, progress, and learning style',
      icon: Target,
      badge: 'AI'
    },
    {
      title: 'Smart Study Plans',
      description: 'Adaptive learning paths that adjust to your pace and performance',
      icon: Brain,
      badge: 'Adaptive'
    },
    {
      title: 'Progress Analytics',
      description: 'AI-powered insights into your learning patterns and skill gaps',
      icon: TrendingUp,
      badge: 'Analytics'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <CourseraStyleHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium text-primary mb-6">
            <Bot className="h-4 w-4" />
            AI-POWERED LEARNING
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Learn Smarter with AI
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Experience the future of learning with our AI-powered features that adapt to your needs and accelerate your progress.
          </p>
          
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            <Sparkles className="h-5 w-5 mr-2" />
            Try AI Features
          </Button>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {aiFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-primary/20 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {feature.title}
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {feature.badge}
                        </Badge>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Experience AI-Powered Learning?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Start your personalized learning journey today
          </p>
          <Button variant="secondary" size="lg">
            <BookOpen className="h-5 w-5 mr-2" />
            Explore Courses
          </Button>
        </div>
      </section>
    </div>
  );
}