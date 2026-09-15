
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  ArrowLeft, 
  MessageSquare,
  Building,
  MapPin,
  Star,
  UserPlus,
  Mail,
  Linkedin,
  Twitter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NetworkConnection {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  industry: string;
  connectionScore: number;
  mutualConnections: number;
  avatar: string;
  canConnect: boolean;
  platforms: string[];
}

const NetworkBuilder = () => {
  const navigate = useNavigate();
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [connections, setConnections] = useState<NetworkConnection[]>([]);

  const findConnections = async () => {
    if (!industry || !role) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSearching(true);
    
    // Simulate AI-powered connection discovery
    setTimeout(() => {
      const mockConnections: NetworkConnection[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          title: 'Senior Product Manager',
          company: 'Google',
          location: 'San Francisco, CA',
          industry: 'Technology',
          connectionScore: 95,
          mutualConnections: 12,
          avatar: '/api/placeholder/40/40',
          canConnect: true,
          platforms: ['LinkedIn', 'Twitter']
        },
        {
          id: '2',
          name: 'Marcus Johnson',
          title: 'VP of Engineering',
          company: 'Stripe',
          location: 'New York, NY',
          industry: 'Fintech',
          connectionScore: 88,
          mutualConnections: 8,
          avatar: '/api/placeholder/40/40',
          canConnect: true,
          platforms: ['LinkedIn']
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          title: 'Design Director',
          company: 'Airbnb',
          location: 'Austin, TX',
          industry: 'Technology',
          connectionScore: 92,
          mutualConnections: 15,
          avatar: '/api/placeholder/40/40',
          canConnect: true,
          platforms: ['LinkedIn', 'Twitter', 'Behance']
        },
        {
          id: '4',
          name: 'David Kim',
          title: 'Principal Engineer',
          company: 'Microsoft',
          location: 'Seattle, WA',
          industry: 'Technology',
          connectionScore: 85,
          mutualConnections: 6,
          avatar: '/api/placeholder/40/40',
          canConnect: true,
          platforms: ['LinkedIn', 'GitHub']
        },
        {
          id: '5',
          name: 'Lisa Thompson',
          title: 'Head of Marketing',
          company: 'Shopify',
          location: 'Toronto, ON',
          industry: 'E-commerce',
          connectionScore: 90,
          mutualConnections: 10,
          avatar: '/api/placeholder/40/40',
          canConnect: true,
          platforms: ['LinkedIn', 'Twitter']
        }
      ];

      setConnections(mockConnections);
      setIsSearching(false);
      toast.success('Found strategic networking opportunities!');
    }, 2500);
  };

  const handleConnect = (connectionId: string) => {
    toast.success('Connection request sent!');
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, canConnect: false }
          : conn
      )
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    return 'text-orange-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'LinkedIn': return <Linkedin className="h-4 w-4" />;
      case 'Twitter': return <Twitter className="h-4 w-4" />;
      case 'GitHub': return <Mail className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
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
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Network Builder</h1>
              <p className="text-gray-600">Build strategic professional connections with AI-powered recommendations</p>
            </div>
          </div>
        </div>

        {connections.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Search Form */}
            <Card>
              <CardHeader>
                <CardTitle>Find Your Network</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isSearching ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">Finding Connections</h3>
                    <p className="text-gray-600">AI is discovering strategic networking opportunities...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Target Industry *</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Target Role *</Label>
                      <Input
                        id="role"
                        placeholder="e.g., Product Manager, Engineer, Designer"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Preferred Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., San Francisco, Remote, Global"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <Button 
                      onClick={findConnections}
                      className="w-full"
                      disabled={!industry || !role}
                    >
                      Find Strategic Connections
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why Strategic Networking?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <UserPlus className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Quality Connections</h4>
                    <p className="text-sm text-gray-600">AI identifies high-value connections in your field</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Conversation Starters</h4>
                    <p className="text-sm text-gray-600">Get personalized message templates for outreach</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Industry Insights</h4>
                    <p className="text-sm text-gray-600">Connect with thought leaders and industry experts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Career Growth</h4>
                    <p className="text-sm text-gray-600">Build relationships that advance your career</p>
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
                <h2 className="text-2xl font-bold text-gray-900">Strategic Connections Found</h2>
                <p className="text-gray-600">AI-recommended professionals for your network</p>
              </div>
              <Button variant="outline" onClick={() => setConnections([])}>
                New Search
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connections.map((connection) => (
                <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={connection.avatar} alt={connection.name} />
                        <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{connection.name}</h3>
                          <Badge className={getScoreBadgeColor(connection.connectionScore)}>
                            {connection.connectionScore}% Match
                          </Badge>
                        </div>
                        
                        <p className="text-sm font-medium text-gray-700 mb-1">{connection.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Building className="h-4 w-4" />
                          <span>{connection.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <MapPin className="h-4 w-4" />
                          <span>{connection.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <Users className="h-4 w-4" />
                          <span>{connection.mutualConnections} mutual connections</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          {connection.platforms.map((platform, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                              {getPlatformIcon(platform)}
                              <span>{platform}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleConnect(connection.id)}
                            disabled={!connection.canConnect}
                            className="flex-1"
                          >
                            {connection.canConnect ? (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Connect
                              </>
                            ) : (
                              'Request Sent'
                            )}
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
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

export default NetworkBuilder;
