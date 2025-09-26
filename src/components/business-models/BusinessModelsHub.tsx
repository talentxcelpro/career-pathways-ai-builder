import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Briefcase, 
  Users, 
  GraduationCap, 
  TrendingUp,
  Star,
  Rocket,
  Zap,
  Target,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Wallet,
  Brain,
  Shield,
  Award,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BusinessModelsHub: React.FC = () => {
  const businessModels = [
    {
      id: 'skills',
      title: 'Skills Marketplace',
      status: 'Popular',
      statusColor: 'bg-red-500',
      icon: BookOpen,
      gradient: 'from-blue-500 to-blue-600',
      earning: '₹15,000 – ₹1,00,000+/month',
      description: 'Monetize your expertise by teaching others.',
      whyHelps: [
        'Converts your knowledge into an income source',
        'Builds a personal brand as a trainer or industry expert',
        'Gives you a scalable model: teach 1-to-1, group sessions, or even upload courses',
        'Creates credibility that opens consulting, speaking, and job offers'
      ],
      howWorks: [
        'List Your Skill → Add description, pricing/credits, and availability',
        'AI Matchmaking → System recommends you to learners who need your skill',
        'Sessions → Deliver live 1:1, group classes, or pre-recorded lessons',
        'Earnings → Earn credits or direct payouts to your wallet'
      ],
      trending: 'AI/ML, coding, design, finance, marketing',
      useCase: 'A digital marketer teaches SEO to fresh graduates for 2 hours daily, earning extra ₹25,000/month while building their coaching portfolio.'
    },
    {
      id: 'gigs',
      title: 'Micro Gigs',
      status: 'Trending',
      statusColor: 'bg-green-500',
      icon: Briefcase,
      gradient: 'from-green-500 to-green-600',
      earning: '₹10,000 – ₹75,000/month',
      description: 'Quick, short-term freelance tasks.',
      whyHelps: [
        'Provides fast income with no long contracts',
        'Great for students and side hustlers who want flexible work',
        'Lets you build a portfolio to attract bigger projects',
        'Companies benefit from quick, affordable talent'
      ],
      howWorks: [
        'Post or Browse Gigs → Small jobs like design, writing, coding',
        'AI Match → Suggests the right professionals instantly',
        'Work & Deliver → Complete in 1–3 days',
        'Instant Payment → Escrow ensures secure payouts'
      ],
      trending: 'graphic design, content writing, web development',
      useCase: 'A student completes 10 content writing gigs in a month, earning ₹18,000 and building a writing portfolio to secure a full-time internship.'
    },
    {
      id: 'mentorship',
      title: 'Mentorship Exchange',
      status: 'Premium',
      statusColor: 'bg-purple-500',
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      earning: '₹20,000 – ₹1,20,000/month',
      description: 'Connect with mentors and mentees for career growth.',
      whyHelps: [
        'For mentors: earn while giving back & grow influence',
        'For mentees: career shortcuts by learning directly from experts',
        'Boosts credibility with verified mentor badges',
        'Opens doors to jobs, collaborations, and partnerships'
      ],
      howWorks: [
        'Sign Up as mentor/mentee',
        'AI Match → System suggests mentors/mentees by industry & goals',
        'Book Sessions → Video, chat, or structured programs',
        'Earn/Invest → Mentors earn; mentees gain skills + insights'
      ],
      trending: 'Mentees: Get career acceleration that\'s 10x cheaper than coaching firms',
      useCase: 'A mid-level IT manager mentors 5 freshers per month, earning ₹35,000 extra while being recognized as a thought leader in the community.'
    },
    {
      id: 'learn',
      title: 'Learn & Earn',
      status: 'New',
      statusColor: 'bg-orange-500',
      icon: GraduationCap,
      gradient: 'from-orange-500 to-orange-600',
      earning: '₹5,000 – ₹25,000/month',
      description: 'Earn rewards while building new skills.',
      whyHelps: [
        'Removes financial stress of learning by rewarding progress',
        'Keeps you motivated through gamified learning',
        'Turns your practice projects into earnings',
        'Builds a portfolio + certificates to unlock jobs and gigs'
      ],
      howWorks: [
        'Join a Learning Path → e.g., AI, Digital Marketing, Finance',
        'Complete Milestones → Courses, projects, and assessments',
        'Earn Rewards → Credits, discounts, or cash bonuses',
        'Showcase → Add certificates to your profile to attract jobs'
      ],
      trending: 'Growth +67% as more learners join',
      useCase: 'A fresher completes a Data Analytics learning path, earns rewards worth ₹7,500, and uses their new certificate to secure an internship.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iaHNsKHZhcigtLXByaW1hcnkpIC8gMC4xKSIvPgo8L3N2Zz4K')] opacity-30"></div>
        
        <div className="container mx-auto px-6 py-20 relative">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">TalentXcel Business Models</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Unlock Multiple
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> Revenue Streams</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              📈 <strong>Overall Potential:</strong> Earn up to ₹1,00,000+ per month while building your skills, brand, and network.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Business Models Grid */}
        <div className="space-y-16">
          {businessModels.map((model, index) => {
            const IconComponent = model.icon;
            
            return (
              <Card key={model.id} className="overflow-hidden border-0 shadow-lg bg-background/80 backdrop-blur-sm">
                <CardHeader className="pb-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-4 rounded-2xl text-white bg-gradient-to-br",
                        model.gradient
                      )}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold">{index + 1}. {model.title}</h2>
                          <Badge className={cn("text-white", model.statusColor)}>
                            {model.status}
                          </Badge>
                        </div>
                        <p className="text-lg text-muted-foreground">{model.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Why It Helps You */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <h3 className="text-xl font-semibold">Why It Helps You</h3>
                      </div>
                      <ul className="space-y-3">
                        {model.whyHelps.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* How It Works */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-500" />
                        <h3 className="text-xl font-semibold">How It Works</h3>
                      </div>
                      <ul className="space-y-3">
                        {model.howWorks.map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <span className="text-muted-foreground">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Earnings and Stats */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-600">Potential</span>
                        </div>
                        <p className="text-lg font-bold text-green-700">{model.earning}</p>
                        <p className="text-sm text-muted-foreground">depending on hours & expertise</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-blue-600">Top Trending</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{model.trending}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Target className="h-5 w-5 text-purple-600" />
                          <span className="font-semibold text-purple-600">Use Case</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Use Case Example */}
                  <div className="bg-accent/20 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-accent/40 rounded-full p-2">
                        <Sparkles className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">📌 Use Case</h4>
                        <p className="text-muted-foreground">{model.useCase}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Cross-Platform Value */}
        <Card className="mt-16 overflow-hidden border-0 shadow-xl bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <Rocket className="h-8 w-8 text-primary" />
              Cross-Platform Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 mx-auto w-fit">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">Unified Wallet</h3>
                <p className="text-sm text-muted-foreground">Credits, rewards, and payouts managed in one place</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 mx-auto w-fit">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">AI-Powered Recommendations</h3>
                <p className="text-sm text-muted-foreground">Suggests gigs, mentors, or skills based on your profile</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 mx-auto w-fit">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">Gamified Growth</h3>
                <p className="text-sm text-muted-foreground">Leader boards, streak rewards, and community badges</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 mx-auto w-fit">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">Trust & Verification</h3>
                <p className="text-sm text-muted-foreground">Verified mentors, gigs, and skills boost credibility</p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Community Tie-in → Showcase skills, projects, and mentorship inside /network/communities</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Ready to Start Earning?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals already building multiple revenue streams on TalentXcel
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Rocket className="mr-2 h-5 w-5" />
                Get Started Today
              </Button>
              <Button size="lg" variant="outline">
                <Users className="mr-2 h-5 w-5" />
                Join Community
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelsHub;