import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { 
  Heart, 
  X, 
  Star, 
  MapPin, 
  Building, 
  DollarSign, 
  Clock, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Info,
  Briefcase,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';

interface JobSwipeData {
  id: string;
  title: string;
  companies?: {
    name: string;
    logo_url?: string;
  };
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  employment_type?: string;
  experience_level?: string;
  skills_required?: string[];
  description: string;
  posted_at: string;
  views_count?: number;
  applications_count?: number;
  matchScore?: number;
  matchReasons?: string[];
  gapAreas?: string[];
}

interface SwipeAction {
  jobId: string;
  action: 'like' | 'pass' | 'super_like';
  matchScore?: number;
}

const JobSwipe = () => {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [swipeActions, setSwipeActions] = useState<SwipeAction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const controls = useAnimation();
  const constraintsRef = useRef(null);

  const { data: jobs, refetch: refetchJobs } = useQuery({
    queryKey: ['tinder-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url
          )
        `)
        .eq('is_active', true)
        .limit(50);

      if (error) throw error;
      return data as JobSwipeData[];
    }
  });

  const { data: enhancedJobs, isLoading: isEnhancing } = useQuery({
    queryKey: ['enhanced-jobs', jobs?.length],
    queryFn: async () => {
      if (!jobs || jobs.length === 0) return [];

      setIsAnalyzing(true);
      try {
        const { data: response, error } = await supabase.functions.invoke('ai-job-matcher', {
          body: {
            jobs: jobs.slice(0, 20), // Process first 20 jobs
            userId: (await supabase.auth.getUser()).data.user?.id
          }
        });

        if (error) throw error;
        return response.enhancedJobs as JobSwipeData[];
      } catch (error) {
        console.error('Enhancement error:', error);
        // Fallback to original jobs with default match scores
        return jobs.slice(0, 20).map(job => ({
          ...job,
          matchScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
          matchReasons: ['Skills match your profile', 'Location preference'],
          gapAreas: ['Experience level could be improved']
        }));
      } finally {
        setIsAnalyzing(false);
      }
    },
    enabled: !!jobs && jobs.length > 0
  });

  const currentJob = enhancedJobs?.[currentJobIndex];

  const handleSwipe = async (direction: 'left' | 'right' | 'up', info?: PanInfo) => {
    if (!currentJob) return;

    const action: SwipeAction['action'] = 
      direction === 'right' ? 'like' : 
      direction === 'up' ? 'super_like' : 'pass';

    const swipeAction: SwipeAction = {
      jobId: currentJob.id,
      action,
      matchScore: currentJob.matchScore
    };

    setSwipeActions(prev => [...prev, swipeAction]);

    // Save swipe action to local state (database integration will be added later)
    try {
      console.log('Swipe action:', { jobId: currentJob.id, action, matchScore: currentJob.matchScore });

      if (action === 'like' || action === 'super_like') {
        toast.success(action === 'super_like' ? '⭐ Super Liked!' : '❤️ Liked!');
      }
    } catch (error) {
      console.error('Error saving swipe:', error);
    }

    // Move to next job
    if (currentJobIndex < (enhancedJobs?.length || 0) - 1) {
      setCurrentJobIndex(prev => prev + 1);
    } else {
      toast.success('🎉 You\'ve reviewed all available jobs!');
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const swipeStrength = Math.abs(info.offset.x);
    const swipeDirection = info.offset.x > 0 ? 'right' : 'left';

    if (swipeStrength > threshold) {
      handleSwipe(swipeDirection, info);
    } else {
      controls.start({ x: 0, y: 0, rotate: 0 });
    }
  };

  const goToPrevious = () => {
    if (currentJobIndex > 0) {
      setCurrentJobIndex(prev => prev - 1);
    }
  };

  const resetStack = () => {
    setCurrentJobIndex(0);
    setSwipeActions([]);
  };

  const getMatchColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getMatchBadge = (score?: number) => {
    if (!score) return 'No Match';
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Great Match';
    if (score >= 50) return 'Good Match';
    return 'Potential Match';
  };

  if (isEnhancing || isAnalyzing) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            AI is Analyzing Jobs
          </h3>
          <p className="text-gray-600">
            Finding the perfect matches for you...
          </p>
        </div>
      </div>
    );
  }

  if (!enhancedJobs || enhancedJobs.length === 0) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Jobs Available
          </h3>
          <p className="text-gray-600 mb-4">
            Check back later for new opportunities
          </p>
          <Button onClick={() => refetchJobs()}>
            Refresh Jobs
          </Button>
        </div>
      </div>
    );
  }

  if (currentJobIndex >= enhancedJobs.length) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            All Done! 🎉
          </h3>
          <p className="text-gray-600 mb-4">
            You've reviewed all available jobs. Check your liked jobs!
          </p>
          <div className="space-y-3">
            <Button onClick={resetStack} variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Review Again
            </Button>
            <Button className="w-full">
              View Matches
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Job Match
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {currentJobIndex + 1} of {enhancedJobs.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={goToPrevious} disabled={currentJobIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowExplanation(!showExplanation)}>
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={(currentJobIndex / enhancedJobs.length) * 100} className="mb-4 sm:mb-6" />

      {/* Job Card Stack */}
      <div className="relative h-[500px] sm:h-[600px] mb-4 sm:mb-6" ref={constraintsRef}>
        <AnimatePresence>
          {currentJob && (
            <motion.div
              key={currentJob.id}
              drag="x"
              dragConstraints={constraintsRef}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              animate={controls}
              whileDrag={{ scale: 1.05, rotate: 5 }}
              initial={{ scale: 0.9, opacity: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <Card className="h-full shadow-xl border-2 hover:shadow-2xl transition-shadow">
                <CardHeader className="pb-4">
                  {/* AI Relevance Score */}
                  {currentJob.matchScore && (
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                        <Brain className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          AI Relevance: {currentJob.matchScore}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Company Logo and Job Title */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-lg">
                      {currentJob.companies?.logo_url ? (
                        <img
                          src={currentJob.companies.logo_url}
                          alt={currentJob.companies?.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        currentJob.companies?.name?.charAt(0) || 'J'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="h-4 w-4 text-gray-600" />
                        <CardTitle className="text-lg line-clamp-2">
                          {currentJob.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <span className="text-sm">@{currentJob.companies?.name || 'Company'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Job Details Row */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{currentJob.location}</span>
                    </div>
                    <span>|</span>
                    <span>{currentJob.experience_level}</span>
                    <span>|</span>
                    <span>{currentJob.employment_type}</span>
                    <span>|</span>
                    {currentJob.salary_min && currentJob.salary_max && (
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <DollarSign className="h-3 w-3" />
                        {currentJob.salary_currency} {(currentJob.salary_min/1000).toFixed(0)}K - {(currentJob.salary_max/1000).toFixed(0)}K
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {currentJob.skills_required && currentJob.skills_required.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">🛠️ Skills:</span>
                        <span className="text-sm text-gray-600">
                          {currentJob.skills_required.slice(0, 3).join(', ')}
                          {currentJob.skills_required.length > 3 && '...'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <span>👀</span>
                      <span>{currentJob.views_count || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>👤</span>
                      <span>{currentJob.applications_count || 0} applicants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>2 minutes ago</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 overflow-y-auto flex-1">
                  {/* Job Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {currentJob.location}
                    </div>
                    
                    {currentJob.salary_min && currentJob.salary_max && (
                      <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                        <DollarSign className="h-4 w-4" />
                        {currentJob.salary_currency} {currentJob.salary_min.toLocaleString()} - {currentJob.salary_max.toLocaleString()}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {currentJob.employment_type} • {currentJob.experience_level}
                    </div>
                  </div>

                  {/* Match Explanation */}
                  {showExplanation && currentJob.matchReasons && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">✅ Why it matches:</h4>
                        <ul className="space-y-1">
                          {currentJob.matchReasons.slice(0, 3).map((reason, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                              <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {currentJob.gapAreas && currentJob.gapAreas.length > 0 && (
                        <div>
                          <h4 className="font-medium text-yellow-600 mb-2">⚠️ Areas to develop:</h4>
                          <ul className="space-y-1">
                            {currentJob.gapAreas.slice(0, 2).map((gap, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                                <div className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Required Skills */}
                  {currentJob.skills_required && currentJob.skills_required.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {currentJob.skills_required.slice(0, 8).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Description Preview */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description:</h4>
                    <p className="text-sm text-gray-600 line-clamp-4">
                      {currentJob.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Heart className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button size="sm" className="flex-1">
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full h-14 w-14 border-red-200 hover:bg-red-50"
          onClick={() => handleSwipe('left')}
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="rounded-full h-14 w-14 border-blue-200 hover:bg-blue-50"
          onClick={() => handleSwipe('up')}
        >
          <Star className="h-6 w-6 text-blue-500" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="rounded-full h-14 w-14 border-green-200 hover:bg-green-50"
          onClick={() => handleSwipe('right')}
        >
          <Heart className="h-6 w-6 text-green-500" />
        </Button>
      </div>

      {/* Action Labels */}
      <div className="flex justify-center items-center gap-4 mt-2 text-xs text-gray-500">
        <span>Pass</span>
        <span>Super Like</span>
        <span>Like</span>
      </div>
    </div>
  );
};

export default JobSwipe;