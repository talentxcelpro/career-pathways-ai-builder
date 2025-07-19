
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Palette, Layout, Type, Spacing, Star, Crown, Zap } from 'lucide-react';

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: Template[];
}

interface Template {
  id: string;
  name: string;
  category: string;
  preview: string;
  isPremium: boolean;
  isPopular: boolean;
  tags: string[];
  description: string;
  suitable_for: string[];
}

interface Customization {
  colorScheme: string;
  fontFamily: string;
  fontSize: number;
  spacing: 'compact' | 'normal' | 'spacious';
}

interface TemplateSelectorProps {
  selectedTemplate: string;
  customization: Customization;
  onTemplateChange: (templateId: string) => void;
  onCustomizationChange: (customization: Customization) => void;
}

const templateCategories: TemplateCategory[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, traditional designs for corporate roles',
    templates: [
      {
        id: 'modern-professional',
        name: 'Modern Professional',
        category: 'professional',
        preview: '/templates/modern-professional.jpg',
        isPremium: false,
        isPopular: true,
        tags: ['Clean', 'Corporate', 'ATS-Friendly'],
        description: 'Clean, professional layout perfect for corporate environments',
        suitable_for: ['Management', 'Finance', 'Consulting', 'Legal']
      },
      {
        id: 'executive-elite',
        name: 'Executive Elite',
        category: 'professional',
        preview: '/templates/executive-elite.jpg',
        isPremium: true,
        isPopular: false,
        tags: ['Executive', 'Leadership', 'Premium'],
        description: 'Sophisticated design for senior executives and leaders',
        suitable_for: ['C-Level', 'Senior Management', 'Directors']
      },
      {
        id: 'classic-minimal',
        name: 'Classic Minimal',
        category: 'professional',
        preview: '/templates/classic-minimal.jpg',
        isPremium: false,
        isPopular: true,
        tags: ['Minimal', 'Traditional', 'Safe'],
        description: 'Timeless minimal design that works everywhere',
        suitable_for: ['Academia', 'Government', 'Healthcare']
      }
    ]
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold, artistic designs for creative professionals',
    templates: [
      {
        id: 'designer-portfolio',
        name: 'Designer Portfolio',
        category: 'creative',
        preview: '/templates/designer-portfolio.jpg',
        isPremium: true,
        isPopular: true,
        tags: ['Creative', 'Visual', 'Portfolio'],
        description: 'Showcase your creativity with this visual-first design',
        suitable_for: ['Graphic Design', 'UI/UX', 'Architecture', 'Art Direction']
      },
      {
        id: 'artistic-flair',
        name: 'Artistic Flair',
        category: 'creative',
        preview: '/templates/artistic-flair.jpg',
        isPremium: true,
        isPopular: false,
        tags: ['Artistic', 'Unique', 'Standout'],
        description: 'Express your artistic vision with bold design elements',
        suitable_for: ['Artists', 'Musicians', 'Writers', 'Photographers']
      }
    ]
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary designs with a fresh, updated look',
    templates: [
      {
        id: 'tech-innovator',
        name: 'Tech Innovator',
        category: 'modern',
        preview: '/templates/tech-innovator.jpg',
        isPremium: false,
        isPopular: true,
        tags: ['Tech', 'Modern', 'Clean'],
        description: 'Perfect for tech professionals and startups',
        suitable_for: ['Software Engineering', 'Product Management', 'Data Science', 'DevOps']
      },
      {
        id: 'startup-ready',
        name: 'Startup Ready',
        category: 'modern',
        preview: '/templates/startup-ready.jpg',
        isPremium: true,
        isPopular: false,
        tags: ['Startup', 'Dynamic', 'Growth'],
        description: 'Dynamic design for fast-paced startup environments',
        suitable_for: ['Startup Roles', 'Growth Marketing', 'Business Development']
      }
    ]
  }
];

const colorSchemes = [
  { id: 'blue', name: 'Professional Blue', colors: ['#2563eb', '#1e40af', '#1d4ed8'] },
  { id: 'gray', name: 'Classic Gray', colors: ['#374151', '#4b5563', '#6b7280'] },
  { id: 'green', name: 'Growth Green', colors: ['#059669', '#047857', '#065f46'] },
  { id: 'purple', name: 'Creative Purple', colors: ['#7c3aed', '#6d28d9', '#5b21b6'] },
  { id: 'red', name: 'Bold Red', colors: ['#dc2626', '#b91c1c', '#991b1b'] },
  { id: 'orange', name: 'Energy Orange', colors: ['#ea580c', '#c2410c', '#9a3412'] }
];

const fontFamilies = [
  { id: 'inter', name: 'Inter', description: 'Modern and readable' },
  { id: 'roboto', name: 'Roboto', description: 'Clean and professional' },
  { id: 'opensans', name: 'Open Sans', description: 'Friendly and approachable' },
  { id: 'poppins', name: 'Poppins', description: 'Trendy and geometric' },
  { id: 'playfair', name: 'Playfair Display', description: 'Elegant and sophisticated' },
  { id: 'lato', name: 'Lato', description: 'Warm and humanist' }
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  customization,
  onTemplateChange,
  onCustomizationChange
}) => {
  const [activeCategory, setActiveCategory] = useState('professional');
  const [activeTab, setActiveTab] = useState('templates');

  const allTemplates = templateCategories.flatMap(cat => cat.templates);
  const selectedTemplateData = allTemplates.find(t => t.id === selectedTemplate);

  const updateCustomization = (updates: Partial<Customization>) => {
    onCustomizationChange({ ...customization, ...updates });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="customize" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Customize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex gap-2 mb-4">
            {templateCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          <ScrollArea className="h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templateCategories
                .find(cat => cat.id === activeCategory)
                ?.templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => onTemplateChange(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                        <Layout className="w-12 h-12 text-gray-400" />
                      </div>
                      
                      {template.isPremium && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      
                      {template.isPopular && (
                        <Badge className="absolute top-2 left-2 bg-green-500">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Best for: {template.suitable_for.join(', ')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="customize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="w-4 h-4" />
                Color Scheme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {colorSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      customization.colorScheme === scheme.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => updateCustomization({ colorScheme: scheme.id })}
                  >
                    <div className="flex gap-1 mb-2">
                      {scheme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="text-sm font-medium">{scheme.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Type className="w-4 h-4" />
                Typography
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Font Family</label>
                <Select
                  value={customization.fontFamily}
                  onValueChange={(value) => updateCustomization({ fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.id} value={font.id}>
                        <div>
                          <div className="font-medium">{font.name}</div>
                          <div className="text-xs text-gray-500">{font.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Font Size: {customization.fontSize}px
                </label>
                <Slider
                  value={[customization.fontSize]}
                  onValueChange={(value) => updateCustomization({ fontSize: value[0] })}
                  min={10}
                  max={16}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Spacing className="w-4 h-4" />
                Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium mb-2 block">Spacing</label>
                <div className="grid grid-cols-3 gap-2">
                  {['compact', 'normal', 'spacious'].map((spacing) => (
                    <Button
                      key={spacing}
                      variant={customization.spacing === spacing ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCustomization({ spacing: spacing as any })}
                      className="capitalize"
                    >
                      {spacing}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedTemplateData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4" />
              Current Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center">
                <Layout className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold">{selectedTemplateData.name}</h3>
                <p className="text-sm text-gray-600">{selectedTemplateData.description}</p>
                <div className="flex gap-1 mt-1">
                  {selectedTemplateData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
