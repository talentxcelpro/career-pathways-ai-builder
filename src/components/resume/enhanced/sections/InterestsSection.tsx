import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface InterestsSectionProps {
  data: string[];
  onChange: (interests: string[]) => void;
}

export const InterestsSection: React.FC<InterestsSectionProps> = ({
  data,
  onChange
}) => {
  const [newInterest, setNewInterest] = useState('');

  const addInterest = () => {
    if (newInterest.trim() && !data.includes(newInterest.trim())) {
      onChange([...data, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  const suggestedInterests = [
    'Travel', 'Photography', 'Reading', 'Cooking', 'Fitness', 'Music',
    'Gaming', 'Gardening', 'Writing', 'Art', 'Technology', 'Sports',
    'Volunteering', 'Learning Languages', 'Hiking', 'Movies'
  ];

  const availableSuggestions = suggestedInterests.filter(
    interest => !data.includes(interest)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Interests & Hobbies</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Interests */}
          {data.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Your Interests ({data.length})</Label>
              <div className="flex flex-wrap gap-2">
                {data.map((interest, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="gap-1 pr-1"
                  >
                    {interest}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInterest(index)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add New Interest */}
          <div className="space-y-2">
            <Label htmlFor="newInterest">Add Interest</Label>
            <div className="flex gap-2">
              <Input
                id="newInterest"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Photography, Travel, Cooking..."
              />
              <Button 
                onClick={addInterest} 
                disabled={!newInterest.trim() || data.includes(newInterest.trim())}
                className="gap-2 shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          {/* Suggested Interests */}
          {availableSuggestions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Suggested Interests</Label>
              <div className="flex flex-wrap gap-2">
                {availableSuggestions.slice(0, 12).map((interest) => (
                  <Badge
                    key={interest}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => onChange([...data, interest])}
                  >
                    {interest}
                    <Plus className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p>No interests added yet</p>
              <p className="text-sm mt-1">Add some personal interests to show your personality</p>
            </div>
          )}

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Tips for Interests:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Include 3-6 relevant interests that show your personality</li>
              <li>• Choose interests that might spark conversation in interviews</li>
              <li>• Consider interests that demonstrate valuable skills (leadership, creativity, etc.)</li>
              <li>• Keep them professional and appropriate for the workplace</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};