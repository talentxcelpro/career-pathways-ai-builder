
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Star, Users, ArrowLeft, Download, Mail, Calendar, Filter } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";

const AIShortlist = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const shortlist = [
    {
      id: "1",
      name: "Sarah Johnson",
      title: "Senior Full-Stack Developer",
      matchScore: 95,
      aiReason: "Perfect skill match + 6 years experience + strong portfolio",
      avatar: "",
      skills: ["React", "Node.js", "TypeScript", "AWS"],
      experience: "6 years",
      location: "San Francisco, CA",
      status: "Not contacted"
    },
    {
      id: "2",
      name: "Michael Chen",
      title: "Software Engineer",
      matchScore: 88,
      aiReason: "Strong technical skills + previous startup experience",
      avatar: "",
      skills: ["JavaScript", "Python", "Docker", "Kubernetes"],
      experience: "5 years",
      location: "Remote",
      status: "Contacted"
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      title: "Frontend Developer",
      matchScore: 82,
      aiReason: "Excellent UI/UX skills + React expertise",
      avatar: "",
      skills: ["React", "Vue.js", "CSS", "JavaScript"],
      experience: "4 years",
      location: "Austin, TX",
      status: "Interview scheduled"
    }
  ];

  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not contacted': return 'bg-gray-100 text-gray-800';
      case 'Contacted': return 'bg-blue-100 text-blue-800';
      case 'Interview scheduled': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-3xl font-bold text-gray-900">AI Shortlist</h1>
            <p className="text-gray-600">Top candidates selected by AI for your job</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Refine
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Shortlist Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Shortlist Summary
          </CardTitle>
          <CardDescription>
            AI has analyzed and ranked the top candidates based on job requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{shortlist.length}</div>
              <div className="text-sm text-gray-600">Top Candidates</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(shortlist.reduce((acc, c) => acc + c.matchScore, 0) / shortlist.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg Match Score</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {shortlist.filter(c => c.status === 'Not contacted').length}
              </div>
              <div className="text-sm text-gray-600">Not Contacted</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {shortlist.filter(c => c.status === 'Interview scheduled').length}
              </div>
              <div className="text-sm text-gray-600">Interviews</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shortlisted Candidates */}
      <div className="space-y-4">
        {shortlist.map((candidate, index) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedCandidates.includes(candidate.id)}
                    onCheckedChange={() => toggleCandidate(candidate.id)}
                  />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">#{index + 1}</div>
                    <div className="text-xs text-gray-500">Rank</div>
                  </div>
                </div>
                
                <Avatar className="h-16 w-16">
                  <AvatarImage src={candidate.avatar} />
                  <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold">{candidate.name}</h3>
                      <p className="text-gray-600">{candidate.title}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{candidate.matchScore}%</div>
                      <div className="text-sm text-gray-500">AI Match</div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg mb-3">
                    <div className="flex items-start space-x-2">
                      <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-800">AI Analysis</p>
                        <p className="text-sm text-purple-700">{candidate.aiReason}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{candidate.experience}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{candidate.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {candidate.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(candidate.status)}>
                      {candidate.status}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                      <Button size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>
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
                <Button variant="outline">Send Email</Button>
                <Button variant="outline">Schedule Interviews</Button>
                <Button>Move to Pipeline</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate(`/jobs/manage/${id}/smart-recommend`)}>
          View More Recommendations
        </Button>
        <div className="space-x-3">
          <Button variant="outline">Regenerate Shortlist</Button>
          <Button onClick={() => navigate(`/jobs/manage/${id}/applicants`)}>
            View All Applicants
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIShortlist;
