import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Star, Crown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplatePreviewProps {
  templates: any[];
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  resumeContent?: any;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  resumeContent
}) => {
  const [previewMode, setPreviewMode] = useState<'grid' | 'detailed'>('grid');

  const generatePreviewContent = (template: any) => {
    // Sample content for preview
    const sampleContent = {
      personal: {
        fullName: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY'
      },
      summary: {
        text: 'Experienced software engineer with 5+ years in full-stack development...'
      },
      experience: {
        items: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            startDate: '2020-01',
            endDate: 'Present',
            description: 'Led development of scalable web applications...'
          }
        ]
      }
    };

    return resumeContent || sampleContent;
  };

  const renderTemplatePreview = (template: any) => {
    const content = generatePreviewContent(template);
    const config = template.template_config || {};
    
    // Get template style classes based on template type
    const getTemplateClasses = () => {
      const baseClasses = "w-full h-full min-h-[400px] p-4 bg-white text-gray-900 text-xs";
      
      switch (template.category) {
        case 'modern':
          return `${baseClasses} border-l-4 border-blue-500`;
        case 'classic':
          return `${baseClasses} border-2 border-gray-300`;
        case 'creative':
          return `${baseClasses} bg-gradient-to-br from-blue-50 to-purple-50`;
        case 'executive':
          return `${baseClasses} border-t-4 border-gray-800`;
        default:
          return baseClasses;
      }
    };

    return (
      <div className={getTemplateClasses()}>
        {/* Header */}
        <div className="mb-4 text-center border-b pb-2">
          <h1 className="text-lg font-bold">{content.personal?.fullName || 'Your Name'}</h1>
          <div className="text-xs text-gray-600 space-x-2">
            <span>{content.personal?.email}</span>
            <span>•</span>
            <span>{content.personal?.phone}</span>
            <span>•</span>
            <span>{content.personal?.location}</span>
          </div>
        </div>

        {/* Professional Summary */}
        {content.summary?.text && (
          <div className="mb-3">
            <h2 className="font-semibold text-sm mb-1 uppercase tracking-wide">
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed">
              {content.summary.text.length > 150 
                ? `${content.summary.text.substring(0, 150)}...`
                : content.summary.text
              }
            </p>
          </div>
        )}

        {/* Experience */}
        {content.experience?.items && content.experience.items.length > 0 && (
          <div className="mb-3">
            <h2 className="font-semibold text-sm mb-1 uppercase tracking-wide">
              Experience
            </h2>
            {content.experience.items.slice(0, 2).map((exp: any, index: number) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-xs">{exp.title}</h3>
                    <p className="text-xs text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </span>
                </div>
                <p className="text-xs text-gray-700 mt-1">
                  {exp.description.length > 100 
                    ? `${exp.description.substring(0, 100)}...`
                    : exp.description
                  }
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Skills Preview */}
        <div className="mb-3">
          <h2 className="font-semibold text-sm mb-1 uppercase tracking-wide">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1">
            {['JavaScript', 'React', 'Node.js', 'Python', 'AWS'].map((skill) => (
              <span 
                key={skill} 
                className="px-2 py-1 bg-gray-100 text-xs rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Education Preview */}
        <div>
          <h2 className="font-semibold text-sm mb-1 uppercase tracking-wide">
            Education
          </h2>
          <div>
            <h3 className="font-medium text-xs">Bachelor of Computer Science</h3>
            <p className="text-xs text-gray-600">University Name • 2016-2020</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Choose Template</h3>
        <div className="flex gap-2">
          <Button
            variant={previewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={previewMode === 'detailed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('detailed')}
          >
            <Eye className="h-4 w-4 mr-1" />
            Detailed
          </Button>
        </div>
      </div>

      {previewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {templates?.map((template) => (
            <Card
              key={template.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedTemplate === template.id && "ring-2 ring-primary"
              )}
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardContent className="p-2">
                <div className="aspect-[3/4] bg-white border rounded overflow-hidden mb-2">
                  {renderTemplatePreview(template)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{template.name}</h4>
                    {selectedTemplate === template.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant={template.is_premium ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {template.is_premium ? (
                        <>
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </>
                      ) : (
                        'Free'
                      )}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground truncate">
                    {template.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {templates?.map((template) => (
            <Card
              key={template.id}
              className={cn(
                "cursor-pointer transition-all",
                selectedTemplate === template.id && "ring-2 ring-primary"
              )}
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="aspect-[3/4] bg-white border rounded overflow-hidden">
                    {renderTemplatePreview(template)}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">{template.name}</h4>
                      {selectedTemplate === template.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={template.is_premium ? 'default' : 'secondary'}
                      >
                        {template.is_premium ? (
                          <>
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </>
                        ) : (
                          'Free'
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {template.category}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        4.8
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Features:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• ATS-friendly format</li>
                        <li>• Professional typography</li>
                        <li>• Customizable colors</li>
                        <li>• Multiple export formats</li>
                      </ul>
                    </div>
                    
                    <Button
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(template.id);
                      }}
                    >
                      {selectedTemplate === template.id ? 'Selected' : 'Select Template'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};