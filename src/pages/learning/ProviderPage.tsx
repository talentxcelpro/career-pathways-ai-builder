import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { learningAggregatorService } from '@/services/learningAggregatorService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  ArrowLeft, 
  ChevronRight, 
  Sparkles, 
  Globe,
  BookOpen
} from 'lucide-react';

export const ProviderPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const providerSlug = slug || 'microsoft-learn';

  const { data: providerData, isLoading } = useQuery({
    queryKey: ['aggregated-provider-page', providerSlug],
    queryFn: () => learningAggregatorService.getProviderBySlug(providerSlug)
  });

  if (isLoading || !providerData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-muted-foreground">Loading Provider Intelligence...</p>
        </div>
      </div>
    );
  }

  const { provider, courses, totalCount, categories } = providerData;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100 pt-2">
      
      {/* 1. Top Breadcrumb Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-3 flex items-center justify-between text-xs font-semibold shadow-2xs">
          <button 
            onClick={() => navigate('/learning')}
            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-blue-600" /> 
            <span className="font-extrabold">Back to Learning Hub</span>
          </button>
          
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/learning')}>Learning</span>
            <ChevronRight className="h-3 w-3" />
            <span>Verified Providers</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-blue-600 font-extrabold">{provider.name}</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Banner - Clean Light Theme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <Card className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card p-6 sm:p-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge className="bg-blue-600 text-white font-extrabold px-3.5 py-1 text-xs flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified {provider.provider_type} Provider</span>
                </Badge>

                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-extrabold px-3 py-1 border border-emerald-200">
                  {totalCount} Verified Courses
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {provider.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {provider.description}
              </p>

              {/* Categories Offered */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-500 mr-1">Categories:</span>
                {categories.map((cat, idx) => (
                  <span key={idx} className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-200 border border-slate-200">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center p-6 bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border rounded-2xl space-y-3">
              <div className="text-3xl font-extrabold text-blue-600">{totalCount}</div>
              <div className="text-xs font-bold text-slate-500">Indexed Opportunities</div>
              <Button
                onClick={() => window.open(provider.website, '_blank', 'noopener,noreferrer')}
                className="rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Visit Provider Site</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>

          </div>
        </Card>
      </div>

      {/* 3. Provider Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-foreground">Verified Courses from {provider.name}</h2>
          <span className="text-xs font-bold text-muted-foreground">{courses.length} courses displayed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Card key={course.id} className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card p-6 space-y-4 shadow-sm flex flex-col justify-between">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    {course.free_type.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-[11px] font-bold text-slate-400">{course.level}</span>
                </div>

                <h3 
                  onClick={() => navigate(`/learning/courses/${course.slug || course.id}`)}
                  className="text-base font-extrabold text-foreground hover:text-blue-600 cursor-pointer transition-colors line-clamp-2"
                >
                  {course.title}
                </h3>

                <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                  {course.short_description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-border/40 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-blue-600" /> {course.duration_text}
                </span>

                <Button
                  size="sm"
                  onClick={() => navigate(`/learning/courses/${course.slug || course.id}`)}
                  className="rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer"
                >
                  View Details
                </Button>
              </div>

            </Card>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProviderPage;
