import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { getPDFWorkerStatus, isPDFWorkerReady } from '@/utils/pdfWorkerConfig';

interface PDFWorkerStatusProps {
  className?: string;
}

export const PDFWorkerStatus: React.FC<PDFWorkerStatusProps> = ({ className }) => {
  const [status, setStatus] = React.useState<string>('');
  const [isReady, setIsReady] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkStatus = () => {
      setStatus(getPDFWorkerStatus());
      setIsReady(isPDFWorkerReady());
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (status === 'Not configured') {
      return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
    }
    if (isReady && status !== 'Disabled (no worker)') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (status === 'Disabled (no worker)') {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = () => {
    if (status === 'Not configured') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (isReady && status !== 'Disabled (no worker)') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'Disabled (no worker)') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getDescription = () => {
    switch (status) {
      case 'Local worker':
        return 'Using locally hosted PDF worker for optimal performance';
      case 'CDNJS worker':
        return 'Using CDNJS fallback worker';
      case 'JSDelivr worker':
        return 'Using JSDelivr fallback worker';
      case 'Inline worker':
        return 'Using inline worker fallback';
      case 'Disabled (no worker)':
        return 'PDF processing will be slower without worker';
      case 'Not configured':
        return 'Configuring PDF worker...';
      default:
        return 'Unknown worker configuration';
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">PDF Processor</span>
              <Badge className={`text-xs ${getStatusColor()}`}>
                {status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getDescription()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};