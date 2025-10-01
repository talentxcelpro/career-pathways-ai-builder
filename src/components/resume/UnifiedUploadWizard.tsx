import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { parseResumeFile } from "@/services/resumeParsingService";
import { enhanceResume } from "@/services/resumeEnhancementService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Step = "upload" | "parsing" | "enhancing" | "complete";

interface ProcessingState {
  step: Step;
  progress: number;
  message: string;
}

export const UnifiedUploadWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [processing, setProcessing] = useState<ProcessingState | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);

  const processResume = async (file: File) => {
    try {
      // Step 1: Upload
      setProcessing({
        step: "upload",
        progress: 10,
        message: "Uploading your resume..."
      });

      // Upload to storage
      const fileName = `resume-${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Step 2: Parsing
      setProcessing({
        step: "parsing",
        progress: 30,
        message: "AI is extracting information from your resume..."
      });

      const parsed = await parseResumeFile(file);
      setParsedData(parsed);

      await new Promise(resolve => setTimeout(resolve, 1000)); // UX delay

      // Step 3: Enhancing
      setProcessing({
        step: "enhancing",
        progress: 60,
        message: "AI is enhancing your resume content..."
      });

      // Enhance key sections
      const enhancedSummary = await enhanceResume({
        action: "generate_summary",
        content: JSON.stringify(parsed)
      });

      const enhancedData = {
        ...parsed,
        summary: enhancedSummary.enhanced
      };

      // Step 4: Save to database
      setProcessing({
        step: "enhancing",
        progress: 80,
        message: "Saving your enhanced resume..."
      });

      if (user) {
        const { data: resumeData, error: saveError } = await supabase
          .from('ai_resumes')
          .insert({
            user_id: user.id,
            title: `${parsed.personalInfo?.fullName || 'Untitled'}'s Resume`,
            content: enhancedData,
            ats_score: 75 // Initial score
          })
          .select()
          .single();

        if (saveError) throw saveError;

        // Step 5: Complete
        setProcessing({
          step: "complete",
          progress: 100,
          message: "Resume enhanced successfully!"
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Navigate to builder
        navigate(`/resume/build/${resumeData.id}`);
        toast.success("Resume uploaded and enhanced!");
      } else {
        // No user - still show preview
        setProcessing({
          step: "complete",
          progress: 100,
          message: "Resume parsed successfully! Sign in to save."
        });

        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate('/resume/build', { state: { resumeData: enhancedData } });
      }

    } catch (error) {
      console.error('Resume processing error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process resume');
      setProcessing(null);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    processResume(file);
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: !!processing
  });

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {processing.step === "complete" ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {processing.step === "upload" && "Uploading Resume"}
              {processing.step === "parsing" && "Parsing Resume"}
              {processing.step === "enhancing" && "Enhancing with AI"}
              {processing.step === "complete" && "All Done!"}
            </CardTitle>
            <CardDescription className="text-base">
              {processing.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={processing.progress} className="h-3" />
            <p className="text-center text-sm text-muted-foreground mt-4">
              {processing.progress}% complete
            </p>

            {/* Processing steps visualization */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              {[
                { label: "Upload", step: "upload", icon: Upload },
                { label: "Parse", step: "parsing", icon: FileText },
                { label: "Enhance", step: "enhancing", icon: Sparkles },
                { label: "Complete", step: "complete", icon: CheckCircle }
              ].map(({ label, step, icon: Icon }) => {
                const isActive = processing.step === step;
                const isComplete = processing.progress > (
                  step === "upload" ? 25 : 
                  step === "parsing" ? 50 : 
                  step === "enhancing" ? 75 : 90
                );
                
                return (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={`p-3 rounded-full ${
                      isComplete ? 'bg-green-500 text-white' :
                      isActive ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs ${
                      isActive ? 'font-semibold' : ''
                    }`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
            <Upload className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl mb-2">Upload Your Resume</CardTitle>
          <CardDescription className="text-base">
            Upload your existing resume and we'll enhance it with AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-all duration-300 hover:border-primary hover:bg-primary/5
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full ${
                isDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <FileText className="h-12 w-12" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse files
                </p>
                <Button variant="outline" size="lg">
                  Choose File
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Supported formats: PDF, DOCX, DOC, TXT</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold mb-1">AI Enhancement</h4>
              <p className="text-sm text-muted-foreground">
                Automatically improve content
              </p>
            </div>
            <div className="text-center p-4">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold mb-1">Smart Parsing</h4>
              <p className="text-sm text-muted-foreground">
                Extract all information accurately
              </p>
            </div>
            <div className="text-center p-4">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold mb-1">ATS Optimized</h4>
              <p className="text-sm text-muted-foreground">
                Formatted for job systems
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/resume/build')}
            >
              Start from scratch instead →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
