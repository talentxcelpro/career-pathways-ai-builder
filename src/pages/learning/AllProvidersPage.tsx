import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VERIFIED_PROVIDERS } from '@/data/learningAggregatorData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

interface ProviderRecord {
  id: string;
  name: string;
  slug: string;
  website: string;
  logo?: string;
  description?: string;
  provider_type: string;
  trust_level: string;
  verified: boolean;
  verification_status?: string;
  course_count: number;
}

export const AllProvidersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'VERIFIED' | 'NEEDS_REVIEW'>('ALL');

  const { data: providers = [], isLoading } = useQuery<ProviderRecord[]>({
    queryKey: ['all-public-providers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('learning_providers' as any)
          .select('*')
          .order('verified', { ascending: false })
          .order('name', { ascending: true });

        if (data && data.length > 0) {
          return data as ProviderRecord[];
        }
      } catch {
        // Fallback
      }
      return VERIFIED_PROVIDERS as ProviderRecord[];
    }
  });

  const filteredProviders = providers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.provider_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const isVerified = p.verified === true || p.verification_status === 'VERIFIED';
    if (activeFilter === 'VERIFIED') return matchesSearch && isVerified;
    if (activeFilter === 'NEEDS_REVIEW') return matchesSearch && !isVerified;
    return matchesSearch;
  });

  const verifiedCount = providers.filter(p => p.verified === true || p.verification_status === 'VERIFIED').length;
  const reviewCount = providers.length - verifiedCount;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-20">
      
      {/* Hero Header Banner */}
      <div className="bg-white dark:bg-card border-b border-slate-200 dark:border-border px-6 py-12 sm:px-12 text-center max-w-7xl mx-auto rounded-b-3xl shadow-2xs">
        <Badge variant="outline" className="mb-4 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1">
          Global Education Ecosystem Directory
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          Verified Learning Providers & Institutions
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Discover verified course opportunities across global tech leaders, top universities, and open education platforms.
        </p>

        {/* Dynamic Metric Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Badge className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs px-3.5 py-1.5 rounded-xl">
            {providers.length} Total Ecosystem Providers
          </Badge>
          <Badge className="bg-emerald-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {verifiedCount} Verified Platforms
          </Badge>
          <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {reviewCount} Providers Queued for Verification
          </Badge>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 mt-10 space-y-8">

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-card p-4 rounded-2xl border border-slate-200 dark:border-border shadow-xs">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search providers by name, category, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-muted text-xs font-semibold border-slate-200 dark:border-border"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Button
              size="sm"
              variant={activeFilter === 'ALL' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('ALL')}
              className={`rounded-xl text-xs font-extrabold cursor-pointer ${activeFilter === 'ALL' ? 'bg-blue-600 hover:bg-blue-500 text-white' : ''}`}
            >
              All Providers ({providers.length})
            </Button>
            <Button
              size="sm"
              variant={activeFilter === 'VERIFIED' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('VERIFIED')}
              className={`rounded-xl text-xs font-extrabold cursor-pointer ${activeFilter === 'VERIFIED' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : ''}`}
            >
              Verified ({verifiedCount})
            </Button>
            <Button
              size="sm"
              variant={activeFilter === 'NEEDS_REVIEW' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('NEEDS_REVIEW')}
              className={`rounded-xl text-xs font-extrabold cursor-pointer ${activeFilter === 'NEEDS_REVIEW' ? 'bg-amber-600 hover:bg-amber-500 text-white' : ''}`}
            >
              Under Review ({reviewCount})
            </Button>
          </div>

        </div>

        {/* Provider Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 bg-white dark:bg-card rounded-3xl border border-slate-200 dark:border-border animate-pulse p-6"></div>
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-card rounded-3xl border border-slate-200 dark:border-border p-8">
            <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-extrabold">No Providers Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search keywords or filter settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((p) => {
              const isVerified = p.verified === true || p.verification_status === 'VERIFIED';
              return (
                <Card 
                  key={p.id} 
                  className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <CardContent className="p-6 space-y-4">
                    
                    {/* Header: Logo & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-muted border border-slate-200 dark:border-border flex items-center justify-center p-2 shrink-0">
                        {p.logo ? (
                          <img src={p.logo} alt={p.name} className="h-full w-full object-contain" />
                        ) : (
                          <Building2 className="h-6 w-6 text-blue-600" />
                        )}
                      </div>

                      <Badge className={
                        isVerified 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1'
                      }>
                        {isVerified ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> Under Review
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Body Info */}
                    <div>
                      <div className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {p.provider_type} • {p.trust_level}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2 line-clamp-2">
                        {p.description || `Official educational learning platform for ${p.name}.`}
                      </p>
                    </div>

                    {/* Verified Course Count */}
                    <div className="pt-2 border-t border-slate-100 dark:border-border/40 flex items-center justify-between text-xs font-extrabold">
                      <span className="text-slate-500">Indexed Courses:</span>
                      <span className={isVerified ? 'text-blue-600' : 'text-slate-400'}>
                        {p.course_count || (isVerified ? 1 : 0)} Verified Opportunities
                      </span>
                    </div>

                  </CardContent>

                  {/* Actions Footer */}
                  <div className="bg-slate-50 dark:bg-muted/30 p-4 border-t border-slate-100 dark:border-border/40 flex items-center justify-between gap-2">
                    <Button 
                      asChild 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl text-xs font-bold w-full border-slate-300 dark:border-border cursor-pointer hover:bg-white dark:hover:bg-card"
                    >
                      <Link to={`/learning/providers/${p.slug}`}>
                        Explore Showcase <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                    <a 
                      href={p.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 rounded-xl border border-slate-300 dark:border-border text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-card transition-colors shrink-0"
                      title="Visit Official Website"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                </Card>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};

export default AllProvidersPage;
