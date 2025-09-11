import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, RefreshCw, Save, CheckCircle, User, FileText, Search, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractTextFromFile, isValidPersonName, downloadFileFromUrl } from '@/utils/resumeTextExtraction';

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [scanningAll, setScanningAll] = useState(false);
  const queryClient = useQueryClient();

  // Get profiles with problematic names with pagination
  const { data: problemProfiles, isLoading } = useQuery({
    queryKey: ['problem-profiles', page, pageSize],
    queryFn: async () => {
      const startRange = (page - 1) * pageSize;
      const endRange = startRange + pageSize - 1;

      const { data, error, count } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at', { count: 'exact' })
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
          'full_name.ilike.%International%,' +
          'full_name.ilike.%Voice Process%,' +
          'full_name.ilike.%Experienced%,' +
          'full_name.ilike.%Fresher%,' +
          'full_name.ilike.%Graduate%'
        )
        .order('created_at', { ascending: false })
        .range(startRange, endRange);

      if (error) throw error;
      return { profiles: data as ProblemProfile[], totalCount: count || 0 };
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

  // Re-parse CV mutation with client-side extraction
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

      // Download and extract text client-side
      const file = await downloadFileFromUrl(cvFile.file_url, cvFile.original_filename);
      const extractedText = await extractTextFromFile(file);

      // Call AI resume parser with extracted text
      const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
        body: {
          extractedText,
          fileName: cvFile.original_filename,
          fileType: file.type,
          profileId: profileId,
          reparse: true
        }
      });

      if (error) throw error;
      
      // Validate and update name if valid
      const extractedName = data?.structured_resume?.name;
      if (extractedName && isValidPersonName(extractedName)) {
        await supabase
          .from('profiles')
          .update({ full_name: extractedName, updated_at: new Date().toISOString() })
          .eq('id', profileId);
      }

      return { ...data, extractedName };
    },
    onSuccess: (data) => {
      const name = data?.extractedName;
      if (name && isValidPersonName(name)) {
        toast.success(`CV re-parsed successfully! Updated name to: ${name}`);
      } else {
        toast.warning('CV re-parsed but no valid name found. Please fix manually.');
      }
      queryClient.invalidateQueries({ queryKey: ['problem-profiles'] });
      setSelectedProfile(null);
    },
    onError: (error: any) => {
      toast.error('Failed to re-parse CV: ' + error.message);
    }
  });


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
      if (!problemProfiles?.profiles) return [];

      const profiles = problemProfiles.profiles.slice(0, 10);
      const results = [];
      
      for (const profile of profiles) {
        try {
          // Find CV file
          const { data: cvFile } = await supabase
            .from('cv_files')
            .select('file_url, original_filename')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (!cvFile) {
            results.push({ profileId: profile.id, status: 'error', error: 'No CV file found' });
            continue;
          }

          // Extract text and parse with AI
          const file = await downloadFileFromUrl(cvFile.file_url, cvFile.original_filename);
          const extractedText = await extractTextFromFile(file);

          const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
            body: {
              extractedText,
              fileName: cvFile.original_filename,
              fileType: file.type,
              profileId: profile.id,
              reparse: true
            }
          });

          if (error) {
            results.push({ profileId: profile.id, status: 'error', error });
            continue;
          }

          // Update name if valid
          const extractedName = data?.structured_resume?.name;
          if (extractedName && isValidPersonName(extractedName)) {
            await supabase
              .from('profiles')
              .update({ full_name: extractedName, updated_at: new Date().toISOString() })
              .eq('id', profile.id);
            
            results.push({ 
              profileId: profile.id, 
              status: 'success', 
              oldName: profile.full_name, 
              newName: extractedName 
            });
          } else {
            results.push({ profileId: profile.id, status: 'error', error: 'No valid name extracted' });
          }
        } catch (err) {
          results.push({ profileId: profile.id, status: 'error', error: err });
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      const successful = results?.filter(r => r.status === 'success') || [];
      const failed = results?.filter(r => r.status === 'error') || [];
      
      toast.success(
        `Bulk fix completed! ${successful.length} fixed, ${failed.length} failed.`,
        { duration: 5000 }
      );
      
      queryClient.invalidateQueries({ queryKey: ['problem-profiles'] });
    },
    onError: () => {
      toast.error('Bulk fix failed. Please try individual fixes.');
    }
  });

  // Scan entire database mutation
  const scanAllMutation = useMutation({
    mutationFn: async () => {
      setScanningAll(true);
      const allProfiles = [];
      let currentPage = 1;
      const batchSize = 200;
      
      while (true) {
        const startRange = (currentPage - 1) * batchSize;
        const endRange = startRange + batchSize - 1;

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
            'full_name.ilike.%International%,' +
            'full_name.ilike.%Voice Process%,' +
            'full_name.ilike.%Experienced%,' +
            'full_name.ilike.%Fresher%,' +
            'full_name.ilike.%Graduate%'
          )
          .order('created_at', { ascending: false })
          .range(startRange, endRange);

        if (error) throw error;
        if (!data || data.length === 0) break;
        
        allProfiles.push(...data);
        currentPage++;
        
        // Prevent infinite loops
        if (currentPage > 50) break;
      }
      
      return allProfiles;
    },
    onSuccess: (allProfiles) => {
      toast.success(`Scan complete! Found ${allProfiles.length} total problematic profiles.`);
      setScanningAll(false);
    },
    onError: () => {
      toast.error('Database scan failed.');
      setScanningAll(false);
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
            Fix profiles with incorrect names extracted from CVs. Found {problemProfiles?.profiles?.length || 0} profiles on this page ({problemProfiles?.totalCount || 0} total).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => bulkFixNames.mutate()}
              disabled={bulkFixNames.isPending || !problemProfiles?.profiles?.length}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${bulkFixNames.isPending ? 'animate-spin' : ''}`} />
              Bulk Fix First 10
            </Button>
            <Button 
              variant="outline"
              onClick={() => scanAllMutation.mutate()}
              disabled={scanningAll}
              className="gap-2"
            >
              <Search className={`h-4 w-4 ${scanningAll ? 'animate-spin' : ''}`} />
              Scan Entire Database
            </Button>
            <Button 
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['problem-profiles'] })}
            >
              Refresh List
            </Button>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Page size:</span>
              <select 
                value={pageSize} 
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} ({problemProfiles?.profiles?.length || 0} of {problemProfiles?.totalCount || 0} total)
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!problemProfiles?.profiles?.length || problemProfiles.profiles.length < pageSize}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Problem Profiles List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4">Loading problem profiles...</div>
            ) : problemProfiles?.profiles?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
                No profiles with problematic names found on this page!
              </div>
            ) : (
              problemProfiles?.profiles?.map((profile) => (
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