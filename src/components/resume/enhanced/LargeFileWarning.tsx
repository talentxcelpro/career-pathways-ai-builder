import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileText, Upload, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LargeFileWarningProps {
  fileSize: number;
  fileName: string;
  onProceed?: () => void;
  onCancel?: () => void;
}

export const LargeFileWarning: React.FC<LargeFileWarningProps> = ({ 
  fileSize, 
  fileName,
  onProceed, 
  onCancel 
}) => {
  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(1);
  const isVeryLarge = fileSize > 5 * 1024 * 1024; // 5MB

  return (
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-700">
          <AlertTriangle className="h-5 w-5" />
          Large File Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{fileName}</span>
          <Badge variant={isVeryLarge ? "destructive" : "secondary"}>
            {fileSizeMB} MB
          </Badge>
        </div>

        {isVeryLarge ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Files larger than 5MB may cause processing timeouts. We recommend compressing your file first.
            </p>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Quick fixes:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Use a PDF compressor (like SmallPDF or PDF24)</li>
                <li>• Remove unnecessary images or graphics</li>
                <li>• Export as a simpler PDF format</li>
                <li>• Copy and paste text instead of uploading</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={onCancel} variant="outline" size="sm">
                Choose Different File
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This file is large and may take longer to process. You can proceed or try a smaller file for faster results.
            </p>
            
            <div className="flex gap-2">
              <Button onClick={onProceed} size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Process Anyway
              </Button>
              <Button onClick={onCancel} variant="outline" size="sm">
                Choose Different File
              </Button>
            </div>
          </div>
        )}

        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Alternative: Manual Entry
          </h4>
          <p className="text-xs text-green-700">
            Skip file upload and build your resume step-by-step with AI assistance for each section.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};