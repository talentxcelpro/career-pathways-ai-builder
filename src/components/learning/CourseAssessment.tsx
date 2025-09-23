import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Award, Timer } from 'lucide-react';

interface CourseAssessmentProps {
  courseId: string;
  assessmentId: string;
  onComplete?: (score: number, passed: boolean) => void;
}

export const CourseAssessment: React.FC<CourseAssessmentProps> = ({
  courseId,
  assessmentId,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  // Mock assessment data
  const assessment = {
    id: assessmentId,
    title: "Course Assessment",
    description: "Test your knowledge",
    questions: [
      {
        id: "1",
        question_text: "What is the main benefit of this course?",
        options: ["Learning", "Certification", "Skills", "Knowledge"],
        correct_answer: "Learning",
        points: 10
      }
    ],
    total_points: 10,
    passing_score: 7
  };

  const handleSubmit = () => {
    setShowResults(true);
    onComplete?.(8, true);
  };

  const currentQuestion = assessment.questions[currentQuestionIndex];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{assessment.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {currentQuestion.question_text}
          </h3>
          
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={(value) => setAnswers(prev => ({...prev, [currentQuestion.id]: value}))}
          >
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button onClick={handleSubmit}>
          Submit Assessment
        </Button>
      </CardContent>
    </Card>
  );
};