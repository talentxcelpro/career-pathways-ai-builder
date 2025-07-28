import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Eye, Search, Filter, Award, Users, Sparkles, FileText } from "lucide-react";
import talentxcelLogo from "@/assets/talentxcel-logo.png";

interface Article {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  author_name: string;
  read_time: string;
  views: number;
  is_featured: boolean;
  featured_image_url?: string;
  created_at: string;
}

const categories = ["All", "Career Advice", "Interview Tips", "Resume Help", "Skill Development", "Industry Insights", "Market Trends"];

const categoryColors: { [key: string]: string } = {
  "Career Advice": "bg-primary/10 text-primary border-primary/20",
  "Interview Tips": "bg-secondary/10 text-secondary border-secondary/20", 
  "Resume Help": "bg-accent/10 text-accent border-accent/20",
  "Skill Development": "bg-orange-500/10 text-orange-600 border-orange-200",
  "Industry Insights": "bg-red-500/10 text-red-600 border-red-200",
  "Market Trends": "bg-teal-500/10 text-teal-600 border-teal-200"
};

// Sample articles for demonstration
const sampleArticles: Article[] = [
  {
    id: "1",
    title: "5 Essential Skills for Remote Work Success",
    category: "Career Advice",
    tags: ["remote work", "productivity", "communication"],
    summary: "Learn the key skills that will help you thrive in a remote work environment.",
    author_name: "John Smith",
    read_time: "5 min read",
    views: 324,
    is_featured: true,
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "2", 
    title: "Mastering Technical Interview Questions",
    category: "Interview Tips",
    tags: ["technical interview", "coding", "preparation"],
    summary: "A comprehensive guide to preparing for technical interviews in software engineering.",
    author_name: "Sarah Johnson",
    read_time: "8 min read",
    views: 567,
    is_featured: false,
    created_at: "2024-01-14T14:30:00Z"
  },
  {
    id: "3",
    title: "Building an ATS-Friendly Resume",
    category: "Resume Help", 
    tags: ["resume", "ATS", "job search"],
    summary: "Tips to optimize your resume for Applicant Tracking Systems.",
    author_name: "Mike Davis",
    read_time: "6 min read",
    views: 412,
    is_featured: false,
    created_at: "2024-01-13T09:15:00Z"
  },
  {
    id: "4",
    title: "The Future of AI in the Workplace",
    category: "Industry Insights",
    tags: ["AI", "future of work", "technology"],
    summary: "How artificial intelligence is reshaping the modern workplace.",
    author_name: "Emily Chen",
    read_time: "7 min read", 
    views: 689,
    is_featured: true,
    created_at: "2024-01-12T16:45:00Z"
  },
  {
    id: "5",
    title: "Learning Cloud Computing in 2024",
    category: "Skill Development",
    tags: ["cloud computing", "AWS", "career growth"],
    summary: "A roadmap for learning cloud computing skills to advance your career.",
    author_name: "Alex Rodriguez",
    read_time: "10 min read",
    views: 234,
    is_featured: false,
    created_at: "2024-01-11T11:20:00Z"
  },
  {
    id: "6",
    title: "Remote Work Trends for 2024",
    category: "Market Trends",
    tags: ["remote work", "trends", "2024"],
    summary: "Key trends shaping the remote work landscape this year.",
    author_name: "Lisa Wang",
    read_time: "4 min read",
    views: 445,
    is_featured: false,
    created_at: "2024-01-10T13:30:00Z"
  }
];

export function SimpleCareerHub() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles] = useState<Article[]>(sampleArticles);

  const handleSearch = () => {
    // Search functionality can be implemented here
    console.log("Searching for:", searchQuery);
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <img 
                src={talentxcelLogo} 
                alt="TalentXcel Logo" 
                className="w-12 h-12 rounded-xl shadow-lg"
              />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TalentXcel
              </h1>
              <p className="text-base font-medium text-muted-foreground">Career Hub</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            🚀 Share your expertise, discover career insights, and grow with a community of professionals.
            <span className="text-primary font-medium"> Your success story starts here!</span>
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-full border border-primary/20">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <FileText className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium">{articles.length}+ Articles</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-full border border-secondary/20">
              <Users className="w-3 h-3 text-secondary" />
              <span className="text-xs font-medium">Expert Community</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-full border border-accent/20">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-xs font-medium">AI-Powered</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="🔍 Search articles, topics, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-10 text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
            
            <Button 
              onClick={handleSearch}
              className="h-10 px-6"
              size="sm"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedCategory === category 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <Filter className="w-3 h-3 mr-1" />
              {category}
            </Badge>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Latest Articles</h2>
            <span className="text-sm text-muted-foreground">{filteredArticles.length} articles</span>
          </div>

          {filteredArticles.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No articles found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "Be the first to share your expertise!"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="group hover:shadow-md transition-all cursor-pointer">
                  {article.featured_image_url && (
                    <div className="h-32 bg-muted rounded-t-lg overflow-hidden">
                      <img 
                        src={article.featured_image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${categoryColors[article.category] || 'bg-muted'}`}
                      >
                        {article.category}
                      </Badge>
                      {article.is_featured && (
                        <Badge variant="secondary" className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    
                    {article.summary && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.read_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views}
                        </span>
                      </div>
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}