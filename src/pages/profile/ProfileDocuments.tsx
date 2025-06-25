
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Upload, Download, Eye, Trash2, FileText, Award, CreditCard, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileLayout from "@/components/profile/ProfileLayout";

const ProfileDocuments = () => {
  const { toast } = useToast();
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  const [documents] = useState([
    {
      id: 1,
      name: "Bachelor's Degree in Computer Science",
      type: "education",
      fileName: "cs_degree.pdf",
      uploadDate: "2024-01-15",
      size: "2.3 MB",
      verified: true
    },
    {
      id: 2,
      name: "AWS Solutions Architect Certificate",
      type: "certification",
      fileName: "aws_cert.pdf",
      uploadDate: "2024-01-10",
      size: "1.8 MB",
      verified: true
    },
    {
      id: 3,
      name: "Driver's License",
      type: "identification",
      fileName: "drivers_license.pdf",
      uploadDate: "2024-01-05",
      size: "0.5 MB",
      verified: false
    },
    {
      id: 4,
      name: "Professional References",
      type: "reference",
      fileName: "references.pdf",
      uploadDate: "2024-01-01",
      size: "1.2 MB",
      verified: false
    }
  ]);

  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: "certification",
    file: null as File | null
  });

  const documentTypes = [
    { value: "certification", label: "Certification", icon: Award },
    { value: "education", label: "Education", icon: FileText },
    { value: "identification", label: "Identification", icon: CreditCard },
    { value: "reference", label: "Reference", icon: Shield }
  ];

  const getDocumentIcon = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.icon : FileText;
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  const handleUpload = () => {
    if (!uploadForm.name.trim()) {
      toast({
        title: "Error",
        description: "Please provide a document name.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Document Uploaded",
      description: "Your document has been uploaded successfully.",
    });
    setShowUploadForm(false);
    setUploadForm({ name: "", type: "certification", file: null });
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
      description: "The document has been removed successfully.",
    });
  };

  return (
    <ProfileLayout 
      title="Documents" 
      description="Manage your certificates, education documents, and professional credentials"
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setShowUploadForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Upload New Document</CardTitle>
              <CardDescription>Add certificates, education documents, or professional credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Document name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
              />
              
              <div>
                <label className="text-sm font-medium mb-2 block">Document Type</label>
                <select 
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Choose File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="w-full p-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleUpload}>Upload Document</Button>
                <Button variant="outline" onClick={() => setShowUploadForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {documentTypes.map((type) => {
            const Icon = type.icon;
            const count = documents.filter(doc => doc.type === type.value).length;
            
            return (
              <Card key={type.value} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{type.label}s</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Documents List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>Manage your uploaded documents and credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc, index) => {
                const Icon = getDocumentIcon(doc.type);
                
                return (
                  <div key={doc.id}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                            <Badge variant={doc.verified ? 'default' : 'secondary'}>
                              {doc.verified ? 'Verified' : 'Pending'}
                            </Badge>
                            <Badge variant="outline">
                              {getDocumentTypeLabel(doc.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {doc.fileName} • {doc.size} • Uploaded {doc.uploadDate}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownload(doc.id, doc.fileName)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {index < documents.length - 1 && <Separator className="my-4" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Document Security */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Document Security & Privacy</CardTitle>
            <CardDescription>How we protect your sensitive documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Security Features</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• End-to-end encryption for all documents</li>
                  <li>• Secure cloud storage with redundancy</li>
                  <li>• Access logging and monitoring</li>
                  <li>• Regular security audits</li>
                  <li>• GDPR and SOC 2 compliant</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Privacy Controls</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• You control document visibility</li>
                  <li>• Share with specific employers only</li>
                  <li>• Automatic document expiration</li>
                  <li>• Download tracking and notifications</li>
                  <li>• Right to delete anytime</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Document Verification</CardTitle>
            <CardDescription>Increase trust by getting your documents verified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">Professional Benefits</h4>
                  <p className="text-sm text-gray-600">Verified documents increase employer trust by 73% and lead to faster hiring decisions.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">Verification Process</h4>
                  <p className="text-sm text-gray-600">Our team reviews documents within 24-48 hours using industry-standard verification methods.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                  <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">Supported Documents</h4>
                  <p className="text-sm text-gray-600">We can verify degrees, certifications, licenses, and other professional credentials.</p>
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
