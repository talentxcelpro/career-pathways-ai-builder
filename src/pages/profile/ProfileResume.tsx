
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Edit, Eye, Plus, Trash2, Star, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { Link } from 'react-router-dom';
import { useFileUpload } from "@/hooks/useFileUpload";
import { Input } from "@/components/ui/input";

const ProfileResume = () => {
  const { toast } = useToast();
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'resumes',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  
  const [resumes] = useState([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadTitle) {
        // Auto-generate title from filename
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setUploadTitle(nameWithoutExt);
      }
    }
  };

  const handleUploadResume = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a resume file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadTitle.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title for your resume.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileUrl = await uploadFile(selectedFile, `${Date.now()}-${selectedFile.name}`);
      
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully.",
      });
      
      // Reset form
      setSelectedFile(null);
      setUploadTitle('');
      setShowUploadForm(false);
      
      // Reset file input
      const fileInput = document.getElementById('resume-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (resumeId: number) => {
    toast({
      title: "Download Started",
      description: "Your resume is being downloaded.",
    });
  };

  const handleSetPrimary = (resumeId: number) => {
    toast({
      title: "Primary Resume Updated",
      description: "This resume is now set as your primary resume.",
    });
  };

  const handleDelete = (resumeId: number) => {
    toast({
      title: "Resume Deleted",
      description: "The resume has been removed from your profile.",
    });
  };

  return (
    <ProfileLayout 
      title="Resume Management" 
      description="Create, edit, upload and manage your professional resumes"
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Link 
            to="/resume"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Resume
          </Link>
          <Button 
            variant="outline" 
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Resume
          </Button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>Upload an existing resume file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Resume Title</label>
                <Input
                  placeholder="e.g., Software Engineer Resume"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Choose File</label>
                <Input
                  id="resume-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>
              
              {selectedFile && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleUploadResume} 
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Resume'}
                </Button>
                <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resume Analytics */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Resume Performance</CardTitle>
            <CardDescription>Track how your resumes are performing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Profile Views</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Resume Downloads</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Applications Sent</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">0%</div>
                <div className="text-sm text-gray-600">ATS Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resume List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Resumes</CardTitle>
            <CardDescription>Manage and organize your professional resumes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resumes.length > 0 ? resumes.map((resume, index) => (
                <div key={resume.id}>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{resume.title}</h3>
                          {resume.isPrimary && (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                          <Badge variant={resume.status === 'active' ? 'default' : 'secondary'}>
                            {resume.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {resume.template} template • Last updated {resume.lastUpdated}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(resume.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(resume.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {!resume.isPrimary && (
                        <Button variant="ghost" size="sm" onClick={() => handleSetPrimary(resume.id)}>
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(resume.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {index < resumes.length - 1 && <Separator className="my-4" />}
                </div>
              )) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Resumes Yet</h3>
                  <p className="text-gray-600 mb-4">Create or upload your first resume to get started</p>
                  <Link 
                    to="/resume" 
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Resume
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resume Tips */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Resume Optimization Tips</CardTitle>
            <CardDescription>Improve your resume's effectiveness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">Tailor for Each Job</h4>
                  <p className="text-sm text-gray-600">Customize your resume for each application to match job requirements.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">Use Action Verbs</h4>
                  <p className="text-sm text-gray-600">Start bullet points with strong action verbs like "Led," "Developed," "Improved."</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                  <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">Quantify Achievements</h4>
                  <p className="text-sm text-gray-600">Include numbers and percentages to demonstrate your impact.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  );
};

export default ProfileResume;
