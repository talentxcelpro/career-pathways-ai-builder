
import { useState } from 'react';
import { useToolsData } from '@/hooks/useToolsData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Star,
  ArrowRight,
  Filter
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ToolsDashboard = () => {
  const navigate = useNavigate();
  const {
    filteredTools,
    toolCategories,
    usageStats,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery
  } = useToolsData();

  const categories = [
    { value: 'all', label: 'All Tools', icon: Sparkles },
    { value: 'Career', label: 'Career Tools', icon: TrendingUp },
    { value: 'Interview', label: 'Interview Prep', icon: Icons.MessageSquare },
    { value: 'Resume', label: 'Resume Builder', icon: Icons.FileText },
    { value: 'JobSearch', label: 'Job Search', icon: Icons.Briefcase },
    { value: 'Skills', label: 'Skills Development', icon: Icons.Brain },
    { value: 'Networking', label: 'Professional Network', icon: Icons.Users },
    { value: 'Profile', label: 'Profile Enhancement', icon: Icons.User },
    { value: 'Analytics', label: 'Career Analytics', icon: Icons.BarChart3 }
  ];

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent && typeof IconComponent === 'function' ? IconComponent : Icons.Wrench;
  };

  const getToolTier = (toolName: string) => {
    const premiumTools = ['ai-career-pathfinder', 'ai-job-match-gpt', 'smart-apply-tool'];
    const featuredTools = ['resume-builder', 'interview-prep', 'career-pathfinder', 'cover-letter-generator'];
    
    if (premiumTools.some(tool => toolName.toLowerCase().includes(tool.replace(/-/g, ' ')))) {
      return { tier: 'premium', color: 'from-purple-500 via-pink-500 to-red-500', badge: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' };
    }
    if (featuredTools.some(tool => toolName.toLowerCase().includes(tool.replace(/-/g, ' ')))) {
      return { tier: 'featured', color: 'from-blue-500 via-cyan-500 to-teal-500', badge: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' };
    }
    return { tier: 'free', color: 'from-green-500 to-emerald-500', badge: 'bg-green-100 text-green-700' };
  };

  const handleToolClick = (toolSlug: string) => {
    navigate(`/tools/${toolSlug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h1 className="text-heading-xl font-bold mb-2 text-slate-900">
            AI-Powered Career Tools
          </h1>
          <p className="text-body text-slate-600 max-w-2xl mx-auto">
            Transform your career with intelligent tools designed to accelerate your professional growth
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-heading-lg font-bold text-slate-900">{usageStats.totalUsage}</div>
              <div className="text-caption text-slate-600">Tools Used</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-success mx-auto mb-2" />
              <div className="text-heading-lg font-bold text-slate-900">{usageStats.completedUsage}</div>
              <div className="text-caption text-slate-600">Completed</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Star className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
              <div className="text-heading-lg font-bold text-slate-900">{usageStats.favoriteTools}</div>
              <div className="text-caption text-slate-600">Saved Results</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Sparkles className="h-5 w-5 text-purple-600 mx-auto mb-2" />
              <div className="text-heading-lg font-bold text-slate-900">{filteredTools.length}</div>
              <div className="text-caption text-slate-600">Available Tools</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 border-0 shadow-md bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tools by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-body"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-64">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        <span className="text-body">{category.label}</span>
                        {category.value !== 'all' && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {toolCategories[category.value] || 0}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const IconComponent = getIconComponent(tool.icon_name);
            const toolTier = getToolTier(tool.name);
            return (
              <Card 
                key={tool.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white/90 backdrop-blur-sm hover:bg-white/95 relative overflow-hidden"
                onClick={() => handleToolClick(tool.slug)}
              >
                {toolTier.tier !== 'free' && (
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${toolTier.color} opacity-10 rounded-bl-full`}></div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 bg-gradient-to-br ${toolTier.color} bg-opacity-10 rounded-lg group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-3 w-3 text-white" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' }} />
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge className={`text-xs px-2 py-1 ${toolTier.badge} border-0`}>
                        {toolTier.tier.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-heading-md text-slate-900 group-hover:text-primary transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription className="text-body text-slate-600 leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant={toolTier.tier === 'premium' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-between transition-colors text-body ${
                      toolTier.tier === 'premium' 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                        : 'group-hover:bg-primary/10'
                    }`}
                  >
                    {toolTier.tier === 'premium' ? 'Try Premium' : 'Try Tool'}
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tools found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {usageStats.recentActivity.length > 0 && (
          <Card className="mt-6 border-0 shadow-md bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-heading-md text-slate-900">
                <Clock className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {usageStats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg">
                    <div>
                      <div className="font-medium text-body text-slate-900">{activity.tool_name}</div>
                      <div className="text-caption text-slate-600">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge 
                      variant={activity.completion_status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.completion_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ToolsDashboard;
