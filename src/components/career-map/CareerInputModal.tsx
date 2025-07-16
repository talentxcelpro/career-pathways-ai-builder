import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Target, Calendar, Loader2 } from 'lucide-react';

interface CareerInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CareerGoalData) => void;
  isLoading?: boolean;
}

interface CareerGoalData {
  targetRole: string;
  timeframe: string;
  currentRole: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
}

export const CareerInputModal: React.FC<CareerInputModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CareerGoalData>({
    targetRole: '',
    timeframe: '',
    currentRole: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.targetRole && formData.timeframe && formData.currentRole) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({
      targetRole: '',
      timeframe: '',
      currentRole: '',
      description: '',
      priority: 'medium'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-600" />
            Create AI Career Roadmap
          </DialogTitle>
          <DialogDescription>
            Tell us about your career goals and we'll generate a personalized roadmap using AI.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-role">Current Role</Label>
            <Input
              id="current-role"
              placeholder="e.g., Software Developer, Marketing Specialist"
              value={formData.currentRole}
              onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-role">Target Role</Label>
            <Input
              id="target-role"
              placeholder="e.g., Senior Software Engineer, Product Manager"
              value={formData.targetRole}
              onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">Timeframe (months)</Label>
            <Select
              value={formData.timeframe}
              onValueChange={(value) => setFormData(prev => ({ ...prev, timeframe: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">1 year</SelectItem>
                <SelectItem value="18">1.5 years</SelectItem>
                <SelectItem value="24">2 years</SelectItem>
                <SelectItem value="36">3 years</SelectItem>
                <SelectItem value="60">5 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Context (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Any specific goals, preferences, or constraints..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleReset();
                onOpenChange(false);
              }}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.targetRole || !formData.timeframe || !formData.currentRole || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Generate Roadmap
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};