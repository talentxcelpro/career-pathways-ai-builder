import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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
  Sparkles,
  Play,
  MessageSquare,
  FileText,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BusinessModelsHub: React.FC = () => {
  const [activeModel, setActiveModel] = useState<string | null>(null);

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
      route: '/marketplace/post-service',
      actionText: 'Start Teaching',
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
      route: '/services',
      actionText: 'Browse Gigs',
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
      route: '/network',
      actionText: 'Find Mentors',
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
      route: '/learning',
      actionText: 'Start Learning',
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

  const crossPlatformFeatures = [
    {
      icon: Wallet,
      title: 'Unified Wallet',
      description: 'Credits, rewards, and payouts managed in one place',
      link: '/dashboard',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Brain,
      title: 'AI-Powered Recommendations',
      description: 'Suggests gigs, mentors, or skills based on your profile',
      link: '/dashboard',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Award,
      title: 'Gamified Growth',
      description: 'Leader boards, streak rewards, and community badges',
      link: '/dashboard',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Shield,
      title: 'Trust & Verification',
      description: 'Verified mentors, gigs, and skills boost credibility',
      link: '/profile',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      {/* Apple-inspired Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent)] opacity-50"></div>
        
        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-xl rounded-full px-3 py-1.5 border border-border/20 shadow-sm">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">TalentXcel Business Models</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
              Unlock Multiple
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> Revenue Streams</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              📈 <strong>Overall Potential:</strong> Earn up to ₹1,00,000+ per month while building your skills, brand, and network.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Link to="/marketplace/post-service">
                <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-6 py-2 shadow-sm">
                  <Rocket className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              </Link>
              <Link to="/learning">
                <Button variant="outline" className="rounded-full border-border/20 text-sm px-6 py-2 shadow-sm">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Business Models Grid */}
        <div className="space-y-12">
          {businessModels.map((model, index) => {
            const IconComponent = model.icon;
            const isExpanded = activeModel === model.id;
            
            return (
              <Card 
                key={model.id} 
                className={cn(
                  "overflow-hidden border-0 shadow-sm bg-background/80 backdrop-blur-xl transition-all duration-500 hover:shadow-lg cursor-pointer",
                  isExpanded && "shadow-xl"
                )}
                onClick={() => setActiveModel(isExpanded ? null : model.id)}
              >
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-xl text-white bg-gradient-to-br shadow-sm",
                        model.gradient
                      )}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-xl font-semibold tracking-tight">{index + 1}. {model.title}</h2>
                          <Badge className={cn("text-white text-xs px-2 py-0.5", model.statusColor)}>
                            {model.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{model.description}</p>
                      </div>
                    </div>
                    <Link to={model.route}>
                      <Button size="sm" className="rounded-full text-xs px-4 py-1.5 shadow-sm">
                        {model.actionText}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-6 pt-0">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Why It Helps You */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <h3 className="text-sm font-semibold">Why It Helps You</h3>
                        </div>
                        <ul className="space-y-2">
                          {model.whyHelps.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                              <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* How It Works */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          <h3 className="text-sm font-semibold">How It Works</h3>
                        </div>
                        <ul className="space-y-2">
                          {model.howWorks.map((step, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="bg-primary/20 text-primary rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <span className="text-xs text-muted-foreground leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Earnings and Stats */}
                    <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-semibold text-green-600">Potential</span>
                          </div>
                          <p className="text-sm font-bold text-green-700">{model.earning}</p>
                          <p className="text-xs text-muted-foreground">depending on hours & expertise</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-600">Top Trending</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{model.trending}</p>
                        </div>
                        <div className="text-center">
                          <Link to={model.route}>
                            <Button size="sm" variant="outline" className="rounded-full text-xs px-4 py-1.5">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              {model.actionText}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Use Case Example */}
                    <div className="bg-accent/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-accent/20 rounded-full p-1.5">
                          <Sparkles className="h-3 w-3 text-accent-foreground" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold mb-1">📌 Use Case</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{model.useCase}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Cross-Platform Value */}
        <Card className="mt-16 overflow-hidden border-0 shadow-sm bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 backdrop-blur-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-3 tracking-tight">
              <Rocket className="h-6 w-6 text-primary" />
              Cross-Platform Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {crossPlatformFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Link key={index} to={feature.link}>
                    <Card className="text-center space-y-3 p-4 hover:shadow-md transition-all duration-300 cursor-pointer border-0 bg-background/60 backdrop-blur-sm">
                      <div className={cn(
                        "bg-gradient-to-br text-white rounded-xl p-3 mx-auto w-fit shadow-sm",
                        feature.gradient
                      )}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                    </Card>
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-6 text-center">
              <Link to="/network/communities">
                <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-xl rounded-full px-4 py-2 border border-border/20 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                  <Users className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium">Community Tie-in → Showcase skills, projects, and mentorship inside /network/communities</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Section */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/marketplace/post-service">
            <Card className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer border-0 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white rounded-lg p-2">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Teach Skills</h3>
                  <p className="text-xs text-muted-foreground">Start monetizing your expertise</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/services">
            <Card className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer border-0 bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 text-white rounded-lg p-2">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Find Gigs</h3>
                  <p className="text-xs text-muted-foreground">Quick freelance opportunities</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/network">
            <Card className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer border-0 bg-purple-50/50 dark:bg-purple-950/20">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 text-white rounded-lg p-2">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Connect</h3>
                  <p className="text-xs text-muted-foreground">Find mentors & mentees</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/learning">
            <Card className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer border-0 bg-orange-50/50 dark:bg-orange-950/20">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 text-white rounded-lg p-2">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Learn & Earn</h3>
                  <p className="text-xs text-muted-foreground">Get rewarded for learning</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Ready to Start Earning?</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals already building multiple revenue streams on TalentXcel
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/auth/register">
              <Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm px-6 py-2.5 shadow-sm">
                <Rocket className="mr-2 h-4 w-4" />
                Get Started Today
              </Button>
            </Link>
            <Link to="/network/communities">
              <Button size="lg" variant="outline" className="rounded-full border-border/20 text-sm px-6 py-2.5 shadow-sm">
                <Users className="mr-2 h-4 w-4" />
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelsHub;