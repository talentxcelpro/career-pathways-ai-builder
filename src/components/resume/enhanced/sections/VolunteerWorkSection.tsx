import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Heart } from "lucide-react";
import { VolunteerWork } from "@/types/enhanced-resume";

interface VolunteerWorkSectionProps {
  data: VolunteerWork[];
  onChange: (data: VolunteerWork[]) => void;
}

export const VolunteerWorkSection: React.FC<VolunteerWorkSectionProps> = ({
  data,
  onChange
}) => {
  const addVolunteerWork = () => {
    const newVolunteerWork: VolunteerWork = {
      id: crypto.randomUUID(),
      role: '',
      organization: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      impact: '',
      skills: []
    };
    onChange([...data, newVolunteerWork]);
  };

  const updateVolunteerWork = (id: string, updates: Partial<VolunteerWork>) => {
    onChange(data.map(vol => 
      vol.id === id ? { ...vol, ...updates } : vol
    ));
  };

  const removeVolunteerWork = (id: string) => {
    onChange(data.filter(vol => vol.id !== id));
  };

  const updateSkills = (id: string, skillsStr: string) => {
    const skills = skillsStr.split(',').map(s => s.trim()).filter(s => s);
    updateVolunteerWork(id, { skills });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Volunteer Work</h3>
        </div>
        <Button onClick={addVolunteerWork} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Volunteer Work
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No volunteer work yet</p>
            <Button onClick={addVolunteerWork} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Volunteer Experience
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((volunteerWork, index) => (
            <Card key={volunteerWork.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Volunteer Experience #{index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVolunteerWork(volunteerWork.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`role-${volunteerWork.id}`}>Role/Position *</Label>
                    <Input
                      id={`role-${volunteerWork.id}`}
                      value={volunteerWork.role}
                      onChange={(e) => updateVolunteerWork(volunteerWork.id, { role: e.target.value })}
                      placeholder="e.g., Volunteer Coordinator"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`organization-${volunteerWork.id}`}>Organization *</Label>
                    <Input
                      id={`organization-${volunteerWork.id}`}
                      value={volunteerWork.organization}
                      onChange={(e) => updateVolunteerWork(volunteerWork.id, { organization: e.target.value })}
                      placeholder="e.g., Local Food Bank"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`location-${volunteerWork.id}`}>Location</Label>
                  <Input
                    id={`location-${volunteerWork.id}`}
                    value={volunteerWork.location}
                    onChange={(e) => updateVolunteerWork(volunteerWork.id, { location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`startDate-${volunteerWork.id}`}>Start Date</Label>
                    <Input
                      id={`startDate-${volunteerWork.id}`}
                      type="month"
                      value={volunteerWork.startDate}
                      onChange={(e) => updateVolunteerWork(volunteerWork.id, { startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`endDate-${volunteerWork.id}`}>End Date</Label>
                    <Input
                      id={`endDate-${volunteerWork.id}`}
                      type="month"
                      value={volunteerWork.endDate}
                      onChange={(e) => updateVolunteerWork(volunteerWork.id, { endDate: e.target.value })}
                      disabled={volunteerWork.current}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`current-${volunteerWork.id}`}
                    checked={volunteerWork.current}
                    onCheckedChange={(checked) => 
                      updateVolunteerWork(volunteerWork.id, { 
                        current: !!checked, 
                        endDate: checked ? '' : volunteerWork.endDate 
                      })
                    }
                  />
                  <Label htmlFor={`current-${volunteerWork.id}`} className="text-sm">
                    I currently volunteer here
                  </Label>
                </div>

                <div>
                  <Label htmlFor={`description-${volunteerWork.id}`}>Description *</Label>
                  <Textarea
                    id={`description-${volunteerWork.id}`}
                    value={volunteerWork.description}
                    onChange={(e) => updateVolunteerWork(volunteerWork.id, { description: e.target.value })}
                    placeholder="Describe your volunteer responsibilities and contributions..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor={`impact-${volunteerWork.id}`}>Impact/Achievements</Label>
                  <Textarea
                    id={`impact-${volunteerWork.id}`}
                    value={volunteerWork.impact}
                    onChange={(e) => updateVolunteerWork(volunteerWork.id, { impact: e.target.value })}
                    placeholder="Describe the impact of your volunteer work, measurable outcomes..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor={`skills-${volunteerWork.id}`}>Skills Developed</Label>
                  <Input
                    id={`skills-${volunteerWork.id}`}
                    value={volunteerWork.skills?.join(', ') || ''}
                    onChange={(e) => updateSkills(volunteerWork.id, e.target.value)}
                    placeholder="e.g., Leadership, Event Planning, Community Outreach"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple skills with commas
                  </p>
                  {volunteerWork.skills && volunteerWork.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {volunteerWork.skills.map((skill, idx) => (
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