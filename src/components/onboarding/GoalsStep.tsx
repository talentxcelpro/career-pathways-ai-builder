import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, GraduationCap, Users, BookOpen, Target, Building } from 'lucide-react';

interface GoalsStepProps {
  data: {
    goals: string[];
  };
  updateData: (updates: any) => void;
  userType: string;
}

export const GoalsStep: React.FC<GoalsStepProps> = ({ data, updateData, userType }) => {
  const candidateGoals = [
    { id: 'jobs', label: 'Find Jobs', icon: Briefcase, description: 'Discover job opportunities' },
    { id: 'internships', label: 'Internships', icon: GraduationCap, description: 'Explore internship programs' },
    { id: 'networking', label: 'Networking', icon: Users, description: 'Connect with professionals' },
    { id: 'learning', label: 'Learning', icon: BookOpen, description: 'Upskill and grow' },
    { id: 'career_guidance', label: 'Career Guidance', icon: Target, description: 'Get career advice' }
  ];

  const employerGoals = [
    { id: 'hire_talent', label: 'Hire Talent', icon: Users, description: 'Find qualified candidates' },
    { id: 'employer_branding', label: 'Employer Branding', icon: Building, description: 'Build company presence' },
    { id: 'talent_pipeline', label: 'Talent Pipeline', icon: Target, description: 'Build talent pool' }
  ];

  const goals = userType === 'employer' ? employerGoals : candidateGoals;

  const toggleGoal = (goalId: string) => {
    const currentGoals = data.goals || [];
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(g => g !== goalId)
      : [...currentGoals, goalId];
    updateData({ goals: newGoals });
  };

  return (
    <div className="space-y-4">
      <Label>What do you want to achieve? (Select all that apply)</Label>
      <div className="grid gap-4">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const isChecked = data.goals?.includes(goal.id) || false;
          
          return (
            <div
              key={goal.id}
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                isChecked ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => toggleGoal(goal.id)}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => toggleGoal(goal.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{goal.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
