import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Globe, 
  Users, 
  Briefcase, 
  Building, 
  FileText, 
  MapPin, 
  Code, 
  GraduationCap,
  TrendingUp,
  Search,
  RefreshCw,
  Eye
} from 'lucide-react';

export const MegaSEODashboard = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch SEO statistics
  const { data: seoStats, isLoading, refetch } = useQuery({
    queryKey: ['mega-seo-stats'],
    queryFn: async () => {
      const [users, jobs, companies, posts] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      return {
        users: users.count || 0,
        jobs: jobs.count || 0,
        companies: companies.count || 0,
        posts: posts.count || 0
      };
    }
  });

  const generateSitemaps = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('mega-sitemap-generator', {
        body: { type: 'all' }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mega sitemaps generated successfully!",
        duration: 3000,
      });

      refetch();
    } catch (error) {
      console.error('Error generating sitemaps:', error);
      toast({
        title: "Error",
        description: "Failed to generate sitemaps",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateTotalPages = () => {
    if (!seoStats) return 0;
    
    const multipliers = {
      users: 4, // 4 different URL patterns per user
      jobs: 4,  // 4 different URL patterns per job
      companies: 3, // 3 different URL patterns per company
      posts: 3, // 3 different URL patterns per post
    };

    const staticPages = 500; // Location, skill, category, tool pages etc.
    
    return (
      seoStats.users * multipliers.users +
      seoStats.jobs * multipliers.jobs +
      seoStats.companies * multipliers.companies +
      seoStats.posts * multipliers.posts +
      staticPages
    );
  };

  const seoCategories = [
    {
      icon: Users,
      title: 'User Profiles',
      count: seoStats?.users || 0,
      multiplier: 4,
      description: 'Professional profiles with multiple URL patterns',
      color: 'bg-blue-500'
    },
    {
      icon: Briefcase,
      title: 'Job Listings',
      count: seoStats?.jobs || 0,
      multiplier: 4,
      description: 'Active job opportunities across industries',
      color: 'bg-green-500'
    },
    {
      icon: Building,
      title: 'Companies',
      count: seoStats?.companies || 0,
      multiplier: 3,
      description: 'Company profiles and career pages',
      color: 'bg-purple-500'
    },
    {
      icon: FileText,
      title: 'Posts & Articles',
      count: seoStats?.posts || 0,
      multiplier: 3,
      description: 'Professional content and insights',
      color: 'bg-orange-500'
    },
    {
      icon: MapPin,
      title: 'Location Pages',
      count: 25,
      multiplier: 4,
      description: 'City-specific job and company pages',
      color: 'bg-red-500'
    },
    {
      icon: Code,
      title: 'Skill Pages',
      count: 35,
      multiplier: 4,
      description: 'Technology and skill-based content',
      color: 'bg-indigo-500'
    },
    {
      icon: GraduationCap,
      title: 'Course Categories',
      count: 15,
      multiplier: 3,
      description: 'Learning and training resources',
      color: 'bg-pink-500'
    }
  ];

  const totalPages = calculateTotalPages();
  const progressToGoal = Math.min((totalPages / 20000) * 100, 100);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Mega SEO Dashboard</h1>
            <p className="text-gray-600">Comprehensive SEO strategy for 20,000+ indexed pages</p>
          </div>
        </div>
        <Button onClick={generateSitemaps} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Generate Sitemaps
            </>
          )}
        </Button>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            SEO Progress to 20,000 Pages
          </CardTitle>
          <CardDescription>
            Current estimate: {totalPages.toLocaleString()} pages ({progressToGoal.toFixed(1)}% of goal)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressToGoal} className="h-4" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>0 pages</span>
            <span className="font-medium">{totalPages.toLocaleString()} current</span>
            <span>20,000 goal</span>
          </div>
        </CardContent>
      </Card>

      {/* SEO Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seoCategories.map((category, index) => {
          const Icon = category.icon;
          const estimatedPages = category.count * category.multiplier;
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className={`p-2 rounded-lg ${category.color} text-white mr-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{category.count.toLocaleString()}</span>
                  <Badge variant="secondary">
                    {estimatedPages.toLocaleString()} pages
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {category.multiplier}x URL patterns per item
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* SEO URL Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>SEO URL Patterns</CardTitle>
          <CardDescription>Multiple URL patterns for maximum search visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">User Profile URLs</h4>
              <ul className="space-y-1 text-sm">
                <li>/users/[id] - Direct user access</li>
                <li>/profiles/[name] - SEO-friendly profiles</li>
                <li>/professionals/[name] - Professional focus</li>
                <li>/experts/[name] - Expertise emphasis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-green-600">Job Listing URLs</h4>
              <ul className="space-y-1 text-sm">
                <li>/jobs/[id] - Direct job access</li>
                <li>/careers/[slug] - Career-focused</li>
                <li>/opportunities/[slug] - Opportunity focus</li>
                <li>/positions/[slug] - Position emphasis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-purple-600">Company URLs</h4>
              <ul className="space-y-1 text-sm">
                <li>/companies/[id] - Direct company access</li>
                <li>/employers/[name] - Employer focus</li>
                <li>/organizations/[name] - Organization view</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-orange-600">Location & Skill URLs</h4>
              <ul className="space-y-1 text-sm">
                <li>/jobs/in/[location] - Location-based jobs</li>
                <li>/jobs/skill/[skill] - Skill-based jobs</li>
                <li>/experts/skill/[skill] - Skill experts</li>
                <li>/courses/category/[category] - Course categories</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Next Steps for 20,000+ Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ Implemented</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Dynamic SEO page generation</li>
                <li>• Multiple URL pattern routing</li>
                <li>• Comprehensive sitemap system</li>
                <li>• Structured data implementation</li>
                <li>• Meta tag optimization</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">🔄 To Maximize Pages</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Add more user profiles (target: 2,000+)</li>
                <li>• Increase job listings (target: 1,500+)</li>
                <li>• Add company profiles (target: 500+)</li>
                <li>• Create more content posts (target: 1,000+)</li>
                <li>• Submit sitemaps to Google Search Console</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};