import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy file processing libraries
export const LazyResumeUploader = lazy(() => 
  import('@/components/resume/ResumeUploader').then(module => ({ default: module.ResumeUploader }))
);

// Lazy load specific file processing utilities (async functions)
export const loadDocxParser = async () => {
  // Use browser-compatible DOCX parsing
  const JSZip = (await import('jszip')).default;
  return { JSZip };
};

export const loadPDFJS = async () => {
  const module = await import('pdfjs-dist');
  return module;
};

export const loadTesseract = async () => {
  const module = await import('tesseract.js');
  return module;
};

export const loadDocx = async () => {
  const module = await import('docx');
  return module;
};

// Wrapper components with loading states
interface LazyProcessorWrapperProps {
  children: React.ReactNode;
  type?: 'uploader' | 'viewer' | 'processor';
}

export const LazyProcessorWrapper: React.FC<LazyProcessorWrapperProps> = ({ 
  children, 
  type = 'processor' 
}) => {
  const getSkeleton = () => {
    switch (type) {
      case 'uploader':
        return <UploaderSkeleton />;
      case 'viewer':
        return <ViewerSkeleton />;
      default:
        return <ProcessorSkeleton />;
    }
  };

  return (
    <Suspense fallback={getSkeleton()}>
      {children}
    </Suspense>
  );
};

const UploaderSkeleton = () => (
  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 space-y-4">
    <Skeleton className="h-12 w-12 rounded-full mx-auto" />
    <Skeleton className="h-4 w-48 mx-auto" />
    <Skeleton className="h-4 w-32 mx-auto" />
  </div>
);

const ViewerSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-96 w-full" />
  </div>
);

const ProcessorSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);