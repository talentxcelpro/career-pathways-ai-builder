import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { learningAggregatorService } from '@/services/learningAggregatorService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Briefcase, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  ArrowLeft, 
  CheckCircle2, 
  Building2, 
  ChevronRight,
  Target,
  Award
} from 'lucide-react';

export const CareerPathwayDetail: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const pathSlug = slug || 'data-analyst';

  const { data: pathway, isLoading } = useQuery({
    queryKey: ['aggregated-career-pathway', pathSlug],
    queryFn: () => learningAggregatorService.getCareerPathwayBySlug(pathSlug)
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['aggregated-pathway-courses'],
    queryFn: () => learningAggregatorService.getCourses()
  });

  if (isLoading || !pathway) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-muted-foreground">Loading Career Pathway...</p>
        </div>
      </div>
    );
  }

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
            <span>Learning Pathways</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-blue-400 font-extrabold">{pathway.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-8 border-b border-slate-800 shadow-lg">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-blue-600 text-white hover:bg-blue-600 rounded-full px-3.5 py-1 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
              <Target className="h-3.5 w-3.5" />
              Target Role: {pathway.target_role}
            </Badge>

            <Badge variant="outline" className="border-emerald-500 text-emerald-400 rounded-full text-xs font-extrabold">
              {pathway.average_salary}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {pathway.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-3xl leading-relaxed">
            {pathway.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 font-semibold pt-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span>{pathway.total_free_courses} Recommended Free Courses</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>Estimated {pathway.estimated_weeks} Weeks (5 hrs/week)</span>
            </div>

            <div className="flex items-center gap-1.5 text-purple-400 font-extrabold">
              <Sparkles className="h-4 w-4" />
              <span>342 Jobs Currently Requesting These Skills</span>
            </div>
          </div>
        </div>
      </div>

      {/* Steps List Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-10">
        
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Your Step-by-Step Learning Path</h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            TalentXcel recommends taking these verified free courses in order to bridge your skill gap for {pathway.target_role} roles.
          </p>
        </div>

        <div className="space-y-8 relative before:absolute before:left-6 before:top-6 before:bottom-6 before:w-0.5 before:bg-slate-200 dark:before:bg-border">
          {pathway.steps.map((step, idx) => {
            const matchedCourse = courses.find(c => c.id === step.recommended_course_id) || courses[idx % courses.length];

            return (
              <div key={idx} className="relative pl-14 space-y-4">
                
                {/* Step Circle Number */}
                <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  {step.step_number}
                </div>

                <Card className="rounded-3xl border-slate-200/80 dark:border-border/60 p-6 space-y-4 bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-border/40 pb-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Step {step.step_number} Competency</div>
                      <h3 className="text-base font-extrabold text-foreground">{step.skill_name}</h3>
                    </div>

                    <Badge variant="outline" className="text-xs font-bold border-slate-300">
                      {step.target_level} Level • {step.duration_text}
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                    💡 <strong>Why this step matters:</strong> {step.reason}
                  </p>

                  {/* Recommended Course Box */}
                  {matchedCourse && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-muted/30 border border-slate-200/80 dark:border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5">
                            Best Match: {matchedCourse.talentxcel_match || 94}%
                          </Badge>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            Course Provided by {matchedCourse.provider_name}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-foreground truncate">{matchedCourse.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 font-medium">{matchedCourse.short_description}</p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            learningAggregatorService.trackHandoff({
                              course_id: matchedCourse.id,
                              provider_id: matchedCourse.provider_id,
                              provider_name: matchedCourse.provider_name,
                              source_url: matchedCourse.source_url,
                              clicked_at: new Date().toISOString(),
                              career_intent: pathway.target_role,
                              source_page: 'career_pathway'
                            });
                            toast.success(`Redirecting to ${matchedCourse.provider_name}...`);
                            window.open(matchedCourse.source_url, '_blank', 'noopener,noreferrer');
                          }}
                          className="rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-1 shadow-sm"
                        >
                          <span>Start on {matchedCourse.provider_name}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                    </div>
                  )}

                </Card>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
