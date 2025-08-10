import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter } from 'lucide-react';
import { resumeTemplates, getTemplatesByCategory } from '@/data/resumeTemplates';
import { TemplatePreview } from './TemplatePreview';

interface TemplateSidebarProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

export const TemplateSidebar: React.FC<TemplateSidebarProps> = ({
  selectedTemplate,
  onTemplateSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Templates', count: resumeTemplates.length },
    { id: 'Modern', name: 'Modern', count: getTemplatesByCategory('Modern').length },
    { id: 'Classic', name: 'Classic', count: getTemplatesByCategory('Classic').length },
    { id: 'Creative', name: 'Creative', count: getTemplatesByCategory('Creative').length },
    { id: 'Executive', name: 'Executive', count: getTemplatesByCategory('Executive').length },
  ];

  const filteredTemplates = resumeTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const recommendedTemplates = filteredTemplates.filter(t => t.isRecommended);
  const otherTemplates = filteredTemplates.filter(t => !t.isRecommended);

  const handlePreview = (templateId: string) => {
    // TODO: Implement template preview functionality
    console.log('Preview template:', templateId);
  };

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Templates</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Modern">Modern</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 space-y-4">
            {recommendedTemplates.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-medium text-sm">Recommended</h4>
                  <Badge variant="secondary" className="text-xs">
                    {recommendedTemplates.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {recommendedTemplates.slice(0, 4).map((template) => (
                    <TemplatePreview
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate === template.id}
                      onSelect={onTemplateSelect}
                      onPreview={handlePreview}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {otherTemplates.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-medium text-sm">All Templates</h4>
                  <Badge variant="outline" className="text-xs">
                    {otherTemplates.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {otherTemplates.slice(0, 6).map((template) => (
                    <TemplatePreview
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate === template.id}
                      onSelect={onTemplateSelect}
                      onPreview={handlePreview}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  No templates found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};