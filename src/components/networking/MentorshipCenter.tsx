import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, Award, BookOpen, MessageCircle, Star, Filter, Plus } from "lucide-react";
import { useNetworking } from "@/hooks/useNetworking";
import { useAuth } from "@/contexts/AuthContext";

const MentorshipCenter = () => {
  const { user } = useAuth();
  const { mentorshipPrograms, applyToMentorship, isLoading, isProcessing } = useNetworking();
  const [activeTab, setActiveTab] = useState('browse');
  const [applicationForm, setApplicationForm] = useState({
    programId: '',
    applicationMessage: '',
    goals: '',
    experienceLevel: ''
  });

  // Mock mentorship programs data
  const mockPrograms = [
    {
      id: '1',
      title: 'Product Management Mastery',
      description: 'Learn product strategy, roadmapping, and stakeholder management from experienced PMs at top tech companies.',
      program_type: 'career_guidance',
      duration_weeks: 12,
      max_mentees: 5,
      current_mentees: 3,
      mentor: {
        name: 'Sarah Johnson',
        title: 'Senior PM at Google',
        experience: '8+ years',
        avatar: '/placeholder-avatar.png',
        rating: 4.9,
        totalMentees: 47
      },
      skills_offered: ['Product Strategy', 'Roadmapping', 'Analytics', 'User Research', 'Stakeholder Management'],
      requirements: {
        experience: 'Entry to Mid-level',
        commitment: '2 hours/week',
        prerequisites: 'Basic PM knowledge'
      },
      is_featured: true,
      next_cohort: '2024-02-15',
      testimonials: [
        {
          name: 'Mike Chen',
          role: 'Associate PM',
          text: 'Sarah\'s mentorship was instrumental in my promotion to Senior PM.'
        }
      ]
    },
    {
      id: '2',
      title: 'Full-Stack Development Journey',
      description: 'Master modern web development with React, Node.js, and cloud technologies through hands-on projects.',
      program_type: 'skill_development',
      duration_weeks: 16,
      max_mentees: 8,
      current_mentees: 6,
      mentor: {
        name: 'Alex Rodriguez',
        title: 'Tech Lead at Microsoft',
        experience: '10+ years',
        avatar: '/placeholder-avatar.png',
        rating: 4.8,
        totalMentees: 62
      },
      skills_offered: ['React', 'Node.js', 'TypeScript', 'AWS', 'System Design'],
      requirements: {
        experience: 'Beginner to Intermediate',
        commitment: '3 hours/week',
        prerequisites: 'Basic programming knowledge'
      },
      is_featured: false,
      next_cohort: '2024-03-01',
      testimonials: [
        {
          name: 'Emma Davis',
          role: 'Frontend Developer',
          text: 'Alex helped me transition from junior to mid-level developer in 4 months.'
        }
      ]
    },
    {
      id: '3',
      title: 'Data Science Leadership',
      description: 'Advance from individual contributor to leading data science teams and driving business impact.',
      program_type: 'leadership',
      duration_weeks: 10,
      max_mentees: 4,
      current_mentees: 2,
      mentor: {
        name: 'Dr. Lisa Wang',
        title: 'Director of Data Science at Netflix',
        experience: '12+ years',
        avatar: '/placeholder-avatar.png',
        rating: 5.0,
        totalMentees: 28
      },
      skills_offered: ['Team Leadership', 'ML Strategy', 'Business Impact', 'Technical Communication'],
      requirements: {
        experience: 'Senior Data Scientist',
        commitment: '1.5 hours/week',
        prerequisites: '3+ years in data science'
      },
      is_featured: true,
      next_cohort: '2024-02-20',
      testimonials: [
        {
          name: 'David Kumar',
          role: 'Senior Data Scientist',
          text: 'Lisa\'s guidance was crucial for my transition to management.'
        }
      ]
    }
  ];

  const experienceLevels = ['Entry Level', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Executive'];

  const handleApplyToProgram = async (programId: string) => {
    if (!applicationForm.applicationMessage || !applicationForm.experienceLevel) {
      return;
    }

    try {
      await applyToMentorship({
        programId,
        applicationMessage: applicationForm.applicationMessage,
        goals: applicationForm.goals,
        experienceLevel: applicationForm.experienceLevel
      });
      
      setApplicationForm({
        programId: '',
        applicationMessage: '',
        goals: '',
        experienceLevel: ''
      });
    } catch (error) {
      console.error('Error applying to mentorship:', error);
    }
  };

  const getProgramTypeColor = (type: string) => {
    switch (type) {
      case 'career_guidance': return 'bg-blue-100 text-blue-800';
      case 'skill_development': return 'bg-green-100 text-green-800';
      case 'leadership': return 'bg-purple-100 text-purple-800';
      case 'industry_transition': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatProgramType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Programs</p>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expert Mentors</p>
                <p className="text-2xl font-bold">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">12 weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="browse">Browse Programs</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="become-mentor">Become a Mentor</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockPrograms.map((program) => (
              <Card key={program.id} className={`hover:shadow-md transition-shadow ${program.is_featured ? 'ring-2 ring-primary/20' : ''}`}>
                {program.is_featured && (
                  <div className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    Featured Program
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{program.title}</h3>
                        <Badge className={getProgramTypeColor(program.program_type)}>
                          {formatProgramType(program.program_type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {program.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Mentor Info */}
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={program.mentor.avatar} />
                      <AvatarFallback>{program.mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{program.mentor.name}</h4>
                      <p className="text-sm text-muted-foreground">{program.mentor.title}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{program.mentor.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {program.mentor.totalMentees} mentees
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Program Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p className="text-muted-foreground">{program.duration_weeks} weeks</p>
                    </div>
                    <div>
                      <span className="font-medium">Commitment:</span>
                      <p className="text-muted-foreground">{program.requirements.commitment}</p>
                    </div>
                    <div>
                      <span className="font-medium">Next Cohort:</span>
                      <p className="text-muted-foreground">{new Date(program.next_cohort).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Spots Left:</span>
                      <p className="text-muted-foreground">{program.max_mentees - program.current_mentees} / {program.max_mentees}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <span className="font-medium text-sm">Skills Covered:</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {program.skills_offered.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {program.skills_offered.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{program.skills_offered.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Testimonial */}
                  {program.testimonials.length > 0 && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm italic">"{program.testimonials[0].text}"</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        - {program.testimonials[0].name}, {program.testimonials[0].role}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="flex-1"
                          disabled={program.current_mentees >= program.max_mentees}
                          onClick={() => setApplicationForm({...applicationForm, programId: program.id})}
                        >
                          {program.current_mentees >= program.max_mentees ? 'Program Full' : 'Apply Now'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Apply to {program.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="experienceLevel">Your Experience Level</Label>
                            <Select 
                              value={applicationForm.experienceLevel} 
                              onValueChange={(value) => setApplicationForm({...applicationForm, experienceLevel: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select your experience level" />
                              </SelectTrigger>
                              <SelectContent>
                                {experienceLevels.map((level) => (
                                  <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="applicationMessage">Why do you want to join this program?</Label>
                            <Textarea
                              id="applicationMessage"
                              placeholder="Tell the mentor why you're interested and what you hope to achieve..."
                              value={applicationForm.applicationMessage}
                              onChange={(e) => setApplicationForm({...applicationForm, applicationMessage: e.target.value})}
                              rows={4}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="goals">Your Goals (Optional)</Label>
                            <Textarea
                              id="goals"
                              placeholder="What specific goals do you want to achieve through this mentorship?"
                              value={applicationForm.goals}
                              onChange={(e) => setApplicationForm({...applicationForm, goals: e.target.value})}
                              rows={3}
                            />
                          </div>
                          
                          <Button 
                            onClick={() => handleApplyToProgram(program.id)}
                            disabled={!applicationForm.applicationMessage || !applicationForm.experienceLevel || isProcessing}
                            className="w-full"
                          >
                            Submit Application
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your mentorship journey by applying to programs
            </p>
            <Button onClick={() => setActiveTab('browse')}>
              Browse Programs
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="become-mentor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Become a Mentor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Share your expertise and help the next generation of professionals grow their careers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Share Knowledge</h4>
                  <p className="text-sm text-muted-foreground">Pass on your expertise to eager learners</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Build Your Brand</h4>
                  <p className="text-sm text-muted-foreground">Establish yourself as a thought leader</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Learn & Grow</h4>
                  <p className="text-sm text-muted-foreground">Gain new perspectives from fresh minds</p>
                </div>
              </div>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Apply to Become a Mentor
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorshipCenter;