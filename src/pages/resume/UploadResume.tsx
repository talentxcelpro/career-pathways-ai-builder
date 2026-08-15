import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseResumeFile } from "@/services/resumeParsingService";

const UploadResume = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      toast.info('Parsing resume...', { description: 'Please wait while we extract your information.' });
      
      // Parse resume
      const parsedData = await parseResumeFile(file);
      
      toast.success('Resume parsed successfully!', { description: 'Opening editor...' });
      
      // Check if user is authenticated and attempt DB save gracefully
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (auth?.user) {
          const title = parsedData?.personalInfo?.fullName
            ? `${parsedData.personalInfo.fullName}'s Resume`
            : 'My Resume';

          const { data: inserted, error } = await supabase
            .from('ai_resumes')
            .insert({
              user_id: auth.user.id,
              title,
              content: parsedData,
              is_primary: false,
              ats_score: 0,
            })
            .select('id')
            .single();

          if (!error && inserted?.id) {
            navigate(`/resume/build/${inserted.id}`);
            return;
          }
        }
      } catch (dbErr) {
        console.warn('⚠️ Supabase DB insert skipped, navigating with in-memory state:', dbErr);
      }
      
      // Navigate to editor with parsed data in state
      navigate('/resume/build', { state: { resumeData: parsedData } });
      
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Upload Failed', { 
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Upload Your Resume</h1>
          <p className="text-muted-foreground text-lg">
            Upload your resume and we'll help you enhance it
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all">
              <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                <label htmlFor="resume-upload" className="cursor-pointer block">
                  {file ? (
                    <div className="space-y-4">
                      <FileText className="h-16 w-16 mx-auto text-primary" />
                      <div>
                        <p className="font-semibold text-lg text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-sm text-primary mt-2">Click to change file</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-16 w-16 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-lg text-foreground">Click to upload</p>
                      <p className="text-sm text-muted-foreground mt-1">
                          Supports PDF, DOC, DOCX, TXT, RTF, ODT, and Images
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">Maximum file size: 10MB</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing Resume...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Parse & Continue to Editor
                  </>
                )}
              </Button>

              {/* Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Your resume will be parsed and you'll be taken directly to the editor to review and enhance it.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>🔒 Your data is secure. We never share your information.</p>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
