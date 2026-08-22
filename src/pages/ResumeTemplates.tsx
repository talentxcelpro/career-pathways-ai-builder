import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { Search, Star, Eye, Download, Filter } from 'lucide-react';

const ResumeTemplates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    {
      id: 'modern-tech',
      name: 'Modern Tech',
      category: 'technology',
      description: 'Clean, modern design perfect for software engineers and tech professionals',
      image: '/api/placeholder/300/400',
      rating: 4.9,
      downloads: 15234,
      isPremium: false,
      tags: ['ATS-Friendly', 'Modern', 'Tech']
    },
    {
      id: 'executive-pro', 
      name: 'Executive Pro',
      category: 'executive',
      description: 'Professional template for C-level executives and senior management',
      image: '/api/placeholder/300/400', 
      rating: 4.8,
      downloads: 8567,
      isPremium: true,
      tags: ['Executive', 'Premium', 'Professional']
    },
    {
      id: 'creative-designer',
      name: 'Creative Designer',
      category: 'creative',
      description: 'Eye-catching design for creative professionals and designers',
      image: '/api/placeholder/300/400',
      rating: 4.7,
      downloads: 12890,
      isPremium: false,
      tags: ['Creative', 'Design', 'Portfolio']
    },
    {
      id: 'minimalist-clean',
      name: 'Minimalist Clean',
      category: 'general',
      description: 'Simple, clean template that works for any industry',
      image: '/api/placeholder/300/400',
      rating: 4.9,
      downloads: 23456,
      isPremium: false,
      tags: ['Minimalist', 'ATS-Friendly', 'Universal']
    },
    {
      id: 'sales-master',
      name: 'Sales Master',
      category: 'sales',
      description: 'Results-driven template for sales professionals and account managers',
      image: '/api/placeholder/300/400',
      rating: 4.6,
      downloads: 9876,
      isPremium: true,
      tags: ['Sales', 'Results-Focused', 'Premium']
    },
    {
      id: 'healthcare-pro',
      name: 'Healthcare Pro',
      category: 'healthcare',
      description: 'Professional template tailored for healthcare and medical professionals',
      image: '/api/placeholder/300/400',
      rating: 4.8,
      downloads: 7654,
      isPremium: false,
      tags: ['Healthcare', 'Medical', 'Professional']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'technology', name: 'Technology', count: templates.filter(t => t.category === 'technology').length },
    { id: 'creative', name: 'Creative', count: templates.filter(t => t.category === 'creative').length },
    { id: 'executive', name: 'Executive', count: templates.filter(t => t.category === 'executive').length },
    { id: 'sales', name: 'Sales', count: templates.filter(t => t.category === 'sales').length },
    { id: 'healthcare', name: 'Healthcare', count: templates.filter(t => t.category === 'healthcare').length },
    { id: 'general', name: 'General', count: templates.filter(t => t.category === 'general').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[11px] font-extrabold border border-blue-500/20">
            <Star className="h-3.5 w-3.5" />
            <span>Recruiter-Approved Templates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Professional Resume Templates
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Choose from our collection of ATS-friendly, professionally designed resume templates crafted by experts to help you land interviews.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 bg-card/70 border border-border/80 rounded-2xl p-3 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-xs font-medium rounded-xl"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 h-auto p-1 rounded-2xl">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs font-bold py-1.5 rounded-xl">
                {category.name}
                <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative">
                <img 
                  src={template.image} 
                  alt={template.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {template.isPremium && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                    Premium
                  </Badge>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{template.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Download className="h-4 w-4" />
                    {template.downloads.toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <AuthDialog>
                  <Button className="w-full">
                    {template.isPremium ? 'Get Premium Template' : 'Use This Template'}
                  </Button>
                </AuthDialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-12">
          <h3 className="text-3xl font-bold mb-4">
            Can't Find the Perfect Template?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Our AI Resume Builder can create a custom template based on your specific needs and industry.
          </p>
          <AuthDialog>
            <Button size="lg" variant="secondary">
              Try AI Resume Builder
            </Button>
          </AuthDialog>
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplates;