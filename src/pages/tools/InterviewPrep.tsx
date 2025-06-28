
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ArrowLeft, Clock, Star, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const InterviewPrep = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [responses, setResponses] = useState<string[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  const mockQuestions = [
    {
      id: 1,
      question: "Tell me about yourself and why you're interested in this role.",
      type: "behavioral",
      difficulty: "easy",
      tips: ["Keep it concise and relevant", "Focus on professional achievements", "Connect your experience to the role"]
    },
    {
      id: 2,
      question: "Describe a challenging project you worked on and how you overcame obstacles.",
      type: "behavioral",
      difficulty: "medium",
      tips: ["Use the STAR method", "Be specific about your contributions", "Highlight problem-solving skills"]
    },
    {
      id: 3,
      question: "How do you handle working under pressure and tight deadlines?",
      type: "behavioral",
      difficulty: "medium",
      tips: ["Provide concrete examples", "Show your prioritization skills", "Demonstrate stress management"]
    }
  ];

  const startSession = () => {
    setIsActive(true);
    setCurrentQuestion(0);
    setResponses([]);
    setSessionComplete(false);
  };

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setSessionComplete(true);
      setIsActive(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Interview Prep</h1>
              <p className="text-gray-600">Practice with AI-powered mock interviews</p>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 ml-auto">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
        </div>

        {!isActive && !sessionComplete && (
          <div className="text-center space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Ready to Practice?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600">
                  This mock interview session includes {mockQuestions.length} carefully selected questions 
                  to help you practice your interview skills with AI-powered feedback.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{mockQuestions.length}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">15-30</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">AI</div>
                    <div className="text-sm text-gray-600">Feedback</div>
                  </div>
                </div>

                <Button onClick={startSession} size="lg" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Interview Practice
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {isActive && (
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">
                    Question {currentQuestion + 1} of {mockQuestions.length}
                  </span>
                </div>
                <Progress value={((currentQuestion + 1) / mockQuestions.length) * 100} />
              </CardContent>
            </Card>

            {/* Current Question */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Interview Question</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{mockQuestions[currentQuestion].type}</Badge>
                    <Badge className={getDifficultyColor(mockQuestions[currentQuestion].difficulty)}>
                      {mockQuestions[currentQuestion].difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-lg font-medium text-blue-900">
                    {mockQuestions[currentQuestion].question}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Tips for answering:</h4>
                  <ul className="space-y-1">
                    {mockQuestions[currentQuestion].tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Take your time to think and practice your answer</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={nextQuestion} className="flex-1">
                    {currentQuestion < mockQuestions.length - 1 ? 'Next Question' : 'Complete Session'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsActive(false)}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {sessionComplete && (
          <div className="text-center space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-green-600">Session Complete! 🎉</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600">
                  Great job completing the mock interview session! Here's your performance summary:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{mockQuestions.length}</div>
                    <div className="text-sm text-gray-600">Questions Completed</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <div className="text-sm text-gray-600">Performance Score</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">B+</div>
                    <div className="text-sm text-gray-600">Overall Grade</div>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <h4 className="font-medium">Key Recommendations:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Strong storytelling and use of specific examples</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Consider practicing more technical questions</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Great job connecting experiences to the role</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button onClick={startSession} className="flex-1">
                    Practice Again
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/tools')}>
                    Back to Tools
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
