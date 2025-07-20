
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, Type, Layout, AlignJustify, 
  Move, Eye, RotateCcw, Save
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface CustomizationSettings {
  colorScheme: string;
  fontFamily: string;
  fontSize: number;
  spacing: 'compact' | 'normal' | 'spacious';
  sectionOrder: string[];
  showPhoto: boolean;
  showBorder: boolean;
  accentColor: string;
}

interface CustomizationEngineProps {
  settings: CustomizationSettings;
  onSettingsChange: (settings: CustomizationSettings) => void;
  onPreview: () => void;
  onReset: () => void;
  onSave: () => void;
}

const colorSchemes = [
  { id: 'blue', name: 'Professional Blue', primary: '#2563eb', secondary: '#1e40af' },
  { id: 'gray', name: 'Modern Gray', primary: '#374151', secondary: '#6b7280' },
  { id: 'green', name: 'Fresh Green', primary: '#059669', secondary: '#047857' },
  { id: 'purple', name: 'Creative Purple', primary: '#7c3aed', secondary: '#6d28d9' },
  { id: 'red', name: 'Bold Red', primary: '#dc2626', secondary: '#b91c1c' },
  { id: 'orange', name: 'Warm Orange', primary: '#ea580c', secondary: '#c2410c' }
];

const fontOptions = [
  { id: 'inter', name: 'Inter', category: 'Modern' },
  { id: 'roboto', name: 'Roboto', category: 'Friendly' },
  { id: 'times', name: 'Times New Roman', category: 'Classic' },
  { id: 'arial', name: 'Arial', category: 'Universal' },
  { id: 'georgia', name: 'Georgia', category: 'Elegant' },
  { id: 'helvetica', name: 'Helvetica', category: 'Clean' }
];

const sectionLabels = {
  personalInfo: 'Personal Information',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  awards: 'Awards',
  languages: 'Languages'
};

export const CustomizationEngine: React.FC<CustomizationEngineProps> = ({
  settings,
  onSettingsChange,
  onPreview,
  onReset,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('colors');

  const updateSettings = (updates: Partial<CustomizationSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(settings.sectionOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateSettings({ sectionOrder: items });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customize Your Resume</h2>
          <p className="text-muted-foreground">
            Personalize colors, fonts, layout, and more
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReset} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button variant="outline" onClick={onPreview} className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button onClick={onSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Customization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Move className="w-4 h-4" />
            Sections
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colorSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      settings.colorScheme === scheme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => updateSettings({ colorScheme: scheme.id })}
                  >
                    <div className="flex gap-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: scheme.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: scheme.secondary }}
                      />
                    </div>
                    <p className="text-sm font-medium">{scheme.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accent Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Border</Label>
                  <p className="text-sm text-muted-foreground">Add a subtle border around sections</p>
                </div>
                <Switch
                  checked={settings.showBorder}
                  onCheckedChange={(checked) => updateSettings({ showBorder: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Font Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Font Family</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value) => updateSettings({ fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.id} value={font.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{font.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {font.category}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Font Size: {settings.fontSize}pt</Label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSettings({ fontSize: value })}
                  min={9}
                  max={14}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Small (9pt)</span>
                  <span>Medium (11pt)</span>
                  <span>Large (14pt)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlignJustify className="h-4 w-4" />
                Spacing & Layout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Section Spacing</Label>
                <Select
                  value={settings.spacing}
                  onValueChange={(value: 'compact' | 'normal' | 'spacious') => 
                    updateSettings({ spacing: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact - More content per page</SelectItem>
                    <SelectItem value="normal">Normal - Balanced spacing</SelectItem>
                    <SelectItem value="spacious">Spacious - Easier to read</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Profile Photo</Label>
                  <p className="text-sm text-muted-foreground">Display your profile photo in the header</p>
                </div>
                <Switch
                  checked={settings.showPhoto}
                  onCheckedChange={(checked) => updateSettings({ showPhoto: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Section Order</CardTitle>
              <p className="text-sm text-muted-foreground">
                Drag and drop to reorder sections in your resume
              </p>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {settings.sectionOrder.map((sectionId, index) => (
                        <Draggable key={sectionId} draggableId={sectionId} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-muted rounded-lg border flex items-center gap-3 transition-all ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <Move className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {sectionLabels[sectionId] || sectionId}
                              </span>
                              <div className="ml-auto text-sm text-muted-foreground">
                                Position {index + 1}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
