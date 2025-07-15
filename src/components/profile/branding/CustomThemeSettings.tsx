import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Crown, Palette, RotateCcw, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFeatureGating } from '@/hooks/useFeatureGating';

interface CustomThemeSettingsProps {
  currentTheme?: any;
  onUpdateSuccess?: (theme: any) => void;
  profileId: string;
}

const defaultTheme = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))"
};

const presetThemes = [
  {
    name: "Professional Blue",
    colors: {
      primary: "hsl(220, 91%, 51%)",
      secondary: "hsl(220, 14%, 96%)",
      accent: "hsl(220, 91%, 51%)"
    }
  },
  {
    name: "Creative Purple",
    colors: {
      primary: "hsl(262, 83%, 58%)",
      secondary: "hsl(262, 83%, 96%)",
      accent: "hsl(262, 83%, 58%)"
    }
  },
  {
    name: "Modern Green",
    colors: {
      primary: "hsl(142, 76%, 36%)",
      secondary: "hsl(142, 76%, 96%)",
      accent: "hsl(142, 76%, 36%)"
    }
  },
  {
    name: "Elegant Rose",
    colors: {
      primary: "hsl(346, 77%, 49%)",
      secondary: "hsl(346, 77%, 96%)",
      accent: "hsl(346, 77%, 49%)"
    }
  },
  {
    name: "Tech Orange",
    colors: {
      primary: "hsl(25, 95%, 53%)",
      secondary: "hsl(25, 95%, 96%)",
      accent: "hsl(25, 95%, 53%)"
    }
  }
];

export const CustomThemeSettings: React.FC<CustomThemeSettingsProps> = ({
  currentTheme,
  onUpdateSuccess,
  profileId
}) => {
  const [theme, setTheme] = useState(currentTheme || defaultTheme);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { checkFeatureAccess } = useFeatureGating();

  const handleColorChange = (key: string, value: string) => {
    setTheme(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePresetSelect = (preset: any) => {
    setTheme(preset.colors);
  };

  const handleSave = async () => {
    if (!checkFeatureAccess('Custom branding')) {
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ custom_theme: theme })
        .eq('id', profileId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Custom theme saved successfully!",
      });
      
      onUpdateSuccess?.(theme);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save custom theme",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTheme(defaultTheme);
  };

  const applyPreviewStyles = () => {
    if (previewMode) {
      document.documentElement.style.setProperty('--primary', theme.primary.replace('hsl(', '').replace(')', ''));
      document.documentElement.style.setProperty('--secondary', theme.secondary.replace('hsl(', '').replace(')', ''));
      document.documentElement.style.setProperty('--accent', theme.accent.replace('hsl(', '').replace(')', ''));
    }
  };

  const removePreviewStyles = () => {
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--secondary');
    document.documentElement.style.removeProperty('--accent');
  };

  useEffect(() => {
    if (previewMode) {
      applyPreviewStyles();
    } else {
      removePreviewStyles();
    }

    return () => {
      removePreviewStyles();
    };
  }, [previewMode, theme]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Custom Theme
        </CardTitle>
        <CardDescription>
          Customize your profile colors and theme (Elite feature)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Customization */}
        <div className="space-y-4">
          <Label>Custom Colors</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(theme).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">{key}</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: value as string }}
                  />
                  <Input
                    id={key}
                    type="text"
                    value={value as string}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    placeholder="hsl(220, 91%, 51%)"
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preset Themes */}
        <div className="space-y-4">
          <Label>Preset Themes</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {presetThemes.map((preset) => (
              <div
                key={preset.name}
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handlePresetSelect(preset)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{preset.name}</span>
                  <div className="flex gap-1">
                    {Object.values(preset.colors).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Theme Preview</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Exit Preview' : 'Preview'}
            </Button>
          </div>
          
          {previewMode && (
            <div className="p-4 border rounded-lg bg-card">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm">Primary Color</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-sm">Secondary Color</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span className="text-sm">Accent Color</span>
                </div>
                <Button size="sm" className="w-full">
                  Sample Button
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : 'Save Theme'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>• Colors should be in HSL format: hsl(220, 91%, 51%)</p>
          <p>• Changes apply to your public profile view</p>
          <p>• Use preview mode to test your theme</p>
        </div>
      </CardContent>
    </Card>
  );
};