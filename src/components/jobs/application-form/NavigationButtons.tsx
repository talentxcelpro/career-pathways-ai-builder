
import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  canSubmit: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function NavigationButtons({
  currentStep,
  totalSteps,
  isSubmitting,
  canSubmit,
  onPrevious,
  onNext,
  onSubmit
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between items-center pt-3 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        size="sm"
        className="h-8 px-3"
      >
        Previous
      </Button>
      
      <div className="flex space-x-2">
        {currentStep < totalSteps ? (
          <Button
            onClick={onNext}
            size="sm"
            className="h-8 px-3"
          >
            Next
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3"
              onClick={() => toast.success('Draft saved!')}
            >
              Save Draft
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting || !canSubmit}
              size="sm"
              className="h-8 px-3"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
