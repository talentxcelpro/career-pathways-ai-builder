import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Globe } from "lucide-react";
import { Language } from "@/types/enhanced-resume";

interface LanguagesSectionProps {
  data: Language[];
  onChange: (data: Language[]) => void;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  data,
  onChange
}) => {
  const addLanguage = () => {
    const newLanguage: Language = {
      id: crypto.randomUUID(),
      name: '',
      level: 'intermediate',
      proficiency: 'conversational',
      certifications: []
    };
    onChange([...data, newLanguage]);
  };

  const updateLanguage = (id: string, updates: Partial<Language>) => {
    onChange(data.map(lang => 
      lang.id === id ? { ...lang, ...updates } : lang
    ));
  };

  const removeLanguage = (id: string) => {
    onChange(data.filter(lang => lang.id !== id));
  };

  const updateCertifications = (id: string, certStr: string) => {
    const certifications = certStr.split(',').map(c => c.trim()).filter(c => c);
    updateLanguage(id, { certifications });
  };

  const getProficiencyColor = (proficiency: Language['proficiency']) => {
    switch (proficiency) {
      case 'native': return 'bg-green-100 text-green-800';
      case 'fluent': return 'bg-blue-100 text-blue-800';
      case 'conversational': return 'bg-yellow-100 text-yellow-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Languages</h3>
        </div>
        <Button onClick={addLanguage} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No languages yet</p>
            <Button onClick={addLanguage} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Language
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((language, index) => (
            <Card key={language.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">
                      Language #{index + 1}
                    </CardTitle>
                    {language.name && (
                      <Badge className={getProficiencyColor(language.proficiency)}>
                        {language.proficiency}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(language.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${language.id}`}>Language *</Label>
                    <Input
                      id={`name-${language.id}`}
                      value={language.name}
                      onChange={(e) => updateLanguage(language.id, { name: e.target.value })}
                      placeholder="e.g., Spanish, Mandarin Chinese"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`proficiency-${language.id}`}>Proficiency Level *</Label>
                    <Select
                      value={language.proficiency}
                      onValueChange={(value: Language['proficiency']) => 
                        updateLanguage(language.id, { proficiency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="fluent">Fluent</SelectItem>
                        <SelectItem value="native">Native</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`certifications-${language.id}`}>Certifications</Label>
                  <Input
                    id={`certifications-${language.id}`}
                    value={language.certifications?.join(', ') || ''}
                    onChange={(e) => updateCertifications(language.id, e.target.value)}
                    placeholder="e.g., DELE B2, HSK Level 5, TOEFL 110"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple certifications with commas
                  </p>
                  {language.certifications && language.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {language.certifications.map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Proficiency Guide:</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div><strong>Basic:</strong> Can understand and use familiar expressions</div>
                    <div><strong>Conversational:</strong> Can handle routine tasks and social exchanges</div>
                    <div><strong>Fluent:</strong> Can express ideas fluently and spontaneously</div>
                    <div><strong>Native:</strong> Native or bilingual proficiency</div>
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