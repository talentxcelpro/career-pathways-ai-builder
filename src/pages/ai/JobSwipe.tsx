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

const JobSwipe = () => {
  console.log('JobSwipe component rendering');
  
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['tinder-jobs'],
    queryFn: async () => {
      console.log('Fetching jobs...');
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
        .limit(10);

      if (error) {
        console.error('Jobs query error:', error);
        throw error;
      }
      console.log('Jobs data:', data);
      
      // Add mock match scores
      const enhancedJobs = data?.map(job => ({
        ...job,
        matchScore: Math.floor(Math.random() * 40) + 60,
        matchReasons: ['Skills match your profile', 'Location preference'],
        gapAreas: ['Experience level could be improved']
      })) || [];
      
      return enhancedJobs as JobSwipeData[];
    }
  });

  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const currentJob = jobs?.[currentJobIndex];

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Jobs</h3>
          <p className="text-gray-600">Fetching available jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center py-12">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Jobs</h3>
          <p className="text-gray-600">{error?.message || 'Failed to load jobs'}</p>
        </div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Available</h3>
          <p className="text-gray-600">Check back later for new opportunities</p>
        </div>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All Done! 🎉</h3>
          <p className="text-gray-600">You've reviewed all available jobs!</p>
        </div>
      </div>
    );
  }

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    const action = direction === 'right' ? 'like' : direction === 'up' ? 'super_like' : 'pass';
    
    if (action === 'like') toast.success('❤️ Liked!');
    if (action === 'super_like') toast.success('⭐ Super Liked!');
    
    setCurrentJobIndex(prev => prev + 1);
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Job Match
          </h1>
          <p className="text-sm text-gray-600">{currentJobIndex + 1} of {jobs.length}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={(currentJobIndex / jobs.length) * 100} className="mb-6" />

      {/* Job Card */}
      <Card className="h-[600px] shadow-xl border-2 mb-6">
        <CardHeader className="pb-4">
          {/* AI Relevance Score */}
          {currentJob.matchScore && (
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full mb-3 w-fit">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                🧠 AI Relevance: {currentJob.matchScore}%
              </span>
            </div>
          )}

          {/* Company Logo and Job Title */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-lg">
              {currentJob.companies?.name?.charAt(0) || 'J'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold">🧑‍💼</span>
                <CardTitle className="text-lg">{currentJob.title}</CardTitle>
              </div>
              <div className="text-gray-600 text-sm">
                @{currentJob.companies?.name || 'Company'}
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 flex-wrap">
            <span>{currentJob.location}</span>
            <span>|</span>
            <span>{currentJob.experience_level}</span>
            <span>|</span>
            <span>{currentJob.employment_type}</span>
            <span>|</span>
            <span className="text-green-600 font-medium">
              ₹{((currentJob.salary_min || 0)/100000).toFixed(0)} LPA - {((currentJob.salary_max || 0)/100000).toFixed(0)} LPA
            </span>
          </div>

          {/* Skills */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">🛠️ Skills:</span>
              <span className="text-sm text-gray-600">
                {currentJob.skills_required?.slice(0, 4).join(', ') || 'React, JavaScript, TypeScript, Node.js'}...
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>👀 {currentJob.views_count || 0} views</span>
            <span>👤 {currentJob.applications_count || 0} applicants</span>
            <span>🕒 2 minutes ago</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600 line-clamp-6">{currentJob.description}</p>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" className="flex-1">
              ❤️ Save
            </Button>
            <Button size="sm" className="flex-1">
              🔗 Apply Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Swipe Actions */}
      <div className="flex justify-center items-center gap-4">
        <Button
          size="lg"
          variant="outline"
          className="w-16 h-16 rounded-full border-2 border-red-200 hover:bg-red-50"
          onClick={() => handleSwipe('left')}
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          className="w-20 h-16 rounded-full border-2 border-blue-200 hover:bg-blue-50"
          onClick={() => handleSwipe('up')}
        >
          <Star className="h-6 w-6 text-blue-500" />
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          className="w-16 h-16 rounded-full border-2 border-green-200 hover:bg-green-50"
          onClick={() => handleSwipe('right')}
        >
          <Heart className="h-6 w-6 text-green-500" />
        </Button>
      </div>

      {/* Action Labels */}
      <div className="flex justify-center items-center gap-8 mt-3">
        <span className="text-xs text-red-500 font-medium">Pass</span>
        <span className="text-xs text-blue-500 font-medium">Super Like</span>
        <span className="text-xs text-green-500 font-medium">Like</span>
      </div>
    </div>
  );
};

export default JobSwipe;