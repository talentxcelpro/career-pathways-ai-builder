
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ImportResult {
  email: string;
  success: boolean;
  error?: string;
  retryCount?: number;
}

interface ImportResultsProps {
  results: ImportResult[];
  onRetryFailed?: (failedUsers: ImportResult[]) => void;
}

export const ImportResults: React.FC<ImportResultsProps> = ({
  results,
  onRetryFailed
}) => {
  const [showSuccessful, setShowSuccessful] = useState(false);
  const [showFailed, setShowFailed] = useState(true);

  if (results.length === 0) {
    return null;
  }

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Import Results</CardTitle>
          {failed.length > 0 && onRetryFailed && (
            <Button
              onClick={() => onRetryFailed(failed)}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retry Failed ({failed.length})
            </Button>
          )}
        </div>
        <div className="text-sm text-gray-600">
          Import Complete: {successful.length} successful, {failed.length} failed
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Successful Results */}
        {successful.length > 0 && (
          <div>
            <Button
              variant="ghost"
              onClick={() => setShowSuccessful(!showSuccessful)}
              className="flex items-center gap-2 p-0 h-auto font-medium text-green-600"
            >
              {showSuccessful ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <CheckCircle className="h-4 w-4" />
              Successful ({successful.length})
            </Button>
            {showSuccessful && (
              <div className="mt-2 space-y-1 pl-6">
                {successful.map((result, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{result.email}</span>
                    {result.retryCount && result.retryCount > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        {result.retryCount} attempts
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Failed Results */}
        {failed.length > 0 && (
          <div>
            <Button
              variant="ghost"
              onClick={() => setShowFailed(!showFailed)}
              className="flex items-center gap-2 p-0 h-auto font-medium text-red-600"
            >
              {showFailed ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <XCircle className="h-4 w-4" />
              Failed ({failed.length})
            </Button>
            {showFailed && (
              <div className="mt-2 space-y-2 pl-6">
                {failed.map((result, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{result.email}</span>
                      {result.retryCount && (
                        <Badge variant="destructive" className="text-xs">
                          {result.retryCount} attempts
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-red-600 pl-2">
                      {result.error || 'Unknown error'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
