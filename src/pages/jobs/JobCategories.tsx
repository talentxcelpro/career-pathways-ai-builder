
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, TrendingUp, Users, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function JobCategories() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCategory = searchParams.get('category');

  // Fetch job categories with job counts
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['job-categories-with-counts'],
    queryFn: async () => {
      // First get all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('job_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) throw categoriesError;

      // Then get job counts for each category
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category) => {
          const { count, error } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_active', true);

          if (error) {
            console.error('Error fetching job count for category:', category.name, error);
            return { ...category, job_count: 0 };
          }

          return { ...category, job_count: count || 0 };
        })
      );

      return categoriesWithCounts;
    }
  });

  // Fetch jobs for selected category
  const { data: categoryJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['category-jobs', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];

      const category = categories.find(c => c.slug === selectedCategory);
      if (!category) return [];

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry,
            location
          )
        `)
        .eq('category_id', category.id)
        .eq('is_active', true)
        .order('posted_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedCategory && categories.length > 0
  });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (category: any) => {
    navigate(`/jobs?category=${category.slug}`);
  };

  const getIconForCategory = (iconName: string | null) => {
    // You can expand this mapping based on your needs
    switch (iconName) {
      case 'Code':
        return '💻';
      case 'Palette':
        return '🎨';
      case 'Megaphone':
        return '📢';
      case 'TrendingUp':
        return '📈';
      case 'Database':
        return '📊';
      case 'Package':
        return '📦';
      case 'Settings':
        return '⚙️';
      case 'DollarSign':
        return '💰';
      case 'Users':
        return '👥';
      case 'Heart':
        return '❤️';
      default:
        return '💼';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Briefcase className="h-8 w-8 mr-3 text-blue-500" />
                Job Categories
              </h1>
              <p className="text-gray-600 mt-2">
                Explore opportunities by category
              </p>
            </div>
            <Button onClick={() => navigate('/jobs')}>
              View All Jobs
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCategoryClick(category)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl mb-2">
                    {getIconForCategory(category.icon_name)}
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {category.job_count} jobs
                  </Badge>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                
                {category.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">
                    Browse Jobs
                  </Button>
                  {category.job_count > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Active</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Category Jobs Preview */}
        {selectedCategory && categoryJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              Latest {categories.find(c => c.slug === selectedCategory)?.name} Jobs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryJobs.slice(0, 6).map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {job.companies?.logo_url ? (
                          <img
                            src={job.companies.logo_url}
                            alt={job.companies.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Briefcase className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.companies?.name}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{job.location || 'Remote'}</span>
                          </div>
                          {job.salary_max && (
                            <div className="flex items-center">
                              <span>${job.salary_min?.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={() => navigate(`/jobs?category=${selectedCategory}`)}>
                View All {categories.find(c => c.slug === selectedCategory)?.name} Jobs
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms to find categories.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
