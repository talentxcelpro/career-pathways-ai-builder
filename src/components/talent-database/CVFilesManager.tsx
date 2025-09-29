import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, User, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
// PDF.js loaded dynamically to prevent memory issues
export const CVFilesManager = () => {
  const { data: cvFiles, isLoading, error } = useQuery({
    queryKey: ['cv-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cv_files')
        .select(`
          id,
          user_id,
          original_filename,
          file_url,
          file_type,
          parsing_status,
          parsing_results,
          created_at,
          profiles (
            id,
            full_name,
            email,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const queryClient = useQueryClient();

  const isTempEmail = (email?: string) => !!email && (/\.temp$/i.test(email) || /no-contact\.temp|contact-extracted\.temp/i.test(email));
  const isValidEmail = (email?: string) => !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !isTempEmail(email);

  const getParsedEmail = (cvFile: any): string | null => {
    const pr = cvFile?.parsing_results || {};
    const email = pr?.personal_info?.email || pr?.email || pr?.contact?.email || null;
    return typeof email === 'string' ? email : null;
  };

  const normalizeEmailText = (txt: string) => (txt || '')
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\[(?:at)\]|\((?:at)\)|\s+(?:at)\s+/gi, '@')
    .replace(/\[(?:dot)\]|\((?:dot)\)|\s+(?:dot)\s+/gi, '.')
    .replace(/\s*\(at\)\s*/gi, '@')
    .replace(/\s*\(dot\)\s*/gi, '.')
    .replace(/\s*@\s*/g, '@')
    .replace(/\s*\.\s*/g, '.')
    .replace(/\s{2,}/g, ' ');

  const extractEmailFromText = (text: string): string | null => {
    const t = normalizeEmailText(text);
    const isReal = (e: string) => {
      // Basic email pattern
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
      // Not a temp email
      if (isTempEmail(e)) return false;
      // Must have reasonable length constraints
      if (e.length > 100 || e.length < 5) return false;
      // Domain should be reasonable (not too long)
      const domain = e.split('@')[1];
      if (!domain || domain.length > 50) return false;
      // Reject if it looks like descriptive text with @ symbol
      if (/^[a-z]+@[a-z]{20,}/.test(e.toLowerCase())) return false;
      // Must have valid TLD pattern
      if (!/\.[a-z]{2,}$/i.test(domain)) return false;
      return true;
    };

    const strict = t.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g) || [];
    const foundStrict = strict.find(isReal);
    if (foundStrict) return foundStrict;

    const labeled = t.match(/(?:email\s*(?:id)?|e-mail|mail|contact\s*email)\s*[:\-–—]?\s*([^\s]+)\b/gi) || [];
    for (const m of labeled) {
      const candidate = (m.split(/[:\-–—]/).pop() || '').trim();
      if (isReal(candidate)) return candidate;
    }

    const spaced = t.match(/[A-Za-z0-9._%+\-\s]+@\s*[A-Za-z0-9.\-\s]+\s*\.\s*[A-Za-z]{2,}/gi) || [];
    for (const s of spaced) {
      const collapsed = s.replace(/\s+/g, '');
      if (isReal(collapsed)) return collapsed;
    }

    return null;
  };

  const extractEmailFromPdf = async (fileUrl: string): Promise<string | null> => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const res = await fetch(fileUrl);
      const arrayBuffer = await res.arrayBuffer();
      const loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const tc = await page.getTextContent();
        const pageText = (tc.items || []).map((i: any) => i.str).join(' ');
        fullText += ' ' + pageText;
      }
      return extractEmailFromText(fullText);
    } catch (e) {
      console.warn('Local PDF text extraction failed:', e);
      return null;
    }
  };
  const fixEmail = async (cvFile: any) => {
    const profile = (cvFile as any).profiles;
    const parsedEmail = getParsedEmail(cvFile);
    
    if (!profile?.id) {
      toast.error('No profile found.');
      return;
    }
    
    // For PDFs, try to re-parse if no valid email found
    if (!isValidEmail(parsedEmail) && cvFile.file_type?.includes('pdf')) {
      toast.info('Re-parsing PDF for email extraction...');
      try {
        const { data, error } = await supabase.functions.invoke('cv-parser', {
          body: {
            fileUrl: cvFile.file_url,
            fileName: cvFile.original_filename,
            fileType: cvFile.file_type,
            batchId: 'reparse-' + Date.now(),
            forceReparse: true
          }
        });
        
        if (error) throw error;
        
        const parsed = (data as any) || {};
        const newEmail = parsed?.parsedCV?.personal_info?.email || parsed?.extractedData?.personal_info?.email;
        if (isValidEmail(newEmail)) {
          await supabase
            .from('profiles')
            .update({ email: newEmail })
            .eq('id', profile.id);
          
          if (parsed?.parsedCV || parsed?.extractedData) {
            await supabase
              .from('cv_files')
              .update({ parsing_results: parsed?.parsedCV || parsed?.extractedData })
              .eq('id', cvFile.id);
          }
            
          toast.success('Email extracted and updated successfully');
          queryClient.invalidateQueries({ queryKey: ['cv-files'] });
          return;
        }
      } catch (e: any) {
        console.error('Re-parsing failed:', e);
      }
    }
    
    if (!isValidEmail(parsedEmail)) {
      if (cvFile.file_type?.includes('pdf')) {
        toast.info('Trying local PDF extraction...');
        try {
          const localEmail = await extractEmailFromPdf(cvFile.file_url);
          if (isValidEmail(localEmail)) {
            await supabase
              .from('profiles')
              .update({ email: localEmail })
              .eq('id', profile.id);

            const mergedResults = {
              ...(cvFile.parsing_results || {}),
              personal_info: {
                ...((cvFile.parsing_results || {}).personal_info || {}),
                email: localEmail,
              }
            };
            await supabase
              .from('cv_files')
              .update({ parsing_results: mergedResults })
              .eq('id', cvFile.id);

            toast.success('Email extracted and updated successfully');
            queryClient.invalidateQueries({ queryKey: ['cv-files'] });
            return;
          }
        } catch (e) {
          console.warn('Local PDF extraction error:', e);
        }
      }
      toast.error('No valid email found. Please check the original CV file.');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email: parsedEmail })
        .eq('id', profile.id);
      if (error) throw error;
      toast.success('Email updated successfully');
      queryClient.invalidateQueries({ queryKey: ['cv-files'] });
    } catch (e: any) {
      toast.error(`Failed to update email: ${e.message || e}`);
    }
  };

  const openFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const downloadFile = async (fileUrl: string, filename: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load CV files: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!cvFiles || cvFiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No CV Files Found</h3>
          <p className="text-muted-foreground">
            Upload some CVs using the Bulk Upload tab to see them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {cvFiles.length} CV File{cvFiles.length !== 1 ? 's' : ''} Uploaded
        </h3>
        <Badge variant="secondary">{cvFiles.filter(f => f.parsing_status === 'completed').length} Parsed</Badge>
      </div>

      <div className="grid gap-4">
        {cvFiles.map((cvFile) => (
          <Card key={cvFile.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {cvFile.original_filename}
                    </h4>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(cvFile.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      
                      <Badge 
                        variant={cvFile.parsing_status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {cvFile.parsing_status}
                      </Badge>
                      
                      {cvFile.file_type && (
                        <Badge variant="outline" className="text-xs">
                          {cvFile.file_type.split('/').pop()?.toUpperCase()}
                        </Badge>
                      )}
                    </div>

                    {cvFile.profiles && (
                      (() => {
                        const profile = (cvFile.profiles as any);
                        const profileEmail = profile?.email || '';
                        const parsedEmail = getParsedEmail(cvFile);
                        const displayEmail = isValidEmail(parsedEmail) ? parsedEmail : (profileEmail || 'No email');
                        const showFixButton = isTempEmail(profileEmail) && (isValidEmail(parsedEmail) || cvFile.file_type?.includes('pdf'));
                        
                        return (
                          <div className="flex items-center space-x-2 mt-3 p-3 bg-muted/50 rounded-lg">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{profile?.full_name || 'Unknown User'}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                                {isTempEmail(profileEmail) && (
                                  <Badge variant="destructive" className="text-xs">Temp Email</Badge>
                                )}
                                {showFixButton && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => fixEmail(cvFile)}
                                    className="ml-auto"
                                  >
                                    Fix email
                                  </Button>
                                )}
                              </div>
                              {profile?.location && (
                                <p className="text-xs text-muted-foreground">{profile.location}</p>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {cvFile.parsing_results && typeof cvFile.parsing_results === 'object' && cvFile.parsing_results !== null && (
                      <div className="mt-3 text-sm">
                        <p className="text-muted-foreground">
                          <strong>Skills:</strong> {
                            Array.isArray((cvFile.parsing_results as any).skills) 
                              ? (cvFile.parsing_results as any).skills.slice(0, 3).join(', ') 
                              : 'N/A'
                          }
                          {Array.isArray((cvFile.parsing_results as any).skills) && (cvFile.parsing_results as any).skills.length > 3 && 
                            ` +${(cvFile.parsing_results as any).skills.length - 3} more`}
                        </p>
                        {(cvFile.parsing_results as any).years_of_experience && (
                          <p className="text-muted-foreground">
                            <strong>Experience:</strong> {(cvFile.parsing_results as any).years_of_experience} years
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openFile(cvFile.file_url)}
                    className="gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(cvFile.file_url, cvFile.original_filename)}
                    className="gap-2"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};