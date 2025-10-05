import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface PreferencesStepProps {
  data: {
    jobLocations: string[];
    skills: string[];
    careerInterests: string[];
  };
  updateData: (updates: any) => void;
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({ data, updateData }) => {
  const [locationInput, setLocationInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const addItem = (field: keyof typeof data, value: string, setValue: (val: string) => void) => {
    if (!value.trim()) return;
    
    const currentItems = data[field] as string[];
    if (!currentItems.includes(value.trim())) {
      updateData({ [field]: [...currentItems, value.trim()] });
      setValue('');
    }
  };

  const removeItem = (field: keyof typeof data, value: string) => {
    const currentItems = data[field] as string[];
    updateData({ [field]: currentItems.filter(item => item !== value) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="jobLocations">Preferred Job Locations</Label>
        <div className="flex gap-2">
          <Input
            id="jobLocations"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem('jobLocations', locationInput, setLocationInput);
              }
            }}
            placeholder="e.g., Bangalore, Remote, Mumbai"
          />
          <button
            type="button"
            onClick={() => addItem('jobLocations', locationInput, setLocationInput)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.jobLocations.map((location) => (
            <Badge key={location} variant="secondary" className="gap-1">
              {location}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeItem('jobLocations', location)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Your Skills</Label>
        <div className="flex gap-2">
          <Input
            id="skills"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem('skills', skillInput, setSkillInput);
              }
            }}
            placeholder="e.g., React, Python, Project Management"
          />
          <button
            type="button"
            onClick={() => addItem('skills', skillInput, setSkillInput)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1">
              {skill}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeItem('skills', skill)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="careerInterests">Career Interests</Label>
        <div className="flex gap-2">
          <Input
            id="careerInterests"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem('careerInterests', interestInput, setInterestInput);
              }
            }}
            placeholder="e.g., AI/ML, Cloud Computing, Leadership"
          />
          <button
            type="button"
            onClick={() => addItem('careerInterests', interestInput, setInterestInput)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.careerInterests.map((interest) => (
            <Badge key={interest} variant="secondary" className="gap-1">
              {interest}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeItem('careerInterests', interest)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
