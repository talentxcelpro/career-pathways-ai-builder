import React, { useState, useEffect } from 'react';
import { Search, Zap, Trophy, Coins, TrendingUp, Clock, MapPin, Briefcase, Star, Heart, Sparkles, ChevronRight, Filter, Brain, Target, Gamepad2, Users, Award, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data with TXC integration
const sparkJobsData = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp India",
    location: "Bangalore",
    salary: "₹15-25L",
    txcReward: 250,
    sparkScore: 95,
    quickApply: true,
    featured: true,
    skills: ["React", "TypeScript", "Node.js"],
    postedTime: "2h ago",
    applicants: 34,
    matchScore: 92,
    urgency: "high",
    type: "Full-time"
  },
  {
    id: 2,
    title: "AI/ML Engineer",
    company: "DataFlow Solutions",
    location: "Hyderabad",
    salary: "₹20-35L",
    txcReward: 400,
    sparkScore: 88,
    quickApply: true,
    featured: true,
    skills: ["Python", "TensorFlow", "AWS"],
    postedTime: "1h ago",
    applicants: 12,
    matchScore: 89,
    urgency: "medium",
    type: "Full-time"
  },
  {
    id: 3,
    title: "Product Manager",
    company: "Startup Hub",
    location: "Mumbai",
    salary: "₹18-30L",
    txcReward: 300,
    sparkScore: 91,
    quickApply: false,
    featured: false,
    skills: ["Product Strategy", "Analytics", "Agile"],
    postedTime: "4h ago",
    applicants: 67,
    matchScore: 85,
    urgency: "low",
    type: "Full-time"
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Pune",
    salary: "₹12-20L",
    txcReward: 200,
    sparkScore: 82,
    quickApply: true,
    featured: false,
    skills: ["Docker", "Kubernetes", "AWS"],
    postedTime: "6h ago",
    applicants: 28,
    matchScore: 78,
    urgency: "medium",
    type: "Full-time"
  }
];

const gameStats = {
  level: 7,
  experience: 2840,
  nextLevelExp: 3500,
  txcBalance: 1250,
  dailyStreak: 12,
  weeklyTarget: 15,
  applicationsThisWeek: 8
};

const dailyChallenges = [
  { id: 1, title: "Apply to 3 jobs", reward: 50, progress: 2, target: 3, completed: false },
  { id: 2, title: "View 10 company profiles", reward: 25, progress: 10, target: 10, completed: true },
  { id: 3, title: "Update profile skill", reward: 30, progress: 0, target: 1, completed: false }
];

