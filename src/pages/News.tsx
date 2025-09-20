import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Clock, TrendingUp, Globe, Briefcase, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const News = () => {
  return (
    <>
      <Helmet>
        <title>Professional News | Industry Updates & Career Insights</title>
        <meta name="description" content="Stay updated with the latest professional news, industry trends, and career insights. Breaking news from the business and tech world." />
        <link rel="canonical" href="https://talentxcel.in/news" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Newspaper className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Professional News</h1>
            </div>
            <p className="text-muted-foreground">Stay informed with the latest industry news and career insights</p>
          </div>

          <div className="grid gap-6">
            {/* News Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: TrendingUp, label: "Trending", count: "24" },
                { icon: Briefcase, label: "Jobs", count: "12" },
                { icon: Globe, label: "Global", count: "18" },
                { icon: Users, label: "People", count: "8" }
              ].map((category, i) => (
                <Card key={i} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 text-center">
                    <category.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                    <h3 className="font-medium">{category.label}</h3>
                    <Badge variant="secondary" className="mt-1">{category.count} new</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Breaking News */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Breaking News
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Major Tech Company Announces 10,000 New Remote Jobs",
                      summary: "In a groundbreaking move, the company will be hiring across multiple departments with full remote flexibility.",
                      time: "2 hours ago",
                      category: "Jobs",
                      trending: true
                    },
                    {
                      title: "AI Revolution: New Skills Every Professional Needs",
                      summary: "Industry experts reveal the top 10 AI-related skills that will be in highest demand in 2024.",
                      time: "4 hours ago",
                      category: "Skills",
                      trending: true
                    }
                  ].map((news, i) => (
                    <div key={i} className="p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive">Breaking</Badge>
                            <Badge variant="outline">{news.category}</Badge>
                            {news.trending && <Badge variant="secondary">Trending</Badge>}
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{news.title}</h3>
                          <p className="text-muted-foreground mb-2">{news.summary}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{news.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Latest Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  Latest Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "The Future of Remote Work: Trends for 2024",
                      excerpt: "As remote work continues to evolve, we explore the key trends shaping the future of distributed teams.",
                      author: "Sarah Johnson",
                      time: "6 hours ago",
                      readTime: "5 min read",
                      category: "Workplace"
                    },
                    {
                      title: "Career Switching in the Digital Age",
                      excerpt: "A comprehensive guide to successfully transitioning careers in today's rapidly changing job market.",
                      author: "Mike Chen",
                      time: "8 hours ago",
                      readTime: "7 min read",
                      category: "Career"
                    },
                    {
                      title: "Emerging Tech Skills: What Employers Want",
                      excerpt: "Analysis of the most sought-after technical skills based on recent job postings and industry reports.",
                      author: "Emily Davis",
                      time: "12 hours ago",
                      readTime: "4 min read",
                      category: "Technology"
                    },
                    {
                      title: "Building Effective Professional Networks",
                      excerpt: "Strategies for growing and maintaining meaningful professional relationships in the digital era.",
                      author: "Alex Rodriguez",
                      time: "1 day ago",
                      readTime: "6 min read",
                      category: "Networking"
                    }
                  ].map((article, i) => (
                    <div key={i} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <Badge variant="outline" className="mb-3">{article.category}</Badge>
                      <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>By {article.author}</span>
                        <div className="flex items-center gap-3">
                          <span>{article.readTime}</span>
                          <span>{article.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Industry Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Industry Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { industry: "Technology", update: "New programming languages gaining popularity", impact: "High" },
                    { industry: "Finance", update: "Cryptocurrency regulations update", impact: "Medium" },
                    { industry: "Healthcare", update: "Telemedicine adoption continues to grow", impact: "High" },
                    { industry: "Education", update: "Online learning platforms see major investments", impact: "Medium" }
                  ].map((update, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{update.industry}</Badge>
                          <Badge variant={update.impact === 'High' ? 'destructive' : 'secondary'}>
                            {update.impact} Impact
                          </Badge>
                        </div>
                        <p className="font-medium">{update.update}</p>
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default News;