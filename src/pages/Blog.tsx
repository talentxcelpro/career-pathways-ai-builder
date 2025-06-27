
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Calendar, 
  User, 
  Clock,
  TrendingUp,
  Brain,
  BookOpen,
  FileText,
  BarChart3
} from 'lucide-react';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { name: 'Career Tips', count: 24, icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
    { name: 'AI in Hiring', count: 18, icon: Brain, color: 'bg-purple-100 text-purple-700' },
    { name: 'Learning & Development', count: 32, icon: BookOpen, color: 'bg-green-100 text-green-700' },
    { name: 'Resume Help', count: 15, icon: FileText, color: 'bg-orange-100 text-orange-700' },
    { name: 'Job Trends', count: 21, icon: BarChart3, color: 'bg-pink-100 text-pink-700' }
  ];

  const featuredPosts = [
    {
      id: 1,
      title: "Top Skills in 2025: What Recruiters Want",
      excerpt: "Discover the most in-demand skills that will make you stand out in today's competitive job market.",
      author: "Sarah Chen",
      date: "June 25, 2025",
      readTime: "5 min read",
      category: "Career Tips",
      image: "/lovable-uploads/5a3d4a06-3cd5-45aa-b2bd-897e40811280.png",
      featured: true
    },
    {
      id: 2,
      title: "AI Tools to Turbocharge Your Job Search",
      excerpt: "Learn how artificial intelligence can help you find better opportunities faster and more efficiently.",
      author: "Marcus Rodriguez",
      date: "June 23, 2025",
      readTime: "7 min read",
      category: "AI in Hiring",
      image: "/lovable-uploads/5a3d4a06-3cd5-45aa-b2bd-897e40811280.png",
      featured: true
    },
    {
      id: 3,
      title: "Career Pathing: How to Plan the Next 5 Years with Precision",
      excerpt: "Strategic career planning techniques that successful professionals use to achieve their goals.",
      author: "Dr. Amanda Foster",
      date: "June 20, 2025",
      readTime: "8 min read",
      category: "Career Tips",
      image: "/lovable-uploads/5a3d4a06-3cd5-45aa-b2bd-897e40811280.png",
      featured: true
    }
  ];

  const recentPosts = [
    {
      id: 4,
      title: "The Future of Remote Work: Trends to Watch",
      excerpt: "How remote work is evolving and what it means for your career.",
      author: "James Liu",
      date: "June 18, 2025",
      readTime: "6 min read",
      category: "Job Trends",
      featured: false
    },
    {
      id: 5,
      title: "Building a Personal Brand on LinkedIn",
      excerpt: "Essential strategies for creating a compelling professional presence.",
      author: "Emily Johnson",
      date: "June 15, 2025",
      readTime: "4 min read",
      category: "Career Tips",
      featured: false
    },
    {
      id: 6,
      title: "Mastering the Technical Interview",
      excerpt: "Preparation strategies and common questions for tech roles.",
      author: "Alex Kumar",
      date: "June 12, 2025",
      readTime: "9 min read",
      category: "Resume Help",
      featured: false
    }
  ];

  const popularTags = [
    "Career Growth", "Job Search", "AI Tools", "Resume Tips", "Interview Prep",
    "Networking", "Skills Development", "Remote Work", "Leadership", "Productivity"
  ];

  const allPosts = [...featuredPosts, ...recentPosts];
  const filteredPosts = allPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFeaturedPosts = filteredPosts.filter(post => post.featured);
  const filteredRecentPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TalentXcel Blog – Insights for a Better Career
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert advice, industry insights, and actionable tips to accelerate your career growth
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg bg-white/60 backdrop-blur-sm border-0 shadow-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Categories */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <category.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.count} articles</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Featured Posts */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeaturedPosts.map((post) => (
                  <Card key={post.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105">
                    <div className="aspect-video bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-lg"></div>
                    <CardHeader>
                      <Badge className={`w-fit mb-2 ${categories.find(c => c.name === post.category)?.color}`}>
                        {post.category}
                      </Badge>
                      <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{post.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
              <div className="space-y-6">
                {filteredRecentPosts.map((post) => (
                  <Card key={post.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <Badge className={`w-fit mb-2 ${categories.find(c => c.name === post.category)?.color}`}>
                            {post.category}
                          </Badge>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                          <p className="text-gray-600 mb-4">{post.excerpt}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{post.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{post.readTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-full sm:w-32 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex-shrink-0"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg mb-6">
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-blue-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Newsletter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Get the latest career insights delivered to your inbox.</p>
                <div className="space-y-3">
                  <Input placeholder="Your email address" />
                  <Button className="w-full">Subscribe</Button>
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