export default function Jobs1() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('spark');
  const [likedJobs, setLikedJobs] = useState<number[]>([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [showGameStats, setShowGameStats] = useState(true);

  const handleJobLike = (jobId: number) => {
    setLikedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const nextJob = () => {
    setCurrentJobIndex((prev) => (prev + 1) % sparkJobsData.length);
  };

  const skipJob = () => {
    setCurrentJobIndex((prev) => (prev + 1) % sparkJobsData.length);
  };

  const currentJob = sparkJobsData[currentJobIndex];

  return (
    <>
      <SEOHead
        title="TalentSpark - Revolutionary Job Discovery | TalentXcel"
        description="Experience the future of job hunting with AI-powered matching, TXC rewards, and gamified career growth. Find your dream job with TalentSpark!"
        keywords={['jobs', 'AI matching', 'TXC rewards', 'gamified job search', 'career growth', 'TalentSpark']}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        {/* Hero Section with Game Stats */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    TalentSpark
                  </h1>
                </div>
                <Badge variant="secondary" className="hidden sm:flex items-center space-x-1">
                  <Flame className="h-3 w-3" />
                  <span>Level {gameStats.level}</span>
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{gameStats.txcBalance} TXC</span>
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <Target className="h-4 w-4 text-green-500" />
                  <span>{gameStats.applicationsThisWeek}/{gameStats.weeklyTarget} this week</span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs with AI-powered matching..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-12 rounded-2xl border-2 focus:border-primary"
                />
                <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl">
                  <Brain className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Game Stats & Challenges */}
            <div className="lg:col-span-1 space-y-4">
              {/* Experience Progress */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Career Progress</h3>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Level {gameStats.level}</span>
                      <span>{gameStats.experience}/{gameStats.nextLevelExp} XP</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                        style={{ width: `${(gameStats.experience / gameStats.nextLevelExp) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Challenges */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Daily Challenges</h3>
                    <Gamepad2 className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dailyChallenges.map((challenge) => (
                      <div key={challenge.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={challenge.completed ? 'line-through text-muted-foreground' : ''}>
                            {challenge.title}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Coins className="h-3 w-3 text-yellow-500" />
                            <span className="text-yellow-600 font-medium">{challenge.reward}</span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1">
                          <div 
                            className="bg-primary h-1 rounded-full transition-all"
                            style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Filters */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <h3 className="font-semibold text-sm flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Smart Filters
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <Zap className="h-3 w-3 mr-2" />
                      Quick Apply Only
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <Star className="h-3 w-3 mr-2" />
                      High Match Score
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <Coins className="h-3 w-3 mr-2" />
                      High TXC Rewards
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="spark" className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Spark Discovery</span>
                  </TabsTrigger>
                  <TabsTrigger value="featured" className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>Featured</span>
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4" />
                    <span>All Jobs</span>
                  </TabsTrigger>
                </TabsList>

                {/* Spark Discovery - TikTok Style */}
                <TabsContent value="spark" className="space-y-6">
                  <div className="max-w-md mx-auto">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentJobIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50 overflow-hidden">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="secondary" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {currentJob.matchScore}% Match
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Coins className="h-4 w-4 text-yellow-500" />
                                <span className="text-yellow-600 font-bold">+{currentJob.txcReward}</span>
                              </div>
                            </div>
                            <h2 className="text-xl font-bold">{currentJob.title}</h2>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {currentJob.company}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {currentJob.location}
                              </span>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-primary">{currentJob.salary}</span>
                              <Badge variant={currentJob.urgency === 'high' ? 'destructive' : 'secondary'}>
                                <Clock className="h-3 w-3 mr-1" />
                                {currentJob.postedTime}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {currentJob.skills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center text-muted-foreground">
                                <Users className="h-4 w-4 mr-1" />
                                {currentJob.applicants} applied
                              </span>
                              {currentJob.quickApply && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Quick Apply
                                </Badge>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 pt-4">
                              <Button 
                                variant="outline" 
                                size="lg" 
                                className="flex-1"
                                onClick={skipJob}
                              >
                                Skip
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="lg"
                                className={`px-4 ${likedJobs.includes(currentJob.id) ? 'text-red-500' : ''}`}
                                onClick={() => handleJobLike(currentJob.id)}
                              >
                                <Heart className={`h-5 w-5 ${likedJobs.includes(currentJob.id) ? 'fill-current' : ''}`} />
                              </Button>
                              <Button 
                                size="lg" 
                                className="flex-1 bg-gradient-to-r from-primary to-secondary"
                                onClick={nextJob}
                              >
                                {currentJob.quickApply ? 'Quick Apply' : 'Apply Now'}
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </TabsContent>

                {/* Featured Jobs */}
                <TabsContent value="featured" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sparkJobsData.filter(job => job.featured).map((job) => (
                      <Card key={job.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Coins className="h-4 w-4 text-yellow-500" />
                              <span className="text-yellow-600 font-bold">+{job.txcReward}</span>
                            </div>
                          </div>
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-primary">{job.salary}</span>
                              <Badge variant="outline">{job.matchScore}% Match</Badge>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {job.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            <Button className="w-full">
                              {job.quickApply ? 'Quick Apply' : 'Apply Now'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* All Jobs */}
                <TabsContent value="all" className="space-y-4">
                  <div className="space-y-3">
                    {sparkJobsData.map((job) => (
                      <Card key={job.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold">{job.title}</h3>
                                {job.featured && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {job.company} • {job.location} • {job.postedTime}
                              </p>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="font-medium text-primary">{job.salary}</span>
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {job.applicants} applied
                                </span>
                                <span className="flex items-center">
                                  <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                                  <span className="text-yellow-600">+{job.txcReward}</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Heart className="h-4 w-4" />
                              </Button>
                              <Button size="sm">
                                {job.quickApply ? 'Quick Apply' : 'Apply'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}