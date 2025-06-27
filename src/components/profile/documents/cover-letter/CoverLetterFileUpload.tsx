
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useState } from "react";

export const CoverLetterFileUpload = () => {
  const { toast } = useToast();
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'cover-letters',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
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
        description: "Please select a cover letter file to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileUrl = await uploadFile(selectedFile);
      
      toast({
        title: "Cover Letter Uploaded",
        description: "Your cover letter has been uploaded successfully.",
      });
      
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('cover-letter-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Cover letter upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload cover letter. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Cover Letters
        </CardTitle>
        <CardDescription>Upload existing cover letter documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            id="cover-letter-file"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: PDF, DOC, DOCX (Max 5MB)
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
        
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Cover Letter'}
        </Button>
      </CardContent>
    </Card>
  );
};
