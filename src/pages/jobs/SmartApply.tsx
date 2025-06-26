
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SmartApply = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matchScore, setMatchScore] = useState(0);
  const [optimizations, setOptimizations] = useState<string[]>([]);

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', id],
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
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: resumes } = useQuery({
    queryKey: ['user-resumes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: coverLetters } = useQuery({
    queryKey: ['user-cover-letters'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const smartApplyMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Select best resume and cover letter (for demo, using most recent)
      const bestResume = resumes?.[0];
      const bestCoverLetter = coverLetters?.[0];

      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: id,
          user_id: user.id,
          resume_url: bestResume?.file_url,
          cover_letter: bestCoverLetter?.content,
          ai_match_score: matchScore,
          status: 'applied'
        })
        .select()
        .single();

      if (error) throw error;

      // Increment job applications count
      await supabase.rpc('increment_job_applications', { job_id: id });

      return data;
    },
    onSuccess: () => {
      toast.success('Smart application submitted successfully!');
      navigate(`/jobs/${id}`);
    },
    onError: (error) => {
      console.error('Smart apply error:', error);
      toast.error('Failed to submit application');
    }
  });

  useEffect(() => {
    if (job && resumes && coverLetters) {
      // Simulate AI analysis
      const calculateMatchScore = () => {
        let score = 0.65; // Base score
        
        // Check skill matches (simplified)
        if (job.skills_required && resumes?.[0]?.content) {
          score += 0.15;
        }
        
        // Check experience level
        if (job.experience_level === 'entry') {
          score += 0.1;
        }
        
        setMatchScore(Math.min(score, 1.0));
      };

      const generateOptimizations = () => {
        const opts = [
          'Resume tailored to match job requirements',
          'Cover letter personalized for company culture',
          'Skills section optimized for ATS scanning',
          'Keywords from job description incorporated'
        ];
        setOptimizations(opts);
      };

      calculateMatchScore();
      generateOptimizations();
    }
  }, [job, resumes, coverLetters]);

  if (jobLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          Smart Apply
        </h1>
        <p className="text-gray-600 mt-2">
          AI-optimized application for {job.title} at {job.companies?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Job Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-gray-600">{job.companies?.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">{job.location}</p>
                <p className="text-sm text-gray-600">{job.employment_type}</p>
              </div>

              {job.skills_required && (
                <div>
                  <p className="font-medium mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.slice(0, 6).map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Match Analysis
            </CardTitle>
            <CardDescription>
              Your compatibility score for this position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {Math.round(matchScore * 100)}%
                </div>
                <p className="text-gray-600">Match Score</p>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <p className="font-medium mb-2">AI Optimizations Applied:</p>
                <ul className="space-y-1">
                  {optimizations.map((opt, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Application Preview</CardTitle>
          <CardDescription>
            Review your optimized application before submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Resume</p>
                <p className="text-sm text-gray-600">
                  {resumes?.[0]?.title || 'Default Resume'}
                </p>
              </div>
              <Badge variant="outline">Optimized</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Cover Letter</p>
                <p className="text-sm text-gray-600">
                  {coverLetters?.[0]?.title || 'AI-Generated Cover Letter'}
                </p>
              </div>
              <Badge variant="outline">Personalized</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <Button
          onClick={() => smartApplyMutation.mutate()}
          disabled={smartApplyMutation.isPending}
          className="flex-1"
        >
          {smartApplyMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Applying...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Smart Apply Now
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate(`/jobs/${id}/apply`)}
          className="flex-1"
        >
          Manual Apply
        </Button>
      </div>

      {matchScore < 0.7 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="font-medium text-yellow-800">
              Consider improving your profile
            </p>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Your match score could be higher. Consider updating your skills or experience to better align with this role.
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartApply;
