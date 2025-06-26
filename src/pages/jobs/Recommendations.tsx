
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, X, Sparkles, MapPin, Building, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Recommendations = () => {
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['job-recommendations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('job_recommendations')
        .select(`
          *,
          jobs (
            *,
            companies (
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_viewed', false)
        .order('match_score', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const updateRecommendationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('job_recommendations')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-recommendations'] });
    }
  });

  const handleLike = (recommendation: any) => {
    updateRecommendationMutation.mutate({
      id: recommendation.id,
      updates: { is_viewed: true }
    });
    toast.success('Added to your interested jobs!');
  };

  const handleDislike = (recommendation: any) => {
    updateRecommendationMutation.mutate({
      id: recommendation.id,
      updates: { is_viewed: true }
    });
    toast.info('We\'ll show you fewer jobs like this');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          AI Job Recommendations
        </h1>
        <p className="text-gray-600 mt-2">
          Jobs matched to your profile, skills, and career goals
        </p>
      </div>

      {!recommendations || recommendations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
            <p className="text-gray-600 mb-4">
              Complete your profile to get personalized job recommendations
            </p>
            <Button asChild>
              <Link to="/profile/edit">Complete Profile</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((recommendation) => {
            const job = recommendation.jobs;
            const company = job.companies;
            
            return (
              <Card key={recommendation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {company?.logo_url && (
                        <img
                          src={company.logo_url}
                          alt={company.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg line-clamp-2">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {company?.name}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      {Math.round((recommendation.match_score || 0) * 100)}% match
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {job.employment_type}
                    </div>

                    {job.salary_min && job.salary_max && (
                      <div className="text-sm font-medium text-green-600">
                        ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {job.skills_required && (
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {job.skills_required.slice(0, 4).map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills_required.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills_required.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {recommendation.recommendation_reason && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Sparkles className="h-4 w-4 inline mr-1" />
                        {recommendation.recommendation_reason}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDislike(recommendation)}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Not Interested
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleLike(recommendation)}
                      className="flex-1"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      Interested
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/jobs/${job.id}`}>View Details</Link>
                    </Button>
                    
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/jobs/${job.id}/smart-apply`}>Smart Apply</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
