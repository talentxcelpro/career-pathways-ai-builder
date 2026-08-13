import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Filter,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  FileText,
  MessageSquare
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function PublicJobSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const handleToggleSave = (jobTitle: string) => {
    if (savedJobs.includes(jobTitle)) {
      setSavedJobs(savedJobs.filter(t => t !== jobTitle));
      toast.info(`Removed ${jobTitle} from saved jobs.`);
    } else {
      setSavedJobs([...savedJobs, jobTitle]);
      toast.success(`Saved ${jobTitle} to your saved listings!`);
    }
  };

  const handleApply = (jobTitle: string) => {
    if (!appliedJobs.includes(jobTitle)) {
      setAppliedJobs([...appliedJobs, jobTitle]);
      toast.success(`🎉 Application submitted for ${jobTitle}!`);
    }
  };

  const featuredJobs = [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'Bangalore, India',
      salary: '₹15-25 LPA',
      type: 'Full-time',
      skills: ['React', 'Node.js', 'TypeScript'],
      posted: '2 days ago'
    },
    {
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'Mumbai, India',
      salary: '₹20-30 LPA',
      type: 'Full-time',
      skills: ['Product Strategy', 'Analytics', 'Leadership'],
      posted: '1 day ago'
    },
    {
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'Delhi, India',
      salary: '₹12-18 LPA',
      type: 'Full-time',
      skills: ['Figma', 'User Research', 'Prototyping'],
      posted: '3 days ago'
    }
  ];

  const trendingSearches = [
    'React Developer',
    'Product Manager',
    'Data Scientist',
    'UX Designer',
    'DevOps Engineer',
    'Marketing Manager'
  ];

  const quickFilters = [
    { label: 'Remote', count: '2.5K' },
    { label: 'Startup', count: '1.8K' },
    { label: 'Full-time', count: '8.2K' },
    { label: 'Entry Level', count: '3.1K' },
    { label: 'Senior', count: '4.7K' },
    { label: 'Contract', count: '950' }
  ];

  return (
    <>
      <Helmet>
        <title>Jobs in India 2025 | Latest IT Jobs, Fresher Jobs, Remote Jobs - TalentXcel</title>
        <meta name="description" content="Find latest jobs in India 2025. Browse 15,000+ IT jobs, fresher positions, remote work opportunities. AI-powered job matching with top companies." />
        <meta name="keywords" content="jobs in India 2025, latest IT jobs, fresher jobs, remote jobs India, job search, software engineer jobs, product manager jobs" />
        <link rel="canonical" href="https://talentxcel.in/public/jobs" />
        <meta property="og:title" content="Jobs in India 2025 | Latest IT Jobs, Fresher Jobs, Remote Jobs - TalentXcel" />
        <meta property="og:description" content="Find latest jobs in India 2025. Browse 15,000+ IT jobs, fresher positions, remote work opportunities." />
        <meta property="og:image" content="https://talentxcel.in/og-jobs.jpg" />
        <meta property="og:url" content="https://talentxcel.in/public/jobs" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobBoard",
            "name": "TalentXcel Jobs",
            "description": "Find latest jobs in India with AI-powered matching",
            "url": "https://talentxcel.in/public/jobs",
            "hiringOrganization": {
              "@type": "Organization",
              "name": "TalentXcel"
            },
            "jobLocation": {
              "@type": "Place",
              "addressCountry": "IN"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Sticky Banner */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="text-sm font-medium">🚀 15,000+ active jobs from top companies</div>
            <Link to="/auth/register">
              <Button size="sm" variant="secondary" className="text-xs">Apply Instantly</Button>
            </Link>
          </div>
        </div>
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Job Matching
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Find Your Perfect Job
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Search thousands of jobs from top companies. Get personalized recommendations 
              and apply with confidence.
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-12 bg-white/60 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Job title, company, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-lg border-0 bg-white shadow-sm"
                  />
                </div>
                <div className="lg:w-80 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-12 h-14 text-lg border-0 bg-white shadow-sm"
                  />
                </div>
                <Button size="lg" className="h-14 px-8 text-lg">
                  <Search className="h-5 w-5 mr-2" />
                  Search Jobs
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="text-sm text-muted-foreground mr-2">Quick filters:</span>
                {quickFilters.map((filter) => (
                  <Button key={filter.label} variant="outline" size="sm" className="h-8">
                    {filter.label} ({filter.count})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center bg-white/60 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">15K+</div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/60 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">2.5K+</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/60 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">85%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/60 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">24h</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Jobs */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Featured Jobs</h2>
              <Link to="/jobs">
                <Button variant="outline">View All Jobs</Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {featuredJobs.map((job, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-primary hover:underline cursor-pointer">
                            {job.title}
                          </h3>
                          <Badge variant="outline" className="ml-2">
                            {job.type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.posted}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleSave(job.title)}
                          className="rounded-xl text-xs font-semibold"
                        >
                          {savedJobs.includes(job.title) ? 'Saved ✓' : 'Save'}
                        </Button>
                        <Button 
                          size="sm"
                          disabled={appliedJobs.includes(job.title)}
                          onClick={() => handleApply(job.title)}
                          className={appliedJobs.includes(job.title) ? "bg-emerald-600 text-white rounded-xl text-xs font-bold" : "rounded-xl text-xs font-bold"}
                        >
                          {appliedJobs.includes(job.title) ? 'Applied ✓' : 'Apply Now'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trending Searches */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search) => (
                  <Button key={search} variant="outline" size="sm" className="rounded-full">
                    {search}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Internal Linking */}
          <Card className="mb-12 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6">Boost Your Job Search Success</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Link to="/public/resume-builder" className="group">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Perfect Resume</h3>
                      <p className="text-sm text-muted-foreground">Build ATS-optimized resume for applications</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/public/interview-prep" className="group">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Interview Ready</h3>
                      <p className="text-sm text-muted-foreground">Ace interviews with AI practice</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/public/market-insights" className="group">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Salary Research</h3>
                      <p className="text-sm text-muted-foreground">Know your market value before applying</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Job?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join millions of job seekers who trust TalentXcel to find their next opportunity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  <Users className="h-5 w-5 mr-2" />
                  Create Free Account
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Browse All Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}