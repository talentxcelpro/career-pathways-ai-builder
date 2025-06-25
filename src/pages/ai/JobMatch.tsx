
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Search, 
  Star, 
  MapPin, 
  DollarSign,
  Building,
  Clock,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const JobMatch = () => {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [matches, setMatches] = useState([]);

  const handleResumeUpload = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setResumeUploaded(true);
      setAnalyzing(false);
      setMatches([
        {
          id: 1,
          title: "Senior Software Engineer",
          company: "TechCorp Inc.",
          location: "San Francisco, CA",
          salary: "$120k - $160k",
          match: 95,
          logo: "🏢",
          skills: ["React", "TypeScript", "Node.js"],
          posted: "2 days ago",
          applicants: "45 applicants"
        },
        {
          id: 2,
          title: "Full Stack Developer",
          company: "StartupXYZ",
          location: "Remote",
          salary: "$100k - $140k",
          match: 87,
          logo: "🚀",
          skills: ["JavaScript", "Python", "AWS"],
          posted: "1 week ago",
          applicants: "23 applicants"
        },
        {
          id: 3,
          title: "Frontend Engineer",
          company: "Design Co.",
          location: "New York, NY",
          salary: "$90k - $130k",
          match: 82,
          logo: "🎨",
          skills: ["React", "CSS", "Figma"],
          posted: "3 days ago",
          applicants: "67 applicants"
        }
      ]);
    }, 3000);
  };

  const getMatchColor = (match) => {
    if (match >= 90) return "text-green-600 bg-green-50";
    if (match >= 80) return "text-blue-600 bg-blue-50";
    if (match >= 70) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Job Match</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your resume and let our AI find the perfect job matches based on your skills, 
            experience, and career goals.
          </p>
        </div>

        {!resumeUploaded ? (
          /* Upload Section */
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  <span>Upload Your Resume</span>
                </CardTitle>
                <CardDescription>
                  Upload your resume in PDF, DOC, or DOCX format to get personalized job matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">Analyzing Your Resume</h3>
                    <p className="text-gray-600 mb-4">Our AI is extracting skills and experience...</p>
                    <Progress value={65} className="w-full max-w-md mx-auto" />
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors cursor-pointer"
                    onClick={handleResumeUpload}
                  >
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Drop your resume here</h3>
                    <p className="text-gray-600 mb-4">or click to browse files</p>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Smart Matching</h3>
                  <p className="text-sm text-gray-600">AI analyzes your skills and matches with relevant opportunities</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Match Scoring</h3>
                  <p className="text-sm text-gray-600">Get percentage match scores for every job opportunity</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Instant Results</h3>
                  <p className="text-sm text-gray-600">Get job matches within seconds of uploading</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Job Matches</h2>
                <p className="text-gray-600">Found {matches.length} relevant opportunities based on your resume</p>
              </div>
              <Button variant="outline" onClick={() => setResumeUploaded(false)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload New Resume
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {matches.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{job.logo}</div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                          <div className="flex items-center space-x-4 text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Building className="h-4 w-4" />
                              <span>{job.company}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{job.salary}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-lg font-bold px-3 py-1 ${getMatchColor(job.match)}`}>
                          {job.match}% Match
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-1">
                          {job.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.posted}</span>
                          </div>
                          <span>{job.applicants}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
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

export default JobMatch;
