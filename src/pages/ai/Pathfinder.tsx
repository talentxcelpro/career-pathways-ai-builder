
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Compass, 
  Target, 
  TrendingUp, 
  Clock, 
  Award,
  MapPin,
  ArrowRight,
  CheckCircle,
  Star,
  Users
} from 'lucide-react';

const Pathfinder = () => {
  const [currentRole, setCurrentRole] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [pathsGenerated, setPathsGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const careerPaths = [
    {
      id: 1,
      title: "Senior Software Engineer",
      match: 92,
      timeline: "2-3 years",
      salary: "$120k - $160k",
      growth: "High",
      demand: "Very High",
      steps: [
        "Master advanced JavaScript/TypeScript",
        "Learn system design principles", 
        "Gain cloud platform experience",
        "Lead technical projects",
        "Mentor junior developers"
      ],
      skills: ["React", "Node.js", "AWS", "System Design", "Leadership"],
      companies: ["Google", "Microsoft", "Amazon", "Meta"]
    },
    {
      id: 2,
      title: "Product Manager",
      match: 85,
      timeline: "3-4 years",
      salary: "$110k - $150k",
      growth: "High",
      demand: "High",
      steps: [
        "Develop product strategy skills",
        "Learn data analysis and metrics",
        "Understand user research methods",
        "Practice stakeholder management",
        "Build technical product knowledge"
      ],
      skills: ["Product Strategy", "Analytics", "User Research", "Agile", "Communication"],
      companies: ["Apple", "Spotify", "Airbnb", "Uber"]
    },
    {
      id: 3,
      title: "Technical Lead",
      match: 88,
      timeline: "1-2 years",
      salary: "$130k - $170k",
      growth: "High",
      demand: "High",
      steps: [
        "Strengthen architecture skills",
        "Improve team leadership",
        "Learn project management",
        "Develop technical strategy",
        "Build cross-team collaboration"
      ],
      skills: ["Architecture", "Leadership", "Strategy", "Communication", "Mentoring"],
      companies: ["Netflix", "Stripe", "Shopify", "Twilio"]
    }
  ];

  const handleGeneratePaths = () => {
    if (!currentRole.trim()) return;
    
    setGenerating(true);
    setTimeout(() => {
      setPathsGenerated(true);
      setGenerating(false);
    }, 3000);
  };

  const getMatchColor = (match) => {
    if (match >= 90) return "text-green-600 bg-green-50";
    if (match >= 80) return "text-blue-600 bg-blue-50";
    return "text-orange-600 bg-orange-50";
  };

  const getDemandColor = (demand) => {
    switch (demand) {
      case 'Very High': return 'bg-green-100 text-green-800';
      case 'High': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-orange-600 rounded-lg">
              <Compass className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Career Pathfinder</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover ideal career paths and growth opportunities tailored to your skills, 
            interests, and professional goals with AI-powered recommendations.
          </p>
        </div>

        {!pathsGenerated ? (
          /* Input Section */
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span>Tell Us About Yourself</span>
                </CardTitle>
                <CardDescription>
                  Provide information about your current role, skills, and career interests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {generating ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">Analyzing Career Paths</h3>
                    <p className="text-gray-600 mb-4">Our AI is discovering your best opportunities...</p>
                    <Progress value={75} className="w-full max-w-md mx-auto" />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Role</label>
                      <Input
                        placeholder="e.g., Software Developer, Marketing Manager, Data Analyst"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Skills & Technologies</label>
                      <Input
                        placeholder="e.g., JavaScript, Python, Project Management, Design"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Career Interests</label>
                      <Input
                        placeholder="e.g., Leadership, Innovation, Remote Work, Startups"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleGeneratePaths}
                      disabled={!currentRole.trim()}
                      className="w-full"
                    >
                      <Compass className="h-4 w-4 mr-2" />
                      Discover Career Paths
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Growth Analysis</h3>
                  <p className="text-sm text-gray-600">Identify high-growth career opportunities in your field</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Skill Roadmap</h3>
                  <p className="text-sm text-gray-600">Get step-by-step plans to reach your career goals</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Market Insights</h3>
                  <p className="text-sm text-gray-600">Understand salary ranges and demand trends</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Career Paths</h2>
                <p className="text-gray-600">Personalized recommendations based on your profile</p>
              </div>
              <Button variant="outline" onClick={() => setPathsGenerated(false)}>
                <Target className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {careerPaths.map((path, index) => (
                <Card key={path.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{path.title}</h3>
                          <Badge className={`text-sm font-bold px-3 py-1 ${getMatchColor(path.match)}`}>
                            {path.match}% Match
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{path.timeline}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{path.salary}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{path.growth} Growth</span>
                          </div>
                          <div>
                            <Badge className={getDemandColor(path.demand)}>
                              {path.demand} Demand
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Steps */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Career Steps
                        </h4>
                        <div className="space-y-2">
                          {path.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-start space-x-2">
                              <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                                {stepIndex + 1}
                              </div>
                              <span className="text-sm text-gray-700">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills & Companies */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Key Skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {path.skills.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Top Companies</h4>
                          <div className="flex flex-wrap gap-1">
                            {path.companies.map((company, companyIndex) => (
                              <Badge key={companyIndex} variant="outline" className="text-xs">
                                {company}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">
                        Start Journey
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pathfinder;
