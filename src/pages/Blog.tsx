
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Clock, User } from "lucide-react";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Career Tips', 'AI in Hiring', 'Learning & Development', 'Resume Help', 'Job Trends'];
  
  const featuredPosts = [
    {
      id: 1,
      title: "Top Skills in 2025: What Recruiters Want",
      excerpt: "Discover the most in-demand skills that will make you stand out in the competitive job market.",
      author: "Sarah Johnson",
      date: "2025-01-15",
      readTime: "5 min read",
      category: "Career Tips",
      featured: true
    },
    {
      id: 2,
      title: "AI Tools to Turbocharge Your Job Search",
      excerpt: "Learn how artificial intelligence can revolutionize your job hunting strategy and increase success rates.",
      author: "Michael Chen",
      date: "2025-01-12",
      readTime: "7 min read",
      category: "AI in Hiring",
      featured: true
    }
  ];

  const recentPosts = [
    {
      id: 3,
      title: "Career Pathing: How to Plan the Next 5 Years with Precision",
      excerpt: "Strategic career planning techniques to achieve your professional goals systematically.",
      author: "Emily Rodriguez",
      date: "2025-01-10",
      readTime: "6 min read",
      category: "Career Tips",
      featured: false
    },
    {
      id: 4,
      title: "Resume Optimization for ATS Systems",
      excerpt: "Master the art of creating ATS-friendly resumes that pass automated screening systems.",
      author: "David Kim",
      date: "2025-01-08",
      readTime: "4 min read",
      category: "Resume Help",
      featured: false
    },
    {
      id: 5,
      title: "The Future of Remote Work: Trends and Opportunities",
      excerpt: "Explore emerging trends in remote work and how to position yourself for success.",
      author: "Lisa Thompson",
      date: "2025-01-05",
      readTime: "8 min read",
      category: "Job Trends",
      featured: false
    },
    {
      id: 6,
      title: "Building Your Personal Brand on LinkedIn",
      excerpt: "Essential strategies for creating a compelling professional presence on LinkedIn.",
      author: "Mark Williams",
      date: "2025-01-03",
      readTime: "5 min read",
      category: "Career Tips",
      featured: false
    }
  ];

  const allPosts = [...featuredPosts, ...recentPosts];
  
  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularTags = ['Career Growth', 'Job Search', 'AI Tools', 'Resume Tips', 'Interview Prep', 'Networking', 'Skills Development'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">TalentXcel Blog</h1>
          <p className="text-xl text-blue-100">Insights for a Better Career</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Categories */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Posts */}
            {selectedCategory === 'All' && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary">{post.category}</Badge>
                          <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                        </div>
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        <p className="text-gray-600">{post.excerpt}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {post.author}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(post.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {post.readTime}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {selectedCategory === 'All' ? 'Recent Posts' : `${selectedCategory} Articles`}
              </h2>
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary">{post.category}</Badge>
                        {post.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                      </div>
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <p className="text-gray-600">{post.excerpt}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {post.author}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(post.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-gray-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
