import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Users, Eye } from 'lucide-react';
import { ResumeTemplate } from '@/data/resumeTemplates';

interface MobileTemplateCardProps {
  template: ResumeTemplate;
  isSelected: boolean;
  onSelect: (templateId: string) => void;
  onPreview: (templateId: string) => void;
}

export const MobileTemplateCard: React.FC<MobileTemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  onPreview
}) => {
  return (
    <Card className={`relative overflow-hidden transition-all ${
      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
    }`}>
      {/* Header with badges */}
      <div className="relative">
        <div className="aspect-[4/5] bg-gradient-to-br from-muted/30 to-muted/70 flex items-center justify-center">
          {/* Template preview mockup */}
          <div className="w-3/4 h-4/5 bg-white rounded-sm shadow-sm p-2 space-y-1">
            <div className="h-1 bg-foreground/80 rounded w-3/4 mx-auto"></div>
            <div className="h-0.5 bg-foreground/60 rounded w-1/2 mx-auto"></div>
            <div className="space-y-0.5 mt-2">
              <div className="h-0.5 bg-foreground/40 rounded w-full"></div>
              <div className="h-0.5 bg-foreground/40 rounded w-4/5"></div>
              <div className="h-0.5 bg-foreground/40 rounded w-3/4"></div>
            </div>
          </div>
        </div>
        
        {/* Top badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {template.isPremium && (
            <Badge variant="secondary" className="text-xs">Pro</Badge>
          )}
        </div>
        
        {/* ATS Score */}
        <div className="absolute top-2 right-2">
          <Badge className="text-xs bg-green-600 text-white">
            ATS {template.atsScore}%
          </Badge>
        </div>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="bg-primary text-primary-foreground rounded-full p-2">
              ✓
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-sm truncate">{template.name}</h3>
          {template.isRecommended && (
            <Badge variant="default" className="text-xs ml-2">
              <Star className="w-3 h-3 mr-1" />
              Recommended
            </Badge>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>
        
        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            4.8
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            12K+ uses
          </div>
        </div>
        
        {/* Feature tags */}
        <div className="flex flex-wrap gap-1">
          {template.features?.slice(0, 2).map((feature, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPreview(template.id)}
            className="flex-1 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={() => onSelect(template.id)}
            className="flex-1 text-xs"
            variant={isSelected ? "default" : "outline"}
          >
            {isSelected ? 'Selected' : 'Use This Template'}
          </Button>
        </div>
      </div>
    </Card>
  );
};