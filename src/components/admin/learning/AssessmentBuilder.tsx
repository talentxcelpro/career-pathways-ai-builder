import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Save, HelpCircle } from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correct_answer: string | number;
  points: number;
  explanation?: string;
}

interface AssessmentBuilderProps {
  courseId: string;
  onSave?: (assessment: any) => void;
}

export const AssessmentBuilder: React.FC<AssessmentBuilderProps> = ({
  courseId,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [attemptLimit, setAttemptLimit] = useState(3);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      points: 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + q.points, 0);
  };

  const handleSave = async () => {
    if (!title || questions.length === 0) {
      toast.error('Please add a title and at least one question');
      return;
    }

    setSaving(true);
    try {
      const totalPoints = calculateTotalPoints();
      
      const { data, error } = await supabase
        .from('course_assessments')
        .insert({
          course_id: courseId,
          title,
          description,
          questions: questions,
          total_points: totalPoints,
          passing_score: passingScore,
          time_limit_minutes: timeLimit ? parseInt(timeLimit) : null,
          attempt_limit: attemptLimit,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Assessment saved successfully!');
      onSave?.(data);
      
      // Reset form
      setTitle('');
      setDescription('');
      setTimeLimit('');
      setQuestions([]);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Assessment Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Assessment Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter assessment title"
              />
            </div>
            
            <div>
              <Label htmlFor="time-limit">Time Limit (minutes)</Label>
              <Input
                id="time-limit"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="Leave empty for no limit"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter assessment description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passing-score">Passing Score (%)</Label>
              <Input
                id="passing-score"
                type="number"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="attempt-limit">Attempt Limit</Label>
              <Input
                id="attempt-limit"
                type="number"
                min="1"
                value={attemptLimit}
                onChange={(e) => setAttemptLimit(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Badge variant="outline">
                {questions.length} Questions
              </Badge>
              <Badge variant="outline">
                {calculateTotalPoints()} Total Points
              </Badge>
            </div>
            <Button onClick={addQuestion} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardContent>
      </Card>

      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Question {index + 1}</CardTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeQuestion(question.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Question Type</Label>
              <Select
                value={question.type}
                onValueChange={(value: any) => updateQuestion(question.id, { type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Question Text *</Label>
              <Textarea
                value={question.question}
                onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                placeholder="Enter your question"
                rows={2}
              />
            </div>

            {question.type === 'multiple_choice' && (
              <div className="space-y-2">
                <Label>Answer Options</Label>
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <Button
                      variant={question.correct_answer === optionIndex ? "default" : "outline"}
                      onClick={() => updateQuestion(question.id, { correct_answer: optionIndex })}
                    >
                      {question.correct_answer === optionIndex ? "Correct" : "Select"}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {question.type === 'true_false' && (
            <div>
              <Label>Correct Answer</Label>
              <Select
                value={question.correct_answer.toString()}
                onValueChange={(value) => updateQuestion(question.id, { correct_answer: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Points</Label>
                <Input
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Explanation (optional)</Label>
              <Textarea
                value={question.explanation || ''}
                onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                placeholder="Explain the correct answer"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {questions.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Assessment'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};