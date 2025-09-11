import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { 
  Award, 
  Calendar, 
  ExternalLink, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  BookOpen,
  Star,
  Target,
  Download,
  Share2,
  Users,
  Zap,
  Crown,
  Shield
} from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  status: 'active' | 'expired' | 'revoked';
  verification_status: 'verified' | 'pending' | 'unverified';
  skill_areas: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  user_id: string;
}

interface CertificationGoal {
  id: string;
  certification_name: string;
  target_date: string;
  progress: number;
  status: 'planning' | 'studying' | 'scheduled' | 'completed';
  study_resources: string[];
  user_id: string;
}

interface CertificationProvider {
  name: string;
  logo: string;
  categories: string[];
  popular_certs: { name: string; level: string; duration: string }[];
}

export const CertificationTracker: React.FC = () => {
  const user = useUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [certForm, setCertForm] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: '',
    description: '',
    skill_areas: [] as string[],
    difficulty_level: 'intermediate' as const
  });

  // Popular certification providers
  const certProviders: CertificationProvider[] = [
    {
      name: 'AWS',
      logo: '/logos/aws.png',
      categories: ['Cloud', 'DevOps', 'Data'],
      popular_certs: [
        { name: 'AWS Solutions Architect', level: 'Associate', duration: '3 months' },
        { name: 'AWS Developer', level: 'Associate', duration: '2 months' },
        { name: 'AWS SysOps Administrator', level: 'Associate', duration: '2 months' }
      ]
    },
    {
      name: 'Google Cloud',
      logo: '/logos/gcp.png',
      categories: ['Cloud', 'Data', 'AI/ML'],
      popular_certs: [
        { name: 'GCP Professional Cloud Architect', level: 'Professional', duration: '4 months' },
        { name: 'GCP Associate Cloud Engineer', level: 'Associate', duration: '2 months' },
        { name: 'GCP Professional Data Engineer', level: 'Professional', duration: '3 months' }
      ]
    },
    {
      name: 'Microsoft',
      logo: '/logos/microsoft.png',
      categories: ['Cloud', 'Development', 'Data'],
      popular_certs: [
        { name: 'Azure Solutions Architect Expert', level: 'Expert', duration: '4 months' },
        { name: 'Azure Developer Associate', level: 'Associate', duration: '3 months' },
        { name: 'Azure Data Engineer Associate', level: 'Associate', duration: '3 months' }
      ]
    },
    {
      name: 'Kubernetes',
      logo: '/logos/kubernetes.png',
      categories: ['DevOps', 'Cloud'],
      popular_certs: [
        { name: 'Certified Kubernetes Administrator', level: 'Professional', duration: '2 months' },
        { name: 'Certified Kubernetes Application Developer', level: 'Professional', duration: '2 months' }
      ]
    }
  ];

  // Fetch user certifications
  const { data: certifications = [] } = useQuery({
    queryKey: ['certifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false });
      
      if (error) throw error;
      return data as Certification[];
    },
    enabled: !!user?.id
  });

  // Fetch certification goals
  const { data: goals = [] } = useQuery({
    queryKey: ['certification-goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('certification_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('target_date', { ascending: true });
      
      if (error) throw error;
      return data as CertificationGoal[];
    },
    enabled: !!user?.id
  });

  // Add certification mutation
  const addCertificationMutation = useMutation({
    mutationFn: async (cert: typeof certForm) => {
      const { data, error } = await supabase
        .from('certifications')
        .insert({
          ...cert,
          user_id: user?.id,
          status: 'active',
          verification_status: 'unverified'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
      toast.success('Certification added successfully!');
      setIsAddingCert(false);
      setCertForm({
        name: '',
        issuing_organization: '',
        issue_date: '',
        expiry_date: '',
        credential_id: '',
        credential_url: '',
        description: '',
        skill_areas: [],
        difficulty_level: 'intermediate'
      });
    }
  });

  const activeCerts = certifications.filter(c => c.status === 'active');
  const expiringSoon = certifications.filter(c => {
    if (!c.expiry_date) return false;
    const expiryDate = new Date(c.expiry_date);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow && c.status === 'active';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'revoked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600';
      case 'intermediate': return 'text-blue-600';
      case 'advanced': return 'text-orange-600';
      case 'expert': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleAddCertification = () => {
    addCertificationMutation.mutate(certForm);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certification Tracker</h1>
          <p className="text-muted-foreground">Manage your professional certifications and career goals</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Certifications</p>
                <p className="text-2xl font-bold">{activeCerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">{expiringSoon.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Goals in Progress</p>
                <p className="text-2xl font-bold">{goals.filter(g => g.status !== 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Year</p>
                <p className="text-2xl font-bold">
                  {certifications.filter(c => 
                    new Date(c.issue_date).getFullYear() === new Date().getFullYear()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900">Certifications Expiring Soon</h3>
                <p className="text-sm text-orange-700 mb-2">
                  {expiringSoon.length} certification(s) will expire within the next 3 months
                </p>
                <div className="space-y-1">
                  {expiringSoon.map((cert) => (
                    <div key={cert.id} className="text-sm text-orange-700">
                      • {cert.name} expires on {new Date(cert.expiry_date!).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="certifications">My Certifications</TabsTrigger>
          <TabsTrigger value="goals">Goals & Planning</TabsTrigger>
          <TabsTrigger value="explore">Explore</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Certifications */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                {activeCerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No certifications yet</h3>
                    <p className="text-muted-foreground mb-4">Start building your professional credentials</p>
                    <Button onClick={() => setActiveTab('certifications')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Certification
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeCerts.slice(0, 3).map((cert) => (
                      <div key={cert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">{cert.issuing_organization}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStatusColor(cert.status)}>
                              {cert.status}
                            </Badge>
                            <Badge variant="outline" className={getDifficultyColor(cert.difficulty_level)}>
                              {cert.difficulty_level}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Issued: {new Date(cert.issue_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {cert.credential_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setIsAddingCert(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('goals')}>
                    <Target className="h-4 w-4 mr-2" />
                    Set New Goal
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('explore')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explore Certifications
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skill Areas Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Certification Skills Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Cloud Computing', 'Development', 'Data Science', 'Security', 'DevOps', 'Project Management'].map((skill) => {
                  const count = certifications.filter(c => 
                    c.skill_areas.some(area => area.toLowerCase().includes(skill.toLowerCase()))
                  ).length;
                  
                  return (
                    <div key={skill} className="p-4 border rounded-lg text-center">
                      <h4 className="font-medium mb-2">{skill}</h4>
                      <div className="text-2xl font-bold text-primary">{count}</div>
                      <p className="text-sm text-muted-foreground">certifications</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Certifications</h2>
            <Dialog open={isAddingCert} onOpenChange={setIsAddingCert}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Certification</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Certification Name</label>
                      <Input
                        placeholder="e.g., AWS Solutions Architect"
                        value={certForm.name}
                        onChange={(e) => setCertForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Issuing Organization</label>
                      <Input
                        placeholder="e.g., Amazon Web Services"
                        value={certForm.issuing_organization}
                        onChange={(e) => setCertForm(prev => ({ ...prev, issuing_organization: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Issue Date</label>
                      <Input
                        type="date"
                        value={certForm.issue_date}
                        onChange={(e) => setCertForm(prev => ({ ...prev, issue_date: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Expiry Date (Optional)</label>
                      <Input
                        type="date"
                        value={certForm.expiry_date}
                        onChange={(e) => setCertForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Credential ID</label>
                      <Input
                        placeholder="Certificate ID or badge number"
                        value={certForm.credential_id}
                        onChange={(e) => setCertForm(prev => ({ ...prev, credential_id: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Difficulty Level</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={certForm.difficulty_level}
                        onChange={(e) => setCertForm(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Credential URL</label>
                    <Input
                      placeholder="https://credentials.provider.com/certificate-id"
                      value={certForm.credential_url}
                      onChange={(e) => setCertForm(prev => ({ ...prev, credential_url: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Brief description of the certification and skills covered..."
                      value={certForm.description}
                      onChange={(e) => setCertForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Skill Areas</label>
                    <Input
                      placeholder="Cloud Computing, DevOps, Security (comma separated)"
                      onChange={(e) => setCertForm(prev => ({ 
                        ...prev, 
                        skill_areas: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      }))}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleAddCertification} 
                    className="w-full"
                    disabled={!certForm.name || !certForm.issuing_organization || !certForm.issue_date}
                  >
                    Add Certification
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Certifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        {cert.verification_status === 'verified' ? (
                          <Shield className="h-8 w-8 text-primary" />
                        ) : (
                          <Award className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={getStatusColor(cert.status)}>
                          {cert.status}
                        </Badge>
                        {cert.verification_status === 'verified' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{cert.name}</h3>
                      <p className="text-muted-foreground text-sm">{cert.issuing_organization}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                      </div>
                      
                      {cert.expiry_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Expires: {new Date(cert.expiry_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getDifficultyColor(cert.difficulty_level)}>
                          {cert.difficulty_level}
                        </Badge>
                        {cert.credential_id && (
                          <span className="text-xs text-muted-foreground">ID: {cert.credential_id}</span>
                        )}
                      </div>
                    </div>
                    
                    {cert.skill_areas.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cert.skill_areas.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 pt-2">
                      {cert.credential_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Verify
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Certification Goals</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          <div className="space-y-4">
            {goals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No certification goals set</h3>
                  <p className="text-muted-foreground mb-4">
                    Set goals to track your certification journey and stay motivated
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Set Your First Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              goals.map((goal) => (
                <Card key={goal.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{goal.certification_name}</h3>
                          <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                            {goal.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Target: {new Date(goal.target_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                          
                          {goal.study_resources.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Study Resources</h4>
                              <div className="flex flex-wrap gap-2">
                                {goal.study_resources.map((resource, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Explore Tab */}
        <TabsContent value="explore" className="space-y-6">
          <h2 className="text-2xl font-bold">Explore Certifications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certProviders.map((provider) => (
              <Card key={provider.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Crown className="h-6 w-6 text-primary" />
                    </div>
                    {provider.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {provider.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Popular Certifications</h4>
                      {provider.popular_certs.map((cert, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h5 className="font-medium text-sm">{cert.name}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {cert.level}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ~{cert.duration} study time
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Learn More
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};