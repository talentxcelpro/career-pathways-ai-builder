
import React, { useState } from 'react';
import { UnifiedResumeInterface } from './UnifiedResumeInterface';
import { useResumeData } from '@/hooks/useResumeData';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { JobTargetingPanel } from './JobTargetingPanel';

interface EnhancedResumeBuilderProps {
  mode?: 'edit' | 'create';
}

export const EnhancedResumeBuilder: React.FC<EnhancedResumeBuilderProps> = ({ 
  mode = 'edit' 
}) => {
  const { 
    resumeData, 
    setResumeData, 
    isLoading, 
    error, 
    isNewResume, 
    resumeId,
    refreshData 
  } = useResumeData();
  const [isTargetingOpen, setTargetingOpen] = useState(false);

  console.log('EnhancedResumeBuilder state:', {
    resumeData: !!resumeData,
    isLoading,
    error,
    isNewResume,
    resumeId,
    mode
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Resume Builder</h2>
          <p className="text-muted-foreground">
            {resumeId && resumeId !== 'new' 
              ? 'Fetching your resume data...' 
              : 'Setting up new resume...'
            }
          </p>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error && !resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Resume</h2>
          <p className="text-muted-foreground mb-4">
            {error}
          </p>
          <div className="space-y-2">
            <Button onClick={refreshData} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/resume-builder'}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure we have resume data before rendering the interface
  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Resume Data</h2>
          <p className="text-muted-foreground mb-4">
            Unable to initialize resume data
          </p>
          <Button onClick={() => window.location.href = '/resume-builder'}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const effectiveMode = isNewResume ? 'create' : mode;
  return (
    <div className="min-h-screen bg-background relative">
      <UnifiedResumeInterface 
        mode={effectiveMode}
        initialData={resumeData}
        onDataChange={setResumeData}
      />

      <Button 
        onClick={() => setTargetingOpen(true)} 
        className="fixed bottom-6 right-6 z-50"
        aria-label="Open job targeting"
      >
        Target a Job
      </Button>

      <JobTargetingPanel 
        isOpen={isTargetingOpen}
        onClose={() => setTargetingOpen(false)}
        resumeData={resumeData}
      />
    </div>
  );
};
