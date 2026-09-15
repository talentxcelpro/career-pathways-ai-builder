
import React, { useState } from 'react';
import { ThreePaneResumeBuilder } from './ThreePaneResumeBuilder';
import { useResumeData } from '@/hooks/useResumeData';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { JobTargetingPanel } from './JobTargetingPanel';
import { LinkedInSyncPanel } from './LinkedInSyncPanel';
import { CoverLetterPanel } from './CoverLetterPanel';
import { InterviewPrepPanel } from './InterviewPrepPanel';
import { NewAnalyticsDashboard } from '../analytics/NewAnalyticsDashboard';
import { coreToEditor, editorToCore } from '@/utils/resume-adapters';

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
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [showInterviewPrep, setShowInterviewPrep] = useState(false);

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
      <ThreePaneResumeBuilder
        data={coreToEditor(resumeData)}
        onChange={(editorData) => setResumeData(editorToCore(editorData))}
      />

      {/* Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <Button 
          onClick={() => setShowAnalytics(true)} 
          variant="outline"
          size="sm"
          aria-label="View analytics"
        >
          📊 Analytics
        </Button>
        <Button 
          onClick={() => setShowInterviewPrep(true)} 
          variant="outline"
          size="sm"
          aria-label="Interview prep"
        >
          💬 Interview Prep
        </Button>
        <Button 
          onClick={() => setShowCoverLetter(true)} 
          variant="outline"
          size="sm"
          aria-label="Generate cover letter"
        >
          📝 Cover Letter
        </Button>
        <Button 
          onClick={() => setShowLinkedIn(true)} 
          variant="outline"
          size="sm"
          aria-label="Sync LinkedIn"
        >
          💼 LinkedIn
        </Button>
        <Button 
          onClick={() => setTargetingOpen(true)} 
          className="bg-primary"
          size="sm"
          aria-label="Open job targeting"
        >
          🎯 Target Job
        </Button>
      </div>

      {/* Panels */}
      <JobTargetingPanel 
        isOpen={isTargetingOpen}
        onClose={() => setTargetingOpen(false)}
        resumeData={resumeData}
      />

      {/* LinkedIn Sync Panel */}
      {showLinkedIn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <LinkedInSyncPanel />
            <Button 
              variant="outline" 
              onClick={() => setShowLinkedIn(false)}
              className="mt-4 w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Cover Letter Panel */}
      <CoverLetterPanel
        isOpen={showCoverLetter}
        onClose={() => setShowCoverLetter(false)}
        resumeData={resumeData}
      />

      {/* Interview Prep Panel */}
      <InterviewPrepPanel
        isOpen={showInterviewPrep}
        onClose={() => setShowInterviewPrep(false)}
        resumeData={resumeData}
      />

      {/* Analytics Dashboard */}
      {showAnalytics && resumeId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-background rounded-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Resume Analytics</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAnalytics(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              <NewAnalyticsDashboard resumeId={resumeId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
