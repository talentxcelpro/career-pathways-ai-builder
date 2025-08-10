import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { EditorVolunteerItem } from '@/types/editor-resume';

interface VolunteerSectionProps {
  data: EditorVolunteerItem[];
  onChange: (volunteer: EditorVolunteerItem[]) => void;
  selectedItemIndex?: number;
  onItemIndexChange?: (index: number) => void;
}

export const VolunteerSection: React.FC<VolunteerSectionProps> = ({
  data,
  onChange,
  selectedItemIndex = 0,
  onItemIndexChange
}) => {
  const addVolunteerExperience = () => {
    const newExperience: EditorVolunteerItem = {
      id: Date.now().toString(),
      role: '',
      organization: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    
    const updated = [...data, newExperience];
    onChange(updated);
    onItemIndexChange?.(updated.length - 1);
  };

  const updateVolunteerExperience = (index: number, field: keyof EditorVolunteerItem, value: string) => {
    const updated = data.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    onChange(updated);
  };

  const removeVolunteerExperience = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
    if (selectedItemIndex >= updated.length && updated.length > 0) {
      onItemIndexChange?.(updated.length - 1);
    } else if (updated.length === 0) {
      onItemIndexChange?.(0);
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate) return '';
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';
    return `${start} - ${end}`;
  };

  const selectedExperience = data[selectedItemIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Volunteer Experience</h3>
        <Button onClick={addVolunteerExperience} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No volunteer experience added yet</p>
          <Button onClick={addVolunteerExperience} variant="outline" className="mt-2">
            Add your first volunteer experience
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Experience List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Experiences ({data.length})</Label>
            {data.map((exp, index) => (
              <Card
                key={exp.id}
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
                        {exp.role || 'Untitled Role'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {exp.organization || 'No organization'}
                      </p>
                      {(exp.startDate || exp.endDate) && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDateRange(exp.startDate, exp.endDate)}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVolunteerExperience(index);
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

          {/* Experience Editor */}
          {selectedExperience && (
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Edit Volunteer Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role/Position *</Label>
                      <Input
                        id="role"
                        value={selectedExperience.role}
                        onChange={(e) => updateVolunteerExperience(selectedItemIndex, 'role', e.target.value)}
                        placeholder="e.g., Volunteer Coordinator"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization *</Label>
                      <Input
                        id="organization"
                        value={selectedExperience.organization}
                        onChange={(e) => updateVolunteerExperience(selectedItemIndex, 'organization', e.target.value)}
                        placeholder="e.g., Local Food Bank"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={selectedExperience.location}
                        onChange={(e) => updateVolunteerExperience(selectedItemIndex, 'location', e.target.value)}
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="month"
                            value={selectedExperience.startDate}
                            onChange={(e) => updateVolunteerExperience(selectedItemIndex, 'startDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="month"
                            value={selectedExperience.endDate}
                            onChange={(e) => updateVolunteerExperience(selectedItemIndex, 'endDate', e.target.value)}
                            placeholder="Leave empty if current"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={selectedExperience.description}
                        onChange={(e) => updateVolunteerExperience(selectedItemIndex, 'description', e.target.value)}
                        placeholder="Describe your volunteer work, responsibilities, and impact..."
                        className="min-h-32 resize-none"
                      />
                    </div>
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