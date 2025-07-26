import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, RefreshCw, FileText, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NetworkErrorFallbackProps {
  onRetry?: () => void;
  onManualEntry?: () => void;
  fileName?: string;
}

export const NetworkErrorFallback: React.FC<NetworkErrorFallbackProps> = ({ 
  onRetry, 
  onManualEntry,
  fileName 
}) => {
  return (
    <div className="space-y-4">
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Wifi className="h-5 w-5" />
            Connection Problem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Unable to connect to our AI processing service. This could be due to:
          </p>
          
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• Temporary network connectivity issues</li>
            <li>• Server maintenance or high load</li>
            <li>• Large file processing timeouts</li>
            <li>• Firewall or security settings</li>
          </ul>

          <div className="flex flex-wrap gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <Button variant="ghost" size="sm" asChild>
              <a 
                href="https://docs.lovable.dev/tips-tricks/troubleshooting" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Troubleshooting Guide
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {onManualEntry && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <FileText className="h-5 w-5" />
              Continue Without Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              While we fix the connection issue, you can still build your resume manually with AI assistance.
            </p>
            
            <Button onClick={onManualEntry} className="w-full sm:w-auto">
              <FileText className="h-4 w-4 mr-2" />
              Build Resume Manually
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">💡 Immediate Solutions</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Check your internet connection</li>
          <li>• Try refreshing the page</li>
          <li>• Use a smaller file (under 2MB)</li>
          <li>• Copy and paste your resume text instead</li>
          <li>• Try again in a few minutes</li>
        </ul>
      </div>
    </div>
  );
};