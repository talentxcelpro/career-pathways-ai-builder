import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star, Quote, Calendar, ExternalLink, Award, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface TestimonialsSectionProps {
  userId?: string;
  showAddButton?: boolean;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ 
  userId, 
  showAddButton = false 
}) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  // Fetch user testimonials
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['user-testimonials', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from('service_testimonials')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!targetUserId
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Service Testimonials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!testimonials?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Service Testimonials
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Testimonials Yet</h3>
          <p className="text-muted-foreground mb-4">
            {showAddButton 
              ? "Complete services to receive testimonials from clients" 
              : "This user hasn't received any testimonials yet"
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Service Testimonials
            <Badge variant="secondary" className="ml-2">
              {testimonials.length}
            </Badge>
          </CardTitle>
          {showAddButton && (
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* Star Rating */}
                <div className="flex items-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm font-medium">{testimonial.rating}/5</span>
                </div>
                
                {/* Featured Badge */}
                {testimonial.is_featured && (
                  <Badge className="bg-purple-100 text-purple-800">
                    <Award className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              {/* Date */}
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                {format(new Date(testimonial.created_at), 'MMM yyyy')}
              </div>
            </div>

            {/* Service Info */}
            <div className="mb-2">
              <Badge variant="outline" className="text-xs">
                Service Order: {testimonial.service_order_id}
              </Badge>
            </div>

            {/* Testimonial Content */}
            <blockquote className="text-gray-700 leading-relaxed mb-3">
              <Quote className="w-4 h-4 text-blue-500 inline mr-1" />
              "{testimonial.testimonial_text}"
            </blockquote>

            {/* Service Experience */}
            {testimonial.service_experience && (
              <div className="bg-gray-50 rounded p-3 mb-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Experience: </span>
                  {testimonial.service_experience}
                </p>
              </div>
            )}

            {/* Recommendation */}
            {testimonial.would_recommend && (
              <div className="flex items-center text-sm text-green-600">
                <Award className="w-4 h-4 mr-1" />
                <span>Would recommend to others</span>
              </div>
            )}
          </div>
        ))}

        {/* Marketing Message */}
        {showAddButton && testimonials.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Boost Your Marketing</h4>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Share these testimonials to build trust with potential clients and grow your business!
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Share Testimonials
              </Button>
              <Button size="sm" variant="outline">
                Download as PDF
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};