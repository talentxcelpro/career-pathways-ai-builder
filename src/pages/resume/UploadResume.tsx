import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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
      // Parse resume
      const parsedData = await parseResumeFile(file);
      
      // Save and navigate
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

        if (error) throw error;
        
        const newId = inserted?.id;
        if (newId) {
          navigate(`/resume/build/${newId}`);
          return;
        }
      }
      
      // Not signed in - go to editor with data
      navigate('/resume/build', { state: { resumeData: parsedData } });
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast({ 
        title: 'Upload failed', 
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Resume</h1>
          <p className="text-gray-600">Upload your resume and we'll help you enhance it</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                <label htmlFor="resume-upload" className="cursor-pointer block">
                  {file ? (
                    <div className="space-y-3">
                      <FileText className="h-12 w-12 mx-auto text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">Click to change file</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="h-12 w-12 mx-auto text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-700">Click to upload</p>
                        <p className="text-sm text-gray-500">PDF, DOC, DOCX, or TXT</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload and Continue
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadResume;
