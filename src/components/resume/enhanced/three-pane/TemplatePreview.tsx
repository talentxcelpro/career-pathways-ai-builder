import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Check } from 'lucide-react';
import { ResumeTemplate } from '@/data/resumeTemplates';

interface TemplatePreviewProps {
  template: ResumeTemplate;
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
    <Card className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      <div className="aspect-[3/4] bg-gradient-to-br from-muted/50 to-muted relative">
        {/* Template Preview Content */}
        <div className="p-4 h-full flex flex-col text-xs space-y-2">
          <div className="text-center space-y-1">
            <div className="h-2 bg-foreground/80 rounded w-3/4 mx-auto"></div>
            <div className="h-1 bg-foreground/60 rounded w-1/2 mx-auto"></div>
            <div className="h-1 bg-foreground/40 rounded w-2/3 mx-auto"></div>
          </div>
          
          <div className="space-y-1">
            <div className="h-1 bg-foreground/60 rounded w-1/4"></div>
            <div className="h-1 bg-foreground/40 rounded w-full"></div>
            <div className="h-1 bg-foreground/40 rounded w-5/6"></div>
          </div>
          
          <div className="flex gap-2">
            <div className="w-1/2 space-y-1">
              <div className="h-1 bg-foreground/60 rounded w-3/4"></div>
              <div className="h-1 bg-foreground/40 rounded w-full"></div>
              <div className="h-1 bg-foreground/40 rounded w-2/3"></div>
            </div>
            <div className="w-1/2 space-y-1">
              <div className="h-1 bg-foreground/60 rounded w-2/3"></div>
              <div className="h-1 bg-foreground/40 rounded w-full"></div>
              <div className="h-1 bg-foreground/40 rounded w-3/4"></div>
            </div>
          </div>
        </div>
        
        {/* Overlay for actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template.id);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template.id);
            }}
          >
            <Check className="h-4 w-4 mr-1" />
            Select
          </Button>
        </div>
        
        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="bg-primary text-primary-foreground rounded-full p-1">
              <Check className="h-3 w-3" />
            </div>
          </div>
        )}
        
        {/* Premium badge */}
        {template.isPremium && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              Pro
            </Badge>
          </div>
        )}
        
        {/* ATS Score */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="outline" className="text-xs">
            ATS: {template.atsScore}%
          </Badge>
        </div>
      </div>
      
      <div className="p-3 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm truncate">{template.name}</h3>
          {template.isRecommended && (
            <Badge variant="default" className="text-xs ml-2">
              Recommended
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {template.features.slice(0, 2).map((feature, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};