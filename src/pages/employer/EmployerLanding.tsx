import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployerAccess } from '@/hooks/useEmployerAccess';
import { 
  FileText, 
  Users, 
  Bot, 
  UserPlus, 
  Clock, 
  Target, 
  Zap, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Plus,
  BarChart3,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import employerHero from '@/assets/employer-hero.jpg';
import teamCollaboration from '@/assets/team-collaboration.jpg';
import aiMatching from '@/assets/ai-matching.jpg';

const EmployerLanding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasEmployerAccess, isLoading, employerStatus } = useEmployerAccess();

  const features = [
    {
      icon: FileText,
      title: 'Post Unlimited Jobs',
      description: 'Create and manage multiple job postings with no limits'
    },
    {
      icon: BarChart3,
      title: 'Manage Applications in Real Time',
      description: 'Track and manage all applications from one dashboard'
    },
    {
      icon: Bot,
      title: 'AI-Matched Candidate Shortlisting',
      description: 'Get automatically matched with the best candidates'
    },
    {
      icon: UserPlus,
      title: 'Add Up to 5 Hiring Team Members',
      description: 'Collaborate with your team on hiring decisions'
    }
  ];

  const whyTalentXcel = [
    {
      icon: Target,
      title: 'Fast, Targeted Reach',
      description: 'Connect with verified professionals across industries.',
      image: teamCollaboration
    },
    {
      icon: Bot,
      title: 'AI-Powered Job Post Creation',
      description: 'Just enter the role title — we\'ll generate the perfect JD.',
      image: aiMatching
    },
    {
      icon: Zap,
      title: 'Smart Matching, Less Filtering',
      description: 'You see only relevant profiles based on skills and experience.',
      image: aiMatching
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite up to 5 colleagues to manage postings and applicants.',
      image: teamCollaboration
    }
  ];

  const renderAccessStatus = () => {
    if (!user) {
      return (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Start Hiring?</h3>
            <p className="text-blue-700 mb-4">Sign up or log in to request employer access</p>
            <div className="space-x-4">
              <Button onClick={() => navigate('/auth/register')} className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
              <Button variant="outline" onClick={() => navigate('/auth/login')}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking access status...</p>
          </CardContent>
        </Card>
      );
    }

    if (hasEmployerAccess) {
      return (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Access Granted</h3>
            <p className="text-green-700 mb-4">You're all set to start hiring!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Button 
                onClick={() => {
                  navigate('/employer/dashboard');
                  toast.success('Navigating to Employer Dashboard');
                }} 
                className="bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                size="lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Employer Dashboard
              </Button>
              <Button 
                onClick={() => {
                  navigate('/jobs/post');
                  toast.success('Opening Job Posting Form');
                }} 
                variant="outline" 
                className="border-green-600 text-green-700 hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Button>
              <Button 
                onClick={() => {
                  navigate('/employer/team');
                  toast.success('Opening Team Management');
                }}
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md"
                size="lg"
              >
                <Users className="h-4 w-4 mr-2" />
                Invite Team
              </Button>
              <Button 
                onClick={() => {
                  navigate('/employer/applications');
                  toast.success('Loading Job Applications');
                }}
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md"
                size="lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Applications
              </Button>
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  navigate('/employer/request-access');
                  toast.success('🔵 Become an Employer - Access Request');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                size="lg"
              >
                <Building2 className="h-4 w-4 mr-2" />
                🔵 Become an Employer
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (employerStatus === 'pending') {
      return (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">⏳ Your Employer Access request is under review.</h3>
            <p className="text-yellow-700 mb-4">We'll notify you once approved (usually within 24 hours)</p>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
              <Button variant="outline" onClick={() => navigate('/contact')}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">👔 Request Employer Access</h3>
          <p className="text-blue-700 mb-4">Get started with posting jobs and finding talent</p>
          <Button onClick={() => navigate('/employer/request-access')} className="bg-blue-600 hover:bg-blue-700">
            Request Access
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-md">
                  <img 
                    src="/talentxcel-official-logo.png" 
                    alt="TalentXcel" 
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                    Become an Employer with{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      TalentXcel AI
                    </span>
                  </h1>
                </div>
              </div>
              <p className="text-xl text-gray-600 mb-8">
                AI-powered hiring that connects you with top talent instantly — Driven by TalentXcel AI intelligence
              </p>
              
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 shadow-md hover:shadow-lg transition-all"
                  onClick={() => navigate('/employer/request-access')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Request Employer Access
                </Button>
                <div className="flex items-center text-sm font-medium text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-slate-500" />
                  Approval within 24 hours
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={employerHero} 
                alt="Professional employer dashboard" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">5-12 hours</p>
                    <p className="text-sm text-gray-600">Avg. first application</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Status Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderAccessStatus()}
        </div>
      </section>

      {/* Why Use TalentXcel Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🔸 Why Use TalentXcel to Hire?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to find, connect with, and hire the best talent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {whyTalentXcel.map((item, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-xl">
                    <item.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOMO Section */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              🔺 Don't Miss Out
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="bg-white border-orange-200">
                <CardContent className="p-8 text-center">
                  <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Target className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    📢 Most job posts get their first 5 applications within 6–12 hours.
                  </h3>
                  <p className="text-gray-600">
                    Our active professional network means faster results for your hiring needs.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-red-200">
                <CardContent className="p-8 text-center">
                  <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    ⚠️ Employer access is manually verified to ensure platform quality.
                  </h3>
                  <p className="text-gray-600">
                    Don't delay if you're hiring soon. Request access today!
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                onClick={() => navigate('/employer/request-access')}
              >
                🔵 Become an Employer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Ready to Find Your Next Great Hire?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of employers who trust TalentXcel to find the best talent in India.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => navigate('/employer/request-access')}
            >
              Get Started Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => navigate('/companies')}
            >
              View Success Stories
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployerLanding;