import React from 'react';
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
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-20">
      
      {/* Top Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold">
          <button 
            onClick={() => navigate('/learning')}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Learning Hub
          </button>
          
          <div className="flex items-center gap-2 text-slate-400">
            <span>Verified Providers</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-blue-400 font-extrabold">{provider.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-8 border-b border-slate-800 shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-blue-600 text-white font-extrabold px-3 py-1 text-xs flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified {provider.provider_type} Provider
              </Badge>

              <Badge variant="outline" className="border-emerald-500 text-emerald-400 rounded-full text-xs font-extrabold">
                {totalCount} Indexed Learning Opportunities
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>{provider.name}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              {provider.description}
            </p>

            {/* Categories Offered */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs font-bold text-slate-400 mr-1">Categories:</span>
              {categories.map((cat, idx) => (
                <span key={idx} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div className="w-20 h-20 rounded-2xl bg-white p-3 flex items-center justify-center overflow-hidden shadow-inner">
              <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" />
            </div>

            <Button
              onClick={() => window.open(provider.website, '_blank', 'noopener,noreferrer')}
              className="rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-1.5 shadow-sm"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>

        </div>
      </div>

      {/* Main Content List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-8">
        
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Popular Free Courses from {provider.name}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Browse verified learning opportunities provided directly by {provider.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Card 
              key={course.id}
              onClick={() => navigate(`/learning/courses/${course.slug || course.id}`)}
              className="rounded-3xl border-slate-200/80 dark:border-border/60 hover:border-blue-500 transition-all shadow-sm hover:shadow-xl cursor-pointer overflow-hidden flex flex-col bg-white dark:bg-card group p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-extrabold border-slate-300">
                  {course.level}
                </Badge>
                <Badge className="bg-emerald-600 text-white text-[10px] font-extrabold">
                  {course.free_type.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 font-medium">
                  {course.short_description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-border/40 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  {course.duration_text}
                </span>

                <span className="text-blue-600 font-extrabold flex items-center gap-0.5">
                  View Course <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>

      </div>

    </div>
  );
};

export default ProviderPage;
