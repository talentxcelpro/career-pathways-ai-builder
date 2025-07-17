
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ServiceReview } from "@/types/service";

interface ServiceReviewsProps {
  serviceId: string;
}

export default function ServiceReviews({ serviceId }: ServiceReviewsProps) {
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<ServiceReview | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [serviceId]);

  const fetchReviews = async () => {
    try {
      // First get reviews with basic data
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('service_reviews')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Get profile data for reviewers
      const reviewerIds = reviewsData?.map(review => review.reviewer_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', reviewerIds);

      if (profilesError) throw profilesError;

      // Combine reviews with profile data
      const reviewsWithProfiles = reviewsData?.map(review => ({
        ...review,
        profiles: profilesData?.find(profile => profile.id === review.reviewer_id)
      })) || [];

      setReviews(reviewsWithProfiles);
      
      // Check if current user has already reviewed
      if (user) {
        const existingReview = reviewsWithProfiles.find(review => review.reviewer_id === user.id);
        setUserReview(existingReview || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        service_id: serviceId,
        reviewer_id: user.id,
        rating,
        review_text: reviewText,
      };

      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('service_reviews')
          .update(reviewData)
          .eq('id', userReview.id);

        if (error) throw error;
      } else {
        // Create new review
        const { error } = await supabase
          .from('service_reviews')
          .insert([reviewData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: userReview ? "Review updated successfully" : "Review submitted successfully",
      });

      setShowForm(false);
      setRating(0);
      setReviewText('');
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Reviews ({reviews.length})
        </h3>
        {user && !showForm && (
          <Button
            onClick={() => {
              if (userReview) {
                setRating(userReview.rating);
                setReviewText(userReview.review_text);
              }
              setShowForm(true);
            }}
            variant={userReview ? "outline" : "default"}
          >
            {userReview ? "Edit Review" : "Write Review"}
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {userReview ? "Edit Your Review" : "Write a Review"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating *</label>
                {renderStars(rating, true, setRating)}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Review *</label>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this service..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No reviews yet. Be the first to review this service!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {review.profiles?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {review.profiles?.full_name || 'Anonymous User'}
                        {review.is_verified && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Verified
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm">{review.review_text}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
