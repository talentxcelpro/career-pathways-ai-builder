
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  ArrowLeft, 
  Star,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  Building2,
  Briefcase
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  matchScore: number;
  requirements: string[];
  benefits: string[];
  postedDays: number;
  applicants: number;
  jobType: string;
  experience: string;
  matchReasons: string[];
}

const JobMatcher = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<JobMatch[]>([]);

  const findMatches = async () => {
    if (!skills || !experience) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsMatching(true);
    
    // Simulate AI job matching
    setTimeout(() => {
      const mockMatches: JobMatch[] = [
        {
          id: '1',
          title: 'Senior React Developer',
          company: 'TechCorp',
          location: 'San Francisco, CA',
          salaryRange: '$120,000 - $160,000',
          matchScore: 95,
          requirements: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
          benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours'],
          postedDays: 3,
          applicants: 45,
          jobType: 'Full-time',
          experience: 'Senior Level',
          matchReasons: ['Perfect skill match', 'Salary aligned', 'Location preference']
        },
        {
          id: '2',
          title: 'Full Stack Engineer',
          company: 'StartupX',
          location: 'New York, NY',
          salaryRange: '$100,000 - $140,000',
          matchScore: 88,
          requirements: ['JavaScript', 'Python', 'AWS', 'Docker'],
          benefits: ['Remote Work', 'Unlimited PTO', 'Learning Budget'],
          postedDays: 1,
          applicants: 23,
          jobType: 'Full-time',
          experience: 'Mid Level',
          matchReasons: ['Strong tech stack match', 'Growth opportunity', 'Startup environment']
        },
        {
          id: '3',
          title: 'Frontend Developer',
          company: 'DesignStudio',
          location: 'Remote',
          salaryRange: '$90,000 - $120,000',
          matchScore: 82,
          requirements: ['React', 'CSS', 'JavaScript', 'Figma'],
          benefits: ['100% Remote', 'Health Insurance', 'Quarterly Bonuses'],
          postedDays: 5,
          applicants: 67,
          jobType: 'Full-time',
          experience: 'Mid Level',
          matchReasons: ['Remote work preference', 'Design-focused role', 'Skill alignment']
        }
      ];

      setMatches(mockMatches);
      setIsMatching(false);
      toast.success('Found matching jobs with AI analysis!');
    }, 3000);
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMatchBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
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
              <h1 className="text-3xl font-bold text-gray-900">AI Job Matcher</h1>
              <p className="text-gray-600">Find jobs that match your profile with AI precision and compatibility scoring</p>
            </div>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Matching Form */}
            <Card>
              <CardHeader>
                <CardTitle>Find Your Perfect Match</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isMatching ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">AI Matching in Progress</h3>
                    <p className="text-gray-600 mb-4">Analyzing your profile against thousands of job opportunities...</p>
                    <Progress value={75} className="w-full" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills & Technologies *</Label>
                      <Input
                        id="skills"
                        placeholder="e.g., React, Python, AWS, Machine Learning"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Level *</Label>
                      <Select value={experience} onValueChange={setExperience}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                          <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                          <SelectItem value="lead">Lead Level (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Preferred Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., San Francisco, Remote, New York"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary">Expected Salary Range</Label>
                      <Input
                        id="salary"
                        placeholder="e.g., 80,000 - 1,20,000"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type Preference</Label>
                      <Select value={jobType} onValueChange={setJobType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={findMatches}
                      className="w-full"
                      disabled={!skills || !experience}
                    >
                      Find Matching Jobs
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>AI Matching Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Smart Compatibility Scoring</h4>
                    <p className="text-sm text-gray-600">AI analyzes job requirements vs your profile for precise matching</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Application Insights</h4>
                    <p className="text-sm text-gray-600">Get data on competition levels and application success rates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Personalized Recommendations</h4>
                    <p className="text-sm text-gray-600">Tailored job suggestions based on your career goals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Real-time Job Updates</h4>
                    <p className="text-sm text-gray-600">Get notified when new matching opportunities are posted</p>
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
                <h2 className="text-2xl font-bold text-gray-900">Your Job Matches</h2>
                <p className="text-gray-600">AI-powered job recommendations based on your profile</p>
              </div>
              <Button variant="outline" onClick={() => setMatches([])}>
                New Search
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {matches.map((match) => (
                <Card key={match.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{match.title}</h3>
                          <Badge className={getMatchBadgeColor(match.matchScore)}>
                            {match.matchScore}% Match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <span>{match.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{match.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{match.salaryRange}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${getMatchColor(match.matchScore)}`}>
                        {match.matchScore}%
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                        <div className="flex flex-wrap gap-1">
                          {match.requirements.map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                        <div className="flex flex-wrap gap-1">
                          {match.benefits.map((benefit, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Why This Matches You</h4>
                      <ul className="space-y-1">
                        {match.matchReasons.map((reason, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Posted {match.postedDays} days ago</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{match.applicants} applicants</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Save Job
                        </Button>
                        <Button size="sm">
                          Apply Now
                        </Button>
                      </div>
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

export default JobMatcher;
