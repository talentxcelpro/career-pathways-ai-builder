import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "sonner";

interface SupportingDocumentsFormProps {
  formData: any;
  onInputChange: (key: string, value: any) => void;
}

const documentTypes = [
  {
    key: 'jd_flyer',
    label: 'JD Flyer',
    description: 'Job description flyer or visual representation'
  },
  {
    key: 'team_brochure',
    label: 'Team Brochure',
    description: 'Team information and company culture document'
  },
  {
    key: 'benefits_policy',
    label: 'Benefits Policy',
    description: 'Employee benefits and compensation details'
  }
];

export default function SupportingDocumentsForm({ formData, onInputChange }: SupportingDocumentsFormProps) {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  
  const { uploadFile } = useFileUpload({
    bucket: 'documents',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });

  const handleFileUpload = async (documentType: string, file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload PDF or DOCX files only');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingDocument(documentType);
    
    try {
      const uploadedUrl = await uploadFile(file, `job-documents/${documentType}`);
      
      const currentDocuments = formData.supporting_documents || [];
      const updatedDocuments = [...currentDocuments];
      
      // Find if document type already exists and update, otherwise add new
      const existingIndex = updatedDocuments.findIndex(doc => doc.type === documentType);
      const documentData = {
        type: documentType,
        url: uploadedUrl,
        filename: file.name,
        uploaded_at: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        updatedDocuments[existingIndex] = documentData;
      } else {
        updatedDocuments.push(documentData);
      }
      
      onInputChange('supporting_documents', updatedDocuments);
      toast.success('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploadingDocument(null);
      // Reset file input
      if (fileInputRefs.current[documentType]) {
        fileInputRefs.current[documentType]!.value = '';
      }
    }
  };

  const removeDocument = (documentType: string) => {
    const currentDocuments = formData.supporting_documents || [];
    const updatedDocuments = currentDocuments.filter((doc: any) => doc.type !== documentType);
    onInputChange('supporting_documents', updatedDocuments);
    toast.success('Document removed');
  };

  const getUploadedDocument = (documentType: string) => {
    const currentDocuments = formData.supporting_documents || [];
    return currentDocuments.find((doc: any) => doc.type === documentType);
  };

  const triggerFileInput = (documentType: string) => {
    fileInputRefs.current[documentType]?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          📎 Upload Supporting Documents (Optional)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          You can upload up to 3 files (PDF or DOCX). Maximum file size: 10MB each.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {documentTypes.map((docType) => {
          const uploadedDoc = getUploadedDocument(docType.key);
          const isUploading = uploadingDocument === docType.key;
          
          return (
            <div key={docType.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{docType.label}</Label>
                  <p className="text-sm text-muted-foreground">{docType.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {uploadedDoc ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {uploadedDoc.filename}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(docType.key)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => triggerFileInput(docType.key)}
                      disabled={isUploading}
                      className="flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload PDF/DOCX
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={(el) => (fileInputRefs.current[docType.key] = el)}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(docType.key, file);
                  }
                }}
                className="hidden"
              />
            </div>
          );
        })}
        
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">📋 Document Guidelines:</p>
          <ul className="space-y-1">
            <li>• Accepted formats: PDF, DOC, DOCX</li>
            <li>• Maximum file size: 10MB per document</li>
            <li>• Documents will be shared with shortlisted candidates</li>
            <li>• Ensure documents don't contain sensitive information</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}