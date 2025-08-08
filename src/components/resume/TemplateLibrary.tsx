
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Code, Palette, GraduationCap, Zap, Building, Search, Eye, Download } from 'lucide-react';

interface ResumeTemplate {
  id: string;
  name: string;
  category: 'executive' | 'technical' | 'creative' | 'academic' | 'minimalist' | 'industry';
  description: string;
  features: string[];
  atsScore: number;
  preview: string;
  colors: string[];
  multiPage: boolean;
  industry?: string;
}

interface TemplateLibraryProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onPreview: (templateId: string) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onPreview
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Templates will be loaded from database in the future
  const templates: ResumeTemplate[] = [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'executive': return <Crown className="h-4 w-4" />;
      case 'technical': return <Code className="h-4 w-4" />;
      case 'creative': return <Palette className="h-4 w-4" />;
      case 'academic': return <GraduationCap className="h-4 w-4" />;
      case 'minimalist': return <Zap className="h-4 w-4" />;
      case 'industry': return <Building className="h-4 w-4" />;
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
    if (score >= 95) return 'bg-success/10 text-success';
    if (score >= 85) return 'bg-primary/10 text-primary';
    if (score >= 75) return 'bg-orange/10 text-orange';
    return 'bg-red/10 text-red';
  };

  return (
    <section className="space-y-6 animate-slideInUp">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
          <TabsTrigger value="executive" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Executive
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            Tech
          </TabsTrigger>
          <TabsTrigger value="creative" className="flex items-center gap-1">
            <Palette className="h-3 w-3" />
            Creative
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="minimalist" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Minimal
          </TabsTrigger>
          <TabsTrigger value="industry" className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            Industry
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-smooth animate-fadeInScale hover:shadow-float ${
                  selectedTemplate === template.id ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge className={`text-xs ${getAtsScoreColor(template.atsScore)}`}>
                      ATS {template.atsScore}%
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Template Preview */}
            <div className="aspect-[3/4] rounded-lg gradient-card flex items-center justify-center">
              <div className="text-muted-foreground text-sm">Template Preview</div>
            </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Colors:</h4>
                    <div className="flex gap-1">
                      {template.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full border-2 border-border"
                  style={{ backgroundColor: color }}
                />
                      ))}
                    </div>
                  </div>

                  {/* Template Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{template.multiPage ? 'Multi-page' : 'Single page'}</span>
              {template.industry && (
                <Badge variant="secondary" className="text-xs">
                  {template.industry}
                </Badge>
              )}
            </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
              onClick={() => onTemplateSelect(template.id)}
              className={selectedTemplate === template.id ? 'bg-primary' : ''}
            >
                      {selectedTemplate === template.id ? 'Selected' : 'Select'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPreview(template.id)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
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
    </section>
  );
};
