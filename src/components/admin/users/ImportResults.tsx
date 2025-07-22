
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, RotateCcw, AlertTriangle, Wifi, Server, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ImportResult {
  email: string;
  success: boolean;
  error?: string;
  retryCount?: number;
  errorType?: 'network' | 'validation' | 'server' | 'unknown';
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
  const [expandedErrorTypes, setExpandedErrorTypes] = useState<Record<string, boolean>>({});

  if (results.length === 0) {
    return null;
  }

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  // Group failed results by error type
  const failedByType = failed.reduce((acc, result) => {
    const type = result.errorType || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(result);
    return acc;
  }, {} as Record<string, ImportResult[]>);

  const getErrorTypeIcon = (type: string) => {
    switch (type) {
      case 'network':
        return <Wifi className="h-4 w-4" />;
      case 'validation':
        return <AlertTriangle className="h-4 w-4" />;
      case 'server':
        return <Server className="h-4 w-4" />;
      default:
        return <ShieldAlert className="h-4 w-4" />;
    }
  };

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'network':
        return 'text-orange-600';
      case 'validation':
        return 'text-yellow-600';
      case 'server':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getErrorTypeDescription = (type: string) => {
    switch (type) {
      case 'network':
        return 'Connection or timeout issues. Try using "Slow" speed or check your internet connection.';
      case 'validation':
        return 'Data validation errors. Check email format, name length, and role values.';
      case 'server':
        return 'Server-side errors. Contact support if this persists.';
      default:
        return 'Unknown error type. Contact support if this persists.';
    }
  };

  const toggleErrorType = (type: string) => {
    setExpandedErrorTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Only show retry button for network and server errors
  const retryableErrors = failed.filter(r => 
    r.errorType === 'network' || r.errorType === 'server' || r.errorType === 'unknown'
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Import Results</CardTitle>
          {retryableErrors.length > 0 && onRetryFailed && (
            <Button
              onClick={() => onRetryFailed(retryableErrors)}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retry Network/Server Errors ({retryableErrors.length})
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

        {/* Failed Results - Grouped by Error Type */}
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
              <div className="mt-2 space-y-3 pl-6">
                {Object.entries(failedByType).map(([errorType, errors]) => (
                  <div key={errorType} className="space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => toggleErrorType(errorType)}
                      className={`flex items-center gap-2 p-0 h-auto font-medium ${getErrorTypeColor(errorType)}`}
                    >
                      {expandedErrorTypes[errorType] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      {getErrorTypeIcon(errorType)}
                      {errorType.charAt(0).toUpperCase() + errorType.slice(1)} Errors ({errors.length})
                    </Button>
                    
                    {/* Error type description */}
                    <div className="text-xs text-gray-600 italic pl-8">
                      {getErrorTypeDescription(errorType)}
                    </div>

                    {expandedErrorTypes[errorType] && (
                      <div className="pl-8 space-y-2">
                        {errors.map((result, index) => (
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary and Recommendations */}
        {failed.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <div className="font-medium text-blue-800 mb-2">💡 Troubleshooting Tips:</div>
            <ul className="text-blue-700 space-y-1 list-disc list-inside">
              {failedByType.network && (
                <li>
                  <strong>Network Issues ({failedByType.network.length}):</strong> Use "Slow" import speed, 
                  check internet connection, or try again later
                </li>
              )}
              {failedByType.validation && (
                <li>
                  <strong>Validation Issues ({failedByType.validation.length}):</strong> Check CSV format - 
                  emails must contain @, names must be 2+ characters, roles must be valid
                </li>
              )}
              {failedByType.server && (
                <li>
                  <strong>Server Issues ({failedByType.server.length}):</strong> Try again in a few minutes 
                  or contact support if persisting
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
