import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { executeJobUpload } from '@/utils/uploadNewJobs';
import { toast } from 'sonner';

const AdminJobUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const result = await executeJobUpload();
      setUploadResult(result);
      
      if (result?.success) {
        toast.success(`Successfully uploaded ${result.successfulJobs} jobs!`);
      } else {
        toast.error('Upload failed. Check console for details.');
      }
    } catch (error) {
      toast.error('Upload failed. Check console for details.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Job Upload</CardTitle>
          <CardDescription>
            Upload the new batch of TalentXcel fresher jobs to the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            size="lg"
          >
            {isUploading ? 'Uploading...' : 'Upload New Jobs (30 positions)'}
          </Button>
          
          {uploadResult && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Upload Results:</h3>
              <p>Total Jobs: {uploadResult.totalJobs}</p>
              <p>Successful: {uploadResult.successfulJobs}</p>
              <p>Failed: {uploadResult.failedJobs}</p>
              
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium text-red-600">Errors:</h4>
                  <pre className="text-sm text-red-500 whitespace-pre-wrap">
                    {JSON.stringify(uploadResult.errors, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminJobUpload;