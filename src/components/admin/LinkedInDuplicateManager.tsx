import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Merge, X, Eye, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DuplicateGroup {
  id: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    linkedin_url?: string;
    profile_picture_url?: string;
    created_at: string;
    similarity_score: number;
    is_primary: boolean;
  }[];
  confidence_score: number;
  match_criteria: string[];
  status: 'pending' | 'reviewed' | 'merged' | 'dismissed';
}

export default function LinkedInDuplicateManager() {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDuplicateGroups();
  }, []);

  const fetchDuplicateGroups = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-duplicate-detector', {
        body: { action: 'get_duplicate_groups' }
      });

      if (error) throw error;
      setDuplicateGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching duplicate groups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch duplicate groups",
        variant: "destructive"
      });
    }
  };

  const startDuplicateDetection = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-duplicate-detector', {
        body: { 
          action: 'detect_duplicates',
          config: {
            similarity_threshold: 0.85,
            include_email_matches: true,
            include_name_matches: true,
            include_linkedin_matches: true
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Duplicate Detection Started",
        description: `Found ${data.groups_detected} potential duplicate groups`,
      });

      fetchDuplicateGroups();
    } catch (error) {
      console.error('Error starting duplicate detection:', error);
      toast({
        title: "Error",
        description: "Failed to start duplicate detection",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleMergeProfiles = async (groupId: string, primaryProfileId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-duplicate-detector', {
        body: {
          action: 'merge_profiles',
          group_id: groupId,
          primary_profile_id: primaryProfileId
        }
      });

      if (error) throw error;

      toast({
        title: "Profiles Merged",
        description: "Duplicate profiles have been successfully merged",
      });

      fetchDuplicateGroups();
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error merging profiles:', error);
      toast({
        title: "Error",
        description: "Failed to merge profiles",
        variant: "destructive"
      });
    }
  };

  const handleDismissGroup = async (groupId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-duplicate-detector', {
        body: {
          action: 'dismiss_group',
          group_id: groupId
        }
      });

      if (error) throw error;

      toast({
        title: "Group Dismissed",
        description: "Duplicate group has been marked as not duplicates",
      });

      fetchDuplicateGroups();
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error dismissing group:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss group",
        variant: "destructive"
      });
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'bg-red-500';
    if (score >= 0.8) return 'bg-orange-500';
    if (score >= 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'merged': return 'bg-green-500';
      case 'reviewed': return 'bg-blue-500';
      case 'dismissed': return 'bg-gray-500';
      default: return 'bg-orange-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Duplicate Profile Manager</CardTitle>
            <CardDescription>
              Detect and manage duplicate LinkedIn profiles
            </CardDescription>
          </div>
          <Button onClick={startDuplicateDetection} disabled={isScanning}>
            <TrendingUp className="h-4 w-4 mr-2" />
            {isScanning ? 'Scanning...' : 'Scan for Duplicates'}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="groups" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="groups">Duplicate Groups</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="groups" className="space-y-4">
              {duplicateGroups.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No duplicate groups found. Run a scan to detect potential duplicates.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {duplicateGroups.map((group) => (
                    <Card key={group.id} className="cursor-pointer hover:bg-muted/50" 
                          onClick={() => setSelectedGroup(group)}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-sm font-medium">
                            {group.profiles.length} Potential Duplicates
                          </CardTitle>
                          <Badge className={getConfidenceColor(group.confidence_score)}>
                            {Math.round(group.confidence_score * 100)}% match
                          </Badge>
                        </div>
                        <Badge className={getStatusColor(group.status)}>
                          {group.status}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4">
                          {group.profiles.slice(0, 3).map((profile, index) => (
                            <div key={profile.id} className="flex items-center space-x-2">
                              <UserAvatar 
                                src={profile.profile_picture_url}
                                userName={profile.full_name}
                                size="sm"
                              />
                              <div className="text-sm">
                                <div className="font-medium">{profile.full_name}</div>
                                <div className="text-muted-foreground">{profile.email}</div>
                              </div>
                            </div>
                          ))}
                          {group.profiles.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              +{group.profiles.length - 3} more
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {group.match_criteria.map((criteria, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {criteria}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{duplicateGroups.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {duplicateGroups.filter(g => g.status === 'pending').length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Merged</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {duplicateGroups.filter(g => g.status === 'merged').length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed Group View Modal */}
      {selectedGroup && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-background border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Review Duplicate Group</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedGroup(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedGroup.profiles.map((profile) => (
                <Card key={profile.id} className={profile.is_primary ? 'border-primary' : ''}>
                  <CardHeader className="flex flex-row items-center space-x-4">
                    <UserAvatar 
                      src={profile.profile_picture_url}
                      userName={profile.full_name}
                      size="md"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{profile.full_name}</CardTitle>
                      <CardDescription>{profile.email}</CardDescription>
                      {profile.is_primary && (
                        <Badge className="mt-1">Primary Profile</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Similarity: </span>
                        {Math.round(profile.similarity_score * 100)}%
                      </div>
                      <div>
                        <span className="font-medium">Created: </span>
                        {new Date(profile.created_at).toLocaleDateString()}
                      </div>
                      {profile.linkedin_url && (
                        <div>
                          <span className="font-medium">LinkedIn: </span>
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" 
                             className="text-primary hover:underline">
                            View Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => handleDismissGroup(selectedGroup.id)}>
                <X className="h-4 w-4 mr-2" />
                Not Duplicates
              </Button>
              <Button onClick={() => {
                const primaryProfile = selectedGroup.profiles.find(p => p.is_primary) || 
                                     selectedGroup.profiles[0];
                handleMergeProfiles(selectedGroup.id, primaryProfile.id);
              }}>
                <Merge className="h-4 w-4 mr-2" />
                Merge Profiles
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}