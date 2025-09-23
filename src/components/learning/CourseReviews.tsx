import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, MessageSquare, ThumbsUp, User } from 'lucide-react';
import { useCourseReviews, useUserCourseReview, useSubmitCourseReview, useCourseRatingStats } from '@/hooks/useCourseReviews';
import { supabase } from '@/integrations/supabase/client';

interface CourseReviewsProps {
  courseId: string;
}

export const CourseReviews: React.FC<CourseReviewsProps> = ({ courseId }) => {
  const [user, setUser] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const { data: reviews = [], isLoading: reviewsLoading } = useCourseReviews(courseId);
  const { data: userReview } = useUserCourseReview(courseId, user?.id);
  const { data: ratingStats } = useCourseRatingStats(courseId);
  const submitReview = useSubmitCourseReview();

  const handleSubmitReview = async () => {
    if (!user) return;

    await submitReview.mutateAsync({
      course_id: courseId,
      rating: selectedRating,
      review_text: reviewText.trim() || undefined,
      is_public: true,
    });

    setShowReviewForm(false);
    setReviewText('');
    setSelectedRating(5);
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
        />
      ))}
    </div>
  );

  if (reviewsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      {ratingStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Course Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{ratingStats.averageRating}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(ratingStats.averageRating))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {ratingStats.totalReviews} reviews
                </p>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingStats.ratingDistribution[rating] || 0;
                  const percentage = ratingStats.totalReviews > 0 
                    ? (count / ratingStats.totalReviews) * 100 
                    : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-3">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="w-8 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {user && !userReview && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            {!showReviewForm ? (
              <Button onClick={() => setShowReviewForm(true)} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  {renderStars(selectedRating, true, setSelectedRating)}
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Review (Optional)</label>
                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this course..."
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSubmitReview} disabled={submitReview.isPending}>
                    {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewText('');
                      setSelectedRating(5);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* User's Existing Review */}
      {userReview && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              {renderStars(userReview.rating)}
              <Badge variant="secondary">Your Review</Badge>
            </div>
            {userReview.review_text && (
              <p className="text-sm">{userReview.review_text}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Posted on {new Date(userReview.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Reviews ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews yet. Be the first to review this course!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {review.user_profiles?.profile_picture_url ? (
                        <img 
                          src={review.user_profiles.profile_picture_url} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">
                          {review.user_profiles?.full_name || 'Anonymous'}
                        </h4>
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {review.review_text && (
                        <p className="text-sm text-gray-700 mb-3">{review.review_text}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary">
                          <ThumbsUp className="h-3 w-3" />
                          Helpful ({review.helpful_votes})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};