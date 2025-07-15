import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, User, Eye, Heart, BookOpen, TrendingUp, Target, Users, Lightbulb, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CareerContent {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'career_advice' | 'interview_tips' | 'resume_help' | 'skill_development' | 'industry_insights' | 'market_trends';
  author: {
    name: string;
    title: string;
    avatar?: string;
  };
  reading_time: number;
  views_count: number;
  likes_count: number;
  created_at: string;
  featured_image_url?: string;
  tags: string[];
}

export function CareerContentHub() {
  const [content, setContent] = useState<CareerContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<CareerContent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    { id: 'all', label: 'All Content', icon: BookOpen },
    { id: 'career_advice', label: 'Career Advice', icon: Target },
    { id: 'interview_tips', label: 'Interview Tips', icon: Users },
    { id: 'resume_help', label: 'Resume Help', icon: User },
    { id: 'skill_development', label: 'Skill Development', icon: TrendingUp },
    { id: 'industry_insights', label: 'Industry Insights', icon: Lightbulb },
    { id: 'market_trends', label: 'Market Trends', icon: BarChart3 }
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [content, searchQuery, selectedCategory]);

  const fetchContent = async () => {
    try {
      // Mock data for now - will be replaced with actual API call
      const mockContent: CareerContent[] = [
        {
          id: '1',
          title: '10 Essential Tips for Acing Your Next Tech Interview',
          excerpt: 'Master the technical interview process with these proven strategies from industry experts.',
          content: 'Full article content here...',
          category: 'interview_tips',
          author: {
            name: 'Sarah Johnson',
            title: 'Senior Technical Recruiter at Google',
            avatar: ''
          },
          reading_time: 8,
          views_count: 1234,
          likes_count: 89,
          created_at: new Date().toISOString(),
          featured_image_url: '',
          tags: ['interview', 'tech', 'preparation', 'coding']
        },
        {
          id: '2',
          title: 'How to Write a Resume That Gets You Hired in 2024',
          excerpt: 'Learn the latest resume trends and ATS optimization techniques that recruiters are looking for.',
          content: 'Full article content here...',
          category: 'resume_help',
          author: {
            name: 'Michael Chen',
            title: 'Career Coach & Resume Expert',
            avatar: ''
          },
          reading_time: 12,
          views_count: 2156,
          likes_count: 167,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          featured_image_url: '',
          tags: ['resume', 'ATS', 'hiring', 'career']
        },
        {
          id: '3',
          title: 'The Future of Remote Work: Industry Trends for 2024',
          excerpt: 'Explore how remote work is evolving and what it means for your career prospects.',
          content: 'Full article content here...',
          category: 'market_trends',
          author: {
            name: 'Emily Rodriguez',
            title: 'Workplace Analyst at Future Corp',
            avatar: ''
          },
          reading_time: 6,
          views_count: 876,
          likes_count: 45,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          featured_image_url: '',
          tags: ['remote work', 'trends', 'future', 'workplace']
        },
        {
          id: '4',
          title: 'Building In-Demand Skills: Python for Data Science',
          excerpt: 'A comprehensive guide to learning Python for data science and analytics roles.',
          content: 'Full article content here...',
          category: 'skill_development',
          author: {
            name: 'David Kim',
            title: 'Data Science Lead at TechStart',
            avatar: ''
          },
          reading_time: 15,
          views_count: 1789,
          likes_count: 234,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          featured_image_url: '',
          tags: ['python', 'data science', 'skills', 'programming']
        },
        {
          id: '5',
          title: 'Salary Negotiation: How to Get the Pay You Deserve',
          excerpt: 'Master the art of salary negotiation with these expert-backed strategies.',
          content: 'Full article content here...',
          category: 'career_advice',
          author: {
            name: 'Jennifer Adams',
            title: 'Executive Career Coach',
            avatar: ''
          },
          reading_time: 10,
          views_count: 1456,
          likes_count: 198,
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          featured_image_url: '',
          tags: ['salary', 'negotiation', 'career growth', 'compensation']
        }
      ];

      setContent(mockContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load career content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = content;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredContent(filtered);
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : BookOpen;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      career_advice: 'bg-blue-100 text-blue-800',
      interview_tips: 'bg-green-100 text-green-800',
      resume_help: 'bg-purple-100 text-purple-800',
      skill_development: 'bg-orange-100 text-orange-800',
      industry_insights: 'bg-yellow-100 text-yellow-800',
      market_trends: 'bg-red-100 text-red-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-12 bg-muted rounded"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Career Content Hub</h1>
          <p className="text-muted-foreground">
            Discover expert advice, industry insights, and practical tips to advance your career.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search articles, tips, and insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-7 w-full">
          {categories.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Featured Content */}
          {filteredContent.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Featured Content</h2>
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <Badge className={getCategoryColor(filteredContent[0].category)}>
                        {filteredContent[0].category.replace('_', ' ')}
                      </Badge>
                      <h3 className="text-2xl font-bold">{filteredContent[0].title}</h3>
                      <p className="text-muted-foreground">{filteredContent[0].excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {filteredContent[0].author.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {filteredContent[0].reading_time} min read
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {filteredContent[0].views_count.toLocaleString()} views
                        </div>
                      </div>
                      <Button>Read Article</Button>
                    </div>
                    <div className="bg-muted/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.slice(1).map((article) => {
              const Icon = getCategoryIcon(article.category);
              return (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={getCategoryColor(article.category)}>
                        <Icon className="w-3 h-3 mr-1" />
                        {article.category.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {article.reading_time}m
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views_count.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {article.likes_count}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Read More
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                        {article.author.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{article.author.name}</div>
                        <div>{article.author.title}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No content found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or browse different categories.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}