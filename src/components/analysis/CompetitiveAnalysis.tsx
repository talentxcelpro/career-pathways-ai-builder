import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Brain,
  Users,
  Briefcase,
  Building,
  Target,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Award,
  ArrowRight
} from 'lucide-react';

interface CompetitorData {
  name: string;
  logo: string;
  description: string;
  marketShare: number;
  userBase: string;
  strengths: string[];
  weaknesses: string[];
  keyFeatures: string[];
  pricing: string;
  rating: number;
  color: string;
}

interface FeatureComparison {
  feature: string;
  talentxcel: number;
  naukri: number;
  linkedin: number;
  indeed: number;
  monster: number;
  weight: number;
  description: string;
}

const CompetitiveAnalysis = () => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('naukri');

  const competitors: CompetitorData[] = [
    {
      name: 'Naukri.com',
      logo: '🔍',
      description: 'India\'s largest job portal with 70M+ registered users',
      marketShare: 45,
      userBase: '70M+ users',
      strengths: [
        'Largest database in India',
        'Strong brand recognition',
        'Enterprise partnerships',
        'Regional language support'
      ],
      weaknesses: [
        'Outdated UI/UX',
        'Limited AI features',
        'Cluttered interface',
        'High irrelevant job matches'
      ],
      keyFeatures: [
        'Job search & alerts',
        'Resume database',
        'Company reviews',
        'Salary insights',
        'Career guidance'
      ],
      pricing: 'Freemium + Paid plans',
      rating: 3.8,
      color: 'from-blue-600 to-blue-800'
    },
    {
      name: 'LinkedIn',
      logo: '💼',
      description: 'Global professional networking platform with job opportunities',
      marketShare: 25,
      userBase: '900M+ globally, 100M+ India',
      strengths: [
        'Professional networking',
        'Global reach',
        'Quality candidates',
        'Learning platform',
        'Industry insights'
      ],
      weaknesses: [
        'Complex for job seekers',
        'Premium-focused features',
        'Information overload',
        'Limited India-specific features'
      ],
      keyFeatures: [
        'Professional networking',
        'Job postings',
        'Learning courses',
        'Company pages',
        'Industry insights'
      ],
      pricing: 'Freemium + Premium subscriptions',
      rating: 4.2,
      color: 'from-blue-700 to-indigo-800'
    },
    {
      name: 'Indeed',
      logo: '🎯',
      description: 'Global job search engine with simple job discovery',
      marketShare: 15,
      userBase: '350M+ monthly visitors',
      strengths: [
        'Simple interface',
        'Global presence',
        'Comprehensive search',
        'Company reviews',
        'Salary data'
      ],
      weaknesses: [
        'Limited networking features',
        'Basic resume tools',
        'High competition',
        'Less India-focused'
      ],
      keyFeatures: [
        'Job search engine',
        'Company reviews',
        'Salary insights',
        'Resume builder',
        'Career advice'
      ],
      pricing: 'Free for job seekers',
      rating: 4.0,
      color: 'from-green-600 to-teal-700'
    },
    {
      name: 'Monster India',
      logo: '👹',
      description: 'Veteran job portal with career tools and resources',
      marketShare: 8,
      userBase: '60M+ users',
      strengths: [
        'Career resources',
        'Resume tools',
        'Industry expertise',
        'Career advice'
      ],
      weaknesses: [
        'Declining market share',
        'Outdated platform',
        'Limited innovation',
        'Poor mobile experience'
      ],
      keyFeatures: [
        'Job search',
        'Resume services',
        'Career advice',
        'Skill tests',
        'Salary tools'
      ],
      pricing: 'Freemium model',
      rating: 3.5,
      color: 'from-purple-600 to-purple-800'
    }
  ];

  const featureComparisons: FeatureComparison[] = [
    {
      feature: 'AI-Powered Job Matching',
      talentxcel: 95,
      naukri: 35,
      linkedin: 70,
      indeed: 45,
      monster: 25,
      weight: 20,
      description: 'Intelligent matching using AI algorithms'
    },
    {
      feature: 'User Experience & Design',
      talentxcel: 90,
      naukri: 40,
      linkedin: 75,
      indeed: 80,
      monster: 35,
      weight: 15,
      description: 'Modern, intuitive interface design'
    },
    {
      feature: 'Resume Builder Quality',
      talentxcel: 92,
      naukri: 45,
      linkedin: 60,
      indeed: 55,
      monster: 65,
      weight: 18,
      description: 'Professional resume creation tools'
    },
    {
      feature: 'Mobile Experience',
      talentxcel: 88,
      naukri: 50,
      linkedin: 85,
      indeed: 75,
      monster: 40,
      weight: 12,
      description: 'Mobile app functionality and design'
    },
    {
      feature: 'Career Guidance & AI Chat',
      talentxcel: 95,
      naukri: 30,
      linkedin: 65,
      indeed: 40,
      monster: 50,
      weight: 15,
      description: 'AI-powered career advice and guidance'
    },
    {
      feature: 'Job Database Size',
      talentxcel: 75,
      naukri: 95,
      linkedin: 85,
      indeed: 90,
      monster: 70,
      weight: 10,
      description: 'Number of available job listings'
    },
    {
      feature: 'Innovation & Features',
      talentxcel: 98,
      naukri: 25,
      linkedin: 80,
      indeed: 45,
      monster: 30,
      weight: 10,
      description: 'Cutting-edge features and innovation'
    }
  ];

  const calculateOverallScore = (platform: keyof Omit<FeatureComparison, 'feature' | 'weight' | 'description'>) => {
    const totalWeightedScore = featureComparisons.reduce((sum, comparison) => 
      sum + (comparison[platform] * comparison.weight), 0
    );
    const totalWeight = featureComparisons.reduce((sum, comparison) => sum + comparison.weight, 0);
    return Math.round(totalWeightedScore / totalWeight);
  };

  const talentxcelAdvantages = [
    {
      title: 'AI-First Approach',
      description: 'Built from ground up with AI at the core, unlike retrofitted competitors',
      icon: Brain,
      impact: 'High'
    },
    {
      title: 'Modern Tech Stack',
      description: 'Latest technologies providing faster, more responsive experience',
      icon: Zap,
      impact: 'High'
    },
    {
      title: 'Personalized Experience',
      description: 'Highly personalized job matching and career guidance',
      icon: Target,
      impact: 'High'
    },
    {
      title: 'Comprehensive Career Tools',
      description: 'All-in-one platform for career development',
      icon: Award,
      impact: 'Medium'
    },
    {
      title: 'User-Centric Design',
      description: 'Focus on user experience over feature bloat',
      icon: Users,
      impact: 'Medium'
    }
  ];

  const competitiveThreats = [
    {
      title: 'Brand Recognition',
      description: 'Established competitors have strong brand awareness',
      severity: 'High',
      mitigation: 'Focus on quality and word-of-mouth growth'
    },
    {
      title: 'Network Effects',
      description: 'LinkedIn\'s networking advantage is hard to replicate',
      severity: 'Medium', 
      mitigation: 'Build unique AI-powered networking features'
    },
    {
      title: 'Database Size',
      description: 'Smaller job database compared to Naukri',
      severity: 'Medium',
      mitigation: 'Quality over quantity approach with better matching'
    }
  ];

  const strategicRecommendations = [
    {
      category: 'Differentiation',
      recommendations: [
        'Double down on AI-powered features that competitors can\'t easily replicate',
        'Focus on career guidance and personalized growth paths',
        'Build unique features like AI interview prep and skill gap analysis'
      ]
    },
    {
      category: 'User Acquisition',
      recommendations: [
        'Partner with educational institutions and bootcamps',
        'Create viral referral programs with AI-matched connections',
        'Focus on underserved segments like fresh graduates and career changers'
      ]
    },
    {
      category: 'Product Development', 
      recommendations: [
        'Develop mobile-first features for tier 2/3 cities',
        'Add regional language support with AI translation',
        'Build industry-specific AI models for better matching'
      ]
    },
    {
      category: 'Market Positioning',
      recommendations: [
        'Position as "Future of Career Development" vs traditional job boards',
        'Emphasize AI-powered personalization and career growth',
        'Target tech-savvy professionals and young graduates first'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">TalentXcel Competitive Analysis</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Comprehensive analysis of TalentXcel against major job portals in the Indian market
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="features">Feature Comparison</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
          <TabsTrigger value="advantages">Our Advantages</TabsTrigger>
          <TabsTrigger value="strategy">Strategic Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Market Share */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Indian Job Portal Market Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitors.map((competitor) => (
                  <div key={competitor.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{competitor.logo}</span>
                        <span className="font-medium">{competitor.name}</span>
                        <Badge variant="outline">{competitor.userBase}</Badge>
                      </div>
                      <span className="font-semibold">{competitor.marketShare}%</span>
                    </div>
                    <Progress value={competitor.marketShare} className="h-2" />
                  </div>
                ))}
                <div className="space-y-2 bg-primary/5 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🚀</span>
                      <span className="font-medium">TalentXcel</span>
                      <Badge className="bg-primary">Emerging</Badge>
                    </div>
                    <span className="font-semibold text-primary">Growing 📈</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Positioning for rapid growth with AI-first approach
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Overall Platform Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{calculateOverallScore('talentxcel')}</div>
                  <div className="text-sm font-medium">TalentXcel</div>
                  <div className="text-xs text-muted-foreground">AI-Powered</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{calculateOverallScore('linkedin')}</div>
                  <div className="text-sm font-medium">LinkedIn</div>
                  <div className="text-xs text-muted-foreground">Professional Network</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{calculateOverallScore('indeed')}</div>
                  <div className="text-sm font-medium">Indeed</div>
                  <div className="text-xs text-muted-foreground">Global Reach</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{calculateOverallScore('naukri')}</div>
                  <div className="text-sm font-medium">Naukri</div>
                  <div className="text-xs text-muted-foreground">Market Leader</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{calculateOverallScore('monster')}</div>
                  <div className="text-sm font-medium">Monster</div>
                  <div className="text-xs text-muted-foreground">Traditional</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Feature-by-Feature Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {featureComparisons.map((comparison) => (
                  <div key={comparison.feature} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{comparison.feature}</h3>
                      <Badge variant="outline">Weight: {comparison.weight}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{comparison.description}</p>
                    <div className="grid grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-primary font-medium">TalentXcel</div>
                        <Progress value={comparison.talentxcel} className="h-2" />
                        <div className="text-xs text-center">{comparison.talentxcel}%</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium">LinkedIn</div>
                        <Progress value={comparison.linkedin} className="h-2" />
                        <div className="text-xs text-center">{comparison.linkedin}%</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium">Indeed</div>
                        <Progress value={comparison.indeed} className="h-2" />
                        <div className="text-xs text-center">{comparison.indeed}%</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium">Naukri</div>
                        <Progress value={comparison.naukri} className="h-2" />
                        <div className="text-xs text-center">{comparison.naukri}%</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium">Monster</div>
                        <Progress value={comparison.monster} className="h-2" />
                        <div className="text-xs text-center">{comparison.monster}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {competitors.map((competitor) => (
              <Button
                key={competitor.name}
                variant={selectedCompetitor === competitor.name.toLowerCase().replace('.com', '').replace(' ', '') ? "default" : "outline"}
                onClick={() => setSelectedCompetitor(competitor.name.toLowerCase().replace('.com', '').replace(' ', ''))}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">{competitor.logo}</span>
                <span className="text-sm">{competitor.name}</span>
              </Button>
            ))}
          </div>

          {competitors
            .filter(c => c.name.toLowerCase().replace('.com', '').replace(' ', '') === selectedCompetitor)
            .map((competitor) => (
              <Card key={competitor.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-3xl">{competitor.logo}</span>
                    <div>
                      <h2>{competitor.name}</h2>
                      <p className="text-sm text-muted-foreground font-normal">
                        {competitor.description}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Strengths
                        </h3>
                        <ul className="space-y-1">
                          {competitor.strengths.map((strength, idx) => (
                            <li key={idx} className="text-sm flex items-center gap-2">
                              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Weaknesses
                        </h3>
                        <ul className="space-y-1">
                          {competitor.weaknesses.map((weakness, idx) => (
                            <li key={idx} className="text-sm flex items-center gap-2">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Key Features</h3>
                        <ul className="space-y-1">
                          {competitor.keyFeatures.map((feature, idx) => (
                            <li key={idx} className="text-sm flex items-center gap-2">
                              <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm">User Rating</h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{competitor.rating}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Pricing</h4>
                          <span className="text-sm">{competitor.pricing}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="advantages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                TalentXcel's Competitive Advantages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {talentxcelAdvantages.map((advantage, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-lg bg-primary/5">
                    <div className="flex-shrink-0">
                      <advantage.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{advantage.title}</h3>
                        <Badge variant={advantage.impact === 'High' ? 'default' : 'secondary'}>
                          {advantage.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{advantage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Competitive Threats & Mitigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitiveThreats.map((threat, idx) => (
                  <div key={idx} className="p-4 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{threat.title}</h3>
                      <Badge variant={threat.severity === 'High' ? 'destructive' : 'secondary'}>
                        {threat.severity} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{threat.description}</p>
                    <div className="text-sm">
                      <span className="font-medium text-primary">Mitigation: </span>
                      {threat.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategicRecommendations.map((section, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    {section.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.recommendations.map((recommendation, recIdx) => (
                      <li key={recIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators to Track</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-semibold mb-2">User Acquisition</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Monthly Active Users</li>
                    <li>• User Acquisition Cost</li>
                    <li>• Organic vs Paid growth</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-semibold mb-2">Engagement</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Time spent on platform</li>
                    <li>• Job application rate</li>
                    <li>• Feature adoption rate</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-semibold mb-2">Success Metrics</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Interview conversion rate</li>
                    <li>• Job placement success</li>
                    <li>• User satisfaction score</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompetitiveAnalysis;