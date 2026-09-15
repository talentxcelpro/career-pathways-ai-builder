import React, { useState } from 'react';
import { useToolsData } from '@/hooks/useToolsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter,
  Star,
  Clock,
  TrendingUp,
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  Briefcase,
  User,
  Network,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const categoryIcons = {
  Resume: FileText,
  Profile: User,
  Interview: MessageSquare,
  JobSearch: Briefcase,
  Skills: BookOpen,
  Career: TrendingUp,
  Analytics: BarChart3,
  Networking: Network
};

const categoryColors = {
  Resume: 'bg-blue-500/10 text-blue-700 border-blue-200',
  Profile: 'bg-green-500/10 text-green-700 border-green-200',
  Interview: 'bg-purple-500/10 text-purple-700 border-purple-200',
  JobSearch: 'bg-orange-500/10 text-orange-700 border-orange-200',
  Skills: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
  Career: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
  Analytics: 'bg-pink-500/10 text-pink-700 border-pink-200',
  Networking: 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
};

export default function ToolsHub() {
  const { 
    filteredTools, 
    toolCategories, 
    usageStats, 
    selectedCategory, 
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isLoading 
  } = useToolsData();
  
  const [view, setView] = useState<'all' | 'favorites' | 'recent'>('all');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Career Tools Hub | TalentXcel - AI-Powered Career Tools</title>
        <meta name="description" content="Access 24+ AI-powered career tools including resume builder, interview prep, job matching, skill gap analysis, and career pathfinding tools." />
        <meta name="keywords" content="career tools, resume builder, interview prep, job search, AI career tools, skill development" />
        <link rel="canonical" href="https://talentxcel.in/tools" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Career Tools Hub</h1>
              <p className="text-muted-foreground text-lg">
                24+ AI-powered tools to accelerate your career growth
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{usageStats.totalUsage}</div>
                <div className="text-sm text-muted-foreground">Total Uses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{usageStats.completedUsage}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{usageStats.favoriteTools}</div>
                <div className="text-sm text-muted-foreground">Favorites</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Tools ({Object.values(toolCategories).reduce((a, b) => a + b, 0)})
            </Button>
            {Object.entries(toolCategories).map(([category, count]) => {
              const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="gap-2"
                >
                  {IconComponent && <IconComponent className="h-3 w-3" />}
                  {category} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* View Toggle */}
        <Tabs value={view} onValueChange={(value) => setView(value as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Tools</TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="h-4 w-4 mr-2" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ToolsGrid tools={filteredTools} />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <ToolsGrid tools={filteredTools.filter(tool => tool.category === 'Resume')} />
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <ToolsGrid tools={filteredTools.slice(0, 6)} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function ToolsGrid({ tools }: { tools: any[] }) {
  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-4">No tools found</div>
        <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => {
        const IconComponent = categoryIcons[tool.category as keyof typeof categoryIcons];
        const categoryColor = categoryColors[tool.category as keyof typeof categoryColors];
        
        return (
          <Card key={tool.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {IconComponent && (
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {tool.name}
                    </CardTitle>
                    <Badge className={`mt-1 ${categoryColor}`} variant="outline">
                      {tool.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {tool.description}
              </p>
              
              <div className="flex items-center justify-between">
                <Link to={`/tools/${tool.slug}`}>
                  <Button className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Use Tool
                  </Button>
                </Link>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>Popular</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}