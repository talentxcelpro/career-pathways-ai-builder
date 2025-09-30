import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, Download, Mail, FileText, CheckCircle, Clock, AlertCircle, RefreshCw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UnifiedCandidate {
  id?: string;
  email: string;
  full_name: string;
  title: string;
  location: string;
  about: string;
  skills: string[];
  experience_years: number;
  current_company?: string;
  industry?: string;
  resume_url?: string;
  activation_status: 'pending' | 'activated' | 'expired';
  created_at: string;
  cv_file_id?: string;
  original_filename?: string;
  parsing_status?: string;
  source_type: 'profile' | 'cv_file';
}

export const UnifiedCandidatesTable: React.FC = () => {
  const [candidates, setCandidates] = useState<UnifiedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    activated: 0,
    pending: 0,
    cv_files: 0,
    profiles: 0,
    pending_cvs: 0
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      
      // Fetch unified candidates view
      const { data: candidatesData, error } = await supabase
        .from('unified_candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching candidates:', error);
        toast.error('Failed to load candidates');
        return;
      }

      // Get error CVs count that can be reprocessed
      const { count: errorCVsCount } = await supabase
        .from('cv_files')
        .select('*', { count: 'exact', head: true })
        .eq('parsing_status', 'error');

      // Get CV files that aren't yet in profiles
      const { data: cvFiles, error: cvError } = await supabase
        .from('cv_files')
        .select(`
          id,
          original_filename,
          parsing_status,
          user_id,
          file_url,
          parsing_results,
          created_at
        `)
        .eq('parsing_status', 'completed')
        .order('created_at', { ascending: false });

      // Combine candidates and CV data
      let allCandidates = [...(candidatesData || [])];
      
      // Add CV files that don't have corresponding profiles yet
      if (cvFiles) {
        for (const cv of cvFiles) {
          const existsInCandidates = allCandidates.some(c => c.cv_file_id === cv.id);
          if (!existsInCandidates && cv.parsing_results) {
            // Extract data from CV
            const email = extractEmailFromResults(cv.parsing_results);
            const fullName = extractNameFromResults(cv.parsing_results);
            
            if (email && fullName) {
              allCandidates.push({
                id: cv.id,
                email: email,
                full_name: fullName,
                title: extractTitleFromResults(cv.parsing_results) || 'Professional',
                location: extractLocationFromResults(cv.parsing_results) || '',
                about: extractAboutFromResults(cv.parsing_results) || '',
                skills: extractSkillsFromResults(cv.parsing_results),
                experience_years: extractExperienceFromResults(cv.parsing_results),
                current_company: extractCompanyFromResults(cv.parsing_results),
                activation_status: 'pending',
                cv_file_id: cv.id,
                original_filename: cv.original_filename,
                source_type: 'cv_file',
                created_at: cv.created_at,
                resume_url: cv.file_url
              });
            }
          }
        }
      }

      setCandidates(allCandidates);
      
      // Calculate stats
      const totalCandidates = allCandidates.length;
      const activatedCount = allCandidates.filter(c => 
        c.activation_status === 'active' || c.activation_status === 'activated'
      ).length;
      const pendingCount = allCandidates.filter(c => 
        c.activation_status === 'pending'
      ).length;
      const cvFilesCount = allCandidates.filter(c => c.source === 'cv_file' || c.source_type === 'cv_file').length;
      const profilesCount = allCandidates.filter(c => c.source === 'platform' || c.source === 'application' || c.source_type === 'profile').length;
      
      setStats({
        total: totalCandidates,
        activated: activatedCount,
        pending: pendingCount,
        cv_files: cvFilesCount,
        profiles: profilesCount,
        pending_cvs: errorCVsCount || 0 // Show error CVs as they can be reprocessed
      });

      console.log(`📊 Loaded ${totalCandidates} candidates, ${errorCVsCount || 0} error CVs that can be reprocessed`);
      
    } catch (error) {
      console.error('Error in fetchCandidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to extract data from CV parsing results
  const extractEmailFromResults = (results: any): string | null => {
    if (!results) return null;
    const patterns = [
      results.profile?.email,
      results.personalInfo?.email,
      results.contact?.email,
      results.contactInfo?.email,
      results.basic_info?.email
    ];
    for (const email of patterns) {
      if (email && typeof email === 'string' && email.includes('@')) {
        return email.trim().toLowerCase();
      }
    }
    return null;
  };

  const extractNameFromResults = (results: any): string | null => {
    if (!results) return null;
    const patterns = [
      results.profile?.fullName,
      results.profile?.name,
      results.personalInfo?.fullName,
      results.personalInfo?.name,
      results.contactInfo?.name,
      results.basic_info?.name
    ];
    for (const name of patterns) {
      if (name && typeof name === 'string' && name.trim().length > 0) {
        return name.trim();
      }
    }
    return null;
  };

  const extractTitleFromResults = (results: any): string | null => {
    if (!results) return null;
    const patterns = [
      results.profile?.title,
      results.experience?.[0]?.title,
      results.workExperience?.[0]?.title
    ];
    for (const title of patterns) {
      if (title && typeof title === 'string' && title.trim().length > 0) {
        return title.trim();
      }
    }
    return null;
  };

  const extractLocationFromResults = (results: any): string | null => {
    if (!results) return null;
    const patterns = [
      results.profile?.location,
      results.personalInfo?.location,
      results.contactInfo?.location
    ];
    for (const location of patterns) {
      if (location && typeof location === 'string' && location.trim().length > 0) {
        return location.trim();
      }
    }
    return null;
  };

  const extractAboutFromResults = (results: any): string | null => {
    if (!results) return null;
    const patterns = [
      results.profile?.summary,
      results.summary,
      results.objective
    ];
    for (const about of patterns) {
      if (about && typeof about === 'string' && about.trim().length > 0) {
        return about.trim();
      }
    }
    return null;
  };

  const extractSkillsFromResults = (results: any): string[] => {
    if (!results) return [];
    const skills = results.skills || results.technicalSkills || [];
    if (Array.isArray(skills)) {
      return skills.filter(skill => typeof skill === 'string' && skill.trim().length > 0).slice(0, 10);
    }
    return [];
  };

  const extractExperienceFromResults = (results: any): number => {
    if (!results) return 0;
    const experience = results.experience || results.workExperience || [];
    if (Array.isArray(experience)) {
      return Math.min(experience.length * 2, 15);
    }
    return 0;
  };

  const extractCompanyFromResults = (results: any): string | null => {
    if (!results) return null;
    const experience = results.experience || results.workExperience || [];
    if (Array.isArray(experience) && experience.length > 0) {
      return experience[0]?.company || null;
    }
    return null;
  };

  const sendActivationEmail = async (candidate: UnifiedCandidate) => {
    if (!candidate.cv_file_id) {
      toast.error('No CV file associated with this candidate');
      return;
    }

    try {
      // Generate activation token
      const token = crypto.randomUUID();
      
      // Save activation token
      const { error: tokenError } = await supabase
        .from('user_activation_tokens')
        .insert({
          email: candidate.email,
          token,
          cv_file_id: candidate.cv_file_id
        });

      if (tokenError) {
        console.error('Token creation error:', tokenError);
        toast.error('Failed to create activation token');
        return;
      }

      // Queue activation email
      const { error: emailError } = await supabase
        .from('email_queue')
        .insert({
          to_email: candidate.email,
          subject: '🎯 Activate Your TalentXcel Profile',
          html_content: generateActivationEmail(candidate, token),
          priority: 'high'
        });

      if (emailError) {
        console.error('Email queue error:', emailError);
        toast.error('Failed to queue activation email');
        return;
      }

      toast.success(`Activation email sent to ${candidate.email}`);
      
    } catch (error) {
      console.error('Error sending activation email:', error);
      toast.error('Failed to send activation email');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'activated':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const generateActivationEmail = (candidate: UnifiedCandidate, token: string): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Activate Your TalentXcel Profile</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #2563eb;">🎯 TalentXcel</h1>
              </div>
              
              <h2>Hi ${candidate.full_name}! 👋</h2>
              
              <p>Great news! We've found your CV and created a profile for you on TalentXcel.</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Your Profile Preview:</h3>
                  <p><strong>Name:</strong> ${candidate.full_name}</p>
                  <p><strong>Title:</strong> ${candidate.title}</p>
                  <p><strong>Location:</strong> ${candidate.location}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                  <a href="https://talentxcel.in/activate?token=${token}" 
                     style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                      🚀 Activate Your Profile
                  </a>
              </div>
              
              <h3>What happens next?</h3>
              <ul>
                  <li>✅ Access personalized job recommendations</li>
                  <li>🤝 Connect with top employers</li>
                  <li>📈 Get AI-powered career insights</li>
                  <li>💼 Apply to exclusive opportunities</li>
              </ul>
          </div>
      </body>
      </html>
    `;
  };

  const processPendingCVs = async () => {
    if (stats.pending_cvs === 0) {
      toast.info('No pending CVs to process');
      return;
    }

    setProcessing(true);
    try {
      console.log(`🚀 Starting CV processing for ${stats.pending_cvs} pending CVs...`);
      
      const { data, error } = await supabase.functions.invoke('run-cv-processing', {
        body: {}
      });
      
      if (error) {
        console.error('CV processing error:', error);
        toast.error(`Failed to process CVs: ${error.message}`);
      } else {
        console.log('CV processing result:', data);
        if (data?.success) {
          toast.success(`🎉 Successfully processed ${stats.pending_cvs} CVs! Refreshing data...`);
        } else {
          toast.warning('CV processing completed with some issues. Check logs for details.');
        }
        // Refresh the data after processing
        await fetchCandidates();
      }
    } catch (error) {
      console.error('Error in CV processing:', error);
      toast.error(`Failed to start CV processing: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prominent Pending CVs Alert */}
      {stats.pending_cvs > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-300 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">⚠️ {stats.pending_cvs} CVs Need Reprocessing</h3>
                <p className="text-sm text-orange-700">Click "Reprocess Error CVs" to retry parsing these CVs and convert them into user accounts.</p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
              onClick={processPendingCVs}
              disabled={processing}
            >
              {processing ? (
                <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
              ) : (
                <Play className="h-5 w-5 mr-3" />
              )}
              🚀 Reprocess Now
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Candidates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.activated}</div>
            <p className="text-sm text-muted-foreground">Activated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.cv_files}</div>
            <p className="text-sm text-muted-foreground">From CVs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.profiles}</div>
            <p className="text-sm text-muted-foreground">Profiles</p>
          </CardContent>
        </Card>
      </div>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Candidates ({candidates.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-blue-600 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={processPendingCVs}
                disabled={processing}
              >
                {processing ? (
                  <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                ) : (
                  <Play className="h-5 w-5 mr-3" />
                )}
                🔄 Reprocess Error CVs ({stats.pending_cvs})
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={fetchCandidates}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {stats.pending_cvs > 0 && (
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={async () => {
                    const { data, error } = await supabase.functions.invoke('fix-cv-processing', { body: {} });
                    if (error) {
                      toast.error('Direct CV processing failed: ' + error.message);
                    } else {
                      toast.success('Direct CV processing completed!');
                      await fetchCandidates();
                    }
                  }}
                >
                  🔧 Test Direct Processing
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add CV Files Section */}
          {stats.pending_cvs > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">📄 Error CV Files ({stats.pending_cvs})</h4>
              <p className="text-sm text-orange-700 mb-3">
                These CV files had errors during initial processing. Click "Reprocess Error CVs" to retry parsing them.
              </p>
              <div className="text-xs text-orange-600">
                Files will be parsed with AI → User profiles created → Activation emails sent
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Candidate</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Experience</th>
                  <th className="text-left p-3">Skills</th>
                  <th className="text-left p-3">Source</th>
                  <th className="text-left p-3">CV File</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <tr key={`${candidate.source_type}-${candidate.cv_file_id || candidate.id || index}`} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{candidate.full_name}</div>
                        <div className="text-sm text-muted-foreground">{candidate.email}</div>
                        <div className="text-sm text-muted-foreground">{candidate.title}</div>
                        <div className="text-xs text-muted-foreground">{candidate.location}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(candidate.activation_status)}
                        <Badge variant={candidate.activation_status === 'activated' ? 'default' : 'secondary'}>
                          {candidate.activation_status}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="text-sm">{candidate.experience_years || 0} years</div>
                        {candidate.current_company && (
                          <div className="text-xs text-muted-foreground">{candidate.current_company}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(candidate.skills || []).slice(0, 2).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {(candidate.skills || []).length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{(candidate.skills || []).length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={candidate.source_type === 'profile' ? 'default' : 'secondary'}>
                          {candidate.source_type === 'profile' ? 'Profile' : 'CV Upload'}
                        </Badge>
                        {candidate.original_filename && (
                          <span className="text-xs text-muted-foreground">
                            📄 {candidate.original_filename.substring(0, 20)}...
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {candidate.original_filename && (
                          <span className="text-xs font-medium text-blue-600">
                            📎 {candidate.original_filename}
                          </span>
                        )}
                        {candidate.cv_file_id && (
                          <span className="text-xs text-muted-foreground">
                            ID: {candidate.cv_file_id.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {candidate.resume_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(candidate.resume_url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {candidate.activation_status === 'pending' && candidate.cv_file_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendActivationEmail(candidate)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};