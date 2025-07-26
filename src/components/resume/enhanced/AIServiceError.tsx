import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Wifi, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIServiceErrorProps {
  error: string;
  onRetry?: () => void;
  showTroubleshooting?: boolean;
}

export const AIServiceError: React.FC<AIServiceErrorProps> = ({ 
  error, 
  onRetry, 
  showTroubleshooting = true 
}) => {
  const getErrorIcon = () => {
    if (error.includes('connection') || error.includes('network')) {
      return <Wifi className="h-8 w-8 text-orange-500" />;
    }
    return <AlertTriangle className="h-8 w-8 text-red-500" />;
  };

  const getErrorTitle = () => {
    if (error.includes('connection') || error.includes('network')) {
      return 'Connection Issue';
    }
    if (error.includes('AI service')) {
      return 'AI Service Unavailable';
    }
    return 'Processing Error';
  };

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {getErrorIcon()}
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{getErrorTitle()}</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {error}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {showTroubleshooting && (
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
            )}
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground max-w-md">
            <p className="font-medium mb-1">💡 Quick fixes to try:</p>
            <ul className="space-y-1 text-left">
              <li>• Check your internet connection</li>
              <li>• Refresh the page and try again</li>
              <li>• Wait a moment and retry</li>
              <li>• Use a smaller file or simpler text</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};