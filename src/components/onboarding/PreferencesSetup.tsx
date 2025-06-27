
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/utils/roleRouting';

interface PreferencesSetupProps {
  userRole: UserRole;
  onComplete: (preferences: any) => void;
}

export const PreferencesSetup: React.FC<PreferencesSetupProps> = ({ 
  userRole, 
  onComplete 
}) => {
  const [preferences, setPreferences] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(preferences);
  };

  const getCandidatePreferences = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Job Search Preferences</Label>
        <div className="mt-3 space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote"
              checked={preferences.remoteWork || false}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, remoteWork: checked }))
              }
            />
            <Label htmlFor="remote">Open to remote work</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="freelance"
              checked={preferences.freelance || false}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, freelance: checked }))
              }
            />
            <Label htmlFor="freelance">Open to freelance opportunities</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fulltime"
              checked={preferences.fullTime || false}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, fullTime: checked }))
              }
            />
            <Label htmlFor="fulltime">Looking for full-time positions</Label>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="experience">Experience Level</Label>
        <Select
          value={preferences.experienceLevel || ''}
          onValueChange={(value) => 
            setPreferences(prev => ({ ...prev, experienceLevel: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
            <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
            <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
            <SelectItem value="executive">Executive Level</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const getEmployerPreferences = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Hiring Preferences</Label>
        <div className="mt-3 space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="urgentHiring"
              checked={preferences.urgentHiring || false}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, urgentHiring: checked }))
              }
            />
            <Label htmlFor="urgentHiring">Currently hiring urgently</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remoteTeam"
              checked={preferences.remoteTeam || false}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, remoteTeam: checked }))
              }
            />
            <Label htmlFor="remoteTeam">Open to remote team members</Label>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="companySize">Company Size</Label>
        <Select
          value={preferences.companySize || ''}
          onValueChange={(value) => 
            setPreferences(prev => ({ ...prev, companySize: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
            <SelectItem value="small">Small (11-50 employees)</SelectItem>
            <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
            <SelectItem value="large">Large (200+ employees)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const getPreferencesContent = () => {
    switch (userRole) {
      case 'candidate':
        return getCandidatePreferences();
      case 'employer':
        return getEmployerPreferences();
      case 'mentor':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Mentoring Preferences</Label>
              <div className="mt-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="careerGuidance"
                    checked={preferences.careerGuidance || false}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, careerGuidance: checked }))
                    }
                  />
                  <Label htmlFor="careerGuidance">Career guidance</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skillDevelopment"
                    checked={preferences.skillDevelopment || false}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, skillDevelopment: checked }))
                    }
                  />
                  <Label htmlFor="skillDevelopment">Skill development</Label>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">No specific preferences needed for your role.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Set Your Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {getPreferencesContent()}
            
            <Button type="submit" className="w-full" size="lg">
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
