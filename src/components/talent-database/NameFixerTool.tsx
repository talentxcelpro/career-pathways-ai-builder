import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, RefreshCw, Save, CheckCircle, User, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ProblemProfile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  cv_file_url?: string;
}

const NameFixerTool = () => {
  const [selectedProfile, setSelectedProfile] = useState<ProblemProfile | null>(null);
  const [newName, setNewName] = useState('');
  const [isReparsing, setIsReparsing] = useState(false);
  const queryClient = useQueryClient();

  // Get profiles with problematic names
  const { data: problemProfiles, isLoading } = useQuery({
    queryKey: ['problem-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .or(
          'full_name.ilike.%Executive%,' +
          'full_name.ilike.%Assistant%,' +
          'full_name.ilike.%Experience%,' +
          'full_name.ilike.%Summary%,' +
          'full_name.ilike.%Professional%,' +
          'full_name.ilike.%Engineer%,' +
          'full_name.ilike.%Manager%,' +
          'full_name.ilike.%Developer%,' +
          'full_name.ilike.%Analyst%,' +
          'full_name.ilike.%Having%,' +
          'full_name.ilike.%International%'
        )
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ProblemProfile[];
    }
  });

  // Manually fix name mutation
  const fixNameMutation = useMutation({
    mutationFn: async ({ profileId, correctName }: { profileId: string; correctName: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: correctName,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Name fixed successfully!');
      queryClient.invalidateQueries({ queryKey: ['problem-profiles'] });
      setSelectedProfile(null);
      setNewName('');
    },
    onError: (error: any) => {
      toast.error('Failed to fix name: ' + error.message);
    }
  });

  // Re-parse CV mutation
  const reparseMutation = useMutation({
    mutationFn: async (profileId: string) => {
      // Find the CV file for this profile
      const { data: cvFile, error: cvError } = await supabase
        .from('cv_files')
        .select('file_url, original_filename')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cvError) throw new Error('No CV file found for this profile');

      // Re-parse the CV
      const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
        body: {
          fileUrl: cvFile.file_url,
          fileName: cvFile.original_filename,
          profileId: profileId,
          reparse: true
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('CV re-parsed successfully!');
      queryClient.invalidateQueries({ queryKey: ['problem-profiles'] });
      setSelectedProfile(null);
    },
    onError: (error: any) => {
      toast.error('Failed to re-parse CV: ' + error.message);
    }
  });

  const isValidPersonName = (name: string): boolean => {
    if (!name || name.trim().length < 2) return false;
    
    const invalidPatterns = [
      /executive/i, /assistant/i, /experience/i, /summary/i, /professional/i,
      /engineer/i, /manager/i, /developer/i, /analyst/i, /having/i, /international/i,
      /skilled/i, /qualified/i, /certified/i, /expert/i, /specialist/i
    ];

    return !invalidPatterns.some(pattern => pattern.test(name));
  };

  const handleManualFix = () => {
    if (!selectedProfile || !newName.trim()) return;
    
    if (!isValidPersonName(newName)) {
      toast.error('Please enter a valid person name, not a job title or description');
      return;
    }

    fixNameMutation.mutate({
      profileId: selectedProfile.id,
      correctName: newName.trim()
    });
  };

  const handleReparse = (profile: ProblemProfile) => {
    setIsReparsing(true);
    reparseMutation.mutate(profile.id);
  };

  const bulkFixNames = useMutation({
    mutationFn: async () => {
      if (!problemProfiles) return;

      const results = [];
      for (const profile of problemProfiles.slice(0, 10)) { // Process first 10
        try {
          const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
            body: {
              profileId: profile.id,
              reparse: true,
              bulkFix: true
            }
          });
          
          if (!error) {
            results.push({ profileId: profile.id, status: 'success' });
          } else {
            results.push({ profileId: profile.id, status: 'error', error });
          }
        } catch (err) {
          results.push({ profileId: profile.id, status: 'error', error: err });
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      const successful = results?.filter(r => r.status === 'success').length || 0;
      toast.success(`Bulk fix completed! Fixed ${successful} profiles.`);
      queryClient.invalidateQueries({ queryKey: ['problem-profiles'] });
    },
    onError: () => {
      toast.error('Bulk fix failed. Please try individual fixes.');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Profile Name Fixer Tool
          </CardTitle>
          <CardDescription>
            Fix profiles with incorrect names extracted from CVs. Found {problemProfiles?.length || 0} profiles with problematic names.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => bulkFixNames.mutate()}
              disabled={bulkFixNames.isPending || !problemProfiles?.length}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${bulkFixNames.isPending ? 'animate-spin' : ''}`} />
              Bulk Fix First 10
            </Button>
            <Button 
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['problem-profiles'] })}
            >
              Refresh List
            </Button>
          </div>

          {/* Problem Profiles List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4">Loading problem profiles...</div>
            ) : problemProfiles?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
                No profiles with problematic names found!
              </div>
            ) : (
              problemProfiles?.map((profile) => (
                <Card key={profile.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Badge variant="destructive" className="text-xs">
                          {profile.full_name}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProfile(profile);
                          setNewName('');
                        }}
                      >
                        Manual Fix
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReparse(profile)}
                        disabled={isReparsing}
                        className="gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        Re-parse CV
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Fix Dialog */}
      {selectedProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Name Fix</CardTitle>
            <CardDescription>
              Fixing name for profile: {selectedProfile.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current (Incorrect) Name</Label>
              <Input 
                value={selectedProfile.full_name} 
                disabled 
                className="bg-destructive/10 text-destructive"
              />
            </div>
            
            <div>
              <Label>Correct Name</Label>
              <Input
                placeholder="Enter the correct person's name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              {newName && !isValidPersonName(newName) && (
                <p className="text-sm text-destructive mt-1">
                  ⚠️ This looks like a job title, not a person's name
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleManualFix}
                disabled={!newName.trim() || !isValidPersonName(newName) || fixNameMutation.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Correct Name
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedProfile(null);
                  setNewName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NameFixerTool;