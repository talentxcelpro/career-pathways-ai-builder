import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Settings, MapPin, Briefcase, IndianRupee, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface JobPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser?: any;
}

interface JobPreferences {
  preferred_roles: string[];
  preferred_locations: string[];
  preferred_salary_min: number;
  preferred_salary_max: number;
  employment_types: string[];
  experience_levels: string[];
  is_remote: boolean;
  preferred_industries: string[];
  skills: string[];
}

export const JobPreferencesDialog: React.FC<JobPreferencesDialogProps> = ({
  open,
  onOpenChange,
  currentUser
}) => {
  const [preferences, setPreferences] = useState<JobPreferences>({
    preferred_roles: [],
    preferred_locations: [],
    preferred_salary_min: 0,
    preferred_salary_max: 5000000,
    employment_types: [],
    experience_levels: [],
    is_remote: false,
    preferred_industries: [],
    skills: []
  });

  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load existing preferences
  useEffect(() => {
    if (currentUser && open) {
      loadPreferences();
    }
  }, [currentUser, open]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (data && !error) {
        setPreferences({
          preferred_roles: data.preferred_roles || [],
          preferred_locations: data.preferred_locations || [],
          preferred_salary_min: data.preferred_salary_min || 0,
          preferred_salary_max: data.preferred_salary_max || 5000000,
          employment_types: data.employment_types || [],
          experience_levels: data.experience_levels || [],
          is_remote: data.is_remote || false,
          preferred_industries: data.preferred_industries || [],
          skills: data.skills || []
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    if (!currentUser) {
      toast.error('Please login to save preferences');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: currentUser.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Job preferences updated successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save preferences');
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToArray = (field: keyof JobPreferences, value: string, setValue: (v: string) => void) => {
    const currentArray = preferences[field] as string[];
    if (value.trim() && !currentArray.includes(value.trim())) {
      setPreferences(prev => ({
        ...prev,
        [field]: [...prev[field] as string[], value.trim()]
      }));
      setValue('');
    }
  };

  const removeFromArray = (field: keyof JobPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const employmentTypeOptions = [
    'Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'
  ];

  const experienceLevelOptions = [
    'Entry Level', 'Junior', 'Mid Level', 'Senior', 'Lead', 'Manager', 'Director'
  ];

  const industryOptions = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 
    'Sales', 'Manufacturing', 'Retail', 'Consulting', 'Media'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Update Job Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preferred Roles */}
          <div>
            <Label className="text-base font-semibold">Preferred Job Roles</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="e.g., Software Engineer, Product Manager"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addToArray('preferred_roles', newRole, setNewRole);
                  }
                }}
              />
              <Button 
                onClick={() => addToArray('preferred_roles', newRole, setNewRole)}
                variant="outline"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {preferences.preferred_roles.map((role, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {role}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFromArray('preferred_roles', role)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Preferred Locations */}
          <div>
            <Label className="text-base font-semibold">Preferred Locations</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="e.g., Mumbai, Bangalore, Remote"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addToArray('preferred_locations', newLocation, setNewLocation);
                  }
                }}
              />
              <Button 
                onClick={() => addToArray('preferred_locations', newLocation, setNewLocation)}
                variant="outline"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {preferences.preferred_locations.map((location, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFromArray('preferred_locations', location)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <Label className="text-base font-semibold">Preferred Salary Range (INR)</Label>
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-sm">Minimum: ₹{preferences.preferred_salary_min.toLocaleString()}</Label>
                  <Slider
                    value={[preferences.preferred_salary_min]}
                    onValueChange={([value]) => setPreferences(prev => ({ ...prev, preferred_salary_min: value }))}
                    max={2000000}
                    step={50000}
                    className="mt-2"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-sm">Maximum: ₹{preferences.preferred_salary_max.toLocaleString()}</Label>
                  <Slider
                    value={[preferences.preferred_salary_max]}
                    onValueChange={([value]) => setPreferences(prev => ({ ...prev, preferred_salary_max: value }))}
                    min={100000}
                    max={5000000}
                    step={50000}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Employment Types */}
          <div>
            <Label className="text-base font-semibold">Employment Types</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {employmentTypeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    checked={preferences.employment_types.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPreferences(prev => ({
                          ...prev,
                          employment_types: [...prev.employment_types, type]
                        }));
                      } else {
                        removeFromArray('employment_types', type);
                      }
                    }}
                  />
                  <Label className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Levels */}
          <div>
            <Label className="text-base font-semibold">Experience Levels</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {experienceLevelOptions.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    checked={preferences.experience_levels.includes(level)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPreferences(prev => ({
                          ...prev,
                          experience_levels: [...prev.experience_levels, level]
                        }));
                      } else {
                        removeFromArray('experience_levels', level);
                      }
                    }}
                  />
                  <Label className="text-sm">{level}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Remote Work */}
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={preferences.is_remote}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, is_remote: checked as boolean }))
              }
            />
            <Label>Open to remote work opportunities</Label>
          </div>

          {/* Skills */}
          <div>
            <Label className="text-base font-semibold">Skills</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="e.g., React, Python, Project Management"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addToArray('skills', newSkill, setNewSkill);
                  }
                }}
              />
              <Button 
                onClick={() => addToArray('skills', newSkill, setNewSkill)}
                variant="outline"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {preferences.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {skill}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFromArray('skills', skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={savePreferences} disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};