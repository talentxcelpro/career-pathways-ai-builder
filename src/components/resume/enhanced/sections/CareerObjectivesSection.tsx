import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Plus, X } from "lucide-react";
import { CareerObjectives } from "@/types/enhanced-resume";

interface CareerObjectivesSectionProps {
  data: CareerObjectives;
  onChange: (data: CareerObjectives) => void;
}

export const CareerObjectivesSection: React.FC<CareerObjectivesSectionProps> = ({
  data,
  onChange
}) => {
  const updateGoals = (goalsStr: string) => {
    const goals = goalsStr.split(',').map(g => g.trim()).filter(g => g);
    onChange({ ...data, goals });
  };

  const addGoal = () => {
    const newGoals = [...(data.goals || []), ''];
    onChange({ ...data, goals: newGoals });
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...(data.goals || [])];
    newGoals[index] = value;
    onChange({ ...data, goals: newGoals });
  };

  const removeGoal = (index: number) => {
    const newGoals = [...(data.goals || [])];
    newGoals.splice(index, 1);
    onChange({ ...data, goals: newGoals });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Career Objectives</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Career Statement</CardTitle>
          <p className="text-sm text-muted-foreground">
            A brief statement outlining your career goals and aspirations
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="statement">Career Objective Statement *</Label>
            <Textarea
              id="statement"
              value={data.statement}
              onChange={(e) => onChange({ ...data, statement: e.target.value })}
              placeholder="Write a concise statement about your career goals, what you're looking for, and what you aim to achieve..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Keep it focused and specific to your target role or industry
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Specific Goals (Optional)</Label>
              <Button onClick={addGoal} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
            
            {data.goals && data.goals.length > 0 ? (
              <div className="space-y-2">
                {data.goals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateGoal(index, e.target.value)}
                      placeholder={`Goal ${index + 1}: e.g., Lead a development team within 2 years`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No specific goals added yet. Click "Add Goal" to add measurable career objectives.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">💡 Tips for Career Objectives:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Keep your statement concise (2-3 sentences)</li>
          <li>• Be specific about the role or industry you're targeting</li>
          <li>• Mention what value you can bring to employers</li>
          <li>• Include timeline-based goals when relevant</li>
          <li>• Avoid generic statements - make it personal and unique</li>
          <li>• Consider tailoring this section for specific job applications</li>
        </ul>
      </div>
    </div>
  );
};