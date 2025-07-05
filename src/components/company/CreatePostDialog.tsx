import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Plus, 
  FileText, 
  Megaphone, 
  Briefcase, 
  Calendar as CalendarIcon, 
  Trophy,
  X,
  Clock,
  Send,
  Save
} from 'lucide-react';
import { useCompanyPosts, CreatePostData } from '@/hooks/useCompanyPosts';
import { toast } from 'sonner';

interface CreatePostDialogProps {
  companyId: string;
  trigger?: React.ReactNode;
}

export function CreatePostDialog({ companyId, trigger }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreatePostData>({
    title: '',
    content: '',
    post_type: 'update',
    status: 'draft',
    tags: [],
    is_featured: false
  });
  const [currentTag, setCurrentTag] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date>();

  const { createPost } = useCompanyPosts(companyId);

  const postTypes = [
    { value: 'update', label: 'Company Update', icon: FileText },
    { value: 'announcement', label: 'Announcement', icon: Megaphone },
    { value: 'job_posting', label: 'Job Posting', icon: Briefcase },
    { value: 'event', label: 'Event', icon: CalendarIcon },
    { value: 'milestone', label: 'Milestone', icon: Trophy }
  ];

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = async (status: 'draft' | 'published' | 'scheduled') => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    const submitData = {
      ...formData,
      status,
      scheduled_at: status === 'scheduled' && scheduledDate 
        ? scheduledDate.toISOString() 
        : undefined,
      companyId
    };

    try {
      await createPost.mutateAsync(submitData);
      setOpen(false);
      // Reset form
      setFormData({
        title: '',
        content: '',
        post_type: 'update',
        status: 'draft',
        tags: [],
        is_featured: false
      });
      setScheduledDate(undefined);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Company Post</DialogTitle>
          <DialogDescription>
            Share updates, announcements, and news with your followers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post Type */}
          <div className="space-y-2">
            <Label>Post Type</Label>
            <Select
              value={formData.post_type}
              onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, post_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {postTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter post title..."
              className="text-lg"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="What would you like to share with your followers?"
              className="min-h-[120px] resize-none"
              rows={6}
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.content.length}/2000 characters
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleAddTag}
                size="sm"
                variant="outline"
              >
                Add
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Featured Post</Label>
              <p className="text-sm text-gray-500">
                Featured posts appear prominently on your company profile
              </p>
            </div>
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_featured: checked }))}
            />
          </div>

          {/* Schedule Option */}
          <div className="space-y-3">
            <Label>Schedule Post (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {scheduledDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScheduledDate(undefined)}
                className="text-red-500 hover:text-red-700"
              >
                Clear schedule
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={createPost.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            
            <div className="flex space-x-2">
              {scheduledDate && (
                <Button
                  onClick={() => handleSubmit('scheduled')}
                  disabled={createPost.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              )}
              
              <Button
                onClick={() => handleSubmit('published')}
                disabled={createPost.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Publish Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}