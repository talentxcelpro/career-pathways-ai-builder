import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserPlus, MessageCircle, Briefcase, Star, TrendingUp, Network } from 'lucide-react';
import { toast } from 'sonner';

interface NetworkLead {
  id: string;
  name: string;
  title: string;
  company: string;
  connectionLevel: number; // 1st, 2nd, 3rd degree
  mutualConnections: number;
  potentialService: string;
  leadScore: number;
  avatar?: string;
  isServiceProvider: boolean;
  skills: string[];
}

interface NetworkStats {
  totalConnections: number;
  serviceProviders: number;
  potentialLeads: number;
  referralOpportunities: number;
}

interface NetworkIntegrationProps {
  userProfile?: any;
  onContactLead: (leadId: string) => void;
  onServiceInquiry: (leadId: string, serviceType: string) => void;
}

export const NetworkIntegration: React.FC<NetworkIntegrationProps> = ({
  userProfile,
  onContactLead,
  onServiceInquiry
}) => {
  const [networkLeads, setNetworkLeads] = useState<NetworkLead[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalConnections: 0,
    serviceProviders: 0,
    potentialLeads: 0,
    referralOpportunities: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      analyzeNetworkForLeads();
    }
  }, [userProfile]);

  const analyzeNetworkForLeads = async () => {
    try {
      setLoading(true);

      // Fetch user's connections
      const { data: connections, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(id, full_name, title, avatar_url),
          recipient:profiles!connections_recipient_id_fkey(id, full_name, title, avatar_url)
        `)
        .or(`requester_id.eq.${userProfile.id},recipient_id.eq.${userProfile.id}`)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;

      // Process connections to identify potential leads
      const leads = await processConnectionsForLeads(connections || []);
      setNetworkLeads(leads);

      // Calculate network stats
      const stats = calculateNetworkStats(connections || [], leads);
      setNetworkStats(stats);

    } catch (error) {
      console.error('Error analyzing network:', error);
      toast.error('Failed to analyze network for leads');
    } finally {
      setLoading(false);
    }
  };

  const processConnectionsForLeads = async (connections: any[]): Promise<NetworkLead[]> => {
    const leads: NetworkLead[] = [];

    for (const connection of connections) {
      const isRequester = connection.requester_id === userProfile.id;
      const contactProfile = isRequester ? connection.recipient : connection.requester;

      if (!contactProfile) continue;

      // Check if this contact could be a service provider or lead
      const leadInfo = await analyzeContactForServiceOpportunity(contactProfile);
      
      if (leadInfo.leadScore > 30) { // Only include promising leads
        leads.push({
          id: contactProfile.id,
          name: contactProfile.full_name || 'Unknown',
          title: contactProfile.title || 'Professional',
          company: contactProfile.company || 'Unknown Company',
          connectionLevel: 1, // Direct connection
          mutualConnections: Math.floor(Math.random() * 15) + 1, // Mock data
          potentialService: leadInfo.potentialService,
          leadScore: leadInfo.leadScore,
          avatar: contactProfile.avatar_url,
          isServiceProvider: leadInfo.isServiceProvider,
          skills: leadInfo.skills
        });
      }
    }

    // Add some 2nd degree connections (mock data for demo)
    const secondDegreeLeads = generateSecondDegreeLeads();
    leads.push(...secondDegreeLeads);

    return leads.sort((a, b) => b.leadScore - a.leadScore).slice(0, 10);
  };

  const analyzeContactForServiceOpportunity = async (profile: any) => {
    // Analyze profile to determine service opportunity potential
    const title = (profile.title || '').toLowerCase();
    const company = (profile.company || '').toLowerCase();
    
    let potentialService = '';
    let leadScore = 0;
    let isServiceProvider = false;
    let skills: string[] = [];

    // Service provider detection
    if (title.includes('recruiter') || title.includes('hr') || title.includes('talent')) {
      potentialService = 'Recruitment Services';
      leadScore += 40;
      isServiceProvider = true;
      skills = ['Recruitment', 'HR', 'Talent Acquisition'];
    } else if (title.includes('coach') || title.includes('mentor') || title.includes('consultant')) {
      potentialService = 'Career Coaching';
      leadScore += 35;
      isServiceProvider = true;
      skills = ['Coaching', 'Mentoring', 'Consulting'];
    } else if (title.includes('designer') || title.includes('developer') || title.includes('engineer')) {
      potentialService = 'Technical Services';
      leadScore += 30;
      isServiceProvider = true;
      skills = ['Design', 'Development', 'Engineering'];
    } else if (title.includes('writer') || title.includes('content') || title.includes('marketing')) {
      potentialService = 'Content & Marketing';
      leadScore += 25;
      isServiceProvider = true;
      skills = ['Writing', 'Content Creation', 'Marketing'];
    }

    // Lead potential (people who might need services)
    if (title.includes('student') || title.includes('graduate') || title.includes('junior')) {
      potentialService = potentialService || 'Resume & Interview Services';
      leadScore += 25;
      skills = skills.length > 0 ? skills : ['Early Career', 'Skill Development'];
    } else if (title.includes('manager') || title.includes('director') || title.includes('senior')) {
      potentialService = potentialService || 'Executive Coaching';
      leadScore += 20;
      skills = skills.length > 0 ? skills : ['Leadership', 'Management'];
    }

    // Company-based scoring
    if (company.includes('tech') || company.includes('software') || company.includes('startup')) {
      leadScore += 15;
    }

    // Base score for all connections
    leadScore += 10;

    return {
      potentialService: potentialService || 'General Services',
      leadScore: Math.min(leadScore, 100),
      isServiceProvider,
      skills
    };
  };

  const generateSecondDegreeLeads = (): NetworkLead[] => {
    // Mock 2nd degree connections for demo
    return [
      {
        id: 'mock-1',
        name: 'Sarah Chen',
        title: 'Senior Recruiter',
        company: 'TechCorp Solutions',
        connectionLevel: 2,
        mutualConnections: 3,
        potentialService: 'Recruitment Services',
        leadScore: 85,
        isServiceProvider: true,
        skills: ['Technical Recruiting', 'Talent Sourcing', 'Interview Coordination']
      },
      {
        id: 'mock-2',
        name: 'Michael Rodriguez',
        title: 'Career Coach',
        company: 'Professional Growth Inc',
        connectionLevel: 2,
        mutualConnections: 2,
        potentialService: 'Career Coaching',
        leadScore: 78,
        isServiceProvider: true,
        skills: ['Career Development', 'Leadership Coaching', 'Resume Review']
      }
    ];
  };

  const calculateNetworkStats = (connections: any[], leads: NetworkLead[]): NetworkStats => {
    return {
      totalConnections: connections.length,
      serviceProviders: leads.filter(lead => lead.isServiceProvider).length,
      potentialLeads: leads.length,
      referralOpportunities: leads.filter(lead => lead.leadScore > 70).length
    };
  };

  const getConnectionLevelBadge = (level: number) => {
    switch (level) {
      case 1: return <Badge className="bg-green-100 text-green-800">1st</Badge>;
      case 2: return <Badge className="bg-blue-100 text-blue-800">2nd</Badge>;
      case 3: return <Badge className="bg-gray-100 text-gray-800">3rd</Badge>;
      default: return <Badge variant="outline">{level}th</Badge>;
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Lead Generation
          </CardTitle>
          <CardDescription>
            Leverage your existing network to find potential service providers and clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{networkStats.totalConnections}</div>
              <div className="text-sm text-gray-600">Total Connections</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Briefcase className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{networkStats.serviceProviders}</div>
              <div className="text-sm text-gray-600">Service Providers</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{networkStats.potentialLeads}</div>
              <div className="text-sm text-gray-600">Potential Leads</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{networkStats.referralOpportunities}</div>
              <div className="text-sm text-gray-600">High-Quality Leads</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Leads */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Network-Based Service Opportunities</h3>
        
        {networkLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={lead.avatar} alt={lead.name} />
                  <AvatarFallback>
                    {lead.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-semibold">{lead.name}</h4>
                      <p className="text-gray-600">{lead.title} at {lead.company}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Lead Score</div>
                      <div className={`text-xl font-bold ${getLeadScoreColor(lead.leadScore)}`}>
                        {lead.leadScore}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    {getConnectionLevelBadge(lead.connectionLevel)}
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {lead.mutualConnections} mutual connections
                    </span>
                    {lead.isServiceProvider && (
                      <Badge className="bg-green-100 text-green-800">Service Provider</Badge>
                    )}
                  </div>

                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Potential Service: </span>
                    <span className="text-sm text-blue-600 font-medium">{lead.potentialService}</span>
                  </div>

                  {lead.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {lead.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Progress value={lead.leadScore} className="mb-4" />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onContactLead(lead.id)}
                      className="flex items-center gap-1"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Connect
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onServiceInquiry(lead.id, lead.potentialService)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Inquire About Services
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {networkLeads.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Network Leads Found
              </h3>
              <p className="text-gray-600">
                Connect with more professionals to discover service opportunities in your network.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};