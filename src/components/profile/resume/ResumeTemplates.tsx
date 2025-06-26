
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Palette, Briefcase, Star } from "lucide-react";

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  isPremium: boolean;
  tags: string[];
}

interface ResumeTemplatesProps {
  onSelectTemplate: (template: ResumeTemplate) => void;
  selectedTemplate?: string;
}

export const ResumeTemplates = ({ onSelectTemplate, selectedTemplate }: ResumeTemplatesProps) => {
  const templates: ResumeTemplate[] = [
    {
      id: 'modern',
      name: 'Modern Professional',
      description: 'Clean, contemporary design perfect for tech and creative industries',
      category: 'Professional',
      preview: 'bg-gradient-to-br from-blue-50 to-blue-100',
      isPremium: false,
      tags: ['Clean', 'Modern', 'ATS-Friendly']
    },
    {
      id: 'classic',
      name: 'Classic Business',
      description: 'Traditional format ideal for corporate and finance roles',
      category: 'Traditional',
      preview: 'bg-gradient-to-br from-gray-50 to-gray-100',
      isPremium: false,
      tags: ['Traditional', 'Corporate', 'Professional']
    },
    {
      id: 'creative',
      name: 'Creative Designer',
      description: 'Bold, artistic layout for designers and creative professionals',
      category: 'Creative',
      preview: 'bg-gradient-to-br from-purple-50 to-pink-100',
      isPremium: true,
      tags: ['Creative', 'Artistic', 'Visual']
    },
    {
      id: 'minimal',
      name: 'Minimal Elegance',
      description: 'Minimalist design focusing on content and readability',
      category: 'Minimal',
      preview: 'bg-gradient-to-br from-green-50 to-green-100',
      isPremium: false,
      tags: ['Minimal', 'Clean', 'Simple']
    },
    {
      id: 'executive',
      name: 'Executive Suite',
      description: 'Premium design for senior-level and executive positions',
      category: 'Executive',
      preview: 'bg-gradient-to-br from-amber-50 to-orange-100',
      isPremium: true,
      tags: ['Executive', 'Premium', 'Leadership']
    },
    {
      id: 'tech',
      name: 'Tech Specialist',
      description: 'Modern template optimized for software developers and engineers',
      category: 'Technology',
      preview: 'bg-gradient-to-br from-cyan-50 to-blue-100',
      isPremium: false,
      tags: ['Tech', 'Developer', 'Engineering']
    }
  ];

  const getIcon = (category: string) => {
    switch (category) {
      case 'Creative': return <Palette className="h-5 w-5" />;
      case 'Executive': return <Star className="h-5 w-5" />;
      case 'Technology': return <Briefcase className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
        <p className="text-sm text-gray-600">Select a professional template that matches your industry and style</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getIcon(template.category)}
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.isPremium && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Template Preview */}
              <div className={`h-32 rounded-lg ${template.preview} border-2 border-gray-200 flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-2 bg-white rounded shadow-sm">
                  <div className="p-3 space-y-2">
                    <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-1 bg-gray-200 rounded w-full"></div>
                    <div className="h-1 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-1 bg-gray-200 rounded w-2/3"></div>
                    <div className="space-y-1 mt-3">
                      <div className="h-1 bg-blue-200 rounded w-1/2"></div>
                      <div className="h-1 bg-blue-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <CardDescription className="text-sm mb-2">
                  {template.description}
                </CardDescription>
                
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                variant={selectedTemplate === template.id ? "default" : "outline"}
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTemplate(template);
                }}
              >
                {selectedTemplate === template.id ? 'Selected' : 'Select Template'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
