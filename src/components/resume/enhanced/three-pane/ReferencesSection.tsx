import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { EditorReferenceItem } from '@/types/editor-resume';

interface ReferencesSectionProps {
  data: EditorReferenceItem[];
  onChange: (references: EditorReferenceItem[]) => void;
  selectedItemIndex?: number;
  onItemIndexChange?: (index: number) => void;
}

export const ReferencesSection: React.FC<ReferencesSectionProps> = ({
  data,
  onChange,
  selectedItemIndex = 0,
  onItemIndexChange
}) => {
  const addReference = () => {
    const newReference: EditorReferenceItem = {
      id: Date.now().toString(),
      name: '',
      relationship: '',
      email: '',
      phone: ''
    };
    
    const updated = [...data, newReference];
    onChange(updated);
    onItemIndexChange?.(updated.length - 1);
  };

  const updateReference = (index: number, field: keyof EditorReferenceItem, value: string) => {
    const updated = data.map((ref, i) => 
      i === index ? { ...ref, [field]: value } : ref
    );
    onChange(updated);
  };

  const removeReference = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
    if (selectedItemIndex >= updated.length && updated.length > 0) {
      onItemIndexChange?.(updated.length - 1);
    } else if (updated.length === 0) {
      onItemIndexChange?.(0);
    }
  };

  const selectedReference = data[selectedItemIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">References</h3>
        <Button onClick={addReference} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Reference
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No references added yet</p>
          <Button onClick={addReference} variant="outline" className="mt-2">
            Add your first reference
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* References List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">References ({data.length})</Label>
            {data.map((ref, index) => (
              <Card
                key={ref.id}
                className={`cursor-pointer transition-colors ${
                  selectedItemIndex === index
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onItemIndexChange?.(index)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {ref.name || 'Untitled Reference'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {ref.relationship || 'No relationship specified'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeReference(index);
                      }}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reference Editor */}
          {selectedReference && (
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Edit Reference</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={selectedReference.name}
                        onChange={(e) => updateReference(selectedItemIndex, 'name', e.target.value)}
                        placeholder="e.g., John Smith"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship *</Label>
                      <Input
                        id="relationship"
                        value={selectedReference.relationship}
                        onChange={(e) => updateReference(selectedItemIndex, 'relationship', e.target.value)}
                        placeholder="e.g., Former Manager, Colleague"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={selectedReference.email}
                        onChange={(e) => updateReference(selectedItemIndex, 'email', e.target.value)}
                        placeholder="john.smith@company.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={selectedReference.phone}
                        onChange={(e) => updateReference(selectedItemIndex, 'phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Reference Tips:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Always ask permission before listing someone as a reference</li>
                      <li>• Choose people who can speak to your professional skills and character</li>
                      <li>• Provide your references with your current resume and job description</li>
                      <li>• Consider including 3-5 professional references</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};