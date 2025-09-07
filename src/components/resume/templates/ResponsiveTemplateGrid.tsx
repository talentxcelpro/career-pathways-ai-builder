import React, { useState, useEffect } from 'react';
import { MobileTemplateCard } from './MobileTemplateCard';
import { TemplatePreview } from '../enhanced/three-pane/TemplatePreview';
import { resumeTemplates, getTemplatesByCategory } from '@/data/resumeTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResponsiveTemplateGridProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onPreview: (templateId: string) => void;
}

export const ResponsiveTemplateGrid: React.FC<ResponsiveTemplateGridProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onPreview
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setViewMode(window.innerWidth < 768 ? 'mobile' : 'desktop');
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const categories = [
    { id: 'all', name: 'All', count: resumeTemplates.length },
    { id: 'Modern', name: 'Modern', count: getTemplatesByCategory('Modern').length },
    { id: 'Traditional', name: 'Traditional', count: getTemplatesByCategory('Traditional').length },
    { id: 'Creative', name: 'Creative', count: getTemplatesByCategory('Creative').length },
    { id: 'Technical', name: 'Technical', count: getTemplatesByCategory('Technical').length },
    { id: 'Business', name: 'Business', count: getTemplatesByCategory('Business').length },
    { id: 'Entry Level', name: 'Entry Level', count: getTemplatesByCategory('Entry Level').length },
    { id: 'Executive', name: 'Executive', count: getTemplatesByCategory('Executive').length }
  ];

  const filteredTemplates = resumeTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const recommendedTemplates = filteredTemplates.filter(t => t.isRecommended);
  const otherTemplates = filteredTemplates.filter(t => !t.isRecommended);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Template</h2>
        <p className="text-muted-foreground">
          Select from our collection of {resumeTemplates.length} professional templates
        </p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {!isMobile && (
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                size="sm"
                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setViewMode('mobile')}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                onClick={() => setViewMode('desktop')}
                className="px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4 lg:grid-cols-8'}`}>
          {categories.slice(0, isMobile ? 4 : 8).map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name}
              {!isMobile && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Recommended Templates */}
          {recommendedTemplates.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-primary">✨ Recommended for You</h3>
              <div className={`grid gap-4 ${
                viewMode === 'mobile' || isMobile 
                  ? 'grid-cols-1 sm:grid-cols-2' 
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
                {recommendedTemplates.map((template) => (
                  viewMode === 'mobile' || isMobile ? (
                    <MobileTemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate === template.id}
                      onSelect={onTemplateSelect}
                      onPreview={onPreview}
                    />
                  ) : (
                    <TemplatePreview
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate === template.id}
                      onSelect={onTemplateSelect}
                      onPreview={onPreview}
                    />
                  )
                ))}
              </div>
            </div>
          )}

          {/* All Templates */}
          <div>
            {recommendedTemplates.length > 0 && (
              <h3 className="text-lg font-semibold mb-4">All Templates</h3>
            )}
            <div className={`grid gap-4 ${
              viewMode === 'mobile' || isMobile 
                ? 'grid-cols-1 sm:grid-cols-2' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {otherTemplates.map((template) => (
                viewMode === 'mobile' || isMobile ? (
                  <MobileTemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    onSelect={onTemplateSelect}
                    onPreview={onPreview}
                  />
                ) : (
                  <TemplatePreview
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    onSelect={onTemplateSelect}
                    onPreview={onPreview}
                  />
                )
              ))}
            </div>
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};