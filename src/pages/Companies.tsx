import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, Users, Globe, Heart, Search, Award, Briefcase, TrendingUp, CheckCircle, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

interface CompanyEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  location: string;
  size_range?: string;
  founded_year?: number;
  website_url?: string;
  logo_url?: string;
  cover_image_url?: string;
  is_verified: boolean;
  open_jobs_count?: number;
}

const VERIFIED_EMPLOYER_CATALOG: CompanyEntity[] = [
  {
    id: 'comp_chatr_chat',
    name: 'chatr Chat',
    slug: 'chatr-chat',
    description: 'Next-generation AI communications and messaging intelligence ecosystem connecting users worldwide with real-time agentic workflows.',
    industry: 'Artificial Intelligence & Telecom',
    location: 'Srinagar, Jammu & Kashmir, India',
    size_range: '50-200 employees',
    founded_year: 2024,
    website_url: 'https://chatrchat.com',
    is_verified: true,
    open_jobs_count: 8
  },
  {
    id: 'comp_savantis_solutions',
    name: 'Savantis Solutions',
    slug: 'savantis-solutions',
    description: 'Global IT consulting, digital transformation, enterprise SAP solutions, data engineering, and specialized technical staffing partner.',
    industry: 'IT Services & Consulting',
    location: 'Noida, Uttar Pradesh, India',
    size_range: '500-1000 employees',
    founded_year: 2012,
    website_url: 'https://savantis.com',
    is_verified: true,
    open_jobs_count: 14
  },
  {
    id: 'comp_talentxcel_services',
    name: 'TalentXcel Services',
    slug: 'talentxcel-services',
    description: 'Premier AI recruitment, technical executive search, talent analytics, and enterprise workforce scaling platform.',
    industry: 'AI Recruitment & Staffing',
    location: 'Gurgaon, Delhi NCR, India',
    size_range: '50-200 employees',
    founded_year: 2023,
    website_url: 'https://talentxcel.in/services',
    is_verified: true,
    open_jobs_count: 12
  },
  {
    id: 'comp_talentxcel_enterprise',
    name: 'TalentXcel Enterprise',
    slug: 'talentxcel-enterprise',
    description: 'Leading AI career OS and talent infrastructure connecting verified professionals with high-velocity career pathways and opportunities.',
    industry: 'HR Tech & Career AI',
    location: 'Bangalore & Gurgaon, India',
    size_range: '100-500 employees',
    founded_year: 2023,
    website_url: 'https://talentxcel.in',
    is_verified: true,
    open_jobs_count: 6
  },
  {
    id: 'comp_google',
    name: 'Google India',
    slug: 'google',
    description: 'World-leading technology company specializing in search, cloud computing, software, consumer electronics, and artificial intelligence.',
    industry: 'Technology & Cloud',
    location: 'Bangalore & Hyderabad, India',
    size_range: '10,000+ employees',
    founded_year: 1998,
    website_url: 'https://google.com',
    is_verified: true,
    open_jobs_count: 45
  },
  {
    id: 'comp_microsoft',
    name: 'Microsoft India',
    slug: 'microsoft',
    description: 'Global technology leader in personal computing, cloud solutions (Azure), developer tools, productivity software, and enterprise AI systems.',
    industry: 'Software & Enterprise Cloud',
    location: 'Hyderabad & Bangalore, India',
    size_range: '10,000+ employees',
    founded_year: 1975,
    website_url: 'https://microsoft.com',
    is_verified: true,
    open_jobs_count: 38
  }
];

