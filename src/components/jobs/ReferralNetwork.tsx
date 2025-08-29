import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, MessageCircle, Linkedin, Send, Search, Star } from "lucide-react";
import { useQuery } from '@tanstack/react-query';

interface Connection {
  id: string;
  name: string;
  job_title: string;
  company: string;
  avatar_url?: string;
  connection_type: 'employee' | 'referrer' | 'mentor';
  linkedin_url?: string;
  bio: string;
  skills: string[];
  years_at_company: number;
  response_rate: number;
  is_available: boolean;
}

interface ReferralNetworkProps {
  companyId?: string;
  targetRole?: string;
}

export const ReferralNetwork: React.FC<ReferralNetworkProps> = ({ companyId, targetRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'employee' | 'referrer' | 'mentor'>('all');

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['referral-network', companyId, targetRole],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        {
          id: '1',
          name: 'Sarah Chen',
          job_title: 'Senior Software Engineer',
          company: 'TechCorp',
          avatar_url: '',
          connection_type: 'employee' as const,
          linkedin_url: 'https://linkedin.com/in/sarahchen',
          bio: 'Full-stack developer with 5 years experience. Happy to help with technical questions.',
          skills: ['React', 'Node.js', 'Python', 'AWS'],
          years_at_company: 3,
          response_rate: 85,
          is_available: true
        },
        {
          id: '2',
          name: 'Michael Rodriguez',
          job_title: 'Engineering Manager',
          company: 'TechCorp',
          avatar_url: '',
          connection_type: 'referrer' as const,
          linkedin_url: 'https://linkedin.com/in/mrodriguez',
          bio: 'Engineering leader passionate about building great teams. Can provide referrals for strong candidates.',
          skills: ['Leadership', 'System Design', 'Mentoring'],
          years_at_company: 5,
          response_rate: 92,
          is_available: true
        },
        {
          id: '3',
          name: 'Emily Johnson',
          job_title: 'Senior Product Manager',
          company: 'TechCorp',
          avatar_url: '',
          connection_type: 'mentor' as const,
          linkedin_url: 'https://linkedin.com/in/emilyjohnson',
          bio: 'Product strategy expert. Available for career guidance and interview preparation.',
          skills: ['Product Strategy', 'User Research', 'Data Analysis'],
          years_at_company: 4,
          response_rate: 78,
          is_available: false
        }
      ];
    }
  });

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connection.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connection.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || connection.connection_type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleConnect = (connection: Connection) => {
    // In a real app, this would open a messaging interface or send a connection request
    console.log('Connecting with:', connection.name);
  };

  const renderConnectionTypeIcon = (type: string) => {
    switch (type) {
      case 'employee':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'referrer':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'mentor':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getConnectionTypeBadge = (type: string) => {
    const types = {
      employee: { label: 'Employee', className: 'bg-blue-100 text-blue-800' },
      referrer: { label: 'Referrer', className: 'bg-yellow-100 text-yellow-800' },
      mentor: { label: 'Mentor', className: 'bg-green-100 text-green-800' }
    };
    return types[type as keyof typeof types] || { label: 'Connection', className: 'bg-gray-100 text-gray-800' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Referral Network & Connections
        </CardTitle>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, role, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'employee', 'referrer', 'mentor'].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type as any)}
                className="capitalize"
              >
                {type === 'all' ? 'All' : type}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredConnections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div>No connections found matching your criteria</div>
              <div className="text-sm">Try adjusting your search or filters</div>
            </div>
          ) : (
            filteredConnections.map((connection) => {
              const typeBadge = getConnectionTypeBadge(connection.connection_type);
              return (
                <div key={connection.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={connection.avatar_url} alt={connection.name} />
                      <AvatarFallback>
                        {connection.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{connection.name}</h3>
                          <p className="text-sm text-gray-600">{connection.job_title}</p>
                          <p className="text-sm text-gray-500">{connection.company} • {connection.years_at_company} years</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={typeBadge.className}>
                            {renderConnectionTypeIcon(connection.connection_type)}
                            <span className="ml-1">{typeBadge.label}</span>
                          </Badge>
                          {connection.is_available && (
                            <Badge className="bg-green-100 text-green-800">
                              Available
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mt-2">{connection.bio}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {connection.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {connection.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{connection.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                          {connection.response_rate}% response rate
                        </div>
                        <div className="flex items-center gap-2">
                          {connection.linkedin_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={connection.linkedin_url} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            onClick={() => handleConnect(connection)}
                            disabled={!connection.is_available}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};