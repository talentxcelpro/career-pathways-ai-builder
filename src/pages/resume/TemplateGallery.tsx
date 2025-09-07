import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Star, Download, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  atsScore: number;
  usageCount: number;
  rating: number;
  isPremium: boolean;
  isNew: boolean;
  previewImage: string;
  bestFor: string[];
  features: string[];
}

const mockTemplates: Template[] = [
  {
    id: 'ats-professional',
    name: 'ATS Professional',
    description: 'Optimized for ATS systems with clean, professional layout',
    category: 'ats-optimized',
    atsScore: 98,
    usageCount: 12450,
    rating: 4.9,
    isPremium: false,
    isNew: false,
    previewImage: '/api/placeholder/300/400',
    bestFor: ['Software Engineer', 'Product Manager', 'Data Scientist'],
    features: ['ATS-optimized', 'single-column', 'keyword-placement']
  },
  {
    id: 'modern-executive',
    name: 'Modern Executive',
    description: 'Sophisticated design for senior-level positions',
    category: 'executive',
    atsScore: 94,
    usageCount: 8320,
    rating: 4.8,
    isPremium: true,
    isNew: true,
    previewImage: '/api/placeholder/300/400',
    bestFor: ['VP Engineering', 'CTO', 'Director'],
    features: ['executive-summary', 'leadership-metrics', 'board-experience']
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    description: 'Visual-heavy design showcasing creative work',
    category: 'creative',
    atsScore: 76,
    usageCount: 5690,
    rating: 4.7,
    isPremium: false,
    isNew: false,
    previewImage: '/api/placeholder/300/400',
    bestFor: ['UI/UX Designer', 'Graphic Designer', 'Creative Director'],
    features: ['portfolio-showcase', 'visual-elements', 'creative-layout']
  },
  {
    id: 'tech-focused',
    name: 'Tech Stack Master',
    description: 'Perfect for developers with technical skill emphasis',
    category: 'tech',
    atsScore: 96,
    usageCount: 15680,
    rating: 4.9,
    isPremium: false,
    isNew: true,
    previewImage: '/api/placeholder/300/400',
    bestFor: ['Full Stack Developer', 'DevOps Engineer', 'Software Architect'],
    features: ['technical-skills', 'github-integration', 'project-showcase']
  },
  {
    id: 'entry-level',
    name: 'Fresh Graduate',
    description: 'Designed for new graduates and entry-level positions',
    category: 'entry-level',
    atsScore: 92,
    usageCount: 9870,
    rating: 4.6,
    isPremium: false,
    isNew: false,
    previewImage: '/api/placeholder/300/400',
    bestFor: ['Recent Graduate', 'Intern', 'Junior Developer'],
    features: ['education-focus', 'internship-highlight', 'potential-based']
  },
  {
    id: 'consultant-premium',
    name: 'Consulting Elite',
    description: 'Premium template for consulting professionals',
    category: 'consulting',
    atsScore: 95,
    usageCount: 4230,
    rating: 4.8,
    isPremium: true,
    isNew: false,
    previewImage: '/api/placeholder/300/400',
    bestFor: ['Management Consultant', 'Strategy Consultant', 'Business Analyst'],
    features: ['achievement-focus', 'client-testimonials', 'metrics-driven']
  }
];

const categories = [
  { value: 'all', label: 'All Templates' },
  { value: 'ats-optimized', label: 'ATS Optimized' },
  { value: 'executive', label: 'Executive' },
  { value: 'creative', label: 'Creative' },
  { value: 'tech', label: 'Technology' },
  { value: 'entry-level', label: 'Entry Level' },
  { value: 'consulting', label: 'Consulting' }
];

const TemplateGallery = () => {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.bestFor.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.usageCount - a.usageCount;
      case 'rating':
        return b.rating - a.rating;
      case 'ats-score':
        return b.atsScore - a.atsScore;
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default:
        return 0;
    }
  });

  return (
    <>
      <Helmet>
        <title>Resume Templates | 50+ ATS-Optimized Templates | TalentXcel</title>
        <meta 
          name="description" 
          content="Choose from 50+ professional resume templates. ATS-optimized designs for every industry and experience level. Free and premium options available." 
        />
        <link rel="canonical" href="https://talentxcel.in/templates" />
        <meta property="og:title" content="Professional Resume Templates - TalentXcel" />
        <meta property="og:description" content="ATS-optimized resume templates for every career stage" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
        {/* Hero Section */}
        <section className="pt-20 pb-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Professional Resume Templates
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Choose from our collection of ATS-optimized templates designed by career experts. 
              Get hired faster with templates that pass through applicant tracking systems.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">ATS Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100K+</div>
                <div className="text-sm text-muted-foreground">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="ats-score">ATS Score</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="px-4 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedTemplates.map((template) => (
                <Card key={template.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={template.previewImage}
                      alt={template.name}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Use Template
                      </Button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {template.isNew && (
                        <Badge variant="default" className="text-xs">NEW</Badge>
                      )}
                      {template.isPremium && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Zap className="h-3 w-3" />
                          PRO
                        </Badge>
                      )}
                    </div>

                    {/* ATS Score */}
                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant={template.atsScore >= 95 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        ATS {template.atsScore}%
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Rating and Usage */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{template.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {template.usageCount.toLocaleString()} uses
                      </span>
                    </div>

                    {/* Best For */}
                    <div className="mb-4">
                      <div className="text-xs text-muted-foreground mb-1">Best for:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.bestFor.slice(0, 2).map((role, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                        {template.bestFor.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.bestFor.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Link to={`/builder?template=${template.id}`} className="w-full">
                        <Button className="w-full">
                          Use This Template
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="w-full">
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Can't Find the Perfect Template?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Let our AI create a custom template based on your industry and role
            </p>
            <Button size="lg" className="gap-2">
              <Zap className="h-5 w-5" />
              Generate Custom Template
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default TemplateGallery;