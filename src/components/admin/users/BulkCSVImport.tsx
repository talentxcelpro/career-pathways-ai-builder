import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileText, Users, Clock, TrendingUp } from 'lucide-react';
import { useBulkCSVImport } from '@/hooks/useBulkCSVImport';
import { toast } from 'sonner';

interface BulkCSVImportProps {
  onImportComplete: () => void;
}

export const BulkCSVImport: React.FC<BulkCSVImportProps> = ({ onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isImporting, progress, importFromCSV, generateCSVTemplate } = useBulkCSVImport();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      await importFromCSV(file, {
        batchSize: 500,
        maxConcurrent: 10
      });
      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk CSV Import
          </CardTitle>
          <CardDescription>
            Import up to 10,000 users daily from CSV files. Optimized for high-volume batch processing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Select CSV File'}
            </Button>
            
            <Button
              variant="outline"
              onClick={generateCSVTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>CSV format required</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Up to 10,000 users/day</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Batch processing optimized</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Import Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{progress.processed}/{progress.total} users</span>
              </div>
              <Progress value={(progress.processed / progress.total) * 100} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Successful</p>
                <p className="font-medium text-green-600">{progress.successful}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Failed</p>
                <p className="font-medium text-red-600">{progress.failed}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Batch</p>
                <p className="font-medium">{progress.batchNumber}</p>
              </div>
              {progress.usersPerSecond && (
                <div className="space-y-1">
                  <p className="text-muted-foreground">Rate</p>
                  <p className="font-medium">{progress.usersPerSecond} users/sec</p>
                </div>
              )}
            </div>

            {progress.totalTime && (
              <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total Time</p>
                  <p className="font-medium">{formatTime(progress.totalTime)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Success Rate</p>
                  <p className="font-medium">{progress.successRate?.toFixed(1)}%</p>
                </div>
              </div>
            )}

            {progress.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-600">
                  Errors ({progress.errors.length})
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {progress.errors.slice(0, 10).map((error, index) => (
                    <p key={index} className="text-xs text-red-500 bg-red-50 p-2 rounded">
                      {error}
                    </p>
                  ))}
                  {progress.errors.length > 10 && (
                    <p className="text-xs text-muted-foreground">
                      ... and {progress.errors.length - 10} more errors
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>CSV Format Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Required Column:</p>
              <p className="text-muted-foreground">• email (must be valid email address)</p>
            </div>
            <div>
              <p className="font-medium">Optional Columns:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• full_name (user's display name)</li>
                <li>• user_role (admin, job_seeker, employer, candidate)</li>
                <li>• phone (phone number)</li>
                <li>• title (job title/position)</li>
                <li>• location (city/address)</li>
                <li>• company (company/organization name)</li>
              </ul>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">Performance Tips:</p>
              <ul className="text-muted-foreground space-y-1 mt-1">
                <li>• Files up to 10,000 users process in ~30-60 seconds</li>
                <li>• Duplicate emails are automatically skipped</li>
                <li>• Users get temporary secure passwords (they can reset)</li>
                <li>• Batch processing ensures database stability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};