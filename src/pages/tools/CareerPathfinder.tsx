
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  ArrowLeft, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Users,
  Star,
  MapPin,
  Award,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CareerPath {
  id: string;
  title: string;
  match: number;
  timeline: string;
  salaryRange: string;
  demandLevel: 'High' | 'Medium' | 'Low';
  description: string;
  requiredSkills: string[];
  steps: string[];
  companies: string[];
  growthPotential: number;
}

const CareerPathfinder = () => {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [interests, setInterests] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CareerPath[] | null>(null);

  const generateCareerPaths = async () => {
    if (!currentRole || !skills || !experience) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockPaths: CareerPath[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          match: 92,
          timeline: '18-24 months',
          salaryRange: '$90k - $140k',
          demandLevel: 'High',
          description: 'Lead technical projects and mentor junior developers while architecting scalable solutions.',
          requiredSkills: ['Advanced JavaScript', 'System Design', 'Cloud Platforms', 'Team Leadership'],
          steps: [
            'Master advanced JavaScript frameworks and patterns',
            'Learn system design principles and scalability',
            'Gain experience with cloud platforms (AWS/Azure)',
            'Take on technical leadership responsibilities',
            'Mentor junior developers and contribute to code reviews'
          ],
          companies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix'],
          growthPotential: 85
        },
        {
          id: '2',
          title: 'Product Manager',
          match: 78,
          timeline: '2-3 years',
          salaryRange: '$80k - $120k',
          demandLevel: 'High',
          description: 'Bridge technical and business teams to deliver products that solve real user problems.',
          requiredSkills: ['Product Strategy', 'User Research', 'Data Analysis', 'Stakeholder Management'],
          steps: [
            'Develop product management fundamentals',
            'Learn user research and data analysis',
            'Practice stakeholder communication',
            'Build portfolio of product case studies',
            'Gain experience with product roadmapping'
          ],
          companies: ['Apple', 'Spotify', 'Airbnb', 'Uber', 'Shopify'],
          growthPotential: 90
        },
        {
          id: '3',
          title: 'Technical Architect',
          match: 85,
          timeline: '3-4 years',
          salaryRange: '$110k - $160k',
          demandLevel: 'Medium',
          description: 'Design and oversee the technical architecture of complex software systems.',
          requiredSkills: ['Software Architecture', 'Distributed Systems', 'Technical Strategy', 'Cross-team Collaboration'],
          steps: [
            'Deepen understanding of software architecture patterns',
            'Study distributed systems and microservices',
            'Develop technical strategy and decision-making skills',
            'Lead cross-functional technical initiatives',
            'Build expertise in emerging technologies'
          ],
          companies: ['Netflix', 'Stripe', 'Twilio', 'Databricks', 'Snowflake'],
          growthPotential: 88
        }
      ];

      setResults(mockPaths);
      setIsAnalyzing(false);
      toast.success('Career paths generated successfully!');
    }, 3000);
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchColor = (match: number) => {
    if (match >= 85) return 'text-green-600';
    if (match >= 70) return 'text-blue-600';
    return 'text-orange-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
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
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Career Pathfinder</h1>
              <p className="text-gray-600">Discover your ideal career path with AI-powered recommendations</p>
            </div>
          </div>
        </div>

        {!results ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Tell Us About Yourself</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">Analyzing Your Profile</h3>
                    <p className="text-gray-600 mb-4">AI is discovering your best career opportunities...</p>
                    <Progress value={75} className="w-full" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="currentRole">Current Role *</Label>
                      <Input
                        id="currentRole"
                        placeholder="e.g., Software Developer, Marketing Manager"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetRole">Target Role (Optional)</Label>
                      <Input
                        id="targetRole"
                        placeholder="e.g., Senior Engineer, Product Manager"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills & Technologies *</Label>
                      <Textarea
                        id="skills"
                        placeholder="List your key skills, technologies, and tools"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Level *</Label>
                      <Select value={experience} onValueChange={setExperience}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                          <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                          <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interests">Career Interests</Label>
                      <Textarea
                        id="interests"
                        placeholder="What aspects of work do you enjoy most?"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <Button 
                      onClick={generateCareerPaths}
                      className="w-full"
                      disabled={!currentRole || !skills || !experience}
                    >
                      Generate Career Paths
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Get</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Personalized Career Paths</h4>
                    <p className="text-sm text-gray-600">AI-generated recommendations based on your profile</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Market Insights</h4>
                    <p className="text-sm text-gray-600">Salary ranges, demand levels, and growth potential</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Step-by-Step Roadmap</h4>
                    <p className="text-sm text-gray-600">Clear action steps to reach your goals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Top Companies</h4>
                    <p className="text-sm text-gray-600">Leading employers in your target field</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Career Path Recommendations</h2>
                <p className="text-gray-600">AI-powered analysis based on your profile</p>
              </div>
              <Button variant="outline" onClick={() => setResults(null)}>
                Generate New Paths
              </Button>
            </div>

            {results.map((path, index) => (
              <Card key={path.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{path.title}</h3>
                        <Badge className={`px-3 py-1 font-bold ${getMatchColor(path.match)}`}>
                          {path.match}% Match
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{path.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{path.timeline}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{path.salaryRange}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{path.growthPotential}% Growth</span>
                        </div>
                        <div>
                          <Badge className={getDemandColor(path.demandLevel)}>
                            {path.demandLevel} Demand
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Required Skills */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Star className="h-4 w-4 text-yellow-600 mr-2" />
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {path.requiredSkills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Top Companies */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Award className="h-4 w-4 text-blue-600 mr-2" />
                        Top Companies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {path.companies.map((company, companyIndex) => (
                          <Badge key={companyIndex} variant="outline" className="text-xs">
                            {company}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Career Steps */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Career Roadmap
                    </h4>
                    <div className="space-y-2">
                      {path.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                            {stepIndex + 1}
                          </div>
                          <span className="text-sm text-gray-700">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 pt-4 border-t">
                    <Button>
                      Start This Path
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerPathfinder;
