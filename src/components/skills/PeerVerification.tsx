import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserCheck, 
  MessageCircle, 
  Star,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface VerificationRequest {
  id: string;
  requesterName: string;
  requesterAvatar: string;
  requesterTitle: string;
  skill: string;
  message: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  workHistory?: string;
}

interface PeerEndorsement {
  id: string;
  endorserName: string;
  endorserAvatar: string;
  endorserTitle: string;
  skill: string;
  message: string;
  rating: number;
  endorsedAt: string;
  relationship: string;
}

export const PeerVerification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'endorsements' | 'give'>('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [newEndorsement, setNewEndorsement] = useState({
    person: '',
    skill: '',
    message: '',
    rating: 5
  });

  // Mock data
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([
    {
      id: '1',
      requesterName: 'Sarah Chen',
      requesterAvatar: '/api/placeholder/40/40',
      requesterTitle: 'Frontend Developer',
      skill: 'React.js',
      message: 'Hi! We worked together on the e-commerce project. Could you verify my React skills?',
      requestedAt: '2024-01-15',
      status: 'pending',
      workHistory: 'Worked together at TechCorp (2023-2024)'
    },
    {
      id: '2',
      requesterName: 'Mike Johnson',
      requesterAvatar: '/api/placeholder/40/40',
      requesterTitle: 'Full Stack Developer',
      skill: 'Node.js',
      message: 'We collaborated on the API development. Can you endorse my Node.js expertise?',
      requestedAt: '2024-01-12',
      status: 'pending'
    }
  ]);

  const [endorsements, setEndorsements] = useState<PeerEndorsement[]>([
    {
      id: '1',
      endorserName: 'Alex Rodriguez',
      endorserAvatar: '/api/placeholder/40/40',
      endorserTitle: 'Senior Developer',
      skill: 'TypeScript',
      message: 'Excellent TypeScript skills. Clean, well-typed code and great attention to detail.',
      rating: 5,
      endorsedAt: '2024-01-10',
      relationship: 'Former Colleague'
    },
    {
      id: '2',
      endorserName: 'Emily Davis',
      endorserAvatar: '/api/placeholder/40/40',
      endorserTitle: 'Tech Lead',
      skill: 'React.js',
      message: 'Outstanding React developer. Delivers high-quality components and follows best practices.',
      rating: 5,
      endorsedAt: '2024-01-08',
      relationship: 'Direct Manager'
    }
  ]);

  const handleVerificationResponse = (requestId: string, approved: boolean) => {
    setVerificationRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: approved ? 'approved' : 'rejected' }
          : req
      )
    );
    
    toast.success(approved ? 'Verification approved!' : 'Verification declined');
  };

  const handleSendEndorsement = () => {
    if (!newEndorsement.person || !newEndorsement.skill || !newEndorsement.message) {
      toast.error('Please fill in all fields');
      return;
    }

    // In reality, this would send to an API
    toast.success(`Endorsement sent to ${newEndorsement.person}!`);
    setNewEndorsement({ person: '', skill: '', message: '', rating: 5 });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'requests', label: 'Verification Requests', icon: MessageCircle },
          { key: 'endorsements', label: 'My Endorsements', icon: UserCheck },
          { key: 'give', label: 'Give Endorsement', icon: Users }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Verification Requests Tab */}
      {activeTab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Pending Verification Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verificationRequests.filter(req => req.status === 'pending').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending verification requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verificationRequests
                  .filter(req => req.status === 'pending')
                  .map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={request.requesterAvatar} />
                            <AvatarFallback>
                              {request.requesterName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{request.requesterName}</h4>
                              <Badge variant="secondary">{request.skill}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{request.requesterTitle}</p>
                            {request.workHistory && (
                              <p className="text-xs text-blue-600">{request.workHistory}</p>
                            )}
                            <p className="text-sm">{request.message}</p>
                            <p className="text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleVerificationResponse(request.id, true)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerificationResponse(request.id, false)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Endorsements Tab */}
      {activeTab === 'endorsements' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Endorsements Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {endorsements.map((endorsement) => (
                <Card key={endorsement.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={endorsement.endorserAvatar} />
                        <AvatarFallback>
                          {endorsement.endorserName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{endorsement.endorserName}</h4>
                          <Badge variant="secondary">{endorsement.skill}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{endorsement.endorserTitle}</p>
                        <p className="text-xs text-blue-600">{endorsement.relationship}</p>
                        <div className="flex items-center gap-1">
                          {renderStars(endorsement.rating)}
                        </div>
                        <p className="text-sm">{endorsement.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(endorsement.endorsedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Give Endorsement Tab */}
      {activeTab === 'give' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Endorse Someone's Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Person to Endorse</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={newEndorsement.person}
                    onChange={(e) => setNewEndorsement(prev => ({ ...prev, person: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Skill</label>
                <Input
                  placeholder="e.g., React.js, Python, Leadership"
                  value={newEndorsement.skill}
                  onChange={(e) => setNewEndorsement(prev => ({ ...prev, skill: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setNewEndorsement(prev => ({ ...prev, rating: i + 1 }))}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        i < newEndorsement.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {newEndorsement.rating}/5
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Endorsement Message</label>
              <Textarea
                placeholder="Describe their skills and how you've worked with them..."
                value={newEndorsement.message}
                onChange={(e) => setNewEndorsement(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
              />
            </div>

            <Button onClick={handleSendEndorsement} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Endorsement
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};