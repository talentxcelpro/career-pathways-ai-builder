import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Award,
  Briefcase,
  Globe,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Settings,
  Database,
  Monitor,
  Search,
  GraduationCap,
  Map,
  PieChart,
  GitBranch,
  Layers,
  Network,
  BookOpen,
  Calendar,
  ClipboardList,
  Rocket,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EnterpriseSolutions: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 'internal-mobility',
      title: 'AI-Powered Internal Mobility and Career Pathing',
      description: 'Connect your existing talent with internal opportunities through intelligent matching and skill graphing.',
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200',
      route: '/enterprise/internal-mobility',
      features: [
        'HRIS Integration with anonymized employee data',
        'AI-powered Skill Graph creation for each employee',
        'Intelligent matching engine for internal opportunities',
        'Personalized career development recommendations',
        'Real-time talent pipeline dashboards'
      ],
      process: {
        input: 'Company integrates HRIS with anonymized employee data including skills, work history, performance reviews, and career interests.',
        processing: [
          'Skill Graphing: AI creates comprehensive skill profiles for each employee',
          'Matching Engine: Continuously scans internal opportunities and matches employees',
          'Personalized Recommendations: Delivers targeted notifications for jobs and development'
        ],
        output: 'Dashboard showing internal talent pipelines, reduced recruitment costs, and clear talent readiness metrics.'
      },
      benefits: [
        'Reduce external recruitment costs by 40-60%',
        'Improve employee retention through career growth',
        'Identify high-potential talent automatically',
        'Create clear succession planning pathways'
      ]
    },
    {
      id: 'skill-gap',
      title: 'Skill Gap Analysis and Corporate Training Marketplaces',
      description: 'Proactively address workforce skill shortages with AI-driven analysis and curated training programs.',
      icon: <Brain className="h-8 w-8 text-green-600" />,
      color: 'bg-green-50 border-green-200',
      route: '/enterprise/skill-gap',
      features: [
        'Strategic business goal alignment',
        'Comprehensive workforce skill analysis',
        'Automated gap identification and reporting',
        'Curated training marketplace integration',
        'Automated enrollment and tracking'
      ],
      process: {
        input: 'Company defines strategic business goals and required future skills (data analytics, AI, cloud security, etc.).',
        processing: [
          'Gap Identification: AI analyzes current workforce skills against future needs',
          'Marketplace Curation: Recommends relevant training from vetted providers',
          'Automated Enrollment: Streamlined program enrollment directly from dashboard'
        ],
        output: 'Clear roadmap to upskill workforce with measurable progress tracking and ROI metrics.'
      },
      benefits: [
        'Stay ahead of industry skill requirements',
        'Reduce skill-related project delays by 50%',
        'Access curated training from top providers',
        'Track training ROI and effectiveness'
      ]
    },
    {
      id: 'analytics',
      title: 'Talent Analytics and Workforce Planning',
      description: 'Strategic decision-making tool for HR and C-suite executives with predictive workforce insights.',
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200',
      route: '/enterprise/analytics',
      features: [
        'Real-time workforce data aggregation',
        'Predictive talent modeling and forecasting',
        'Industry benchmarking and comparisons',
        'Strategic planning recommendations',
        'Executive-level insights and reporting'
      ],
      process: {
        input: 'Continuous data collection from internal systems and external market data including salary trends and talent availability.',
        processing: [
          'Data Aggregation: Clean, intuitive dashboard visualization',
          'Predictive Modeling: AI forecasts future talent needs and requirements',
          'Benchmarking: Compare metrics against industry peers and standards'
        ],
        output: 'Actionable insights for long-term talent strategy, hiring plans, compensation, and diversity initiatives.'
      },
      benefits: [
        'Predict future talent needs with 85% accuracy',
        'Optimize compensation and hiring strategies',
        'Benchmark against industry standards',
        'Drive data-informed strategic decisions'
      ]
    },
    {
      id: 'recruitment',
      title: 'Specialized Recruitment and Freelancer Platforms',
      description: 'Leverage Career Passport technology for specialized full-time and project-based hiring.',
      icon: <UserPlus className="h-8 w-8 text-orange-600" />,
      color: 'bg-orange-50 border-orange-200',
      route: '/enterprise/recruitment',
      features: [
        'Hyper-specific talent matching using Career Passports',
        'Verified project history and skills assessment',
        'Integrated freelancer marketplace',
        'End-to-end project management',
        'Streamlined payment processing'
      ],
      process: {
        input: 'Company posts specialized roles (blockchain developer) or project-based contracts (UX design project).',
        processing: [
          'Targeted Matching: AI matches job descriptions with verified Career Passport data',
          'Freelancer Marketplace: Access pre-vetted professionals for project work',
          'Project Management: Handle payments and project oversight seamlessly'
        ],
        output: 'Immediate access to qualified, verified talent pool for both permanent and temporary needs.'
      },
      benefits: [
        'Access to pre-vetted, specialized talent',
        'Reduce hiring time by 70% for specialized roles',
        'Seamless project-based engagement',
        'End-to-end hiring and project management'
      ]
    }
  ];

  const stats = [
    { label: 'Enterprise Clients', value: '250+', icon: <Building2 className="h-5 w-5" /> },
    { label: 'Employees Managed', value: '50K+', icon: <Users className="h-5 w-5" /> },
    { label: 'Skills Tracked', value: '10K+', icon: <Brain className="h-5 w-5" /> },
    { label: 'Cost Savings', value: '$25M+', icon: <Target className="h-5 w-5" /> }
  ];

  const platformFeatures = [
    {
      title: 'Enterprise Security',
      description: 'Bank-grade security with SOC 2 compliance and data encryption',
      icon: <Shield className="h-6 w-6 text-blue-600" />
    },
    {
      title: 'Seamless Integration',
      description: 'Connect with existing HRIS, ATS, and performance management systems',
      icon: <Network className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Scalable Architecture',
      description: 'Built to handle enterprise-scale workforces from 100 to 100,000+ employees',
      icon: <Layers className="h-6 w-6 text-purple-600" />
    },
    {
      title: 'Custom Reporting',
      description: 'Generate custom reports and dashboards tailored to your business needs',
      icon: <PieChart className="h-6 w-6 text-orange-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display">
            TalentXcel Enterprise Solutions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform your organization with AI-powered talent management, strategic workforce planning, 
            and intelligent career development solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-3">
              Schedule Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3">
              View Pricing
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-center mb-2 text-primary">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Core Services Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Four Core AI-Powered Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive talent management tools designed to optimize your workforce and drive strategic growth.
            </p>
          </div>

          <div className="space-y-12">
            {services.map((service, index) => (
              <Card key={service.id} className={`${service.color} transition-all duration-300 hover:shadow-xl`}>
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Service Overview */}
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          {service.icon}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {service.title}
                          </h3>
                          <p className="text-gray-700 text-lg">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      {/* Key Features */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Benefits */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Key Benefits:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {service.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={() => navigate(service.route)}
                        className="w-full sm:w-auto"
                      >
                        Access {service.title.split(' ')[0]} Tool
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    {/* Right Column - Process Flow */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-primary" />
                        How It Works
                      </h4>
                      
                      <div className="space-y-4">
                        {/* Input */}
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h5 className="font-medium text-blue-900 mb-1">Input</h5>
                          <p className="text-sm text-gray-700">{service.process.input}</p>
                        </div>

                        {/* Processing */}
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h5 className="font-medium text-purple-900 mb-2">Processing</h5>
                          <ul className="space-y-1">
                            {service.process.processing.map((step, idx) => (
                              <li key={idx} className="text-sm text-gray-700">
                                • {step}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Output */}
                        <div className="border-l-4 border-green-500 pl-4">
                          <h5 className="font-medium text-green-900 mb-1">Output</h5>
                          <p className="text-sm text-gray-700">{service.process.output}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Platform Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for scale, security, and seamless integration with your existing systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-gray-50 rounded-full">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Talent Management?
            </h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto text-primary-foreground/90">
              Join 250+ enterprise clients who have revolutionized their workforce planning 
              and talent development with TalentXcel's AI-powered solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="px-8 py-3">
                Schedule Enterprise Demo
                <Calendar className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-white border-white hover:bg-white hover:text-primary">
                Contact Sales Team
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};