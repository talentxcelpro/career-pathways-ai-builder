import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Link, 
  ExternalLink, 
  TrendingUp, 
  Target,
  Zap,
  Globe,
  Search,
  Users,
  Building,
  BookOpen,
  Award,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Network,
  Anchor,
  BarChart3,
  Eye,
  Clock,
  Star,
  Share2,
  MessageSquare,
  FileText,
  Briefcase
} from 'lucide-react';

const InterlinkingBacklinkStrategy = () => {
  const [activeTab, setActiveTab] = useState('analysis');

  const currentInterlinkingStatus = {
    score: 65,
    issues: [
      { severity: 'high', issue: 'Missing job-to-company cross-links', impact: 'Low page authority transfer' },
      { severity: 'high', issue: 'No career path interconnections', impact: 'Poor user journey flow' },
      { severity: 'medium', issue: 'Limited skill-to-job linking', impact: 'Missed keyword clustering' },
      { severity: 'medium', issue: 'Shallow profile-to-content links', impact: 'Low engagement depth' },
      { severity: 'low', issue: 'Inconsistent anchor text strategy', impact: 'Suboptimal keyword targeting' }
    ],
    strengths: [
      'Good homepage to main sections linking',
      'Functional breadcrumb navigation',
      'Related jobs suggestions working'
    ]
  };

  const backlinkOpportunities = {
    highPriority: [
      {
        strategy: 'Industry Publications Guest Posts',
        domain: 'HR & Tech Blogs',
        difficulty: 'Medium',
        impact: 'High',
        timeline: '2-4 weeks',
        potential_links: 15,
        examples: ['HRTechnologist.com', 'PeopleHum.com', 'TechHR.in']
      },
      {
        strategy: 'University Career Centers',
        domain: 'Educational Institutions',
        difficulty: 'Low',
        impact: 'High',
        timeline: '1-2 weeks',
        potential_links: 25,
        examples: ['IIT Career Centers', 'IIM Placement Cells', 'Engineering Colleges']
      },
      {
        strategy: 'Startup Directories',
        domain: 'Business Listings',
        difficulty: 'Low',
        impact: 'Medium',
        timeline: '1 week',
        potential_links: 20,
        examples: ['YourStory.com', 'Inc42.com', 'Tracxn.com']
      },
      {
        strategy: 'Tech Community Partnerships',
        domain: 'Developer Communities',
        difficulty: 'Medium',
        impact: 'High',
        timeline: '3-6 weeks',
        potential_links: 12,
        examples: ['Dev.to', 'Hashnode', 'GitNation']
      }
    ],
    contentOpportunities: [
      {
        type: 'Industry Reports',
        title: 'State of Indian Tech Hiring 2024',
        target_sites: ['ETtech', 'LiveMint', 'BusinessStandard'],
        potential_backlinks: 50,
        effort: 'High'
      },
      {
        type: 'Salary Insights',
        title: 'Tech Salary Guide India',
        target_sites: ['Glassdoor', 'PayScale', 'AmbitionBox'],
        potential_backlinks: 30,
        effort: 'Medium'
      },
      {
        type: 'Career Guides',
        title: 'Complete Career Switch Guide',
        target_sites: ['Medium Publications', 'LinkedIn Articles', 'Career Blogs'],
        potential_backlinks: 40,
        effort: 'Medium'
      }
    ]
  };

  const interlinkingStrategy = {
    topical_clusters: [
      {
        cluster: 'Software Engineering Careers',
        pillar_page: '/careers/software-engineering',
        supporting_pages: [
          '/jobs/role/software-engineer',
          '/learning/programming',
          '/tools/coding-interview',
          '/companies/tech-companies',
          '/salary/software-engineer'
        ],
        internal_links_needed: 45,
        priority: 'High'
      },
      {
        cluster: 'Data Science Career Path',
        pillar_page: '/careers/data-science',
        supporting_pages: [
          '/jobs/role/data-scientist',
          '/learning/data-science',
          '/tools/data-analysis',
          '/companies/data-companies',
          '/skills/python-machine-learning'
        ],
        internal_links_needed: 35,
        priority: 'High'
      },
      {
        cluster: 'Product Management',
        pillar_page: '/careers/product-management',
        supporting_pages: [
          '/jobs/role/product-manager',
          '/learning/product-strategy',
          '/tools/product-analytics',
          '/companies/product-companies',
          '/skills/product-management'
        ],
        internal_links_needed: 28,
        priority: 'Medium'
      }
    ],
    contextual_linking: [
      { from: 'Job Posts', to: 'Company Profiles', anchor: 'company_name', priority: 'High' },
      { from: 'Job Posts', to: 'Skill Pages', anchor: 'required_skills', priority: 'High' },
      { from: 'Company Profiles', to: 'Similar Companies', anchor: 'explore_similar', priority: 'Medium' },
      { from: 'User Profiles', to: 'Job Recommendations', anchor: 'view_opportunities', priority: 'High' },
      { from: 'Learning Content', to: 'Job Applications', anchor: 'apply_skills', priority: 'Medium' },
      { from: 'Career Guides', to: 'Resume Builder', anchor: 'build_resume', priority: 'High' }
    ]
  };

  const implementationPlan = {
    phase1: {
      title: 'Foundation (Week 1-2)',
      tasks: [
        'Audit existing internal links',
        'Create topical cluster mapping',
        'Implement contextual linking system',
        'Set up link tracking analytics'
      ]
    },
    phase2: {
      title: 'Content Amplification (Week 3-6)',
      tasks: [
        'Create linkable assets (reports, guides)',
        'Launch university partnership program',
        'Submit to startup directories',
        'Begin guest posting campaign'
      ]
    },
    phase3: {
      title: 'Scale & Automate (Week 7-12)',
      tasks: [
        'Automate internal linking suggestions',
        'Build relationships with industry publications',
        'Create resource pages for link attraction',
        'Implement link monitoring system'
      ]
    }
  };

  const metrics = {
    current: {
      internal_links: 1250,
      external_backlinks: 45,
      referring_domains: 23,
      domain_authority: 28,
      page_authority_avg: 22
    },
    targets_3months: {
      internal_links: 2500,
      external_backlinks: 150,
      referring_domains: 75,
      domain_authority: 40,
      page_authority_avg: 35
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Network className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Interlinking & Backlink Strategy</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Comprehensive SEO linking strategy to boost domain authority and improve search rankings
          </p>
          
          {/* Current Status Alert */}
          <Alert className="border-orange-200 bg-orange-50 max-w-4xl mx-auto">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <AlertDescription className="text-orange-800">
              <strong>Current Link Profile:</strong> 45 backlinks from 23 domains (DA: 28). Significant growth opportunity identified.
            </AlertDescription>
          </Alert>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.current.internal_links}</div>
              <div className="text-sm text-slate-600">Internal Links</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.current.external_backlinks}</div>
              <div className="text-sm text-slate-600">Backlinks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.current.referring_domains}</div>
              <div className="text-sm text-slate-600">Ref Domains</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.current.domain_authority}</div>
              <div className="text-sm text-slate-600">Domain Authority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{currentInterlinkingStatus.score}%</div>
              <div className="text-sm text-slate-600">Link Health</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analysis">Current Analysis</TabsTrigger>
            <TabsTrigger value="interlinking">Internal Linking</TabsTrigger>
            <TabsTrigger value="backlinking">Backlink Strategy</TabsTrigger>
            <TabsTrigger value="content">Content Assets</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Critical Linking Issues
                  </CardTitle>
                  <CardDescription>Issues hurting your SEO performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentInterlinkingStatus.issues.map((issue, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{issue.issue}</h4>
                          <Badge 
                            className={
                              issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                              issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{issue.impact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Link Health Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Link Profile Health
                  </CardTitle>
                  <CardDescription>Overall linking strategy performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Internal Linking Quality</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Backlink Diversity</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Anchor Text Optimization</span>
                      <span className="font-medium">70%</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Link Authority Flow</span>
                      <span className="font-medium">55%</span>
                    </div>
                    <Progress value={55} className="h-2" />
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Quick Wins:</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {currentInterlinkingStatus.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interlinking">
            <div className="space-y-6">
              {/* Topical Clusters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Topical Cluster Strategy
                  </CardTitle>
                  <CardDescription>Organize content into SEO-powerful topic clusters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {interlinkingStrategy.topical_clusters.map((cluster, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-slate-900">{cluster.cluster}</h3>
                          <Badge variant={cluster.priority === 'High' ? 'destructive' : 'secondary'}>
                            {cluster.priority}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-slate-700">Pillar Page:</p>
                            <p className="text-sm text-blue-600">{cluster.pillar_page}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">Supporting Pages:</p>
                            <ul className="text-xs text-slate-600 space-y-1">
                              {cluster.supporting_pages.slice(0, 3).map((page, i) => (
                                <li key={i}>• {page}</li>
                              ))}
                              {cluster.supporting_pages.length > 3 && (
                                <li>• +{cluster.supporting_pages.length - 3} more</li>
                              )}
                            </ul>
                          </div>
                          <div className="pt-2 border-t text-sm">
                            <span className="text-slate-600">Links needed: </span>
                            <span className="font-medium text-orange-600">{cluster.internal_links_needed}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contextual Linking Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5 text-green-500" />
                    Contextual Linking Rules
                  </CardTitle>
                  <CardDescription>Automated internal linking strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {interlinkingStrategy.contextual_linking.map((rule, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-sm font-medium text-slate-900">{rule.from}</div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          <div className="text-sm font-medium text-slate-900">{rule.to}</div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600">
                            <span className="font-medium">Anchor:</span> {rule.anchor}
                          </p>
                          <Badge 
                            size="sm"
                            variant={rule.priority === 'High' ? 'destructive' : 'secondary'}
                          >
                            {rule.priority} Priority
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="backlinking">
            <div className="space-y-6">
              {/* High Priority Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-purple-500" />
                    High-Priority Backlink Opportunities
                  </CardTitle>
                  <CardDescription>Ready-to-execute link building campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {backlinkOpportunities.highPriority.map((opportunity, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-semibold text-slate-900">{opportunity.strategy}</h3>
                          <div className="flex gap-2">
                            <Badge variant="outline">{opportunity.difficulty}</Badge>
                            <Badge 
                              className={
                                opportunity.impact === 'High' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {opportunity.impact} Impact
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-600">Domain Type:</span>
                              <p className="font-medium">{opportunity.domain}</p>
                            </div>
                            <div>
                              <span className="text-slate-600">Timeline:</span>
                              <p className="font-medium">{opportunity.timeline}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-600 text-sm">Potential Links:</span>
                            <span className="font-bold text-blue-600 ml-2">{opportunity.potential_links}</span>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 mb-2">Target Sites:</p>
                            <div className="flex flex-wrap gap-1">
                              {opportunity.examples.map((site, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {site}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Growth Targets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    3-Month Growth Targets
                  </CardTitle>
                  <CardDescription>Projected improvements from link building strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {Object.entries(metrics.targets_3months).map(([metric, target]) => {
                      const current = metrics.current[metric as keyof typeof metrics.current];
                      const growth = Math.round(((target - current) / current) * 100);
                      
                      return (
                        <div key={metric} className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{target}</div>
                          <div className="text-sm text-slate-600 capitalize">
                            {metric.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            +{growth}% growth
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Linkable Content Assets
                </CardTitle>
                <CardDescription>High-value content designed to attract backlinks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {backlinkOpportunities.contentOpportunities.map((content, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">{content.title}</h3>
                        <Badge variant="outline">{content.type}</Badge>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-600 mb-2">Target Publications:</p>
                          <div className="flex flex-wrap gap-1">
                            {content.target_sites.map((site, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {site}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div>
                            <span className="text-sm text-slate-600">Potential Links:</span>
                            <span className="font-bold text-green-600 ml-2">{content.potential_backlinks}</span>
                          </div>
                          <Badge 
                            className={
                              content.effort === 'High' ? 'bg-red-100 text-red-800' :
                              content.effort === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {content.effort} Effort
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementation">
            <div className="space-y-6">
              {Object.entries(implementationPlan).map(([phase, plan]) => (
                <Card key={phase}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      {plan.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.tasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-slate-800">{task}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Implementation CTA */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Ready to Execute Strategy?</h2>
                  <p className="text-slate-600 mb-6">
                    I can implement automated internal linking and launch backlink campaigns immediately.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      Start Internal Linking Automation
                    </Button>
                    <Button size="lg" variant="outline">
                      Launch University Outreach
                    </Button>
                    <Button size="lg" variant="outline">
                      Create Content Assets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InterlinkingBacklinkStrategy;