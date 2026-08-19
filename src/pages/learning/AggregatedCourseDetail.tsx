import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { learningAggregatorService } from '@/services/learningAggregatorService';
import { AggregatedCourse } from '@/types/learningAggregator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Award, 
  BookOpen, 
  Globe, 
  Briefcase, 
  ChevronRight, 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  CheckCircle2, 
  Building2
} from 'lucide-react';

export const AggregatedCourseDetail: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const courseIdentifier = slug || id || 'microsoft-power-bi-data-analyst';

  const [isSaved, setIsSaved] = useState(false);

  // Fetch course detail
  const { data: course, isLoading } = useQuery({
    queryKey: ['aggregated-course-detail', courseIdentifier],
    queryFn: () => learningAggregatorService.getCourseBySlugOrId(courseIdentifier)
  });

  // Fetch alternatives
  const { data: alternatives = [] } = useQuery({
    queryKey: ['aggregated-course-alternatives', courseIdentifier],
    queryFn: () => course ? learningAggregatorService.getAlternatives(course) : Promise.resolve([]),
    enabled: !!course
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-muted-foreground">Loading course intelligence...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 text-center">
        <h2 className="text-xl font-bold text-foreground mb-4">Course Not Found</h2>
        <Button onClick={() => navigate('/learning')}>Return to Learning Hub</Button>
      </div>
    );
  }

  const handleStartCourseHandoff = () => {
    learningAggregatorService.trackHandoff({
      course_id: course.id,
      provider_id: course.provider_id,
      provider_name: course.provider_name,
      source_url: course.source_url,
      clicked_at: new Date().toISOString(),
      source_page: 'course_detail'
    });

    toast.success(`Redirecting to official course on ${course.provider_name}...`);
    window.open(course.source_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-20">
      
      {/* Top Breadcrumb Header */}
      <div className="bg-slate-900 text-slate-100 border-b border-slate-800 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold">
          <button 
            onClick={() => navigate('/learning')}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Learning Hub
          </button>
          
          <div className="flex items-center gap-2 text-slate-400">
            <span>Learning</span>
            <ChevronRight className="h-3 w-3" />
            <span>{course.category}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-blue-400 truncate max-w-[200px]">{course.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Header Section with Explicit High-Contrast White Text */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-8 border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Provider Identification Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-blue-600 text-white hover:bg-blue-500 rounded-full px-3.5 py-1 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                Course Provided by {course.provider_name}
              </Badge>

              <Badge variant="outline" className="border-emerald-500 text-emerald-400 rounded-full text-xs font-extrabold">
                {course.free_type.replace(/_/g, ' ')}
              </Badge>

              <Badge variant="outline" className="border-slate-700 text-slate-300 rounded-full text-xs">
                {course.level}
              </Badge>
            </div>

            <h1 
              style={{ color: '#ffffff' }}
              className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight !text-white"
            >
              {course.title}
            </h1>

            <p 
              style={{ color: '#cbd5e1' }}
              className="text-sm sm:text-base font-medium max-w-2xl leading-relaxed !text-slate-300"
            >
              {course.short_description}
            </p>

            {/* Key Metadata Pills */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 font-semibold pt-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-400" />
                <span style={{ color: '#cbd5e1' }}>{course.duration_text}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-400" />
                <span style={{ color: '#cbd5e1' }}>{course.certificate_type.replace(/_/g, ' ')}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-purple-400" />
                <span style={{ color: '#cbd5e1' }}>{course.language}</span>
              </div>

              {course.talentxcel_match && (
                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{course.talentxcel_match}% TalentXcel Match</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Action Card Container */}
          <Card className="bg-slate-950 border-slate-800 shadow-2xl text-white rounded-3xl overflow-hidden">
            <div className="relative h-48 w-full overflow-hidden bg-slate-900 flex items-center justify-center">
              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Access Model</div>
                <div className="text-xl font-extrabold text-emerald-400 flex items-center justify-between">
                  <span>{course.free_type.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-normal text-slate-400">Verified</span>
                </div>
              </div>

              {/* EXPLICIT HANDOFF CTA BUTTON */}
              <Button
                onClick={handleStartCourseHandoff}
                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 group transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Start Course on {course.provider_name}</span>
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>

              {/* Explicit Handoff Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="font-extrabold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  External Provider Handoff
                </div>
                <p className="leading-relaxed">
                  This course is provided by <strong className="text-white">{course.provider_name}</strong>. TalentXcel does not host this course. You will continue learning on {course.provider_name}'s official platform while TalentXcel remains open in your tab.
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsSaved(!isSaved);
                    toast.success(isSaved ? "Removed from saved" : "Saved to My Learning!");
                  }}
                  className="flex-1 rounded-xl text-xs font-bold border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer"
                >
                  <Bookmark className={`h-3.5 w-3.5 mr-1.5 ${isSaved ? 'fill-blue-500 text-blue-500' : ''}`} />
                  {isSaved ? 'Saved' : 'Save Course'}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Course link copied to clipboard!");
                  }}
                  className="rounded-xl text-xs font-bold border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Main Body Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column Details */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Why TalentXcel Recommends This Box */}
          <Card className="rounded-3xl border-purple-200 dark:border-purple-900/60 bg-gradient-to-br from-purple-500/5 via-white to-blue-500/5 dark:via-card shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="text-base font-extrabold text-foreground">Why TalentXcel Recommends This</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              {course.recommendation_reason || `This ${course.level} level course in ${course.category} directly aligns with in-demand technical competencies required across modern enterprise job roles.`}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-[11px]">
                Skill Gap: {course.skills[0] || 'Technical Skill'}
              </Badge>
              <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[11px]">
                Target Career: {course.career_relevance[0] || 'Software Professional'}
              </Badge>
              <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px]">
                Verified 100% Free Access
              </Badge>
            </div>
          </Card>

          {/* About Course */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-foreground">About This Course</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-medium">
              {course.long_description || course.short_description}
            </p>
          </div>

          <Separator />

          {/* Skills You Will Learn */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-foreground">Skills You Will Master</h2>
            <div className="flex flex-wrap gap-2">
              {course.skills.map((skill, i) => (
                <div key={i} className="px-3.5 py-2 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border text-xs font-bold text-foreground shadow-2xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Careers Using These Skills */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-foreground">Careers Using These Skills</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {course.career_relevance.map((career, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-2xs space-y-1">
                  <div className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    <span>{career}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Average industry entry: ₹8 - ₹18 LPA ($75k - $115k)
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Alternatives Grid */}
          {alternatives.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-foreground">Alternatives from Other Providers</h2>
              <p className="text-xs text-muted-foreground font-medium">
                TalentXcel is provider-agnostic. Explore alternative verified courses covering similar competencies:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {alternatives.map(alt => (
                  <Card 
                    key={alt.id} 
                    onClick={() => navigate(`/learning/courses/${alt.slug || alt.id}`)}
                    className="rounded-2xl border-slate-200 dark:border-border hover:border-blue-500 transition-all cursor-pointer p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-600">{alt.provider_name}</span>
                      <Badge variant="outline" className="text-[10px] font-bold">{alt.duration_text}</Badge>
                    </div>

                    <h4 className="text-xs font-extrabold text-foreground line-clamp-2">{alt.title}</h4>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>{alt.free_type.replace(/_/g, ' ')}</span>
                      <span className="text-blue-600 font-extrabold flex items-center">
                        View Course <ChevronRight className="h-3 w-3 ml-0.5" />
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column Related Jobs Widget */}
        <div className="space-y-6">
          
          <Card className="rounded-3xl border-slate-200 dark:border-border shadow-sm p-6 space-y-5 bg-white dark:bg-card">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-extrabold text-foreground">Matching TalentXcel Jobs</h3>
            </div>

            <p className="text-xs text-muted-foreground font-medium">
              Open jobs in our database requiring skills taught in this course:
            </p>

            <div className="space-y-3">
              {[
                { title: 'Junior Data Analyst', company: 'Savantis Solutions', location: 'India (Remote)', salary: '₹8 - ₹12 LPA', skills: ['SQL', 'Power BI'] },
                { title: 'BI Specialist', company: 'Nexgenn Services', location: 'Hyderabad', salary: '₹10 - ₹16 LPA', skills: ['Power BI', 'Data Modeling'] },
                { title: 'Analytics Associate', company: 'Global Tech Corp', location: 'Bengaluru', salary: '₹9 - ₹14 LPA', skills: ['Excel', 'SQL'] }
              ].map((job, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-muted/30 border border-slate-100 dark:border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-foreground">{job.title}</h4>
                    <Badge variant="secondary" className="text-[9px] font-bold bg-blue-50 text-blue-700">{job.salary}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">{job.company} • {job.location}</p>
                  <div className="flex flex-wrap gap-1">
                    {job.skills.map((s, idx) => (
                      <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-card border border-slate-200 text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => navigate('/jobs')}
              className="w-full rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            >
              Explore All Jobs Requiring These Skills
            </Button>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default AggregatedCourseDetail;
