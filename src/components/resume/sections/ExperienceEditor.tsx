import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { InlineAIEnhancer } from "../ai/InlineAIEnhancer";

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ExperienceEditorProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({ experiences, onChange }) => {
  const handleAdd = () => {
    onChange([...experiences, {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    }]);
  };

  const handleRemove = (id: string) => {
    onChange(experiences.filter(exp => exp.id !== id));
  };

  const handleChange = (id: string, field: keyof Experience, value: string) => {
    onChange(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  return (
    <div className="space-y-6">
      {experiences.map((exp, index) => (
        <div key={exp.id} className="p-4 border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Experience {index + 1}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(exp.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Job Title</Label>
              <Input
                value={exp.title}
                onChange={(e) => handleChange(exp.id, 'title', e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={exp.company}
                onChange={(e) => handleChange(exp.id, 'company', e.target.value)}
                placeholder="Tech Corp"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Location</Label>
              <Input
                value={exp.location}
                onChange={(e) => handleChange(exp.id, 'location', e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="month"
                value={exp.startDate}
                onChange={(e) => handleChange(exp.id, 'startDate', e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="month"
                value={exp.endDate}
                onChange={(e) => handleChange(exp.id, 'endDate', e.target.value)}
                placeholder="Leave empty if current"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Description & Achievements</Label>
              <InlineAIEnhancer
                content={`${exp.title} at ${exp.company}`}
                type="bullets"
                onEnhanced={(enhanced) => handleChange(exp.id, 'description', enhanced)}
                label="Suggest Bullets"
              />
            </div>
            <Textarea
              value={exp.description}
              onChange={(e) => handleChange(exp.id, 'description', e.target.value)}
              placeholder="• Achieved X by implementing Y&#10;• Led team of N in developing Z&#10;• Improved metrics by N%"
              rows={5}
              className="resize-none font-mono text-sm"
            />
          </div>
        </div>
      ))}

      <Button
        onClick={handleAdd}
        variant="outline"
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Experience
      </Button>
    </div>
  );
};
