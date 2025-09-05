import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Play, 
  CheckCircle,
  Star,
  Clock,
  Users,
  Brain,
  Target,
  Sparkles,
  VideoIcon,
  Mic,
  FileText
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function PublicInterviewPrep() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');

  const mockInterviews = [
    {
      title: 'Software Engineer - Technical Round',
      duration: '45 mins',
      questions: 15,
      difficulty: 'intermediate',
      topics: ['Data Structures', 'Algorithms', 'System Design']
    },
    {
      title: 'Product Manager - Behavioral',
      duration: '30 mins',
      questions: 10,
      difficulty: 'beginner',
      topics: ['Leadership', 'Strategy', 'Problem Solving']
    },
    {
      title: 'Data Scientist - Analytics',
      duration: '60 mins',
      questions: 20,
      difficulty: 'advanced',
      topics: ['Statistics', 'ML Models', 'Business Cases']
    }
  ];

  const questionCategories = [
    {
      category: 'Behavioral',
      count: 150,
      icon: Users,
      description: 'Tell me about yourself, leadership, teamwork'
    },
    {
      category: 'Technical',
      count: 300,
      icon: Brain,
      description: 'Coding, system design, problem-solving'
    },
    {
      category: 'Situational',
      count: 120,
      description: 'How would you handle conflicts, deadlines'
    },
    {
      category: 'Company-Specific',
      count: 200,
      description: 'Why this company, culture fit questions'
    }
  ];

  const starAnswers = [
    {
      question: 'Tell me about a time you faced a challenging deadline',
      situation: 'Our team had to deliver a critical feature in 2 weeks instead of 4',
      task: 'As lead developer, I needed to ensure quality while meeting the deadline',
      action: 'I reorganized sprints, delegated effectively, and implemented pair programming',
      result: 'Delivered on time with 95% test coverage and zero critical bugs'
    },
    {
      question: 'Describe a time you had to learn a new technology quickly',
      situation: 'Client requested a React Native app, but team only knew web development',
      task: 'Learn React Native and train the team within 1 week',
      action: 'Created learning plan, daily standups, and hands-on workshops',
      result: 'Successfully delivered MVP in 3 weeks, client extremely satisfied'
    }
  ];

  const interviewTips = [
    {
      category: 'Before Interview',
      tips: [
        'Research the company and role thoroughly',
        'Practice your elevator pitch',
        'Prepare 5-10 thoughtful questions',
        'Review your resume and be ready to discuss each point'
      ]
    },
    {
      category: 'During Interview',
      tips: [
        'Use the STAR method for behavioral questions',
        'Ask clarifying questions when needed',
        'Show enthusiasm and genuine interest',
        'Maintain good eye contact and body language'
      ]
    },
    {
      category: 'After Interview',
      tips: [
        'Send a thank you email within 24 hours',
        'Reflect on what went well and areas to improve',
        'Follow up appropriately if no response',
        'Continue applying to other opportunities'
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Interview Preparation | AI Mock Interviews & Practice - TalentXcel</title>
        <meta name="description" content="Ace your interviews with AI-powered mock interviews, question banks, and STAR method training. Practice with real interview scenarios." />
        <meta name="keywords" content="interview preparation, mock interview, interview questions, STAR method, interview practice" />
        <link rel="canonical" href="https://talentxcel.in/public/interview-prep" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Interview Prep
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Ace Your Next Interview
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Practice with AI mock interviews, master the STAR method, and get personalized 
              feedback to boost your confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                <Play className="h-5 w-5 mr-2" />
                Start Mock Interview
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                <MessageSquare className="h-5 w-5 mr-2" />
                Practice Questions
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardHeader>
                <VideoIcon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>AI Mock Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Practice with AI interviewer that adapts to your responses and provides real-time feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Star className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>STAR Method Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Master the STAR technique with guided practice and example answers from successful candidates.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Target className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Personalized Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get detailed analysis of your performance with specific recommendations for improvement.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="mock" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm">
              <TabsTrigger value="mock">Mock Interviews</TabsTrigger>
              <TabsTrigger value="questions">Question Bank</TabsTrigger>
              <TabsTrigger value="star">STAR Examples</TabsTrigger>
              <TabsTrigger value="tips">Pro Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="mock" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <VideoIcon className="h-5 w-5" />
                    AI Mock Interview Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {mockInterviews.map((interview, index) => (
                      <div key={index} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{interview.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {interview.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {interview.questions} questions
                            </div>
                            <Badge 
                              variant={interview.difficulty === 'beginner' ? 'secondary' : 
                                      interview.difficulty === 'intermediate' ? 'default' : 'destructive'}
                            >
                              {interview.difficulty}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {interview.topics.map((topic) => (
                              <Badge key={topic} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button className="lg:w-auto">
                          <Play className="h-4 w-4 mr-2" />
                          Start Interview
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Question Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {questionCategories.map((category) => (
                      <Card key={category.category} className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          {category.icon && <category.icon className="h-6 w-6 text-orange-600" />}
                          <div>
                            <h3 className="font-semibold">{category.category}</h3>
                            <p className="text-sm text-muted-foreground">{category.count} questions</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                        <Button variant="outline" size="sm" className="w-full">
                          Practice Now
                        </Button>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="star" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    STAR Method Examples
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {starAnswers.map((example, index) => (
                      <div key={index} className="p-6 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold text-lg mb-4">{example.question}</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div>
                              <Badge className="mb-2 bg-blue-100 text-blue-700">Situation</Badge>
                              <p className="text-sm">{example.situation}</p>
                            </div>
                            <div>
                              <Badge className="mb-2 bg-green-100 text-green-700">Task</Badge>
                              <p className="text-sm">{example.task}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Badge className="mb-2 bg-orange-100 text-orange-700">Action</Badge>
                              <p className="text-sm">{example.action}</p>
                            </div>
                            <div>
                              <Badge className="mb-2 bg-purple-100 text-purple-700">Result</Badge>
                              <p className="text-sm">{example.result}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {interviewTips.map((section) => (
                  <Card key={section.category}>
                    <CardHeader>
                      <CardTitle className="text-lg">{section.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {section.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl p-12 mt-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Interview?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of professionals who've landed their dream jobs with our interview prep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                <Play className="h-5 w-5 mr-2" />
                Start Free Practice
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <FileText className="h-5 w-5 mr-2" />
                Download Prep Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}