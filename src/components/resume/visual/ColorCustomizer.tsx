
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Type, Layout, Spacing } from "lucide-react";

interface Customization {
  colorScheme: string;
  fontFamily: string;
  fontSize: string;
  spacing: string;
  layout: string;
}

interface ColorCustomizerProps {
  customization: Customization;
  onCustomizationChange: (customization: Customization) => void;
}

export const ColorCustomizer: React.FC<ColorCustomizerProps> = ({
  customization,
  onCustomizationChange
}) => {
  const colorSchemes = [
    { id: 'blue', name: 'Professional Blue', primary: '#2563eb', secondary: '#64748b' },
    { id: 'green', name: 'Growth Green', primary: '#059669', secondary: '#64748b' },
    { id: 'purple', name: 'Creative Purple', primary: '#7c3aed', secondary: '#64748b' },
    { id: 'orange', name: 'Energetic Orange', primary: '#ea580c', secondary: '#64748b' },
    { id: 'gray', name: 'Elegant Gray', primary: '#374151', secondary: '#6b7280' },
    { id: 'red', name: 'Bold Red', primary: '#dc2626', secondary: '#64748b' }
  ];

  const fontFamilies = [
    { id: 'Inter', name: 'Inter', description: 'Modern & clean' },
    { id: 'Roboto', name: 'Roboto', description: 'Professional' },
    { id: 'Lato', name: 'Lato', description: 'Friendly' },
    { id: 'Montserrat', name: 'Montserrat', description: 'Elegant' },
    { id: 'Open Sans', name: 'Open Sans', description: 'Readable' },
  ];

  const layouts = [
    { id: 'classic', name: 'Classic', description: 'Traditional single column' },
    { id: 'modern', name: 'Modern', description: 'Two column with sidebar' },
    { id: 'creative', name: 'Creative', description: 'Asymmetric design' },
  ];

  const updateCustomization = (key: keyof Customization, value: string) => {
    onCustomizationChange({
      ...customization,
      [key]: value
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Color Scheme */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Color Scheme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {colorSchemes.map(scheme => (
              <button
                key={scheme.id}
                onClick={() => updateCustomization('colorScheme', scheme.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  customization.colorScheme === scheme.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: scheme.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: scheme.secondary }}
                  />
                </div>
                <p className="text-xs font-medium">{scheme.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="w-4 h-4" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Font Family</Label>
            <RadioGroup 
              value={customization.fontFamily} 
              onValueChange={(value) => updateCustomization('fontFamily', value)}
            >
              {fontFamilies.map(font => (
                <div key={font.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={font.id} id={font.id} />
                  <Label htmlFor={font.id} className="flex-1">
                    <span className="font-medium">{font.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{font.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Font Size</Label>
            <RadioGroup 
              value={customization.fontSize} 
              onValueChange={(value) => updateCustomization('fontSize', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small">Small (10-12px)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium (12-14px)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large">Large (14-16px)</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout Style
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={customization.layout} 
            onValueChange={(value) => updateCustomization('layout', value)}
          >
            {layouts.map(layout => (
              <div key={layout.id} className="flex items-center space-x-2">
                <RadioGroupItem value={layout.id} id={layout.id} />
                <Label htmlFor={layout.id} className="flex-1">
                  <span className="font-medium">{layout.name}</span>
                  <span className="text-xs text-muted-foreground ml-2 block">{layout.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Spacing className="w-4 h-4" />
            Spacing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={customization.spacing} 
            onValueChange={(value) => updateCustomization('spacing', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="compact" />
              <Label htmlFor="compact">Compact</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="normal" />
              <Label htmlFor="normal">Normal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spacious" id="spacious" />
              <Label htmlFor="spacious">Spacious</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Reset */}
      <Button variant="outline" className="w-full">
        Reset to Default
      </Button>
    </div>
  );
};
