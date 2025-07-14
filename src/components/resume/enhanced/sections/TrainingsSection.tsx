import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, BookOpen, ExternalLink } from "lucide-react";
import { Training } from "@/types/enhanced-resume";

interface TrainingsSectionProps {
  data: Training[];
  onChange: (data: Training[]) => void;
}

export const TrainingsSection: React.FC<TrainingsSectionProps> = ({
  data,
  onChange
}) => {
  const addTraining = () => {
    const newTraining: Training = {
      id: crypto.randomUUID(),
      title: '',
      provider: '',
      completionDate: '',
      duration: '',
      type: 'online',
      certificateUrl: '',
      skills: []
    };
    onChange([...data, newTraining]);
  };

  const updateTraining = (id: string, updates: Partial<Training>) => {
    onChange(data.map(training => 
      training.id === id ? { ...training, ...updates } : training
    ));
  };

  const removeTraining = (id: string) => {
    onChange(data.filter(training => training.id !== id));
  };

  const updateSkills = (id: string, skillsStr: string) => {
    const skills = skillsStr.split(',').map(s => s.trim()).filter(s => s);
    updateTraining(id, { skills });
  };

  const getTypeColor = (type: Training['type']) => {
    switch (type) {
      case 'online': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-purple-100 text-purple-800';
      case 'bootcamp': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Trainings & Workshops</h3>
        </div>
        <Button onClick={addTraining} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Training
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No trainings yet</p>
            <Button onClick={addTraining} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Training
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((training, index) => (
            <Card key={training.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">
                      Training #{index + 1}
                    </CardTitle>
                    <Badge className={getTypeColor(training.type)}>
                      {training.type}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTraining(training.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`title-${training.id}`}>Training Title *</Label>
                    <Input
                      id={`title-${training.id}`}
                      value={training.title}
                      onChange={(e) => updateTraining(training.id, { title: e.target.value })}
                      placeholder="e.g., Advanced React Development"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`provider-${training.id}`}>Training Provider *</Label>
                    <Input
                      id={`provider-${training.id}`}
                      value={training.provider}
                      onChange={(e) => updateTraining(training.id, { provider: e.target.value })}
                      placeholder="e.g., Coursera, Udemy, LinkedIn Learning"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`completionDate-${training.id}`}>Completion Date *</Label>
                    <Input
                      id={`completionDate-${training.id}`}
                      type="month"
                      value={training.completionDate}
                      onChange={(e) => updateTraining(training.id, { completionDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`duration-${training.id}`}>Duration</Label>
                    <Input
                      id={`duration-${training.id}`}
                      value={training.duration}
                      onChange={(e) => updateTraining(training.id, { duration: e.target.value })}
                      placeholder="e.g., 40 hours, 3 days"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`type-${training.id}`}>Training Type</Label>
                    <Select
                      value={training.type}
                      onValueChange={(value: Training['type']) => 
                        updateTraining(training.id, { type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online Course</SelectItem>
                        <SelectItem value="offline">In-Person Training</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="bootcamp">Bootcamp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`certificateUrl-${training.id}`}>Certificate URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`certificateUrl-${training.id}`}
                      value={training.certificateUrl}
                      onChange={(e) => updateTraining(training.id, { certificateUrl: e.target.value })}
                      placeholder="https://..."
                    />
                    {training.certificateUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(training.certificateUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor={`skills-${training.id}`}>Skills Learned</Label>
                  <Input
                    id={`skills-${training.id}`}
                    value={training.skills?.join(', ') || ''}
                    onChange={(e) => updateSkills(training.id, e.target.value)}
                    placeholder="e.g., React Hooks, State Management, Testing"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple skills with commas
                  </p>
                  {training.skills && training.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {training.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};