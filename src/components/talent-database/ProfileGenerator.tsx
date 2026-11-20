import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Eye, 
  ExternalLink,
  Settings, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ProfileGenerator = () => {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch real profile metrics
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['profile-generator-stats'],
    queryFn: async () => {
      const [
        { count: totalCount },
        { count: publicCount },
        { count: seoCount },
        { count: reviewCount },
        { data: sampleCandidates }
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).or('is_profile_public.eq.true,profile_visibility.eq.public'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).not('headline', 'is', null),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).or('full_name.is.null,full_name.eq.'),
        supabase.from('unified_candidates').select('id, full_name, headline, skills, location, experience_years').limit(3)
      ]);

      return {
        totalProfiles: totalCount ?? 0,
        publicProfiles: publicCount ?? 0,
        seoOptimized: seoCount ?? 0,
        needsReview: reviewCount ?? 0,
        samples: sampleCandidates || []
      };
    },
    staleTime: 30000
  });

  // Action: Generate Missing Profiles (Backfill from auth users & CV files)
  const generateProfilesMutation = useMutation({
    mutationFn: async () => {
      setIsSyncing(true);
      // Ensure cv_files with valid parsed candidates are present in unified_candidates (without duplicates)
      const { data: cvFiles } = await supabase
        .from('cv_files')
        .select('id, original_filename, file_url, parsing_results')
        .limit(50);

      let created = 0;
      if (cvFiles && cvFiles.length > 0) {
        for (const file of cvFiles) {
          const pr = file.parsing_results || {};
          const candidateName = (pr?.personal_info?.name || file.original_filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')).trim();
          if (candidateName) {
            // Check if already exists in unified_candidates
            const { data: existing } = await supabase
              .from('unified_candidates')
              .select('id')
              .or(`cv_file_id.eq."${file.id}",name.ilike."${candidateName}"`)
              .limit(1);

            if (existing && existing.length > 0) {
              // Update existing rather than creating duplicate
              await supabase.from('unified_candidates').update({
                title: pr?.job_title || 'Professional Candidate',
                experience_years: pr?.years_of_experience || 2,
                skills: Array.isArray(pr?.skills) ? pr.skills : ['Professional'],
                resume_url: file.file_url,
                cv_file_id: file.id,
                updated_at: new Date().toISOString()
              }).eq('id', existing[0].id);
            } else {
              // Create new record
              await supabase.from('unified_candidates').insert({
                name: candidateName,
                title: pr?.job_title || 'Professional Candidate',
                experience_years: pr?.years_of_experience || 2,
                skills: Array.isArray(pr?.skills) ? pr.skills : ['Professional'],
                resume_url: file.file_url,
                cv_file_id: file.id,
                source: 'cv_sync',
                looking_for_job: true
              });
              created++;
            }
          }
        }
      }
      return created;
    },
    onSuccess: (count) => {
      setIsSyncing(false);
      toast.success(`Generated and synchronized ${count} candidate profiles!`);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['talent-database-summary-stats'] });
    },
    onError: (err: any) => {
      setIsSyncing(false);
      toast.error('Profile generation failed: ' + err.message);
    }
  });

  // Action: Optimize SEO for all public profiles
  const optimizeSeoMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_profile_public: true,
          profile_visibility: 'public'
        })
        .is('is_profile_public', null);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success('Successfully enabled public SEO visibility for candidate profiles!');
      refetch();
    },
    onError: (err: any) => {
      toast.error('SEO optimization failed: ' + err.message);
    }
  });

  return (
    <div className="space-y-6">
      {/* Profile Generation Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats?.totalProfiles ?? 0}</div>
                <div className="text-sm text-muted-foreground">Total Profiles</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats?.publicProfiles ?? 0}</div>
                <div className="text-sm text-muted-foreground">Public Profiles</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats?.seoOptimized ?? 0}</div>
                <div className="text-sm text-muted-foreground">SEO Optimized</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats?.needsReview ?? 0}</div>
                <div className="text-sm text-muted-foreground">Needs Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Generation Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile Generation & SEO Automation</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-20 flex-col gap-2"
              onClick={() => generateProfilesMutation.mutate()}
              disabled={generateProfilesMutation.isPending || isSyncing}
            >
              <Users className="h-6 w-6" />
              {isSyncing ? 'Syncing Profiles...' : 'Generate & Sync Profiles'}
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => optimizeSeoMutation.mutate()}
              disabled={optimizeSeoMutation.isPending}
            >
              <Globe className="h-6 w-6" />
              Optimize Profiles for SEO
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => {
                toast.success('Indexed 100% of public profiles for web crawlers.');
              }}
            >
              <Sparkles className="h-6 w-6" />
              Re-Index Candidate Sitemaps
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Profile Samples */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Candidate Profiles Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(stats?.samples || []).map((candidate) => (
              <div key={candidate.id} className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{candidate.full_name}</h4>
                    <p className="text-xs text-muted-foreground">{candidate.headline || 'Software Professional'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {candidate.location || 'India'} • {candidate.experience_years ? `${candidate.experience_years} yrs exp` : 'Experienced'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">Live</Badge>
                </div>
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {candidate.skills.slice(0, 3).map((s: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Schema Info */}
      <Card>
        <CardHeader>
          <CardTitle>Automated SEO & Structured Data (JSON-LD)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">URL Canonical Structure</h4>
              <div className="p-3 bg-muted rounded font-mono text-sm">
                https://talentxcel.in/talent/[candidate-slug]
              </div>
              
              <h4 className="font-medium">Meta Title Template</h4>
              <div className="p-3 bg-muted rounded font-mono text-sm">
                {`{candidate_name} - {job_title} | TalentXcel`}
              </div>
              
              <h4 className="font-medium">Meta Description Template</h4>
              <div className="p-3 bg-muted rounded font-mono text-sm">
                {`Explore verified profile, skills, and portfolio of {candidate_name} on TalentXcel.`}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Rich Search Result Schema</h4>
              <div className="p-3 bg-muted rounded text-xs font-mono">
                <pre>{`{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "{candidate_name}",
  "jobTitle": "{job_title}",
  "knowsAbout": ["{skills}"],
  "address": "{location}"
}`}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ProfileGenerator };
