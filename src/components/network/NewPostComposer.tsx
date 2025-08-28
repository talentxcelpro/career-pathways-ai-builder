import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image, Video, Calendar, FileText, Smile, AtSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewPostComposerProps {
  onPostCreated: () => void;
}

export const NewPostComposer: React.FC<NewPostComposerProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { displayName } = useCurrentUserProfile();
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
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
      setIsExpanded(false);
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to share post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mediaOptions = [
    { icon: Image, label: 'Photo', color: 'text-blue-600' },
    { icon: Video, label: 'Video', color: 'text-green-600' },
    { icon: Calendar, label: 'Event', color: 'text-orange-600' },
    { icon: FileText, label: 'Article', color: 'text-purple-600' },
  ];

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/60">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            {!isExpanded ? (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full text-left p-4 rounded-full border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground"
              >
                Start a post...
              </button>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="What do you want to talk about?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-24 border-none resize-none focus:ring-0 bg-transparent text-sm p-0"
                  maxLength={3000}
                  autoFocus
                />
                
                <div className="text-xs text-muted-foreground text-right">
                  {content.length}/3000
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <div className="flex items-center space-x-2">
                    {mediaOptions.map((option) => (
                      <Button
                        key={option.label}
                        variant="ghost"
                        size="sm"
                        className={`${option.color} hover:bg-muted/50 h-8 px-2`}
                      >
                        <option.icon className="h-4 w-4" />
                      </Button>
                    ))}
                    <div className="h-4 w-px bg-border/60 mx-2" />
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-muted/50 h-8 px-2">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-muted/50 h-8 px-2">
                      <AtSign className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsExpanded(false);
                        setContent('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!content.trim() || isSubmitting}
                      className="min-w-16 h-8"
                      size="sm"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                      ) : (
                        'Post'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};