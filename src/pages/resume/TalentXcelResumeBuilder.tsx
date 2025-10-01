import { useParams, useNavigate } from 'react-router-dom';
import { ThreePaneResumeBuilder } from '@/components/resume/enhanced/ThreePaneResumeBuilder';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useResumeData } from '@/hooks/useResumeData';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { editorToCore, coreToEditor } from '@/utils/resume-adapters';
import { Helmet } from 'react-helmet-async';

const TalentXcelResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resumeData, isLoading, error } = useResumeData();
  const { saveResume, isSaving, updateResumeData } = useResumeBuilder(resumeData || undefined);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your resume...</p>
        </div>
      </div>
    );
  }

  // Show error or no data state
  if (error || !resumeData) {
    return (
      <>
        <Helmet>
          <title>Resume Builder | TalentXcel</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="text-center space-y-4 p-8">
            <h2 className="text-2xl font-bold">
              {error ? 'Error Loading Resume' : 'No Resume Found'}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {error || 'Start by uploading an existing resume or creating a new one from scratch'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/resume/upload')} variant="default">
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
              <Button onClick={() => navigate('/resume/new')} variant="outline">
                Create New Resume
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Convert CoreResumeData to EditorResume format
  const editorData = coreToEditor(resumeData);

  const handleChange = (updatedData: any) => {
    // Convert back to core format and update
    const coreData = editorToCore(updatedData);
    updateResumeData(coreData);
  };

  return (
    <>
      <Helmet>
        <title>Edit Resume - {resumeData.personalInfo.fullName || 'TalentXcel Resume Builder'}</title>
        <meta name="description" content="Professional resume builder with AI assistance, ATS optimization, and multiple templates" />
      </Helmet>
      <ErrorBoundary>
        <ThreePaneResumeBuilder 
          data={editorData}
          onChange={handleChange}
          onSave={saveResume}
        />
      </ErrorBoundary>
    </>
  );
};

export default TalentXcelResumeBuilder;