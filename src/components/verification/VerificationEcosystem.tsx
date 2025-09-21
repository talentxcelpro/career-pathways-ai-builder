import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Shield, Award, Building2, GraduationCap, User, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Verification {
  id: string;
  type: 'education' | 'experience' | 'skill' | 'certification';
  title: string;
  issuer: string;
  status: 'verified' | 'pending' | 'expired' | 'rejected';
  verifiedDate?: string;
  expiryDate?: string;
  blockchainHash?: string;
}

export const VerificationEcosystem: React.FC = () => {
  const [verifications] = useState<Verification[]>([
    {
      id: '1',
      type: 'education',
      title: 'Bachelor of Computer Science',
      issuer: 'MIT',
      status: 'verified',
      verifiedDate: '2024-01-15',
      blockchainHash: '0x1a2b3c4d...'
    },
    {
      id: '2',
      type: 'certification',
      title: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      status: 'verified',
      verifiedDate: '2024-03-10',
      expiryDate: '2027-03-10',
      blockchainHash: '0x5e6f7g8h...'
    },
    {
      id: '3',
      type: 'experience',
      title: 'Senior Developer at Google',
      issuer: 'Google Inc.',
      status: 'pending',
      verifiedDate: '2024-02-20'
    },
    {
      id: '4',
      type: 'skill',
      title: 'React Development',
      issuer: 'TalentXcel Skills Assessment',
      status: 'verified',
      verifiedDate: '2024-03-25',
      blockchainHash: '0x9i0j1k2l...'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      case 'rejected': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'education': return <GraduationCap className="h-5 w-5" />;
      case 'experience': return <Building2 className="h-5 w-5" />;
      case 'certification': return <Award className="h-5 w-5" />;
      case 'skill': return <User className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const verifiedCount = verifications.filter(v => v.status === 'verified').length;
  const verificationScore = Math.round((verifiedCount / verifications.length) * 100);

  return (
    <div className="space-y-6">
      {/* Verification Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verification Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Verification</span>
              <span className="text-2xl font-bold text-primary">{verificationScore}%</span>
            </div>
            <Progress value={verificationScore} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
                <div className="text-xs text-muted-foreground">Verified</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {verifications.filter(v => v.status === 'pending').length}
                </div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verifications List */}
      <Card>
        <CardHeader>
          <CardTitle>My Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="certification">Certs</TabsTrigger>
              <TabsTrigger value="skill">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {verifications.map((verification) => (
                <div key={verification.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-primary">
                        {getTypeIcon(verification.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{verification.title}</h4>
                        <p className="text-sm text-muted-foreground">{verification.issuer}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(verification.status)} text-white`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(verification.status)}
                        {verification.status}
                      </span>
                    </Badge>
                  </div>

                  {verification.blockchainHash && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Blockchain Hash: </span>
                      <code className="bg-muted px-2 py-1 rounded">{verification.blockchainHash}</code>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    {verification.verifiedDate && (
                      <span>Verified: {verification.verifiedDate}</span>
                    )}
                    {verification.expiryDate && (
                      <span>Expires: {verification.expiryDate}</span>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            {['education', 'experience', 'certification', 'skill'].map((type) => (
              <TabsContent key={type} value={type} className="space-y-4 mt-4">
                {verifications
                  .filter(v => v.type === type)
                  .map((verification) => (
                    <div key={verification.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-primary">
                            {getTypeIcon(verification.type)}
                          </div>
                          <div>
                            <h4 className="font-medium">{verification.title}</h4>
                            <p className="text-sm text-muted-foreground">{verification.issuer}</p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(verification.status)} text-white`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(verification.status)}
                            {verification.status}
                          </span>
                        </Badge>
                      </div>

                      {verification.blockchainHash && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Blockchain Hash: </span>
                          <code className="bg-muted px-2 py-1 rounded">{verification.blockchainHash}</code>
                        </div>
                      )}
                    </div>
                  ))}
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6 space-y-2">
            <Button className="w-full" variant="outline">
              <Award className="h-4 w-4 mr-2" />
              Add New Verification
            </Button>
            <Button className="w-full" variant="secondary">
              <Shield className="h-4 w-4 mr-2" />
              Request Employer Verification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};