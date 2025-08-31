import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Share2, 
  Heart,
  MessageSquare,
  Eye,
  ThumbsUp,
  Send,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SocialSectionProps {
  userId?: string;
  userProfile?: any;
  isOwner?: boolean;
}

export function SocialSection({ 
  userId, 
  userProfile, 
  isOwner = true 
}: SocialSectionProps) {
  const [activeTab, setActiveTab] = useState('connections');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Sample social data - in real app, this would come from backend
  const connections = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      avatar: '/placeholder.svg',
      status: 'connected',
      mutualConnections: 5,
      lastInteraction: '2 days ago'
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Product Manager',
      company: 'StartupXYZ',
      avatar: '/placeholder.svg',
      status: 'connected',
      mutualConnections: 12,
      lastInteraction: '1 week ago'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      title: 'UX Designer',
      company: 'Design Studio',
      avatar: '/placeholder.svg',
      status: 'pending',
      mutualConnections: 3,
      requestSent: '3 days ago'
    }
  ];

  const socialActivity = [
    {
      id: 1,
      type: 'profile_view',
      user: 'Alex Thompson',
      avatar: '/placeholder.svg',
      action: 'viewed your profile',
      time: '2 hours ago',
      company: 'InnovateCorp'
    },
    {
      id: 2,
      type: 'connection_request',
      user: 'Lisa Park',
      avatar: '/placeholder.svg',
      action: 'sent you a connection request',
      time: '5 hours ago',
      company: 'DataFlow Inc'
    },
    {
      id: 3,
      type: 'passport_share',
      user: 'David Kumar',
      avatar: '/placeholder.svg',
      action: 'shared your career passport',
      time: '1 day ago',
      company: 'CloudTech'
    },
    {
      id: 4,
      type: 'achievement_like',
      user: 'Rachel Adams',
      avatar: '/placeholder.svg',
      action: 'liked your certification achievement',
      time: '2 days ago',
      company: 'SkillBuilder'
    }
  ];

  const networkSuggestions = [
    {
      id: 1,
      name: 'James Wilson',
      title: 'Tech Lead',
      company: 'Future Systems',
      avatar: '/placeholder.svg',
      reason: 'Works in similar role',
      mutualConnections: 8
    },
    {
      id: 2,
      name: 'Maria Garcia',
      title: 'Engineering Manager',
      company: 'TechFlow',
      avatar: '/placeholder.svg',
      reason: 'Same company background',
      mutualConnections: 4
    },
    {
      id: 3,
      name: 'Robert Singh',
      title: 'Senior Developer',
      company: 'CodeCraft',
      avatar: '/placeholder.svg',
      reason: 'Similar skills and experience',
      mutualConnections: 6
    }
  ];

  const handleConnect = (personId: number) => {
    toast.success('Connection request sent!');
  };

  const handleMessage = (personId: number) => {
    navigate(`/messages/${personId}`);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'profile_view': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'connection_request': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'passport_share': return <Share2 className="w-4 h-4 text-purple-500" />;
      case 'achievement_like': return <ThumbsUp className="w-4 h-4 text-red-500" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'declined': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Social Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Connections</p>
                <p className="text-2xl font-bold text-blue-800">{connections.filter(c => c.status === 'connected').length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Profile Views</p>
                <p className="text-2xl font-bold text-green-800">
                  {socialActivity.filter(a => a.type === 'profile_view').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Shares</p>
                <p className="text-2xl font-bold text-purple-800">
                  {socialActivity.filter(a => a.type === 'passport_share').length}
                </p>
              </div>
              <Share2 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Engagement</p>
                <p className="text-2xl font-bold text-orange-800">
                  {socialActivity.filter(a => a.type === 'achievement_like').length}
                </p>
              </div>
              <Heart className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'connections' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('connections')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              My Network
            </Button>
            <Button
              variant={activeTab === 'activity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('activity')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Activity
            </Button>
            <Button
              variant={activeTab === 'suggestions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('suggestions')}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Network ({connections.filter(c => c.status === 'connected').length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
                <Button size="sm" variant="outline">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredConnections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={connection.avatar} />
                      <AvatarFallback>{connection.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900">{connection.name}</h4>
                      <p className="text-sm text-gray-600">{connection.title} at {connection.company}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge className={getStatusColor(connection.status)}>
                          {connection.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {connection.mutualConnections} mutual connections
                        </span>
                        {connection.lastInteraction && (
                          <span className="text-xs text-gray-500">
                            Last: {connection.lastInteraction}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connection.status === 'connected' ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleMessage(connection.id)}>
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </>
                    ) : connection.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600">Pending</span>
                        <Button size="sm" variant="outline">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => handleConnect(connection.id)}>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {socialActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar>
                    <AvatarImage src={activity.avatar} />
                    <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <span className="font-medium text-gray-900">{activity.user}</span>
                      <span className="text-gray-600">{activity.action}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{activity.time}</span>
                      <span>{activity.company}</span>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      {activity.type === 'connection_request' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button size="sm" variant="outline">
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {activity.type === 'profile_view' && (
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              People You May Know
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {networkSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarImage src={suggestion.avatar} />
                      <AvatarFallback>{suggestion.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-gray-900 mb-1">{suggestion.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {suggestion.title} at {suggestion.company}
                    </p>
                    <Badge variant="outline" className="text-xs mb-3">
                      {suggestion.reason}
                    </Badge>
                    <p className="text-xs text-gray-500 mb-4">
                      {suggestion.mutualConnections} mutual connections
                    </p>
                    {isOwner && (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleConnect(suggestion.id)}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Connect
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}