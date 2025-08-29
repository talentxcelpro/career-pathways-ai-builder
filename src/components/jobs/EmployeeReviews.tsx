import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Briefcase, Heart, Users, TrendingUp, MessageSquare } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  company_id: string;
  rating: number;
  title: string;
  pros: string;
  cons: string;
  advice_to_management: string;
  job_title: string;
  employment_status: 'current' | 'former';
  work_life_balance: number;
  culture_values: number;
  career_opportunities: number;
  compensation_benefits: number;
  created_at: string;
  helpful_count: number;
}

interface EmployeeReviewsProps {
  companyId: string;
  companyName: string;
}

export const EmployeeReviews: React.FC<EmployeeReviewsProps> = ({ companyId, companyName }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'insights'>('overview');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['company-reviews', companyId],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        {
          id: '1',
          company_id: companyId,
          rating: 4.2,
          title: 'Great place to grow your career',
          pros: 'Excellent learning opportunities, supportive management, good work-life balance',
          cons: 'Limited remote work options, could improve compensation',
          advice_to_management: 'Consider more flexible work arrangements',
          job_title: 'Software Engineer',
          employment_status: 'current' as const,
          work_life_balance: 4,
          culture_values: 5,
          career_opportunities: 4,
          compensation_benefits: 3,
          created_at: '2024-01-15',
          helpful_count: 12
        },
        {
          id: '2',
          company_id: companyId,
          rating: 3.8,
          title: 'Good company with room for improvement',
          pros: 'Strong team collaboration, interesting projects, learning culture',
          cons: 'Work can be demanding at times, benefits could be better',
          advice_to_management: 'Focus on employee wellness programs',
          job_title: 'Product Manager',
          employment_status: 'former' as const,
          work_life_balance: 3,
          culture_values: 4,
          career_opportunities: 4,
          compensation_benefits: 3,
          created_at: '2024-01-10',
          helpful_count: 8
        }
      ];
    }
  });

  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0;
  const ratingDistribution = {
    5: reviews.filter(r => r.rating >= 4.5).length,
    4: reviews.filter(r => r.rating >= 3.5 && r.rating < 4.5).length,
    3: reviews.filter(r => r.rating >= 2.5 && r.rating < 3.5).length,
    2: reviews.filter(r => r.rating >= 1.5 && r.rating < 2.5).length,
    1: reviews.filter(r => r.rating < 1.5).length,
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  if (isLoading) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Employee Reviews & Insights
        </CardTitle>
        <div className="flex gap-2">
          {['overview', 'reviews', 'insights'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab as any)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overall Rating */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{avgRating.toFixed(1)}</div>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(avgRating)}
                </div>
                <div className="text-sm text-gray-600">{reviews.length} reviews</div>
              </div>
              <div className="flex-1 space-y-2">
                {Object.entries(ratingDistribution).reverse().map(([rating, count]) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-6">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${(count / reviews.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Ratings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Work-Life Balance', icon: Heart, rating: 3.8 },
                { label: 'Culture & Values', icon: Users, rating: 4.2 },
                { label: 'Career Growth', icon: TrendingUp, rating: 3.9 },
                { label: 'Compensation', icon: Briefcase, rating: 3.5 }
              ].map((category) => (
                <div key={category.label} className="text-center p-4 bg-gray-50 rounded-lg">
                  <category.icon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="font-semibold text-lg">{category.rating}</div>
                  <div className="text-sm text-gray-600">{category.label}</div>
                  <div className="flex justify-center mt-1">
                    {renderStars(category.rating)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(review.rating)}
                      <span className="font-semibold">{review.title}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {review.job_title} • {review.employment_status === 'current' ? 'Current Employee' : 'Former Employee'}
                    </div>
                  </div>
                  <Badge variant={review.employment_status === 'current' ? 'default' : 'secondary'}>
                    {review.employment_status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-green-700 mb-1">Pros</div>
                    <div className="text-sm text-gray-700">{review.pros}</div>
                  </div>
                  <div>
                    <div className="font-medium text-red-700 mb-1">Cons</div>
                    <div className="text-sm text-gray-700">{review.cons}</div>
                  </div>
                  {review.advice_to_management && (
                    <div>
                      <div className="font-medium text-blue-700 mb-1">Advice to Management</div>
                      <div className="text-sm text-gray-700">{review.advice_to_management}</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Posted {new Date(review.created_at).toLocaleDateString()}
                  </div>
                  <Button variant="outline" size="sm">
                    Helpful ({review.helpful_count})
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Most Mentioned Pros</h3>
                <ul className="text-sm space-y-1">
                  <li>• Great learning opportunities</li>
                  <li>• Supportive management</li>
                  <li>• Good work-life balance</li>
                  <li>• Strong team collaboration</li>
                </ul>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Common Concerns</h3>
                <ul className="text-sm space-y-1">
                  <li>• Limited remote work options</li>
                  <li>• Compensation could be better</li>
                  <li>• Work can be demanding</li>
                  <li>• Benefits need improvement</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Employee Recommendations</h3>
              <div className="text-sm space-y-2">
                <div>• 78% of employees would recommend this company to a friend</div>
                <div>• 82% approve of the CEO</div>
                <div>• 65% have a positive outlook for the business</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};