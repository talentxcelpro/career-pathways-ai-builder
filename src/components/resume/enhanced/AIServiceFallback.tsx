import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIServiceError } from '@/components/resume/enhanced/AIServiceError';

interface AIServiceFallbackProps {
  onManualEntry?: () => void;
  onRetry?: () => void;
  error?: string;
}

export const AIServiceFallback: React.FC<AIServiceFallbackProps> = ({ 
  onManualEntry, 
  onRetry, 
  error 
}) => {
  return (
    <div className="space-y-4">
      {error && (
        <AIServiceError 
          error={error}
          onRetry={onRetry}
          showTroubleshooting={true}
        />
      )}
      
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <FileText className="h-5 w-5" />
            Alternative: Manual Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            While we work on fixing the AI processing issue, you can still create your resume by filling out the form manually.
          </p>
          
          <div className="flex flex-wrap gap-2">
            {onManualEntry && (
              <Button onClick={onManualEntry} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Build Resume Manually
              </Button>
            )}
            
            {onRetry && (
              <Button onClick={onRetry} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try AI Upload Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">📝 Manual Entry Benefits</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Complete control over your content</li>
          <li>• Step-by-step guided process</li>
          <li>• AI assistance available for individual sections</li>
          <li>• Professional templates and formatting</li>
        </ul>
      </div>
    </div>
  );
};