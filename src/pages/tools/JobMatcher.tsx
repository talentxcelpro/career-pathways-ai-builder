import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Target, 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Building2, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  Send, 
  Sparkles,
  Search,
  Briefcase
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  matchScore: number;
  requirements: string[];
  benefits: string[];
  postedDays: number;
  applicants: number;
  jobType: string;
  experience: string;
  matchReasons: string[];
}

const DEFAULT_MATCHES: JobMatch[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA (Hybrid)',
    salaryRange: '$120,000 - $160,000',
    matchScore: 95,
    requirements: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours'],
    postedDays: 3,
    applicants: 45,
    jobType: 'Full-time',
    experience: 'Senior Level',
    matchReasons: ['Perfect skill alignment', 'Salary expectation matched', 'Preferred location']
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupX',
    location: 'New York, NY (Remote)',
    salaryRange: '$100,000 - $140,000',
    matchScore: 88,
    requirements: ['JavaScript', 'Python', 'AWS', 'Docker'],
    benefits: ['100% Remote', 'Unlimited PTO', 'Learning Stipend'],
    postedDays: 1,
    applicants: 23,
    jobType: 'Full-time',
    experience: 'Mid Level',
    matchReasons: ['Strong technical stack match', 'Growth opportunities', 'Remote flexibility']
  },
  {
    id: '3',
    title: 'Frontend Systems Architect',
    company: 'DesignStudio AI',
    location: 'Remote',
    salaryRange: '$130,000 - $170,000',
    matchScore: 82,
    requirements: ['React', 'Tailwind CSS', 'System Design', 'Figma'],
    benefits: ['100% Remote', 'Health & Dental', 'Quarterly Performance Bonuses'],
    postedDays: 5,
    applicants: 67,
    jobType: 'Full-time',
    experience: 'Lead / Senior',
    matchReasons: ['Design system experience', 'Remote preference', 'High compensation']
  }
];

