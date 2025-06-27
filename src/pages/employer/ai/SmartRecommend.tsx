
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Star, Users, MapPin, Briefcase, Mail, Phone, ArrowLeft, Filter } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const SmartRecommend = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const recommendations = [
    {
      id: "1",
      name: "Sarah Johnson",
      title: "Senior Full-Stack Developer",
      location: "San Francisco, CA",
      experience: "6 years",
      matchScore: 95,
      avatar: "",
      skills: ["React", "Node.js", "TypeScript", "AWS"],
      summary: "Experienced developer with strong background in modern web technologies",
      availability: "Available immediately",
      source: "TalentXcel Database"
    },
    {
      id: "2",
      name: "Michael Chen",
      title: "Software Engineer",
      location: "Remote",
      experience: "5 years",
      matchScore: 88,
      avatar: "",
      skills: ["JavaScript", "Python", "Docker", "Kubernetes"],
      summary: "Full-stack engineer with DevOps experience",
      availability: "Available in 2 weeks",
      source: "LinkedIn Integration"
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      title: "Frontend Developer",
      location: "Austin, TX",
      experience: "4 years",
      matchScore: 82,
      avatar: "",
      skills: ["React", "Vue.js", "CSS", "JavaScript"],
      summary: "Creative frontend developer with strong UI/UX sensibilities",
      availability: "Open to opportunities",
      source: "GitHub Profile"
    }
  ];

  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => navigate(`/jobs/manage/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Recommendations</h1>
            <p className="text-gray-600">AI-powered candidate matching for your job posting</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button disabled={selectedCandidates.length === 0}>
            Contact Selected ({selectedCandidates.length})
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Matching Insights
          </CardTitle>
          <CardDescription>
            Based on your job requirements, we've analyzed thousands of profiles to find the best matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{recommendations.length}</div>
              <div className="text-sm text-gray-600">Top Matches Found</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(recommendations.reduce((acc, r) => acc + r.matchScore, 0) / recommendations.length)}%
              </div>
              <div className="text-sm text-gray-600">Average Match Score</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Data Sources</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Candidates */}
      <div className="space-y-4">
        {recommendations.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={candidate.avatar} />
                      <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <Badge className={`absolute -top-2 -right-2 px-1 py-0 text-xs ${getMatchScoreColor(candidate.matchScore)}`}>
                      {candidate.matchScore}%
                    </Badge>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-xl font-semibold">{candidate.name}</h3>
                      <Badge variant="outline">{candidate.source}</Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{candidate.title}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {candidate.location}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {candidate.experience}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{candidate.summary}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {candidate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-sm text-green-600 font-medium">{candidate.availability}</p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    variant={selectedCandidates.includes(candidate.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCandidate(candidate.id)}
                  >
                    {selectedCandidates.includes(candidate.id) ? "Selected" : "Select"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                  <Button variant="ghost" size="sm">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedCandidates.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Bulk Actions</h3>
                <p className="text-sm text-gray-600">{selectedCandidates.length} candidates selected</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">Send Message</Button>
                <Button variant="outline">Schedule Interview</Button>
                <Button>Contact All</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartRecommend;
