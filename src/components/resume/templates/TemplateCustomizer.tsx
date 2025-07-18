import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Palette, Layout, Type, Settings, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateCustomization {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: number;
    lineHeight: number;
  };
  layout: {
    margins: 'narrow' | 'normal' | 'wide';
    spacing: 'compact' | 'standard' | 'spacious';
    columns: 1 | 2;
  };
  sections: {
    showPhoto: boolean;
    showSummary: boolean;
    showObjective: boolean;
    sectionOrder: string[];
  };
}

interface TemplateCustomizerProps {
  template: any;
  customization: TemplateCustomization;
  onCustomizationChange: (customization: TemplateCustomization) => void;
  onPreview: () => void;
  onDownload: () => void;
}

export const TemplateCustomizer: React.FC<TemplateCustomizerProps> = ({
  template,
  customization,
  onCustomizationChange,
  onPreview,
  onDownload
}) => {
  const [activeTab, setActiveTab] = useState('colors');

  const colorPresets = [
    { name: 'Professional Blue', colors: { primary: '#3498DB', secondary: '#2980B9', accent: '#1ABC9C', text: '#2C3E50', background: '#FFFFFF' } },
    { name: 'Modern Green', colors: { primary: '#1ABC9C', secondary: '#16A085', accent: '#27AE60', text: '#2C3E50', background: '#FFFFFF' } },
    { name: 'Creative Purple', colors: { primary: '#9B59B6', secondary: '#8E44AD', accent: '#E74C3C', text: '#2C3E50', background: '#FFFFFF' } },
    { name: 'Executive Gray', colors: { primary: '#34495E', secondary: '#2C3E50', accent: '#E67E22', text: '#2C3E50', background: '#FFFFFF' } },
    { name: 'Minimal Black', colors: { primary: '#2C3E50', secondary: '#34495E', accent: '#95A5A6', text: '#2C3E50', background: '#FFFFFF' } }
  ];

  const fontOptions = [
    { value: 'inter', label: 'Inter (Modern)' },
    { value: 'roboto', label: 'Roboto (Clean)' },
    { value: 'openSans', label: 'Open Sans (Readable)' },
    { value: 'lato', label: 'Lato (Friendly)' },
    { value: 'sourceSerifPro', label: 'Source Serif Pro (Traditional)' },
    { value: 'playfair', label: 'Playfair Display (Elegant)' }
  ];

  const updateCustomization = (updates: Partial<TemplateCustomization>) => {
    const newCustomization = { ...customization, ...updates };
    onCustomizationChange(newCustomization);
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    updateCustomization({
      colors: { ...customization.colors, ...preset.colors }
    });
    toast.success(`Applied ${preset.name} color scheme`);
  };

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center space-x-2">
        <div
          className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value;
            input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
            input.click();
          }}
        />
        <span className="text-sm font-mono text-muted-foreground">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customize Template</h3>
          <p className="text-sm text-muted-foreground">
            Personalize your {template.name} template
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onPreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={onDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" className="flex items-center gap-1">
            <Palette className="w-4 h-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-1">
            <Type className="w-4 h-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-1">
            <Layout className="w-4 h-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            Sections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Color Scheme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ColorPicker
                  label="Primary Color"
                  value={customization.colors.primary}
                  onChange={(value) => updateCustomization({
                    colors: { ...customization.colors, primary: value }
                  })}
                />
                <ColorPicker
                  label="Secondary Color"
                  value={customization.colors.secondary}
                  onChange={(value) => updateCustomization({
                    colors: { ...customization.colors, secondary: value }
                  })}
                />
                <ColorPicker
                  label="Accent Color"
                  value={customization.colors.accent}
                  onChange={(value) => updateCustomization({
                    colors: { ...customization.colors, accent: value }
                  })}
                />
                <ColorPicker
                  label="Text Color"
                  value={customization.colors.text}
                  onChange={(value) => updateCustomization({
                    colors: { ...customization.colors, text: value }
                  })}
                />
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-3 block">Color Presets</Label>
                <div className="grid grid-cols-1 gap-2">
                  {colorPresets.map((preset, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => applyColorPreset(preset)}
                    >
                      <span className="text-sm font-medium">{preset.name}</span>
                      <div className="flex items-center gap-1">
                        {Object.values(preset.colors).slice(0, 4).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Typography Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heading Font</Label>
                  <Select
                    value={customization.typography.headingFont}
                    onValueChange={(value) => updateCustomization({
                      typography: { ...customization.typography, headingFont: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Body Font</Label>
                  <Select
                    value={customization.typography.bodyFont}
                    onValueChange={(value) => updateCustomization({
                      typography: { ...customization.typography, bodyFont: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Size: {customization.typography.fontSize}px</Label>
                <Slider
                  value={[customization.typography.fontSize]}
                  onValueChange={([value]) => updateCustomization({
                    typography: { ...customization.typography, fontSize: value }
                  })}
                  min={10}
                  max={16}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Line Height: {customization.typography.lineHeight}</Label>
                <Slider
                  value={[customization.typography.lineHeight]}
                  onValueChange={([value]) => updateCustomization({
                    typography: { ...customization.typography, lineHeight: value }
                  })}
                  min={1.2}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Layout Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Page Margins</Label>
                <Select
                  value={customization.layout.margins}
                  onValueChange={(value: 'narrow' | 'normal' | 'wide') => updateCustomization({
                    layout: { ...customization.layout, margins: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="narrow">Narrow (More content)</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="wide">Wide (More white space)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Section Spacing</Label>
                <Select
                  value={customization.layout.spacing}
                  onValueChange={(value: 'compact' | 'standard' | 'spacious') => updateCustomization({
                    layout: { ...customization.layout, spacing: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Column Layout</Label>
                <Select
                  value={customization.layout.columns.toString()}
                  onValueChange={(value) => updateCustomization({
                    layout: { ...customization.layout, columns: parseInt(value) as 1 | 2 }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Single Column</SelectItem>
                    <SelectItem value="2">Two Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Section Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-photo">Show Photo</Label>
                  <Switch
                    id="show-photo"
                    checked={customization.sections.showPhoto}
                    onCheckedChange={(checked) => updateCustomization({
                      sections: { ...customization.sections, showPhoto: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-summary">Show Summary</Label>
                  <Switch
                    id="show-summary"
                    checked={customization.sections.showSummary}
                    onCheckedChange={(checked) => updateCustomization({
                      sections: { ...customization.sections, showSummary: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-objective">Show Objective</Label>
                  <Switch
                    id="show-objective"
                    checked={customization.sections.showObjective}
                    onCheckedChange={(checked) => updateCustomization({
                      sections: { ...customization.sections, showObjective: checked }
                    })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-3 block">Section Order</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Drag and drop to reorder sections (Coming soon)
                </p>
                <div className="space-y-2">
                  {customization.sections.sectionOrder.map((section, index) => (
                    <div
                      key={section}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm capitalize">{section.replace('_', ' ')}</span>
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};