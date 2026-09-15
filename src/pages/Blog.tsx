// src/pages/Blog.tsx
// TalentXcel Official Blog & Career Insights Hub
// Features 26 comprehensive, categorized articles with high-resolution imagery,
// dynamic category/tag filtering, search, and direct routing to /blog/:slug.

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  Sparkles, 
  Tag as TagIcon,
  BookOpen,
  TrendingUp,
  SlidersHorizontal
} from "lucide-react";
import { BLOG_POSTS, BlogPostItem } from '@/data/blogPostsData';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Compute dynamic categories with counts
  const categories = useMemo(() => {
    const cats = ['All'];
    const countMap: Record<string, number> = { All: BLOG_POSTS.length };
    
    BLOG_POSTS.forEach(post => {
      countMap[post.category] = (countMap[post.category] || 0) + 1;
      if (!cats.includes(post.category)) {
        cats.push(post.category);
      }
    });

    return cats.map(cat => ({ name: cat, count: countMap[cat] || 0 }));
  }, []);

  // Compute all unique popular tags
  const popularTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    BLOG_POSTS.forEach(post => {
      post.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag]) => tag);
  }, []);

  // Filter posts based on search, category, and active tag
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query || 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(t => t.toLowerCase().includes(query)) ||
        post.author.name.toLowerCase().includes(query);

      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesTag = !selectedTag || post.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchTerm, selectedCategory, selectedTag]);

  const featuredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => post.featured);
  }, []);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null); // Toggle off
    } else {
      setSelectedTag(tag);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>TalentXcel Blog | AI Career Intelligence, Resumes, Salaries & Tech Hiring</title>
        <meta 
          name="description" 
          content="Explore authoritative guides on AI-driven job search, ATS resume algorithms, tech salary negotiations, system design interviews, and global tech career mobility." 
        />
        <link rel="canonical" href="https://talentxcel.in/blog" />
        <meta property="og:title" content="TalentXcel Blog | AI Career Intelligence & Tech Hiring" />
        <meta property="og:description" content="25+ comprehensive articles on modern career acceleration, resume engineering, and high-paying tech skills." />
        <meta property="og:image" content={BLOG_POSTS[0].imageUrl} />
        <meta property="og:url" content="https://talentxcel.in/blog" />
      </Helmet>

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-10 pb-8 border-b border-slate-800/80 bg-gradient-to-b from-blue-950/30 via-slate-950 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Career Knowledge &amp; Guides · 26 Articles
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Careers, Engineered with Intelligence
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Practical guides on job search, resume optimization, interview prep, salary benchmarks, and career acceleration.
          </p>

          {/* Search bar in Hero */}
          <div className="mt-5 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search articles, skills, salaries, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus-visible:ring-blue-500 text-xs sm:text-sm shadow-md"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Navigation Pills */}
        <div className="mb-6 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSelectedTag(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== 'All' || selectedTag || searchTerm) && (
          <div className="mb-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
              <span className="font-semibold text-white">Filtering by:</span>
              {selectedCategory !== 'All' && (
                <Badge variant="secondary" className="bg-blue-500/15 text-blue-400 border-blue-500/30">
                  Category: {selectedCategory}
                </Badge>
              )}
              {selectedTag && (
                <Badge variant="secondary" className="bg-purple-500/15 text-purple-400 border-purple-500/30">
                  Tag: #{selectedTag}
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="bg-amber-500/15 text-amber-400 border-amber-500/30">
                  Query: "{searchTerm}"
                </Badge>
              )}
              <span className="text-slate-400">({filteredPosts.length} matches)</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedTag(null);
                setSearchTerm('');
              }}
              className="text-xs text-slate-400 hover:text-white h-7 px-2"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Featured Posts (Only when on 'All' without active search/tag) */}
        {selectedCategory === 'All' && !selectedTag && !searchTerm && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Featured Intelligence Reports
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.slice(0, 3).map((post) => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.slug}`}
                  className="group block rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-slate-700 transition-all hover:shadow-2xl hover:shadow-blue-500/5 flex flex-col"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-blue-600 text-white font-semibold text-[10px] uppercase tracking-wider">
                        {post.category}
                      </Badge>
                      <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px] uppercase">
                        Featured
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <img 
                          src={post.author.avatar} 
                          alt={post.author.name}
                          className="w-5 h-5 rounded-full object-cover border border-slate-700" 
                        />
                        <span className="font-medium text-slate-300">{post.author.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{post.readTime}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Grid + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Articles List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {selectedCategory === 'All' ? 'All Publications' : `${selectedCategory}`}
                <span className="text-sm font-normal text-slate-400 ml-2">({filteredPosts.length} articles)</span>
              </h2>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">No articles matched your criteria</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  Try clearing your search or switching categories to discover our full library of 26 career reports.
                </p>
                <Button 
                  onClick={() => { setSelectedCategory('All'); setSelectedTag(null); setSearchTerm(''); }}
                  className="mt-5 bg-blue-600 hover:bg-blue-500 text-white text-xs"
                >
                  View All 26 Articles
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group block rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-blue-500/5 flex flex-col"
                  >
                    {/* Article Image */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-slate-950/80 backdrop-blur-md text-blue-400 border border-blue-500/30 text-[10px] uppercase font-semibold">
                          {post.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-slate-300 font-medium">
                        {post.readTime}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800/80">
                        {/* Tags list snippet */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Author & Date Footer */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <img 
                              src={post.author.avatar} 
                              alt={post.author.name}
                              className="w-5 h-5 rounded-full object-cover border border-slate-700" 
                            />
                            <span className="font-medium text-slate-300">{post.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Platform Quick Links Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">TalentXcel Career Tools</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Put these insights into practice with our AI-powered career operating tools.
              </p>
              <div className="space-y-2">
                <Link 
                  to="/resume"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 hover:border-blue-500/40 hover:text-white transition-colors"
                >
                  <span>Build ATS Resume</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                </Link>
                <Link 
                  to="/jobs"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 hover:border-blue-500/40 hover:text-white transition-colors"
                >
                  <span>Browse Verified Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                </Link>
                <Link 
                  to="/career-map"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 hover:border-blue-500/40 hover:text-white transition-colors"
                >
                  <span>5-Year Career Map</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                </Link>
                <Link 
                  to="/colleges"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 hover:border-blue-500/40 hover:text-white transition-colors"
                >
                  <span>10,250+ College Hubs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                </Link>
              </div>
            </div>

            {/* Popular Topics & Tags */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <TagIcon className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Popular Topics & Tags</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularTags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Newsletter / RSS Info */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <div className="font-semibold text-white text-sm mb-1">Weekly Intelligence Dispatch</div>
              <p className="leading-relaxed mb-3">
                Updated weekly with verified hiring trends, labor economics, and engineering benchmarks.
              </p>
              <div className="text-[11px] text-slate-500">
                Primary Publisher: <span className="text-slate-400">TalentXcel Services Private Limited</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
