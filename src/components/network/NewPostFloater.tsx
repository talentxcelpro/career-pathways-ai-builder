import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Image, Video, Calendar, Plus, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const NewPostFloater: React.FC = () => {
  const { user } = useAuth();
  const { displayName } = useCurrentUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: content.trim(),
          visibility: 'public',
          content_type: 'text'
        });

      if (error) throw error;

      toast.success('Post shared successfully!');
      setContent('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to share post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-40"
        size="sm"
      >
        <Plus className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-card/95 backdrop-blur-md border-border/60">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/60">
            <h3 className="font-medium text-foreground">Share an update</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start space-x-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">Share with your network</p>
              </div>
            </div>

            <Textarea
              placeholder="What do you want to talk about?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 border-none resize-none focus:ring-0 text-sm"
              maxLength={3000}
            />

            <div className="text-xs text-muted-foreground text-right mt-2">
              {content.length}/3000
            </div>

            {/* Media Options */}
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-border/60">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Image className="h-4 w-4 mr-2" />
                Photo
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Video className="h-4 w-4 mr-2" />
                Video
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Event
              </Button>
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="min-w-20"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};