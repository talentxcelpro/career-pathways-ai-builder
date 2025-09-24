import React, { useState } from 'react';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Star, Award, Play, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SkillAssessment = () => {
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);

  React.useEffect(() => {
    updateMetaTags({
      title: 'Skill Assessment | TalentXcel Learning',
      description: 'Test and validate your skills with comprehensive assessments and earn certificates.'
    });
  }, []);

  // Mock assessments data
  const assessments = [
    {
      id: 'javascript-fundamentals',
      title: 'JavaScript Fundamentals',
      description: 'Test your core JavaScript knowledge including variables, functions, and objects',
      duration: 45,
      questions: 30,
      difficulty: 'Beginner',
      passingScore: 70,
      attempts: 2,
      bestScore: 85,
      category: 'Programming',
      skills: ['Variables', 'Functions', 'Objects', 'Arrays', 'Loops'],
      participants: 15420
    },
    {
      id: 'react-advanced',
      title: 'React Advanced Concepts',
      description: 'Advanced React patterns, hooks, state management, and performance optimization',
      duration: 60,
      questions: 25,
      difficulty: 'Advanced',
      passingScore: 80,
      attempts: 0,
      bestScore: null,
      category: 'Frontend',
      skills: ['Hooks', 'Context', 'Performance', 'Testing', 'Patterns'],
      participants: 8930
    },
    {
      id: 'python-data-science',
      title: 'Python for Data Science',
      description: 'Evaluate your Python skills for data analysis, pandas, and machine learning',
      duration: 75,
      questions: 35,
      difficulty: 'Intermediate',
      passingScore: 75,
      attempts: 1,
      bestScore: 92,
      category: 'Data Science',
      skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Machine Learning'],
      participants: 12580
    },
    {
      id: 'nodejs-backend',
      title: 'Node.js Backend Development',
      description: 'Test your knowledge of Node.js, Express, databases, and API development',
      duration: 90,
      questions: 40,
      difficulty: 'Advanced',
      passingScore: 80,
      attempts: 0,
      bestScore: null,
      category: 'Backend',
      skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Authentication'],
      participants: 7340
    },
    {
      id: 'css-advanced',
      title: 'Advanced CSS & Design',
      description: 'Master CSS Grid, Flexbox, animations, and responsive design principles',
      duration: 50,
      questions: 28,
      difficulty: 'Intermediate',
      passingScore: 70,
      attempts: 3,
      bestScore: 78,
      category: 'Frontend',
      skills: ['CSS Grid', 'Flexbox', 'Animations', 'Responsive Design', 'SASS'],
      participants: 18920
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number, passingScore: number) => {
    if (score >= passingScore + 10) return 'text-green-600';
    if (score >= passingScore) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (selectedAssessment) {
    const assessment = assessments.find(a => a.id === selectedAssessment);
    if (!assessment) return null;

    return (
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <div className="bg-primary text-primary-foreground p-6">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedAssessment(null)}
              className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessments
            </Button>
            <h1 className="text-2xl font-bold mb-2">{assessment.title}</h1>
            <p className="text-primary-foreground/80 mb-4">{assessment.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{assessment.duration} minutes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>{assessment.questions} questions</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4" />
                <span>{assessment.passingScore}% to pass</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Assessment Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Assessment Starting Soon</span>
                <Badge className={getDifficultyColor(assessment.difficulty)}>
                  {assessment.difficulty}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You have {assessment.duration} minutes to complete {assessment.questions} questions</li>
                  <li>• You need {assessment.passingScore}% to pass this assessment</li>
                  <li>• Once started, you cannot pause the timer</li>
                  <li>• You can review and change answers before submitting</li>
                </ul>
              </div>

              {/* Skills Covered */}
              <div>
                <h3 className="font-semibold mb-3">Skills Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {assessment.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>

              {/* Previous Attempts */}
              {assessment.attempts > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Previous Attempts</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Attempts: {assessment.attempts}/3
                      </span>
                      <span className={`font-semibold ${getScoreColor(assessment.bestScore!, assessment.passingScore)}`}>
                        Best Score: {assessment.bestScore}%
                      </span>
                    </div>
                    <Progress 
                      value={assessment.bestScore!} 
                      className="mt-2" 
                    />
                  </div>
                </div>
              )}

              {/* Start Button */}
              <div className="flex justify-center pt-4">
                <Button size="lg" className="px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Start Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-primary text-primary-foreground p-6">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/learning"
            className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning Hub
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Skill Assessments</h1>
          </div>
          <p className="text-primary-foreground/80">Test and validate your skills with comprehensive assessments</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-foreground">
                {assessments.filter(a => a.bestScore && a.bestScore >= a.passingScore).length}
              </p>
              <p className="text-sm text-muted-foreground">Passed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-foreground">
                {assessments.reduce((total, a) => total + a.attempts, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Attempts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-foreground">
                {Math.round(assessments.filter(a => a.bestScore).reduce((avg, a, _, arr) => avg + a.bestScore! / arr.length, 0)) || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-foreground">
                {assessments.filter(a => a.bestScore && a.bestScore >= 90).length}
              </p>
              <p className="text-sm text-muted-foreground">Excellence</p>
            </CardContent>
          </Card>
        </div>

        {/* Assessments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-1">
                        {assessment.title}
                      </h3>
                      <Badge className={getDifficultyColor(assessment.difficulty)}>
                        {assessment.difficulty}
                      </Badge>
                    </div>
                    {assessment.bestScore && assessment.bestScore >= assessment.passingScore && (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {assessment.description}
                  </p>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{assessment.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{assessment.questions} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{(assessment.participants / 1000).toFixed(0)}k</span>
                    </div>
                  </div>

                  {/* Previous Score */}
                  {assessment.bestScore && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Best Score</span>
                        <span className={`font-semibold ${getScoreColor(assessment.bestScore, assessment.passingScore)}`}>
                          {assessment.bestScore}%
                        </span>
                      </div>
                      <Progress value={assessment.bestScore} />
                    </div>
                  )}

                  {/* Skills */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {assessment.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {assessment.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{assessment.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full" 
                    onClick={() => setSelectedAssessment(assessment.id)}
                    variant={assessment.attempts >= 3 ? "outline" : "default"}
                    disabled={assessment.attempts >= 3}
                  >
                    {assessment.attempts >= 3 ? (
                      "Max Attempts Reached"
                    ) : assessment.attempts > 0 ? (
                      `Retake (${assessment.attempts}/3)`
                    ) : (
                      "Start Assessment"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillAssessment;