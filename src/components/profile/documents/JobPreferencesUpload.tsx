
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useState } from "react";

export const JobPreferencesUpload = () => {
  const { toast } = useToast();
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'preferences',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/json', 'text/plain', 'application/pdf']
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileUrl = await uploadFile(selectedFile);
      
      toast({
        title: "Preferences Uploaded",
        description: "Your job preferences file has been uploaded successfully.",
      });
      
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('preferences-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Preferences upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload preferences file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    // Mock export functionality
    const preferences = {
      preferredRoles: ["Software Engineer", "Full Stack Developer"],
      locations: ["Remote", "San Francisco", "New York"],
      salaryRange: { min: 80000, max: 150000 },
      workType: "Remote",
      industries: ["Technology", "Fintech"],
      companySize: ["Startup", "Medium"]
    };

    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'job-preferences.json';
    link.click();

    toast({
      title: "Preferences Exported",
      description: "Your job preferences have been downloaded as a JSON file.",
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Import/Export Job Preferences</CardTitle>
        <CardDescription>Upload or download your job preference settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Upload Preferences File</label>
            <Input
              id="preferences-file"
              type="file"
              accept=".json,.txt,.pdf"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JSON, TXT, PDF (Max 5MB)
            </p>
          </div>
          
          {selectedFile && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading..' : 'Upload Preferences'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="flex-1"
            >
              Export Current Preferences
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">How it works</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Upload: Import job preferences from a JSON or text file</li>
            <li>• Export: Download your current preferences for backup or sharing</li>
            <li>• Format: JSON files should contain preference objects with relevant fields</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
