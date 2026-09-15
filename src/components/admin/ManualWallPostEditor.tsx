import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Save, Send, Clock } from 'lucide-react';
import { useCreateWallPost, CreateWallPostData } from '@/hooks/useBotWall';
import { AIBot } from '@/hooks/useBotManagement';

interface ManualWallPostEditorProps {
  bot: AIBot;
  onClose: () => void;
}

const POST_TYPES = [
  { value: 'post', label: 'Social Post' },
  { value: 'article', label: 'Article' },
  { value: 'seo_page', label: 'SEO Page' },
  { value: 'newsletter', label: 'Newsletter' }
];

const COMMON_TAGS = [
  'career', 'learning', 'technology', 'tips', 'industry-news', 
  'professional-development', 'networking', 'skills', 'trends', 'insights'
];

export const ManualWallPostEditor: React.FC<ManualWallPostEditorProps> = ({ bot, onClose }) => {
  const [formData, setFormData] = useState<CreateWallPostData>({
    bot_id: bot.id,
    title: '',
    content: '',
    type: 'post',
    tags: [],
    is_draft: false
  });
  
  const [newTag, setNewTag] = useState('');
  const createWallPost = useCreateWallPost();

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    try {
      await createWallPost.mutateAsync({
        ...formData,
        is_draft: isDraft
      });
      onClose();
    } catch (error) {
      console.error('Failed to create wall post:', error);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const isFormValid = formData.title.trim() && formData.content.trim();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              ✍️ Create Wall Post for {bot.name}
            </CardTitle>
            <CardDescription>
              Create manual content for {bot.name}'s wall feed
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter a compelling title..."
            className="text-lg"
          />
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Content Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POST_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Write your content here... (150-1000+ words supported)"
            className="min-h-[300px] resize-y"
          />
          <div className="text-sm text-muted-foreground">
            {formData.content.length} characters
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label>Tags</Label>
          
          {/* Common Tags */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Common Tags:</div>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map(tag => (
                <Button
                  key={tag}
                  variant={formData.tags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => addTag(tag)}
                  disabled={formData.tags.includes(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Tag Input */}
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add custom tag..."
              onKeyPress={(e) => e.key === 'Enter' && addTag(newTag)}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => addTag(newTag)}
              disabled={!newTag.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Tags */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={!isFormValid || createWallPost.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            
            <Button
              onClick={() => handleSubmit(false)}
              disabled={!isFormValid || createWallPost.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Publish Now
            </Button>
          </div>
        </div>

        {createWallPost.isPending && (
          <div className="text-center text-muted-foreground">
            Creating wall post...
          </div>
        )}
      </CardContent>
    </Card>
  );
};