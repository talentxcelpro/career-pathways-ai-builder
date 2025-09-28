import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useContentModeration } from '@/hooks/useContentModeration';
import { AlertTriangle, Flag, Shield } from 'lucide-react';

interface ReportContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'post' | 'comment' | 'user' | 'group';
  contentId: string;
  contentTitle?: string;
}

export const ReportContentDialog: React.FC<ReportContentDialogProps> = ({
  open,
  onOpenChange,
  contentType,
  contentId,
  contentTitle
}) => {
  const { reportContent, isReporting } = useContentModeration();
  const [reason, setReason] = useState<'spam' | 'harassment' | 'inappropriate' | 'fake_news' | 'violence' | 'hate_speech' | 'other'>('spam');
  const [description, setDescription] = useState('');

  const reasons = [
    { value: 'spam', label: 'Spam or misleading content', icon: '📧' },
    { value: 'harassment', label: 'Harassment or bullying', icon: '😠' },
    { value: 'inappropriate', label: 'Inappropriate content', icon: '🚫' },
    { value: 'fake_news', label: 'False information', icon: '📰' },
    { value: 'violence', label: 'Violence or threats', icon: '⚠️' },
    { value: 'hate_speech', label: 'Hate speech', icon: '💬' },
    { value: 'other', label: 'Other', icon: '❓' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    reportContent({
      content_type: contentType,
      content_id: contentId,
      reason,
      description: description.trim() || undefined,
      reporter_id: '' // Will be set by the hook
    });
    
    // Reset form
    setReason('spam');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            Report {contentType}
          </DialogTitle>
          {contentTitle && (
            <p className="text-sm text-muted-foreground mt-2">
              "{contentTitle.substring(0, 50)}{contentTitle.length > 50 ? '...' : ''}"
            </p>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Why are you reporting this content?</Label>
            <RadioGroup value={reason} onValueChange={(value: any) => setReason(value)}>
              {reasons.map((reasonOption) => (
                <div key={reasonOption.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reasonOption.value} id={reasonOption.value} />
                  <Label 
                    htmlFor={reasonOption.value} 
                    className="cursor-pointer flex items-center gap-2 flex-1"
                  >
                    <span>{reasonOption.icon}</span>
                    {reasonOption.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional context that might help our moderation team..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Your report helps keep our community safe</p>
                <p>Our moderation team will review this report within 24 hours. False reports may result in action against your account.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isReporting}
              className="gap-2"
            >
              <Flag className="w-4 h-4" />
              {isReporting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};