export const Companies: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [followedCompanies, setFollowedCompanies] = useState<Set<string>>(new Set());

  const { data: companiesList = [], isLoading } = useQuery({
    queryKey: ['companies', searchTerm, selectedIndustry],
    queryFn: async () => {
      let dbCompanies: any[] = [];
      try {
        const { data } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) dbCompanies = data;
      } catch (err) {
        console.warn('Companies fetch note:', err);
      }

      // Merge DB companies with verified catalog, skipping blank placeholders
      const mergedMap = new Map<string, CompanyEntity>();

      // 1. Add verified catalog first
      VERIFIED_EMPLOYER_CATALOG.forEach(c => mergedMap.set(c.name.toLowerCase(), c));

      // 2. Add valid database rows
      dbCompanies.forEach((db: any) => {
        if (!db.name || db.name.toLowerCase() === 'your company' || db.name.trim().length < 2) return;
        const key = db.name.toLowerCase();
        const existing = mergedMap.get(key);
        mergedMap.set(key, {
          id: db.id || existing?.id || `comp_${key.replace(/[^a-z0-9]+/g, '_')}`,
          name: db.name,
          slug: db.slug || existing?.slug || db.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: db.description || existing?.description || 'Leading innovative organization committed to technology and growth.',
          industry: db.industry || existing?.industry || 'Technology & Services',
          location: db.location || existing?.location || 'India',
          size_range: db.size_range || existing?.size_range || '50-200 employees',
          founded_year: db.founded_year || existing?.founded_year,
          website_url: db.website_url || existing?.website_url,
          logo_url: db.logo_url || existing?.logo_url,
          cover_image_url: db.cover_image_url || existing?.cover_image_url,
          is_verified: db.is_verified ?? true,
          open_jobs_count: existing?.open_jobs_count || 5
        });
      });

      let results = Array.from(mergedMap.values());

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        results = results.filter(c => 
          c.name.toLowerCase().includes(term) ||
          c.industry.toLowerCase().includes(term) ||
          c.location.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term)
        );
      }

      if (selectedIndustry !== 'all') {
        results = results.filter(c => c.industry.toLowerCase().includes(selectedIndustry.toLowerCase()));
      }

      return results;
    }
  });

  const toggleFollow = (companyName: string) => {
    setFollowedCompanies(prev => {
      const next = new Set(prev);
      if (next.has(companyName)) {
        next.delete(companyName);
        toast.info(`Unfollowed ${companyName}`);
      } else {
        next.add(companyName);
        toast.success(`Following ${companyName}! You will receive new job alerts.`);
      }
      return next;
    });
  };

  return (
    <>
      <Helmet>
        <title>Top Companies Hiring in India | Company Profiles & Jobs | TalentXcel</title>
        <meta 
          name="description" 
          content="Explore top verified companies hiring in India. Discover culture insights, verified employee sizes, open roles, and direct recruitment pathways." 
        />
        <link rel="canonical" href="https://talentxcel.in/companies" />
      </Helmet>

      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40">
        {/* Compact Hero Section */}
        <div className="bg-white dark:bg-slate-900 border-b border-border/80 py-6 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                  <Building2 className="h-3 w-3 text-blue-600" />
                  Verified Employer Ecosystem
                </span>
                <span className="text-xs text-muted-foreground">• Direct Hiring Partners</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
                Discover Top Companies Hiring Now
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Explore verified employer profiles, culture highlights, tech stacks, and active career opportunities.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/employer')}
                className="text-xs h-8 gap-1.5"
              >
                <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                Post Jobs as Employer
              </Button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name, industry, or location (e.g. AI, Noida, Srinagar, Bangalore)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant={selectedIndustry === 'all' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => setSelectedIndustry('all')}
                className="text-xs h-8"
              >
                All
              </Button>
              <Button 
                variant={selectedIndustry === 'ai' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => setSelectedIndustry('ai')}
                className="text-xs h-8"
              >
                AI & Tech
              </Button>
              <Button 
                variant={selectedIndustry === 'consulting' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => setSelectedIndustry('consulting')}
                className="text-xs h-8"
              >
                IT Services
              </Button>
            </div>
          </div>

          {/* Companies Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse h-64 border rounded-xl bg-muted/20" />
              ))}
            </div>
          ) : companiesList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {companiesList.map((company) => {
                const isFollowed = followedCompanies.has(company.name);
                const profileUrl = `/company/${company.slug}`;
                const jobsUrl = `/jobs?search=${encodeURIComponent(company.name)}`;

                return (
                  <Card key={company.id} className="border rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-900 group">
                    <div>
                      {/* Gradient Header with Logo badge */}
                      <div className="h-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-3 flex items-start justify-between">
                        <div className="w-11 h-11 rounded-lg bg-white dark:bg-slate-900 border-2 border-white shadow-sm flex items-center justify-center font-bold text-sm text-blue-700">
                          {company.name.slice(0, 2).toUpperCase()}
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleFollow(company.name)}
                          className={`h-7 w-7 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors ${
                            isFollowed ? 'text-rose-300 bg-rose-500/30' : ''
                          }`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${isFollowed ? 'fill-rose-400 text-rose-400' : ''}`} />
                        </Button>
                      </div>

                      {/* Details Section */}
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">
                              {company.name}
                            </h3>
                            {company.is_verified && (
                              <CheckCircle className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <Badge variant="secondary" className="text-[10px] px-2 py-0">
                              {company.industry}
                            </Badge>
                            {company.size_range && (
                              <span className="text-[10px] text-muted-foreground font-medium">
                                • {company.size_range}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {company.description}
                        </p>

                        <div className="space-y-1 text-[11px] text-muted-foreground border-t pt-2">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{company.location}</span>
                          </div>

                          {company.website_url && (
                            <div className="flex items-center gap-1.5">
                              <Globe className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <a 
                                href={company.website_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate flex items-center gap-0.5"
                              >
                                {company.website_url.replace(/^https?:\/\//, '')}
                                <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-3 bg-muted/20 border-t flex items-center justify-between gap-2">
                      <Link to={profileUrl} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-8 text-xs font-semibold">
                          View Profile
                        </Button>
                      </Link>
                      
                      <Link to={jobsUrl} className="flex-1">
                        <Button size="sm" className="w-full h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                          View Jobs ({company.open_jobs_count || 5})
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border p-8">
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-bold text-foreground">No companies match your query</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Try searching for a different keyword, industry, or city.
              </p>
              <Button size="sm" variant="outline" onClick={() => setSearchTerm('')} className="text-xs">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Companies;
