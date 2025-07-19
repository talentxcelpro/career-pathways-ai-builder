
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  FileText, 
  Star, 
  Crown, 
  Briefcase, 
  Palette, 
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  Eye
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: 'professional' | 'creative' | 'academic' | 'modern' | 'classic';
  description: string;
  isPremium: boolean;
  isPopular: boolean;
  previewUrl: string;
  colorScheme: string;
  rating: number;
  usageCount: number;
}

const templates: Template[] = [
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    category: 'modern',
    description: 'Clean, contemporary design perfect for tech professionals',
    isPremium: false,
    isPopular: true,
    previewUrl: '/templates/modern-tech.png',
    colorScheme: 'blue',
    rating: 4.8,
    usageCount: 12540
  },
  {
    id: 'executive-classic',
    name: 'Executive Classic',
    category: 'professional',
    description: 'Traditional, authoritative template for senior roles',
    isPremium: true,
    isPopular: false,
    previewUrl: '/templates/executive-classic.png',
    colorScheme: 'navy',
    rating: 4.7,
    usageCount: 8920
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    category: 'creative',
    description: 'Vibrant, creative template for design professionals',
    isPremium: true,
    isPopular: true,
    previewUrl: '/templates/creative-designer.png',
    colorScheme: 'purple',
    rating: 4.9,
    usageCount: 15320
  },
  {
    id: 'academic-scholar',
    name: 'Academic Scholar',
    category: 'academic',
    description: 'Scholarly template for academic and research positions',
    isPremium: false,
    isPopular: false,
    previewUrl: '/templates/academic-scholar.png',
    colorScheme: 'green',
    rating: 4.6,
    usageCount: 5640
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    category: 'modern',
    description: 'Ultra-clean, minimalist design focusing on content',
    isPremium: false,
    isPopular: true,
    previewUrl: '/templates/minimalist-clean.png',
    colorScheme: 'gray',
    rating: 4.8,
    usageCount: 18750
  },
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    category: 'classic',
    description: 'Timeless design that never goes out of style',
    isPremium: false,
    isPopular: false,
    previewUrl: '/templates/classic-professional.png',
    colorScheme: 'black',
    rating: 4.5,
    usageCount: 7890
  }
];

const TemplateSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinueEditing = () => {
    if (selectedTemplate) {
      navigate(`/resume-builder/edit/new?template=${selectedTemplate}`);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'professional': return <Briefcase className="h-4 w-4" />;
      case 'creative': return <Palette className="h-4 w-4" />;
      case 'academic': return <GraduationCap className="h-4 w-4" />;
      case 'modern': return <Star className="h-4 w-4" />;
      case 'classic': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/resume-builder')} 
              className="flex items-center text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <FileText className="w-3 h-3 mr-1" />
              Choose Your Template
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Choose Your Perfect Template
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Select a professional design that matches your industry and style. All templates are fully customizable.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              Professional
            </TabsTrigger>
            <TabsTrigger value="modern" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Modern
            </TabsTrigger>
            <TabsTrigger value="creative" className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Creative
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              Academic
            </TabsTrigger>
            <TabsTrigger value="classic" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Classic
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-8">
            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedTemplate === template.id 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader className="p-0">
                    <div className="relative">
                      {/* Template Preview */}
                      <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                        <div className="text-gray-500">
                          <FileText className="w-16 h-16 opacity-50" />
                        </div>
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {template.isPopular && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                          {template.isPremium && (
                            <Badge className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0">
                              <Crown className="w-3 h-3 mr-1" />
                              Pro
                            </Badge>
                          )}
                        </div>
                        
                        {/* Selected Indicator */}
                        {selectedTemplate === template.id && (
                          <div className="absolute inset-0 bg-blue-500/20 rounded-t-lg flex items-center justify-center">
                            <div className="bg-white rounded-full p-2">
                              <CheckCircle className="w-8 h-8 text-blue-600" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{template.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{template.usageCount.toLocaleString()} downloads</span>
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(template.category)}
                        <span className="capitalize">{template.category}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template.id);
                        }}
                        className={selectedTemplate === template.id ? 'bg-blue-600' : ''}
                      >
                        {selectedTemplate === template.id ? 'Selected' : 'Select'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected Template Info */}
        {selectedTemplate && (
          <Card className="bg-blue-50 border-blue-200 mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      {templates.find(t => t.id === selectedTemplate)?.name} Selected
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Ready to start building your professional resume
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleContinueEditing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Continue Editing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or browse different categories
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelectionPage;
