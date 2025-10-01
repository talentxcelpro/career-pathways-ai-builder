import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { resumeTemplates } from '@/data/resumeTemplates';

interface TemplateGalleryPanelProps {
  currentTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
}

export function TemplateGalleryPanel({ currentTemplateId, onTemplateSelect }: TemplateGalleryPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Template</h3>
        <p className="text-sm text-muted-foreground">
          Select a professional template that matches your industry and experience level
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resumeTemplates.map((template) => {
          const isSelected = currentTemplateId === template.id;
          
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onTemplateSelect(template.id)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Template Preview */}
                  <div className="aspect-[8.5/11] bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="text-center p-4">
                      <div className="text-xs font-mono text-muted-foreground mb-2">
                        {template.name}
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 w-20 bg-primary/20 rounded mx-auto" />
                        <div className="h-1 w-16 bg-primary/10 rounded mx-auto" />
                        <div className="h-1 w-24 bg-primary/10 rounded mx-auto mt-3" />
                        <div className="h-1 w-20 bg-primary/10 rounded mx-auto" />
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {template.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.features.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* ATS Score */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">ATS Score</span>
                      <span className="font-semibold text-primary">
                        {template.atsScore}%
                      </span>
                    </div>

                    {/* Select Button */}
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplateSelect(template.id);
                      }}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        'Select Template'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
