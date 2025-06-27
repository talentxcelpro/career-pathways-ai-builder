
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { DocumentUploadForm } from "@/components/profile/documents/DocumentUploadForm";
import { DocumentsList } from "@/components/profile/documents/DocumentsList";
import { DocumentTypeCards } from "@/components/profile/documents/DocumentTypeCards";
import { useFileUpload } from "@/hooks/useFileUpload";

const ProfileDocuments = () => {
  const { toast } = useToast();
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'documents',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
  });
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [documents] = useState([
    {
      id: 1,
      name: "Software Engineering Certificate",
      type: "certification",
      fileName: "cert-software-eng.pdf",
      uploadDate: "2024-01-15",
      size: "2.3 MB",
      verified: true
    },
    {
      id: 2,
      name: "Bachelor's Degree Transcript",
      type: "education",
      fileName: "transcript-bachelor.pdf",
      uploadDate: "2024-01-10",
      size: "1.8 MB",
      verified: true
    },
    {
      id: 3,
      name: "Driver's License",
      type: "identification",
      fileName: "drivers-license.jpg",
      uploadDate: "2024-01-08",
      size: "0.5 MB",
      verified: false
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'certification',
    file: null as File | null
  });

  const handleUpload = async () => {
    if (!formData.file) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileUrl = await uploadFile(formData.file, `documents/${Date.now()}`);
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully.",
      });
      
      setFormData({ name: '', type: 'certification', file: null });
      setShowUploadForm(false);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (docId: number, fileName: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${fileName}...`,
    });
  };

  const handleDelete = (docId: number) => {
    toast({
      title: "Document Deleted",
      description: "The document has been removed from your profile.",
    });
  };

  return (
    <ProfileLayout 
      title="Documents" 
      description="Manage your certificates, education documents, and professional credentials"
    >
      <div className="space-y-6">
        {/* Document Type Overview */}
        <DocumentTypeCards documents={documents} />

        {/* Upload Form */}
        {showUploadForm && (
          <DocumentUploadForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpload}
            onCancel={() => setShowUploadForm(false)}
          />
        )}

        {/* Documents List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>Manage and organize your professional documents</CardDescription>
              </div>
              <Button 
                onClick={() => setShowUploadForm(true)}
                disabled={uploading}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Add Document'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DocumentsList
              documents={documents}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        {/* Document Tips */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Document Guidelines</CardTitle>
            <CardDescription>Best practices for uploading documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">High Quality Scans</h4>
                  <p className="text-sm text-gray-600">Ensure documents are clear and readable with good resolution.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">Supported Formats</h4>
                  <p className="text-sm text-gray-600">Upload PDF, DOC, DOCX, JPG, or PNG files up to 10MB.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                  <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">Privacy & Security</h4>
                  <p className="text-sm text-gray-600">All documents are securely stored and only visible to you and authorized recruiters.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  );
};

export default ProfileDocuments;
