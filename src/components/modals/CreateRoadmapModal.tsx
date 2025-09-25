import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Target, Clock, Zap, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateRoadmapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateRoadmapModal: React.FC<CreateRoadmapModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    currentRole: '',
    targetRole: '',
    timeline: '',
    skills: [] as string[],
    description: '',
    priority: 'medium'
  });
  const [newSkill, setNewSkill] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleCreate = async () => {
    if (!formData.currentRole || !formData.targetRole || !formData.timeline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to create a roadmap');
        return;
      }

      // Create career goal
      const { error } = await supabase.from('career_goals').insert({
        user_id: user.id,
        current_position: formData.currentRole,
        target_role: formData.targetRole,
        timeline_months: parseInt(formData.timeline),
        skills_needed: formData.skills,
        progress_notes: formData.description,
        is_active: true
      });

      if (error) throw error;

      toast.success('🚀 Your AI-powered career roadmap has been created!', {
        description: 'Check your personalized visualizations above',
      });

      // Reset form
      setFormData({
        currentRole: '',
        targetRole: '',
        timeline: '',
        skills: [],
        description: '',
        priority: 'medium'
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error('Failed to create roadmap: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-apple shadow-apple-large">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-apple-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            Create AI-Powered Career Roadmap
          </DialogTitle>
          <p className="text-text-secondary mt-2">
            Let our AI create a personalized career progression plan based on your goals and current position.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current & Target Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentRole" className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                Current Role *
              </Label>
              <Input
                id="currentRole"
                value={formData.currentRole}
                onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
                placeholder="e.g., Junior Developer"
                className="rounded-apple-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetRole" className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                Target Role *
              </Label>
              <Input
                id="targetRole"
                value={formData.targetRole}
                onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
                placeholder="e.g., Senior Full Stack Developer"
                className="rounded-apple-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Timeline & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeline" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                Timeline (months) *
              </Label>
              <Select value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                <SelectTrigger className="rounded-apple-lg border-gray-200">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="18">18 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                  <SelectItem value="36">36 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">Priority Level</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="rounded-apple-lg border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Skills to Develop</Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g., React, Node.js, AWS"
                className="rounded-apple-lg border-gray-200"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <Button
                type="button"
                onClick={handleAddSkill}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-apple-lg px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 rounded-apple-lg pr-1"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Additional Context (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Any specific goals, challenges, or preferences you'd like the AI to consider..."
              className="rounded-apple-lg border-gray-200 resize-none"
              rows={3}
            />
          </div>

          {/* AI Features Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-apple-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              AI Will Generate:
            </h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Personalized visual roadmap with interactive nodes</li>
              <li>• Skills progression tree with learning recommendations</li>
              <li>• Timeline with milestones and success metrics</li>
              <li>• Real-time progress tracking and AI insights</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-apple-lg border-gray-200"
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !formData.currentRole || !formData.targetRole || !formData.timeline}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-apple-lg shadow-apple-light"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Create AI Roadmap
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};