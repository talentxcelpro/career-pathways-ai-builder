
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  skill: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface SkillResult {
  skill: string;
  score: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  strengths: string[];
  improvements: string[];
  resources: string[];
}

const SkillAssessor = () => {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [isAssessing, setIsAssessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SkillResult[]>([]);

  const skills = [
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'Data Analysis',
    'Machine Learning',
    'Product Management',
    'Digital Marketing',
    'UX/UI Design',
    'Project Management'
  ];

  const mockQuestions: { [key: string]: Question[] } = {
    'JavaScript': [
      {
        id: '1',
        question: 'What is the output of: console.log(typeof null)?',
        options: ['null', 'undefined', 'object', 'boolean'],
        correctAnswer: 2,
        skill: 'JavaScript',
        difficulty: 'Intermediate'
      },
      {
        id: '2',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 0,
        skill: 'JavaScript',
        difficulty: 'Beginner'
      },
      {
        id: '3',
        question: 'What is a closure in JavaScript?',
        options: [
          'A function that returns another function',
          'A function that has access to variables in its outer scope',
          'A function that is immediately invoked',
          'A function that accepts no parameters'
        ],
        correctAnswer: 1,
        skill: 'JavaScript',
        difficulty: 'Advanced'
      }
    ],
    'React': [
      {
        id: '4',
        question: 'What is the purpose of useEffect hook?',
        options: [
          'To manage component state',
          'To perform side effects in functional components',
          'To create context',
          'To handle events'
        ],
        correctAnswer: 1,
        skill: 'React',
        difficulty: 'Intermediate'
      },
      {
        id: '5',
        question: 'How do you pass data from parent to child component?',
        options: ['Using state', 'Using props', 'Using context', 'Using refs'],
        correctAnswer: 1,
        skill: 'React',
        difficulty: 'Beginner'
      }
    ]
  };

  const startAssessment = () => {
    if (!selectedSkill) {
      toast.error('Please select a skill to assess');
      return;
    }
    setIsAssessing(true);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const nextQuestion = () => {
    const questions = mockQuestions[selectedSkill] || [];
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment();
    }
  };

  const completeAssessment = () => {
    const questions = mockQuestions[selectedSkill] || [];
    let correctAnswers = 0;
    
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    let level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    
    if (score >= 90) level = 'Expert';
    else if (score >= 75) level = 'Advanced';
    else if (score >= 60) level = 'Intermediate';
    else level = 'Beginner';

    const result: SkillResult = {
      skill: selectedSkill,
      score,
      level,
      strengths: [
        'Good understanding of basic concepts',
        'Practical application knowledge',
        'Problem-solving approach'
      ],
      improvements: [
        'Practice more advanced concepts',
        'Work on real-world projects',
        'Stay updated with latest features'
      ],
      resources: [
        'Official documentation',
        'Interactive coding challenges',
        'Community forums and discussions',
        'Video tutorials and courses'
      ]
    };

    setResults([result]);
    setShowResults(true);
    setIsAssessing(false);
    toast.success('Assessment completed!');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-purple-100 text-purple-800';
      case 'Advanced': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Beginner': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-purple-600';
    if (score >= 75) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const questions = mockQuestions[selectedSkill] || [];
  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tools')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Skill Assessor</h1>
              <p className="text-gray-600">Evaluate your skills with AI-powered assessments</p>
            </div>
          </div>
        </div>

        {!isAssessing && !showResults ? (
          /* Skill Selection */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Skill</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Select a skill to assess</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {skills.map((skill) => (
                      <Button
                        key={skill}
                        variant={selectedSkill === skill ? "default" : "outline"}
                        onClick={() => setSelectedSkill(skill)}
                        className="justify-start"
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={startAssessment}
                  className="w-full"
                  disabled={!selectedSkill}
                >
                  Start Assessment
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assessment Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Skill-Specific Questions</h4>
                    <p className="text-sm text-gray-600">Tailored questions for accurate assessment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Difficulty Levels</h4>
                    <p className="text-sm text-gray-600">From beginner to expert level questions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Detailed Results</h4>
                    <p className="text-sm text-gray-600">Comprehensive feedback and improvement suggestions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Quick Assessment</h4>
                    <p className="text-sm text-gray-600">Complete in 5-10 minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : isAssessing && !showResults ? (
          /* Assessment Questions */
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedSkill} Assessment</CardTitle>
                  <Badge variant="outline">
                    Question {currentQuestion + 1} of {questions.length}
                  </Badge>
                </div>
                <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mt-4" />
              </CardHeader>
              <CardContent className="space-y-6">
                {currentQ && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className={currentQ.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' : 
                                        currentQ.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-green-100 text-green-800'}>
                          {currentQ.difficulty}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-medium">{currentQ.question}</h3>
                    </div>

                    <RadioGroup
                      value={answers[currentQ.id]?.toString() || ''}
                      onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
                    >
                      {currentQ.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="flex justify-end">
                      <Button 
                        onClick={nextQuestion}
                        disabled={answers[currentQ.id] === undefined}
                      >
                        {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Assessment Results</h2>
                <p className="text-gray-600">Your skill evaluation and improvement plan</p>
              </div>
              <Button variant="outline" onClick={() => { setShowResults(false); setIsAssessing(false); }}>
                Take Another Assessment
              </Button>
            </div>

            {results.map((result, index) => (
              <div key={index} className="space-y-6">
                {/* Score Overview */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}%
                      </div>
                      <div>
                        <Badge className={getLevelColor(result.level)} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                          {result.level} Level
                        </Badge>
                      </div>
                      <p className="text-gray-600">
                        You scored {result.score}% in {result.skill}
                      </p>
                      <Progress value={result.score} className="max-w-md mx-auto" />
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.improvements.map((improvement, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Learning Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Recommended Learning Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.resources.map((resource, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-sm">{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillAssessor;
