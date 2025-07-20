import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ParsingFeedbackProps {
  resumeData: any;
  onFeedbackSubmitted?: () => void;
}

export const ParsingFeedback: React.FC<ParsingFeedbackProps> = ({
  resumeData,
  onFeedbackSubmitted
}) => {
  const [accuracy, setAccuracy] = useState<string>('');
  const [satisfaction, setSatisfaction] = useState<string>('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!accuracy || !satisfaction) {
      toast({
        title: "Please complete the feedback",
        description: "Please rate both accuracy and satisfaction.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        parsing_accuracy: parseInt(accuracy),
        user_satisfaction: parseInt(satisfaction),
        feedback_comments: comments.trim() || null,
        confidence_score: resumeData?.key_metrics?.confidence_score || 0,
        extraction_method: resumeData?.key_metrics?.extraction_method || 'standard',
        file_type: 'pdf', // Could be extracted from resumeData
        parsing_errors: resumeData?.errors || null,
        created_at: new Date().toISOString()
      };

      // Here we would store feedback in a database table
      // For now, we'll log it for development
      console.log('📊 Parsing feedback collected:', feedbackData);

      toast({
        title: "Thank you for your feedback!",
        description: "Your input helps us improve our resume parsing accuracy.",
      });

      onFeedbackSubmitted?.();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          How did we do?
        </CardTitle>
        <CardDescription>
          Help us improve our resume parsing by sharing your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parsing Accuracy */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            How accurate was the resume parsing?
          </Label>
          <RadioGroup value={accuracy} onValueChange={setAccuracy}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="accuracy-5" />
              <Label htmlFor="accuracy-5" className="text-sm">Perfect - Everything was extracted correctly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="accuracy-4" />
              <Label htmlFor="accuracy-4" className="text-sm">Good - Minor errors or missing details</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="accuracy-3" />
              <Label htmlFor="accuracy-3" className="text-sm">Fair - Some important information was wrong</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="accuracy-2" />
              <Label htmlFor="accuracy-2" className="text-sm">Poor - Many errors or missing sections</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="accuracy-1" />
              <Label htmlFor="accuracy-1" className="text-sm">Very poor - Mostly incorrect or incomplete</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Overall Satisfaction */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Overall satisfaction with the parsing experience?
          </Label>
          <RadioGroup value={satisfaction} onValueChange={setSatisfaction}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="satisfaction-5" />
              <Label htmlFor="satisfaction-5" className="flex items-center gap-2 text-sm">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                Very satisfied
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="satisfaction-4" />
              <Label htmlFor="satisfaction-4" className="text-sm">Satisfied</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="satisfaction-3" />
              <Label htmlFor="satisfaction-3" className="text-sm">Neutral</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="satisfaction-2" />
              <Label htmlFor="satisfaction-2" className="text-sm">Dissatisfied</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="satisfaction-1" />
              <Label htmlFor="satisfaction-1" className="flex items-center gap-2 text-sm">
                <ThumbsDown className="h-4 w-4 text-red-600" />
                Very dissatisfied
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <Label htmlFor="comments" className="text-sm font-medium">
            Additional comments (optional)
          </Label>
          <Textarea
            id="comments"
            placeholder="Tell us what went wrong or what could be improved..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="min-h-20"
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !accuracy || !satisfaction}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
};