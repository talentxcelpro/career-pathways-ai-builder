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
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
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
      description: 'Create and publish job postings with instant reach and AI matching'
    },
    {
      icon: BarChart3,
      title: 'Manage Applications in Real Time',
      description: 'Track candidate submissions, ATS scores, and interviews from one dashboard'
    },
    {
      icon: Bot,
      title: 'AI-Matched Candidate Shortlisting',
      description: 'Get automatically matched with verified professionals across India'
    },
    {
      icon: UserPlus,
      title: 'Add Up to 5 Hiring Team Members',
      description: 'Collaborate with your recruitment team with role-based access'
    }
  ];

  const whyTalentXcel = [
    {
      icon: Target,
      title: 'Fast, Targeted Reach',
      description: 'Connect with verified professionals across industries with zero noise.',
      image: teamCollaboration
    },
    {
      icon: Bot,
      title: 'AI-Powered Job Post Creation',
      description: 'Just enter the role title — our engine generates recruiter-grade structured JDs.',
      image: aiMatching
    },
    {
      icon: Zap,
      title: 'Smart Matching, Less Filtering',
      description: 'See only relevant profiles based on real verified skills and capability.',
      image: aiMatching
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members to manage postings, review candidates, and schedule interviews.',
      image: teamCollaboration
    }
  ];

  const renderAccessStatus = () => {
    if (!user) {
      return (
        <Card className="bg-blue-50/80 dark:bg-slate-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6 text-center">
            <Building2 className="h-10 w-10 text-blue-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-blue-950 dark:text-blue-200 mb-1">Ready to Start Hiring?</h3>
            <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">Sign in with your employer account or request hiring access.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/auth/register')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                Get Started
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/auth/login')} className="text-xs">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <Card className="bg-muted/30 border">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-xs text-muted-foreground">Checking employer access status...</p>
          </CardContent>
        </Card>
      );
    }

    if (hasEmployerAccess) {
      return (
        <Card className="bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200 mb-1">
              ✅ Verified Employer Access Active
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-5">
              You are authorized to publish jobs, access candidate pipelines, and manage your hiring team.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                onClick={() => {
                  navigate('/jobs/post');
                  toast.success('Opening Job Posting Form');
                }} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Post a Job Now
              </Button>
              <Button 
                onClick={() => {
                  navigate('/employer/dashboard');
                  toast.success('Navigating to Employer Dashboard');
                }} 
                variant="outline" 
                className="border-emerald-600 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50 text-xs h-9"
              >
                <BarChart3 className="h-4 w-4 mr-1.5" />
                Employer Dashboard
              </Button>
              <Button 
                onClick={() => {
                  navigate('/employer/applications');
                  toast.success('Loading Job Applications');
                }}
                variant="outline"
                className="border-slate-300 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs h-9"
              >
                <FileText className="h-4 w-4 mr-1.5" />
                View Applications
              </Button>
              <Button 
                onClick={() => {
                  navigate('/employer/team');
                  toast.success('Opening Team Management');
                }}
                variant="outline"
                className="border-slate-300 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs h-9"
              >
                <Users className="h-4 w-4 mr-1.5" />
                Manage Team
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (employerStatus === 'pending') {
      return (
        <Card className="bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6 text-center">
            <Clock className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-amber-950 dark:text-amber-200 mb-1">
              ⏳ Employer Access Request Under Review
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-4">
              Your request is queued for verification. Approvals typically complete within 24 hours.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="text-xs">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh Status
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/contact')} className="text-xs">
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-blue-50/80 dark:bg-slate-900 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6 text-center">
          <Building2 className="h-10 w-10 text-blue-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-blue-950 dark:text-blue-200 mb-1">Request Employer Access</h3>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">Get verified to post jobs and search pre-screened technical talent.</p>
          <Button onClick={() => navigate('/employer/request-access')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
            Request Access Now
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Employer Recruitment Portal | Post Jobs & Hire Talent | TalentXcel</title>
        <meta 
          name="description" 
          content="Post jobs, screen ATS-optimized candidates, and build high-velocity engineering teams with TalentXcel AI employer intelligence." 
        />
        <link rel="canonical" href="https://talentxcel.in/employer" />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50/40 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 py-12 md:py-16 border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-md">
                    <img 
                      src="/talentxcel-official-logo.png" 
                      alt="TalentXcel" 
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                      Employer Recruitment Portal
                    </h1>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                  AI-powered hiring that connects you with verified candidates instantly. Publish roles, review ATS scorecards, and hire faster.
                </p>
                
                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                      <div className="bg-blue-100 dark:bg-blue-950/80 p-1.5 rounded-md shrink-0">
                        <feature.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-xs">{feature.title}</h3>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dynamic Hero Action Buttons Based on Real Status */}
                {hasEmployerAccess ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <Button 
                      size="default" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-md hover:shadow-lg transition-all text-xs h-10 gap-1.5"
                      onClick={() => navigate('/jobs/post')}
                    >
                      <Plus className="h-4 w-4" />
                      ⚡ Post a Job Now
                    </Button>
                    <Button 
                      size="default" 
                      variant="outline"
                      className="border-slate-300 dark:border-slate-700 font-semibold px-5 text-xs h-10 gap-1.5"
                      onClick={() => navigate('/employer/dashboard')}
                    >
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      Employer Dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <Button 
                      size="default" 
                      className="bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md hover:shadow-lg transition-all text-xs h-10"
                      onClick={() => navigate('/employer/request-access')}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Request Employer Access
                    </Button>
                    <div className="flex items-center text-xs font-medium text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                      Instant verification for partner accounts
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <img 
                  src={employerHero} 
                  alt="Professional employer dashboard" 
                  className="rounded-2xl shadow-xl border border-border/80 object-cover max-h-[360px] w-full"
                />
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-900 p-3 rounded-xl shadow-lg border border-border/80">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-100 dark:bg-emerald-950 p-2 rounded-full">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-xs">Active Candidate Stream</p>
                      <p className="text-[11px] text-muted-foreground">Direct applications within hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Access Status / Quick Action Section */}
        <section className="py-8 bg-slate-50 dark:bg-slate-900/50 border-b">
          <div className="max-w-4xl mx-auto px-4">
            {renderAccessStatus()}
          </div>
        </section>

        {/* Why Use TalentXcel Section */}
        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Why Top Companies Hire with TalentXcel
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                Streamline recruitment from job description generation to technical candidate evaluation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {whyTalentXcel.map((item, index) => (
                <Card key={index} className="border shadow-xs hover:shadow-md transition-all">
                  <CardContent className="p-5 space-y-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default EmployerLanding;
