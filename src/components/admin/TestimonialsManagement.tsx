import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star, Search, CheckCircle, X, Eye, MessageSquare, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const TestimonialsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch testimonials
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['admin-testimonials', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('service_testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        if (statusFilter === 'verified') {
          query = query.eq('is_verified', true);
        } else if (statusFilter === 'pending') {
          query = query.eq('is_verified', false);
        } else if (statusFilter === 'featured') {
          query = query.eq('is_featured', true);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Verify testimonial mutation
  const verifyTestimonial = useMutation({
    mutationFn: async ({ id, isVerified }: { id: string; isVerified: boolean }) => {
      const { error } = await supabase
        .from('service_testimonials')
        .update({ is_verified: isVerified })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Testimonial status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update testimonial');
    }
  });

  // Feature testimonial mutation
  const featureTestimonial = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const { error } = await supabase
        .from('service_testimonials')
        .update({ is_featured: isFeatured })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Testimonial featured status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update featured status');
    }
  });

  const filteredTestimonials = testimonials?.filter(testimonial =>
    testimonial.testimonial_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (testimonial: any) => {
    if (testimonial.is_featured) return 'bg-purple-100 text-purple-800';
    if (testimonial.is_verified) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (testimonial: any) => {
    if (testimonial.is_featured) return 'Featured';
    if (testimonial.is_verified) return 'Verified';
    return 'Pending';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testimonials Management</h1>
          <p className="text-muted-foreground">Review and manage user testimonials</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredTestimonials?.length || 0} Total
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search testimonials or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTestimonials?.map((testimonial) => (
          <Card key={testimonial.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">User ID: {testimonial.user_id}</h3>
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {testimonial.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(testimonial)}>
                  {getStatusText(testimonial)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Service Info */}
              <div className="text-sm">
                <span className="font-medium">Service Order ID:</span> {testimonial.service_order_id}
              </div>

              {/* Testimonial Text */}
              <div>
                <p className="text-sm text-gray-700 line-clamp-3">
                  "{testimonial.testimonial_text}"
                </p>
              </div>

              {/* Service Experience */}
              {testimonial.service_experience && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Experience:</span>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {testimonial.service_experience}
                  </p>
                </div>
              )}

              {/* Recommendation */}
              {testimonial.would_recommend && (
                <div className="flex items-center text-sm text-green-600">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Would recommend
                </div>
              )}

              {/* Date */}
              <div className="text-xs text-muted-foreground">
                Submitted: {format(new Date(testimonial.created_at), 'MMM dd, yyyy')}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {!testimonial.is_verified ? (
                  <Button
                    size="sm"
                    onClick={() => verifyTestimonial.mutate({ id: testimonial.id, isVerified: true })}
                    disabled={verifyTestimonial.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verify
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => verifyTestimonial.mutate({ id: testimonial.id, isVerified: false })}
                    disabled={verifyTestimonial.isPending}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Unverify
                  </Button>
                )}

                <Button
                  size="sm"
                  variant={testimonial.is_featured ? "default" : "outline"}
                  onClick={() => featureTestimonial.mutate({ 
                    id: testimonial.id, 
                    isFeatured: !testimonial.is_featured 
                  })}
                  disabled={featureTestimonial.isPending}
                >
                  <Star className="w-4 h-4 mr-1" />
                  {testimonial.is_featured ? 'Unfeature' : 'Feature'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTestimonials?.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Testimonials Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'No testimonials match your search criteria.' : 'No testimonials available.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};