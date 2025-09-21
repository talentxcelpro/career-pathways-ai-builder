import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Briefcase, 
  Network, 
  Sparkles, 
  Rocket, 
  Users, 
  Clock,
  MapPin,
  DollarSign,
  Target,
  Plus,
  Send,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useCollaborationMatching, type CollaborationOpportunity } from '@/hooks/useCollaborationMatching';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const CollaborationCard: React.FC = () => {
  const {
    opportunities,
    isLoadingOpportunities,
    myOpportunities,
    isLoadingMyOpportunities,
    applications,
    isLoadingApplications,
    createOpportunity,
    isCreatingOpportunity,
    applyToOpportunity,
    isApplyingToOpportunity,
    respondToApplication,
    isRespondingToApplication,
    currentUserProfile
  } = useCollaborationMatching();

  const [selectedOpportunity, setSelectedOpportunity] = useState<CollaborationOpportunity | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [experience, setExperience] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New opportunity form state
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    collaboration_type: 'side-project',
    skills_needed: [] as string[],
    time_commitment: 'part-time',
    compensation_type: 'unpaid',
    remote_ok: true,
    location: '',
    tags: [] as string[]
  });
  const [skillInput, setSkillInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  const handleApplyToOpportunity = () => {
    if (!selectedOpportunity) return;

    const links = portfolioLinks.split(',').map(link => link.trim()).filter(link => link);
    
    applyToOpportunity({
      opportunityId: selectedOpportunity.id,
      message: applicationMessage,
      experience,
      portfolioLinks: links,
      availabilityStart: new Date().toISOString()
    });
    
    setSelectedOpportunity(null);
    setApplicationMessage('');
    setExperience('');
    setPortfolioLinks('');
  };

  const handleCreateOpportunity = () => {
    createOpportunity({
      ...newOpportunity,
      status: 'open'
    });
    
    setShowCreateForm(false);
    setNewOpportunity({
      title: '',
      description: '',
      collaboration_type: 'side-project',
      skills_needed: [],
      time_commitment: 'part-time',
      compensation_type: 'unpaid',
      remote_ok: true,
      location: '',
      tags: []
    });
    setSkillInput('');
    setRoleInput('');
  };

  const addSkill = () => {
    if (skillInput.trim() && !newOpportunity.skills_needed.includes(skillInput.trim())) {
      setNewOpportunity(prev => ({
        ...prev,
        skills_needed: [...prev.skills_needed, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setNewOpportunity(prev => ({
      ...prev,
      skills_needed: prev.skills_needed.filter(s => s !== skill)
    }));
  };

  const addTag = () => {
    if (roleInput.trim() && !newOpportunity.tags.includes(roleInput.trim())) {
      setNewOpportunity(prev => ({
        ...prev,
        tags: [...prev.tags, roleInput.trim()]
      }));
      setRoleInput('');
    }
  };

  const removeTag = (tag: string) => {
    setNewOpportunity(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const getProjectTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'startup': 'bg-purple-100 text-purple-800 border-purple-200',
      'side-project': 'bg-blue-100 text-blue-800 border-blue-200',
      'content': 'bg-green-100 text-green-800 border-green-200',
      'research': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'freelance': 'bg-orange-100 text-orange-800 border-orange-200',
      'open-source': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getProjectStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      'idea': 'bg-gray-100 text-gray-800',
      'mvp': 'bg-blue-100 text-blue-800',
      'beta': 'bg-yellow-100 text-yellow-800',
      'launched': 'bg-green-100 text-green-800',
      'growth': 'bg-purple-100 text-purple-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!currentUserProfile) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-6 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Complete your profile to find collaborations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          Project Collaboration
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Live Matching
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="applications">
              Applications
              {applications.length > 0 && (
                <Badge className="ml-2 h-5 w-5 text-xs">{applications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Find collaborators for projects, startups, and content creation
                </p>
                {isLoadingOpportunities && (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Finding collaboration opportunities...</span>
                  </div>
                )}
              </div>

              {opportunities.length > 0 ? (
                <div className="space-y-3">
                  {opportunities.slice(0, 5).map((opportunity) => (
                    <div key={opportunity.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm">{opportunity.title}</h4>
                            {opportunity.matchScore && (
                              <Badge variant="secondary" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {opportunity.matchScore}% match
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {opportunity.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={`text-xs ${getProjectTypeColor(opportunity.collaboration_type)}`}>
                              <Rocket className="h-3 w-3 mr-1" />
                              {opportunity.collaboration_type?.replace('-', ' ') || 'Unknown'}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(opportunity.status)}`}>
                              {opportunity.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {opportunity.time_commitment}
                            </Badge>
                            {opportunity.compensation_type !== 'unpaid' && (
                              <Badge variant="outline" className="text-xs">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Paid
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {opportunity.remote_ok ? 'Remote' : opportunity.location || 'Location TBD'}
                            </Badge>
                          </div>

                          {opportunity.skills_needed && opportunity.skills_needed.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {opportunity.skills_needed.slice(0, 4).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-accent/50">
                                  {skill}
                                </Badge>
                              ))}
                              {opportunity.skills_needed.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{opportunity.skills_needed.length - 4} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {opportunity.matchReasons && opportunity.matchReasons.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {opportunity.matchReasons.slice(0, 2).map((reason, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-primary/10 text-primary">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={opportunity.creator_profile?.profile_picture_url} />
                                <AvatarFallback className="text-xs">
                                  {opportunity.creator_profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span>{opportunity.creator_profile?.full_name}</span>
                            </div>
                            <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedOpportunity(opportunity)}
                              className="gap-1"
                            >
                              <Send className="h-3 w-3" />
                              Apply
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Apply to Collaborate
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <h4 className="font-semibold text-sm">{selectedOpportunity?.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {selectedOpportunity?.description}
                                </p>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="app-message">Why are you interested?</Label>
                                  <Textarea
                                    id="app-message"
                                    placeholder="Tell them why you want to collaborate and what you can bring to the project..."
                                    value={applicationMessage}
                                    onChange={(e) => setApplicationMessage(e.target.value)}
                                    className="min-h-20"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="experience">Relevant Experience</Label>
                                  <Textarea
                                    id="experience"
                                    placeholder="Describe your relevant experience for this project..."
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="portfolio">Portfolio Links (comma separated)</Label>
                                  <Input
                                    id="portfolio"
                                    placeholder="https://github.com/user, https://portfolio.com"
                                    value={portfolioLinks}
                                    onChange={(e) => setPortfolioLinks(e.target.value)}
                                  />
                                </div>

                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={handleApplyToOpportunity}
                                    disabled={!applicationMessage || isApplyingToOpportunity}
                                    className="flex-1"
                                  >
                                    {isApplyingToOpportunity && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                                    Send Application
                                  </Button>
                                  <Button variant="outline" onClick={() => setSelectedOpportunity(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isLoadingOpportunities ? (
                <div className="text-center py-8">
                  <Network className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No collaboration opportunities found</p>
                  <p className="text-sm text-muted-foreground mb-3">Be the first to create one!</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('create')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Opportunity
                  </Button>
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="my-projects">
            <div className="space-y-4">
              {isLoadingMyOpportunities ? (
                <div className="text-center py-4">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                </div>
              ) : myOpportunities.length > 0 ? (
                <div className="space-y-3">
                  {myOpportunities.map((opportunity) => (
                    <div key={opportunity.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{opportunity.title}</h4>
                        <Badge className={`text-xs ${getStatusColor(opportunity.status)}`}>
                          {opportunity.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{opportunity.applications_count || 0} applications</span>
                        </div>
                        <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No projects created yet</p>
                  <p className="text-sm text-muted-foreground">Create your first collaboration opportunity</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="space-y-4">
              {isLoadingApplications ? (
                <div className="text-center py-4">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                </div>
              ) : applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.map((application) => (
                    <div key={application.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{application.opportunity?.title}</h4>
                            <Badge className={`text-xs ${getStatusColor(application.status)}`}>
                              {application.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {application.opportunity?.creator_profile?.full_name}
                          </p>
                          <p className="text-sm">{application.application_message}</p>
                        </div>
                        
                        {application.status === 'pending' && application.opportunity?.created_by === currentUserProfile?.id && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => respondToApplication({ applicationId: application.id, action: 'accept' })}
                              disabled={isRespondingToApplication}
                              className="gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => respondToApplication({ applicationId: application.id, action: 'decline' })}
                              disabled={isRespondingToApplication}
                              className="gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No applications yet</p>
                  <p className="text-sm text-muted-foreground">Start applying to collaboration opportunities</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <div className="space-y-4">
              {!showCreateForm ? (
                <div className="text-center py-8">
                  <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Create a Collaboration Opportunity</p>
                  <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Create New Opportunity</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Project Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Looking for React Developer for SaaS Platform"
                        value={newOpportunity.title}
                        onChange={(e) => setNewOpportunity(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your project, goals, and what you're looking for..."
                        value={newOpportunity.description}
                        onChange={(e) => setNewOpportunity(prev => ({ ...prev, description: e.target.value }))}
                        className="min-h-24"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Collaboration Type</Label>
                        <Select 
                          value={newOpportunity.collaboration_type} 
                          onValueChange={(value: any) => setNewOpportunity(prev => ({ ...prev, collaboration_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="startup">Startup</SelectItem>
                            <SelectItem value="side-project">Side Project</SelectItem>
                            <SelectItem value="content">Content Creation</SelectItem>
                            <SelectItem value="research">Research</SelectItem>
                            <SelectItem value="freelance">Freelance</SelectItem>
                            <SelectItem value="open-source">Open Source</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Status</Label>
                        <Select 
                          value="open" 
                          onValueChange={() => {}}
                          disabled
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="growth">Growth</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Skills Required</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="e.g., React, Node.js, Design"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill} size="sm">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {newOpportunity.skills_needed.map((skill) => (
                          <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                            {skill} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Time Commitment</Label>
                        <Select 
                          value={newOpportunity.time_commitment} 
                          onValueChange={(value: any) => setNewOpportunity(prev => ({ ...prev, time_commitment: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                            <SelectItem value="weekend">Weekend</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Remote Work</Label>
                        <Select 
                          value={newOpportunity.remote_ok ? "yes" : "no"} 
                          onValueChange={(value: any) => setNewOpportunity(prev => ({ ...prev, remote_ok: value === "yes" }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes (Remote)</SelectItem>
                            <SelectItem value="no">No (On-site)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_paid"
                        checked={newOpportunity.compensation_type !== "unpaid"}
                        onCheckedChange={(checked) => setNewOpportunity(prev => ({ ...prev, compensation_type: checked ? "paid" : "unpaid" }))}
                      />
                      <Label htmlFor="is_paid">This is a paid opportunity</Label>
                    </div>

                    <Button 
                      onClick={handleCreateOpportunity}
                      disabled={!newOpportunity.title || !newOpportunity.description || isCreatingOpportunity}
                      className="w-full"
                    >
                      {isCreatingOpportunity && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                      Create Opportunity
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};