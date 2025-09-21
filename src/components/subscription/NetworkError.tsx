import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Wifi } from "lucide-react";

interface NetworkErrorProps {
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry, isRetrying }) => {
  return (
    <Alert className="mb-4 border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Connection Issue</AlertTitle>
      <AlertDescription className="text-red-700">
        <div className="space-y-3">
          <p>
            We're having trouble connecting to our payment system. This could be due to:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Temporary network connectivity issues</li>
            <li>Server maintenance (usually brief)</li>
            <li>Your internet connection</li>
          </ul>
          <div className="flex items-center space-x-3 pt-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            )}
            <span className="text-xs text-red-600">
              💡 If the issue persists, please check your connection and try again in a few moments.
            </span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};