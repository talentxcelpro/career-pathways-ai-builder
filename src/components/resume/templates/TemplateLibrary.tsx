
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Code, Palette, GraduationCap, Zap, Building, Search, Filter } from 'lucide-react';
import { EnhancedTemplatePreview } from './EnhancedTemplatePreview';
import { enhancedTemplateData } from '@/data/enhancedTemplateData';

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
  const [sortBy, setSortBy] = useState('recommended'); // recommended, ats-score, popularity

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Traditional': return <Crown className="h-4 w-4" />;
      case 'Engineering': return <Code className="h-4 w-4" />;
      case 'Design': return <Palette className="h-4 w-4" />;
      case 'Education': return <GraduationCap className="h-4 w-4" />;
      case 'Clean': return <Zap className="h-4 w-4" />;
      case 'Business': return <Building className="h-4 w-4" />;
      default: return null;
    }
  };

  const categories = [
    { id: 'all', name: 'All', count: enhancedTemplateData.length },
    { id: 'Traditional', name: 'Traditional', count: enhancedTemplateData.filter(t => t.category === 'Traditional').length },
    { id: 'Contemporary', name: 'Modern', count: enhancedTemplateData.filter(t => t.category === 'Contemporary').length },
    { id: 'Design', name: 'Creative', count: enhancedTemplateData.filter(t => t.category === 'Design').length },
    { id: 'Engineering', name: 'Technical', count: enhancedTemplateData.filter(t => t.category === 'Engineering').length },
    { id: 'Leadership', name: 'Executive', count: enhancedTemplateData.filter(t => t.category === 'Leadership').length },
    { id: 'Business', name: 'Business', count: enhancedTemplateData.filter(t => t.category === 'Business').length }
  ];

  const filteredTemplates = enhancedTemplateData.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.bestFor.some(use => use.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'ats-score':
        return b.atsScore - a.atsScore;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recommended':
      default:
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;
        return b.atsScore - a.atsScore;
    }
  });

  const recommendedTemplates = sortedTemplates.filter(t => t.isRecommended);
  const otherTemplates = sortedTemplates.filter(t => !t.isRecommended);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Template</h2>
        <p className="text-muted-foreground text-lg">
          {enhancedTemplateData.length} professional templates with customizable colors and designs
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates by name, style, or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="recommended">Recommended First</option>
            <option value="ats-score">Highest ATS Score</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id} 
              className="flex items-center gap-1 text-xs"
            >
              {getCategoryIcon(category.name)}
              <span className="hidden sm:inline">{category.name}</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {/* Results Summary */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {sortedTemplates.length} template{sortedTemplates.length !== 1 ? 's' : ''} found
              {searchTerm && ` for "${searchTerm}"`}
            </p>
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </Button>
            )}
          </div>

          {/* Recommended Templates Section */}
          {recommendedTemplates.length > 0 && activeCategory === 'all' && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-yellow-600" />
                <h3 className="text-xl font-semibold text-primary">Recommended Templates</h3>
                <Badge className="bg-yellow-100 text-yellow-800">AI Selected</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendedTemplates.map((template) => (
                  <EnhancedTemplatePreview
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    onSelect={onTemplateSelect}
                    onPreview={onPreview}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Templates Section */}
          <div>
            {recommendedTemplates.length > 0 && activeCategory === 'all' && (
              <h3 className="text-xl font-semibold mb-4 text-gray-700">All Templates</h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(activeCategory === 'all' ? otherTemplates : sortedTemplates).map((template) => (
                <EnhancedTemplatePreview
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  onSelect={onTemplateSelect}
                  onPreview={onPreview}
                />
              ))}
            </div>
          </div>

          {/* No Results */}
          {sortedTemplates.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or browse different categories.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                }}
              >
                Show All Templates
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Stats */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{enhancedTemplateData.length}</div>
            <div className="text-sm text-muted-foreground">Total Templates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(enhancedTemplateData.reduce((acc, t) => acc + t.atsScore, 0) / enhancedTemplateData.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg ATS Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(require('@/data/sampleResumeData').colorSchemes).length}
            </div>
            <div className="text-sm text-muted-foreground">Color Schemes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(enhancedTemplateData.map(t => t.category)).size}
            </div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
};
