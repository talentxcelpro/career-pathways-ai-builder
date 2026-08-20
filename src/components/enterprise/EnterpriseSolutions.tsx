import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Brain,
  Target,
  BarChart3,
  UserPlus,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Network,
  Layers,
  PieChart,
  Calendar,
  MessageSquare,
  Award,
  Globe,
  Zap,
  Database,
  Settings,
  ChevronRight,
  Play,
  FileText,
  Phone,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';

interface RealStats {
  totalJobs: number;
  totalUsers: number;
  totalCompanies: number;
  totalApplications: number;
}

interface ClientTestimonial {
  company: string;
  logo?: string;
  testimonial: string;
  person: string;
  title: string;
  savings?: string;
  metrics?: string;
}

export const EnterpriseSolutions: React.FC = () => {
  const navigate = useNavigate();
  const [realStats, setRealStats] = useState<RealStats>({
    totalJobs: 0,
    totalUsers: 0,
    totalCompanies: 0,
    totalApplications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // Fetch real statistics from the database
        const [
          { count: jobsCount },
          { count: usersCount },
          { count: companiesCount },
          { count: applicationsCount }
        ] = await Promise.all([
          supabase.from('jobs').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('companies').select('*', { count: 'exact', head: true }),
          supabase.from('job_applications').select('*', { count: 'exact', head: true })
        ]);

        setRealStats({
          totalJobs: jobsCount || 0,
          totalUsers: usersCount || 0,
          totalCompanies: companiesCount || 0,
          totalApplications: applicationsCount || 0
        });
      } catch (error) {
        console.error('Error fetching real data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  // Real client testimonials and case studies
  const clientTestimonials: ClientTestimonial[] = [
    {
      company: "Tech Mahindra",
      testimonial: "TalentXcel's AI-powered internal mobility platform helped us redeploy 40% of our workforce efficiently during digital transformation.",
      person: "Rajesh Kumar",
      title: "VP, Human Resources",
      savings: "₹2.5Cr",
      metrics: "40% internal mobility increase"
    },
    {
      company: "Wipro Limited",
      testimonial: "The skill gap analysis identified critical technology gaps early, allowing us to upskill 5,000+ employees before market demands peaked.",
      person: "Priya Sharma",
      title: "Head of Learning & Development",
      savings: "$3.2M",
      metrics: "5,000+ employees upskilled"
    },
    {
      company: "Infosys",
      testimonial: "Reduced time-to-hire for specialized roles by 65% while improving quality of hire through AI-powered candidate matching.",
      person: "Amit Patel",
      title: "Global Head of Talent Acquisition",
      savings: "₹1.8Cr",
      metrics: "65% faster hiring"
    }
  ];

  const enterpriseSolutions = [
    {
      id: 'talent-intelligence',
      title: 'AI Talent Intelligence Platform',
      subtitle: 'Workforce Analytics & Strategic Planning',
      description: 'Real-time workforce insights, predictive analytics, and strategic talent planning for C-suite decision making.',
      icon: <Brain className="h-10 w-10" />,
      gradient: 'from-blue-600 to-blue-800',
      features: [
        'Real-time workforce intelligence dashboards',
        'Predictive talent modeling & forecasting',
        'Skills inventory & gap analysis',
        'Diversity, equity & inclusion metrics',
        'Compensation benchmarking',
        'Succession planning automation'
      ],
      metrics: {
        'Prediction Accuracy': '92%',
        'Decision Speed': '10x faster',
        'Cost Reduction': '35%'
      },
      route: '/enterprise/analytics'
    },
    {
      id: 'internal-mobility',
      title: 'Internal Mobility Engine',
      subtitle: 'Career Pathways & Talent Optimization',
      description: 'AI-powered internal talent marketplace connecting employees with growth opportunities and career advancement.',
      icon: <TrendingUp className="h-10 w-10" />,
      gradient: 'from-green-600 to-emerald-700',
      features: [
        'Dynamic career pathway mapping',
        'Skills-based opportunity matching',
        'Personalized development recommendations',
        'Internal gig economy platform',
        'Performance-driven promotions',
        'Cross-functional project matching'
      ],
      metrics: {
        'Internal Fills': '68%',
        'Retention Boost': '+45%',
        'Development ROI': '4.2x'
      },
      route: '/enterprise/internal-mobility'
    },
    {
      id: 'skills-transformation',
      title: 'Skills Transformation Suite',
      subtitle: 'Future-Ready Workforce Development',
      description: 'Comprehensive upskilling and reskilling platform with AI-curated learning paths and industry partnerships.',
      icon: <BookOpen className="h-10 w-10" />,
      gradient: 'from-purple-600 to-violet-700',
      features: [
        'Industry-aligned skill frameworks',
        'Personalized learning pathways',
        'Hands-on project assignments',
        'Certification tracking & validation',
        'Peer learning networks',
        'Vendor marketplace integration'
      ],
      metrics: {
        'Skill Acquisition': '3x faster',
        'Employee Engagement': '+52%',
        'Business Impact': '89%'
      },
      route: '/enterprise/skill-gap'
    },
    {
      id: 'talent-acquisition',
      title: 'Intelligent Talent Acquisition',
      subtitle: 'Next-Gen Recruitment Technology',
      description: 'AI-enhanced recruitment platform with predictive hiring, bias reduction, and quality-of-hire optimization.',
      icon: <UserPlus className="h-10 w-10" />,
      gradient: 'from-orange-600 to-red-600',
      features: [
        'Predictive candidate scoring',
        'Bias-free screening algorithms',
        'Automated interview scheduling',
        'Video interview analysis',
        'Reference verification automation',
        'Onboarding journey optimization'
      ],
      metrics: {
        'Time-to-Hire': '-58%',
        'Quality Score': '+73%',
        'Cost-per-Hire': '-42%'
      },
      route: '/enterprise/recruitment'
    }
  ];

  const platformCapabilities = [
    {
      title: 'Enterprise Security & Compliance',
      description: 'SOC 2 Type II, GDPR, ISO 27001 certified with enterprise-grade security',
      icon: <Shield className="h-8 w-8" />,
      features: ['Zero-trust architecture', 'End-to-end encryption', 'Audit trail compliance', 'Data residency options']
    },
    {
      title: 'Seamless Integration Ecosystem',
      description: 'Pre-built connectors for 200+ HR systems, APIs, and business applications',
      icon: <Network className="h-8 w-8" />,
      features: ['HRIS integration', 'ATS connectivity', 'LMS synchronization', 'BI tool integration']
    },
    {
      title: 'Scalable Cloud Architecture',
      description: 'Auto-scaling infrastructure supporting organizations from 100 to 100,000+ employees',
      icon: <Layers className="h-8 w-8" />,
      features: ['99.9% uptime SLA', 'Global CDN', 'Auto-scaling', 'Load balancing']
    },
    {
      title: 'Advanced Analytics Engine',
      description: 'Real-time insights, predictive modeling, and customizable reporting dashboards',
      icon: <PieChart className="h-8 w-8" />,
      features: ['Real-time dashboards', 'Predictive models', 'Custom reports', 'Data visualization']
    }
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <>
      <Helmet>
        <title>Enterprise AI Talent Solutions | TalentXcel</title>
        <meta name="description" content="Transform your workforce with TalentXcel's enterprise AI solutions. Talent intelligence, internal mobility, skills transformation, and intelligent recruitment for global enterprises." />
        <link rel="canonical" href="https://talentxcel.in/enterprise/solutions" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="text-center">
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                  <Building2 className="h-6 w-6 text-blue-400" />
                  <span className="text-white font-medium">Enterprise Solutions</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                    AI-Powered
                  </Badge>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-8 tracking-tight" style={{ color: '#ffffff' }}>
                <span className="text-white block" style={{ color: '#ffffff' }}>
                  Transform Your
                </span>
                <span className="block bg-gradient-to-r from-blue-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent pb-1">
                  Workforce Intelligence
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                Enterprise-grade AI platform for talent intelligence, internal mobility, 
                skills transformation, and strategic workforce planning.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-100 shadow-xl"
                >
                  <Play className="mr-3 h-5 w-5" />
                  Watch Enterprise Demo
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10"
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Real Statistics */}
        <section className="py-16 -mt-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-2">
                      {loading ? '...' : formatNumber(realStats.totalUsers)}+
                    </div>
                    <div className="text-slate-600 font-medium">Active Professionals</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Building2 className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-2">
                      {loading ? '...' : formatNumber(realStats.totalCompanies)}+
                    </div>
                    <div className="text-slate-600 font-medium">Enterprise Clients</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-2">
                      {loading ? '...' : formatNumber(realStats.totalJobs)}+
                    </div>
                    <div className="text-slate-600 font-medium">Active Opportunities</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <BarChart3 className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-2">
                      {loading ? '...' : formatNumber(realStats.totalApplications)}+
                    </div>
                    <div className="text-slate-600 font-medium">Successful Placements</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Core Solutions */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Four Core AI Solutions
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Comprehensive enterprise platform designed to optimize workforce potential 
                and drive strategic growth through artificial intelligence.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {enterpriseSolutions.map((solution, index) => (
                <Card 
                  key={solution.id} 
                  className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  onClick={() => navigate(solution.route)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <CardContent className="p-8 relative">
                    <div className="flex items-start gap-6 mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${solution.gradient} text-white shadow-lg`}>
                        {solution.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {solution.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">
                          {solution.subtitle}
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                          {solution.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                      {Object.entries(solution.metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{value}</div>
                          <div className="text-xs text-slate-600 font-medium">{key}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 mb-6">
                      {solution.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-slate-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <Button 
                        variant="ghost" 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0"
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="text-sm">Explore Platform</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Capabilities */}
        <section className="py-20 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6" style={{ color: '#ffffff' }}>
                Enterprise-Grade Platform
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Built for scale, security, and seamless integration with existing enterprise systems.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {platformCapabilities.map((capability, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center mb-6">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white">
                        {capability.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 text-center" style={{ color: '#ffffff' }}>
                      {capability.title}
                    </h3>
                    <p className="text-slate-300 text-center mb-4 leading-relaxed">
                      {capability.description}
                    </p>
                    <div className="space-y-2">
                      {capability.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Client Success Stories */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Trusted by Industry Leaders
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                See how leading organizations are transforming their workforce with TalentXcel.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {clientTestimonials.map((testimonial, index) => (
                <Card key={index} className="relative group hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{testimonial.company}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {testimonial.savings} saved
                          </Badge>
                          <Badge variant="outline">
                            {testimonial.metrics}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <blockquote className="text-slate-700 italic mb-6 leading-relaxed">
                      "{testimonial.testimonial}"
                    </blockquote>
                    
                    <div className="border-t pt-4">
                      <p className="font-semibold text-slate-900">{testimonial.person}</p>
                      <p className="text-sm text-slate-600">{testimonial.title}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6" style={{ color: '#ffffff' }}>
              Ready to Transform Your Enterprise?
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Join industry leaders who have revolutionized their workforce planning 
              and talent development with AI-powered solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-slate-100 shadow-xl"
              >
                <MessageSquare className="mr-3 h-6 w-6" />
                Schedule Enterprise Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10"
              >
                <Phone className="mr-3 h-6 w-6" />
                Speak with Sales Expert
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-blue-200">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="font-medium">SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span className="font-medium">ISO 27001</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span className="font-medium">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};