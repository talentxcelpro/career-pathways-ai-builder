import React, { useState } from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Star, Award, Play, Users } from 'lucide-react';

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
      id: 'node-backend',
      title: 'Node.js Backend Development',
      description: 'Server-side development with Node.js, Express, and database integration',
      duration: 75,
      questions: 35,
      difficulty: 'Intermediate',
      passingScore: 75,
      attempts: 1,
      bestScore: 72,
      category: 'Backend',
      skills: ['Express', 'APIs', 'Databases', 'Authentication', 'Security'],
      participants: 11250
    },
    {
      id: 'python-data',
      title: 'Python for Data Science',
      description: 'Data manipulation, analysis, and visualization with Python libraries',
      duration: 90,
      questions: 40,
      difficulty: 'Intermediate',
      passingScore: 75,
      attempts: 0,
      bestScore: null,
      category: 'Data Science',
      skills: ['Pandas', 'NumPy', 'Matplotlib', 'Statistics', 'ML'],
      participants: 9680
    },
    {
      id: 'aws-cloud',
      title: 'AWS Cloud Fundamentals',
      description: 'Core AWS services, cloud architecture, and deployment strategies',
      duration: 120,
      questions: 50,
      difficulty: 'Intermediate',
      passingScore: 70,
      attempts: 0,
      bestScore: null,
      category: 'Cloud',
      skills: ['EC2', 'S3', 'Lambda', 'RDS', 'IAM'],
      participants: 12100
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity Essentials',
      description: 'Security fundamentals, threat analysis, and protection strategies',
      duration: 100,
      questions: 45,
      difficulty: 'Advanced',
      passingScore: 80,
      attempts: 0,
      bestScore: null,
      category: 'Security',
      skills: ['Network Security', 'Encryption', 'Risk Assessment', 'Compliance'],
      participants: 6890
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-700 bg-green-100';
      case 'Intermediate': return 'text-blue-700 bg-blue-100';
      case 'Advanced': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getScoreColor = (score: number, passingScore: number) => {
    if (score >= passingScore) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Award className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Skill Assessment</h1>
            <p className="text-gray-600">
              Test and validate your skills with comprehensive assessments
            </p>
          </div>
        </div>

        {/* Assessment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Assessments Taken</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-50 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-50 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">79%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-50 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Time Spent</p>
                  <p className="text-2xl font-bold text-gray-900">4.2h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDifficultyColor(assessment.difficulty)}>
                    {assessment.difficulty}
                  </Badge>
                  <Badge variant="outline">{assessment.category}</Badge>
                </div>
                <CardTitle className="text-lg">{assessment.title}</CardTitle>
                <p className="text-sm text-gray-600">{assessment.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Assessment Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{assessment.duration} min</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{assessment.participants.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    {assessment.questions} questions • {assessment.passingScore}% to pass
                  </div>

                  {/* Previous Results */}
                  {assessment.attempts > 0 && assessment.bestScore && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Best Score</span>
                        <span className={`text-sm font-bold ${getScoreColor(assessment.bestScore, assessment.passingScore)}`}>
                          {assessment.bestScore}%
                        </span>
                      </div>
                      <Progress value={assessment.bestScore} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {assessment.attempts} attempt{assessment.attempts > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}

                  {/* Skills Covered */}
                  <div>
                    <p className="text-sm font-medium mb-2">Skills Covered:</p>
                    <div className="flex flex-wrap gap-1">
                      {assessment.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {assessment.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{assessment.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    variant={assessment.attempts > 0 ? "outline" : "default"}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {assessment.attempts > 0 ? 'Retake Assessment' : 'Start Assessment'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Assessment Benefits */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Take Skill Assessments?</h2>
              <p className="text-gray-600">Validate your expertise and showcase your abilities to employers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Earn Certificates</h3>
                <p className="text-sm text-gray-600">Get industry-recognized certificates to add to your profile</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Validate Skills</h3>
                <p className="text-sm text-gray-600">Prove your competency with objective skill verification</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Stand Out</h3>
                <p className="text-sm text-gray-600">Differentiate yourself in the competitive job market</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SkillAssessment;