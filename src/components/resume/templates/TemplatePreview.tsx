
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Eye } from 'lucide-react';

interface TemplatePreviewProps {
  template: {
    id: string;
    name: string;
    category: string;
    description: string;
    preview: string;
    features: string[];
    atsScore: number;
    isRecommended?: boolean;
  };
  isSelected: boolean;
  onSelect: (templateId: string) => void;
  onPreview: (templateId: string) => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  isSelected,
  onSelect,
  onPreview
}) => {
  return (
    <Card className={`cursor-pointer transition-all hover:shadow-lg ${
      isSelected ? 'ring-2 ring-primary shadow-lg' : ''
    }`}>
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
            <img
              src={template.preview}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {isSelected && (
            <div className="absolute top-2 right-2">
              <CheckCircle className="h-6 w-6 text-primary bg-white rounded-full" />
            </div>
          )}

          {template.isRecommended && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-yellow-500 text-yellow-900">
                <Star className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
            </div>
          )}

          <div className="absolute bottom-2 right-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(template.id);
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{template.name}</h3>
            <Badge variant="outline" className="text-xs">
              ATS: {template.atsScore}%
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {template.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {template.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>

          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={() => onSelect(template.id)}
          >
            {isSelected ? 'Selected' : 'Select Template'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