const JobMatcher = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState('React, TypeScript, Node.js');
  const [experience, setExperience] = useState('senior');
  const [location, setLocation] = useState('San Francisco, CA');
  const [salary, setSalary] = useState('120000');
  const [jobType, setJobType] = useState('full-time');
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<JobMatch[]>(DEFAULT_MATCHES);
  
  // Interactive state for Save and Apply
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [applyModalJob, setApplyModalJob] = useState<JobMatch | null>(null);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  const findMatches = async () => {
    if (!skills || !experience) {
      toast.error('Please enter your primary skills and experience level');
      return;
    }

    setIsMatching(true);
    
    // Simulate AI job matching refresh
    setTimeout(() => {
      setMatches(DEFAULT_MATCHES);
      setIsMatching(false);
      toast.success('Updated job recommendations using your latest criteria!');
    }, 1500);
  };

  const handleToggleSaveJob = async (job: JobMatch) => {
    const isSaved = savedJobIds.includes(job.id);
    let updated: string[];

    if (isSaved) {
      updated = savedJobIds.filter(id => id !== job.id);
      toast.info(`Removed "${job.title}" from saved jobs.`);
    } else {
      updated = [...savedJobIds, job.id];
      toast.success(`Saved "${job.title}" at ${job.company} to your saved listings!`);
    }
    setSavedJobIds(updated);

    // Persist to Supabase if authenticated user exists
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        if (!isSaved) {
          await supabase.from('saved_jobs').upsert({
            user_id: authData.user.id,
            job_title: job.title,
            company_name: job.company,
            location: job.location,
            salary_range: job.salaryRange
          });
        }
      }
    } catch (err) {
      console.log('Saved locally:', err);
    }
  };

  const handleOpenApplyModal = (job: JobMatch) => {
    setApplyModalJob(job);
  };

  const handleConfirmApplication = async () => {
    if (!applyModalJob) return;
    setIsSubmittingApp(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setAppliedJobIds(prev => [...prev, applyModalJob.id]);
      toast.success(`🎉 Application submitted for ${applyModalJob.title} at ${applyModalJob.company}!`);
      setApplyModalJob(null);
    } catch (err) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 80) return 'text-indigo-600 dark:text-indigo-400';
    if (score >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getMatchBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    if (score >= 80) return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
    if (score >= 70) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation & Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tools')}
            className="mb-4 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md">
              <Target className="h-7 w-7 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Job Matcher</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
                Discover job opportunities matched to your exact skills and career preferences with AI scoring.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <Card className="mb-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span>Set Your Career & Matching Criteria</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Primary Skills (comma separated)
                </Label>
                <Input
                  id="skills"
                  placeholder="e.g. React, TypeScript, Node.js"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="rounded-xl h-11 border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Experience Level
                </Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-800 text-sm">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                    <SelectItem value="lead">Lead / Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Location Preference
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. San Francisco, Remote, New York"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-xl h-11 border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Expected Salary (USD/year)
                </Label>
                <Input
                  id="salary"
                  placeholder="e.g. 120000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="rounded-xl h-11 border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                onClick={findMatches}
                disabled={isMatching}
                className="w-full sm:w-auto px-8 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md"
              >
                {isMatching ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Job Database...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find AI Matched Jobs
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              <span>Recommended Jobs ({matches.length})</span>
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={findMatches}
              className="rounded-xl text-xs font-semibold"
            >
              Refresh Matches
            </Button>
          </div>

          <div className="space-y-4">
            {matches.map((match) => {
              const isSaved = savedJobIds.includes(match.id);
              const isApplied = appliedJobIds.includes(match.id);

              return (
                <Card 
                  key={match.id}
                  className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {match.title}
                          </h3>
                          <Badge variant="outline" className={`text-xs font-bold rounded-full px-2.5 py-0.5 border ${getMatchBadgeColor(match.matchScore)}`}>
                            {match.matchScore}% Match
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4 text-indigo-500" />
                            {match.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {match.location}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-200">
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                            {match.salaryRange}
                          </span>
                        </div>
                      </div>

                      <div className={`text-3xl font-extrabold ${getMatchColor(match.matchScore)} shrink-0`}>
                        {match.matchScore}%
                      </div>
                    </div>

                    {/* Requirements & Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {match.requirements.map((req, index) => (
                            <Badge key={index} variant="secondary" className="text-xs font-medium rounded-lg px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Key Benefits</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {match.benefits.map((benefit, index) => (
                            <Badge key={index} className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium rounded-lg px-2 py-0.5">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Why This Job Matches You</h4>
                      <ul className="space-y-1">
                        {match.matchReasons.map((reason, index) => (
                          <li key={index} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Posted {match.postedDays}d ago
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                          {match.applicants} applicants
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleSaveJob(match)}
                          className={navigator ? "rounded-xl text-xs font-semibold h-10 px-4 transition-all" : ""}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="h-4 w-4 mr-1.5 text-emerald-600" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Bookmark className="h-4 w-4 mr-1.5 text-slate-400" />
                              Save Job
                            </>
                          )}
                        </Button>

                        <Button 
                          size="sm"
                          disabled={isApplied}
                          onClick={() => handleOpenApplyModal(match)}
                          className={isApplied 
                            ? "bg-emerald-600 text-white rounded-xl text-xs font-bold h-10 px-5" 
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold h-10 px-5 shadow-md hover:shadow-lg transition-all"
                          }
                        >
                          {isApplied ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1.5" />
                              Applied ✓
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-1.5" />
                              1-Click Apply
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Apply Confirmation Modal */}
        <Dialog open={!!applyModalJob} onOpenChange={(open) => !open && setApplyModalJob(null)}>
          <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                1-Click AI Application
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Submit your profile and AI-tailored application directly to the recruiting manager.
              </DialogDescription>
            </DialogHeader>

            {applyModalJob && (
              <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{applyModalJob.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{applyModalJob.company} • {applyModalJob.location}</p>
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Match Score:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{applyModalJob.matchScore}% Match</span>
                </div>
              </div>
            )}

            <DialogFooter className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setApplyModalJob(null)}
                className="rounded-xl text-xs font-semibold h-10 flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmApplication}
                disabled={isSubmittingApp}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold h-10 flex-1 shadow-md"
              >
                {isSubmittingApp ? 'Submitting Application...' : 'Confirm & Apply Now'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default JobMatcher;
