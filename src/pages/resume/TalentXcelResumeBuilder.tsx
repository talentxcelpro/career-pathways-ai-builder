import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThreePaneResumeBuilder } from '@/components/resume/enhanced/ThreePaneResumeBuilder';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const TalentXcelResumeBuilder = () => {
  console.log('🎯 TalentXcelResumeBuilder component is rendering!');
  const { id } = useParams();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<any>(null);

  // If no resume data, redirect to upload
  if (!resumeData && !id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Resume Data</h2>
          <p className="text-muted-foreground">Please upload a resume first</p>
          <Button onClick={() => navigate('/resume/upload')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Resume
          </Button>
        </div>
      </div>
    );
  }

  // Show the three-pane builder with proper props
  return (
    <ErrorBoundary>
      <ThreePaneResumeBuilder 
        data={resumeData} 
        onChange={setResumeData}
      />
    </ErrorBoundary>
  );
};

export default TalentXcelResumeBuilder;