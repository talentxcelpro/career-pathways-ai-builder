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
  Award,
  BookOpen
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
      
      {/* 1. Top Breadcrumb Navigation Bar */}
      <div className="bg-white dark:bg-card border-b border-slate-200 dark:border-border py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold">
          <button 
            onClick={() => navigate('/learning')}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-blue-600" /> 
            <span>Back to Learning Hub</span>
          </button>
          
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/learning')}>Learning</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-blue-600 font-extrabold">{pathway.title}</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Banner - Clean Light Theme */}
      <div className="bg-white dark:bg-card py-10 px-4 sm:px-8 border-b border-slate-200 dark:border-border shadow-xs">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-blue-600 text-white hover:bg-blue-500 rounded-full px-3.5 py-1 text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
              <Target className="h-3.5 w-3.5" />
              Target Role: {pathway.target_role}
            </Badge>

            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-extrabold px-3 py-1">
              Average Entry: {pathway.average_salary}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {pathway.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium max-w-3xl leading-relaxed">
            {pathway.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700 dark:text-slate-300 font-bold pt-2">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-muted px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-border">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>{pathway.total_free_courses} Recommended Free Courses</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-muted px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-border">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>{pathway.estimated_weeks} Weeks Estimated Duration</span>
            </div>

            <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-3.5 py-1.5 rounded-full border border-purple-200 dark:border-purple-800 font-extrabold">
              <Building2 className="h-4 w-4 text-purple-600" />
              <span>27 Matching TalentXcel Jobs</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Main Step-by-step Pathway Steps */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-foreground">Step-by-Step Learning Roadmap</h2>
          <p className="text-xs text-muted-foreground font-medium">
            Curated 100% free courses structured from foundational to advanced specialization:
          </p>
        </div>

        <div className="space-y-6">
          {pathway.steps.map((step, idx) => (
            <Card key={step.step_number} className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card p-6 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    {step.step_number}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">
                      {step.step_title || (step as any).skill_name || `Step ${step.step_number}`}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {step.description || (step as any).reason || 'Master core competencies'}
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="text-xs font-bold shrink-0">
                  Step {step.step_number} of {pathway.steps.length}
                </Badge>
              </div>

              {/* Step Skill Tags */}
              <div className="flex flex-wrap gap-2">
                {(step.skills_acquired || [(step as any).skill_name || 'Core Skill']).map((skill, sIdx) => (
                  <span key={sIdx} className="text-xs font-extrabold px-3 py-1 rounded-xl bg-slate-100 dark:bg-muted text-slate-800 dark:text-slate-200 border border-slate-200/80">
                    ✓ {skill}
                  </span>
                ))}
              </div>

              {/* Recommended Course Card inside Step */}
              {step.recommended_courses && step.recommended_courses.length > 0 && (
                <div className="pt-2">
                  {step.recommended_courses.map(courseRef => {
                    const fullCourse = courses.find(c => c.id === courseRef.course_id || c.title === courseRef.title) || courses[idx % courses.length];
                    if (!fullCourse) return null;

                    return (
                      <div key={fullCourse.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-600">{fullCourse.provider_name}</span>
                            <Badge variant="secondary" className="text-[9px] font-bold">{fullCourse.free_type.replace(/_/g, ' ')}</Badge>
                          </div>
                          <h4 
                            onClick={() => navigate(`/learning/courses/${fullCourse.slug || fullCourse.id}`)}
                            className="text-xs font-extrabold text-foreground hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            {fullCourse.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground font-medium line-clamp-1">{fullCourse.short_description}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/learning/courses/${fullCourse.slug || fullCourse.id}`)}
                            className="rounded-xl text-xs font-bold border-slate-300 cursor-pointer"
                          >
                            View Details
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => {
                              toast.success(`Redirecting to ${fullCourse.provider_name}...`);
                              window.open(fullCourse.source_url, '_blank', 'noopener,noreferrer');
                            }}
                            className="rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-1 cursor-pointer"
                          >
                            <span>Start Course</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </Card>
          ))}
        </div>

        {/* Bottom Call to Action */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-4 shadow-xl text-center">
          <h3 className="text-xl font-extrabold">Ready to start your {pathway.target_role} career?</h3>
          <p className="text-xs text-slate-300 font-medium max-w-xl mx-auto">
            Complete the recommended courses above to automatically unlock verified skill credentials on your TalentXcel Career Passport.
          </p>

          <Button
            onClick={() => navigate('/jobs')}
            className="h-11 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg cursor-pointer"
          >
            Explore 27 Open Jobs for This Pathway
          </Button>
        </div>

      </div>

    </div>
  );
};

export default CareerPathwayDetail;
