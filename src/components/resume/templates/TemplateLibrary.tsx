
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Code, Palette, GraduationCap, Zap, Building, Search, Eye, Download, Star } from 'lucide-react';

interface ResumeTemplate {
  id: string;
  name: string;
  category: 'modern' | 'classic' | 'creative' | 'technical' | 'executive' | 'academic';
  description: string;
  features: string[];
  atsScore: number;
  preview: string;
  colors: string[];
  isPopular?: boolean;
  isPremium?: boolean;
}

interface TemplateLibraryProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
}

const templates: ResumeTemplate[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    category: 'modern',
    description: 'Clean, minimal design perfect for tech professionals',
    features: ['ATS Optimized', 'Single Page', 'Clean Layout'],
    atsScore: 95,
    preview: '/templates/modern-minimal.png',
    colors: ['#2563eb', '#64748b', '#0f172a'],
    isPopular: true
  },
  {
    id: 'executive-pro',
    name: 'Executive Pro',
    category: 'executive',
    description: 'Professional template for senior-level positions',
    features: ['Executive Format', 'Multi-page', 'Premium Design'],
    atsScore: 92,
    preview: '/templates/executive-pro.png',
    colors: ['#1e40af', '#374151', '#111827'],
    isPremium: true
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio', 
    category: 'creative',
    description: 'Eye-catching design for creative professionals',
    features: ['Visual Impact', 'Portfolio Section', 'Color Customizable'],
    atsScore: 85,
    preview: '/templates/creative-portfolio.png',
    colors: ['#7c3aed', '#ec4899', '#f59e0b']
  },
  {
    id: 'tech-specialist',
    name: 'Tech Specialist',
    category: 'technical',
    description: 'Optimized for software engineers and developers',
    features: ['Skills Matrix', 'Project Showcase', 'GitHub Integration'],
    atsScore: 94,
    preview: '/templates/tech-specialist.png',
    colors: ['#059669', '#0891b2', '#374151'],
    isPopular: true
  },
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    category: 'classic',
    description: 'Traditional format for conservative industries',
    features: ['Conservative Design', 'ATS Safe', 'Print Ready'],
    atsScore: 98,
    preview: '/templates/classic-professional.png',
    colors: ['#374151', '#6b7280', '#111827']
  },
  {
    id: 'academic-researcher',
    name: 'Academic Researcher',
    category: 'academic',
    description: 'Comprehensive format for academic positions',
    features: ['Publications Section', 'Research Focus', 'Multi-page'],
    atsScore: 90,
    preview: '/templates/academic-researcher.png',
    colors: ['#1e40af', '#7c2d12', '#374151']
  }
];

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onPreview
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'executive': return <Crown className="h-4 w-4" />;
      case 'technical': return <Code className="h-4 w-4" />;
      case 'creative': return <Palette className="h-4 w-4" />;
      case 'academic': return <GraduationCap className="h-4 w-4" />;
      case 'modern': return <Zap className="h-4 w-4" />;
      case 'classic': return <Building className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getAtsScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-100';
    if (score >= 85) return 'text-blue-600 bg-blue-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Perfect Template</h2>
        <p className="text-muted-foreground">
          Professional templates designed to get you hired faster
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="modern" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Modern
          </TabsTrigger>
          <TabsTrigger value="classic" className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            Classic
          </TabsTrigger>
          <TabsTrigger value="creative" className="flex items-center gap-1">
            <Palette className="h-3 w-3" />
            Creative
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="executive" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Executive
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            Academic
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                  selectedTemplate === template.id ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border'
                }`}
                onClick={() => onTemplateSelect(template.id)}
              >
                <CardContent className="p-0">
                  {/* Template Preview */}
                  <div className="relative">
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        Template Preview
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {template.isPopular && (
                        <Badge className="bg-orange-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      {template.isPremium && (
                        <Badge className="bg-purple-500 text-white">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>

                    {/* ATS Score */}
                    <div className="absolute top-2 right-2">
                      <Badge className={`text-xs ${getAtsScoreColor(template.atsScore)}`}>
                        ATS {template.atsScore}%
                      </Badge>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(template.category)}
                        <h3 className="font-semibold">{template.name}</h3>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-3">
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Color Palette */}
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium">Colors:</h4>
                      <div className="flex gap-1">
                        {template.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded-full border-2 border-gray-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTemplateSelect(template.id);
                        }}
                        className={`flex-1 ${selectedTemplate === template.id ? 'bg-primary' : ''}`}
                      >
                        {selectedTemplate === template.id ? 'Selected' : 'Select'}
                      </Button>
                      {onPreview && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreview(template.id);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No templates found matching your criteria.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('all');
            }}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};
