import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Search, 
  Brain,
  Target,
  BarChart3,
  Shield,
  UserPlus,
  Award,
  Briefcase,
  Globe,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';

export const EnterpriseSolutions: React.FC = () => {
  const [selectedSolution, setSelectedSolution] = useState<string>('mobility');

  const solutions = [
    {
      id: 'mobility',
      title: 'AI-Powered Internal Mobility & Career Pathing',
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      description: 'Identify and develop your existing employees with AI-driven career recommendations.',
      longDescription: 'A comprehensive service for large organizations to analyze employee skills and performance data, recommending internal job openings and learning opportunities that align with career goals and company needs.',
      benefits: [
        'Reduce employee turnover by 40%',
        'Fill open roles 60% faster internally',
        'Build culture of continuous learning',
        'Increase employee satisfaction scores',
        'Optimize talent utilization across departments'
      ],
      features: [
        'AI skill gap analysis',
        'Personalized career path recommendations',
        'Internal job matching algorithm',
        'Learning opportunity suggestions',
        'Performance-based insights',
        'Manager dashboard for talent development'
      ],
      pricing: {
        starter: '$5 per employee/month',
        enterprise: 'Custom pricing',
        features: ['Up to 500 employees', 'Basic analytics', 'Email support']
      }
    },
    {
      id: 'training',
      title: 'Skill Gap Analysis & Corporate Training',
      icon: <Brain className="h-8 w-8 text-primary" />,
      description: 'Analyze workforce skills and recommend targeted training programs from curated marketplace.',
      longDescription: 'Advanced workforce analysis tool that identifies critical skill gaps and facilitates training programs through a curated marketplace of education providers, transforming your organization into a learning powerhouse.',
      benefits: [
        'Identify skill gaps with 95% accuracy',
        'Access 500+ certified training providers',
        'Reduce training costs by 30%',
        'Track ROI on training investments',
        'Future-proof your workforce'
      ],
      features: [
        'AI-powered skill assessment',
        'Customized training recommendations',
        'Integrated learning marketplace',
        'Progress tracking and analytics',
        'Certification management',
        'Budget optimization tools'
      ],
      pricing: {
        starter: '$8 per employee/month',
        enterprise: 'Custom pricing',
        features: ['Skill assessments', 'Training marketplace', 'Basic reporting']
      }
    },
    {
      id: 'analytics',
      title: 'Talent Analytics & Workforce Planning',
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      description: 'Real-time talent insights for C-suite executives and HR leaders with predictive analytics.',
      longDescription: 'Comprehensive dashboard providing real-time insights into talent acquisition trends, retention rates, diversity metrics, and market intelligence to drive strategic decision-making.',
      benefits: [
        'Make data-driven hiring decisions',
        'Predict future talent needs',
        'Improve retention by 35%',
        'Optimize compensation strategies',
        'Track diversity and inclusion progress'
      ],
      features: [
        'Real-time talent dashboards',
        'Predictive workforce analytics',
        'Market intelligence reports',
        'Diversity and inclusion metrics',
        'Retention risk analysis',
        'Compensation benchmarking'
      ],
      pricing: {
        starter: '$12 per employee/month',
        enterprise: 'Custom pricing',
        features: ['Advanced analytics', 'Predictive insights', 'Custom reports']
      }
    },
    {
      id: 'recruitment',
      title: 'Specialized Recruitment & Freelancer Platform',
      icon: <UserPlus className="h-8 w-8 text-primary" />,
      description: 'Curated marketplace for niche skills and freelance talent with verified credentials.',
      longDescription: 'Dedicated platform for finding specialized talent in high-demand areas like AI, data science, and cybersecurity, plus a comprehensive freelancer marketplace leveraging verified Career Passports.',
      benefits: [
        'Access to pre-vetted specialist talent',
        'Reduce time-to-hire by 50%',
        'Lower recruitment costs',
        'Tap into global freelance market',
        'Verified credentials and portfolios'
      ],
      features: [
        'Specialized talent pools',
        'AI-powered candidate matching',
        'Verified Career Passports',
        'Project-based hiring tools',
        'Freelancer management system',
        'Quality assurance protocols'
      ],
      pricing: {
        starter: 'Per hire fee: $2,500',
        enterprise: 'Custom pricing',
        features: ['Unlimited searches', 'Dedicated support', 'Custom integrations']
      }
    }
  ];

  const selectedSol = solutions.find(sol => sol.id === selectedSolution);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Enterprise Solutions
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 font-display">
            Transform Your Organization with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI-Powered </span>
            Talent Solutions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive B2B services that revolutionize how you manage, develop, and recruit talent. 
            From internal mobility to workforce analytics, we've got your enterprise covered.
          </p>
        </div>

        {/* Solutions Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {solutions.map((solution) => (
            <Card 
              key={solution.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                selectedSolution === solution.id ? 'ring-2 ring-primary shadow-xl' : ''
              }`}
              onClick={() => setSelectedSolution(solution.id)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  {solution.icon}
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                  {solution.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {solution.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant={selectedSolution === solution.id ? "default" : "outline"} 
                  className="w-full"
                  size="sm"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Solution View */}
        {selectedSol && (
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 rounded-full">
                    {selectedSol.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 font-display">
                    {selectedSol.title}
                  </h2>
                </div>
                
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {selectedSol.longDescription}
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Key Benefits
                  </h3>
                  <ul className="space-y-3">
                    {selectedSol.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Starting from</h4>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {selectedSol.pricing.starter}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedSol.pricing.features.join(' • ')}
                  </p>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Core Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {selectedSol.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Demo/Preview Area */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                  <h4 className="font-semibold mb-3">See It In Action</h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Schedule a personalized demo to see how {selectedSol.title.toLowerCase()} can transform your organization.
                  </p>
                  <Button variant="secondary" className="w-full bg-white text-gray-900 hover:bg-gray-100">
                    Schedule Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Why Choose TalentXcel Enterprise */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-display">
              Why Choose TalentXcel Enterprise?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're not just another HR tech company. We're your strategic talent partner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-First Approach</h3>
              <p className="text-gray-600">
                Cutting-edge AI algorithms trained on millions of career data points for unmatched accuracy.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Enterprise Security</h3>
              <p className="text-gray-600">
                Bank-level security with SOC 2 compliance and enterprise-grade data protection.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Scale</h3>
              <p className="text-gray-600">
                Serving enterprises across 50+ countries with 24/7 support and localized solutions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-display">
            Ready to Transform Your Talent Strategy?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ enterprises already using TalentXcel to revolutionize their workforce.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Schedule Enterprise Demo
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Download Enterprise Brochure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};