import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resumeTemplates, getTemplatesByCategory, type ResumeTemplate } from '@/data/resumeTemplates';
import { 
  FileText, 
  Search, 
  Crown, 
  Palette, 
  Layout, 
  Type, 
  Star,
  Filter,
  Eye,
  Download
} from 'lucide-react';

interface TemplateGalleryProps {
  selectedTemplate?: string;
  onTemplateSelect: (template: ResumeTemplate) => void;
  onPreview?: (template: ResumeTemplate) => void;
  showPremiumOnly?: boolean;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onPreview,
  showPremiumOnly = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'popularity'>('name');

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'creative', label: 'Creative' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'professional', label: 'Professional' },
    { value: 'academic', label: 'Academic' }
  ];

  const filteredTemplates = resumeTemplates
    .filter(template => {
      if (showPremiumOnly && !template.isPremium) return false;
      if (selectedCategory !== 'all' && template.category !== selectedCategory) return false;
      if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !template.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return 0; // popularity would need additional data
    });

  const freeTemplates = filteredTemplates.filter(t => !t.isPremium);
  const premiumTemplates = filteredTemplates.filter(t => t.isPremium);

  const TemplateCard: React.FC<{ template: ResumeTemplate }> = ({ template }) => {
    const isSelected = selectedTemplate === template.id;
    
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary border-primary' : ''
        }`}
      >
        <CardContent className="p-0">
          {/* Template Preview */}
          <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/70 rounded-t-lg relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-16 w-16 text-muted-foreground/50" />
            </div>
            
            {/* Premium Badge */}
            {template.isPremium && (
              <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            )}

            {/* Color Scheme Preview */}
            <div className="absolute bottom-3 left-3 flex gap-1">
              {template.colorSchemes.slice(0, 3).map((scheme, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: scheme.primary }}
                />
              ))}
            </div>

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview?.(template);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onTemplateSelect(template);
                }}
              >
                {isSelected ? 'Selected' : 'Select'}
              </Button>
            </div>
          </div>

          {/* Template Info */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>

            {/* Features */}
            <div className="flex gap-1 flex-wrap">
              {template.features.slice(0, 3).map((feature, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {template.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.features.length - 3} more
                </Badge>
              )}
            </div>

            {/* Template Properties */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Layout className="h-3 w-3" />
                <span>{template.layout.columns} col</span>
              </div>
              <div className="flex items-center gap-1">
                <Type className="h-3 w-3" />
                <span>{template.layout.typography}</span>
              </div>
              <div className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                <span>{template.colorSchemes.length} colors</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => onTemplateSelect(template)}
              >
                {isSelected ? (
                  <>
                    <Star className="h-4 w-4 mr-1" />
                    Selected
                  </>
                ) : (
                  'Use Template'
                )}
              </Button>
              {onPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreview(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Resume Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="popularity">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </span>
            <span>•</span>
            <span>{freeTemplates.length} free</span>
            <span>•</span>
            <span>{premiumTemplates.length} premium</span>
          </div>
        </CardContent>
      </Card>

      {/* Template Grid */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="free">Free Templates</TabsTrigger>
          <TabsTrigger value="premium">Premium Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No templates found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="free">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {freeTemplates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="premium">
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="h-6 w-6 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-800">Premium Templates</h3>
                </div>
                <p className="text-yellow-700 mb-4">
                  Unlock advanced templates with enhanced features, premium layouts, and professional designs.
                </p>
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {premiumTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};