
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, FileText, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const UploadResume = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    // TODO: Implement file upload and AI parsing logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsUploading(false);
    // Navigate to edit mode after successful upload
    // navigate(`/resume/edit/${newResumeId}`);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/resume')}
            className="flex items-center mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Resume</h1>
            <p className="text-gray-600">Upload your existing resume for AI enhancement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
                <CardDescription>
                  Support for PDF and DOCX files. Our AI will extract and enhance your content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {isUploading ? (
                    <div className="space-y-4">
                      <Loader2 className="h-12 w-12 mx-auto text-blue-600 animate-spin" />
                      <div>
                        <h3 className="font-medium text-gray-900">Processing your resume...</h3>
                        <p className="text-sm text-gray-600">AI is extracting and optimizing your content</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900">Drop your resume here</h3>
                        <p className="text-sm text-gray-600">or click to browse files</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="resume-upload"
                        disabled={isUploading}
                      />
                      <label htmlFor="resume-upload">
                        <Button variant="outline" className="cursor-pointer" disabled={isUploading}>
                          <FileText className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500">
                        Supported formats: PDF, DOCX • Max size: 10MB
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
                <CardDescription>Our AI will analyze and enhance your resume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Content Extraction</h4>
                      <p className="text-sm text-gray-600">AI extracts all sections including experience, education, and skills</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">ATS Optimization</h4>
                      <p className="text-sm text-gray-600">Automatic formatting and keyword optimization for ATS systems</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Enhancement Suggestions</h4>
                      <p className="text-sm text-gray-600">AI provides improvement suggestions for better impact</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 font-semibold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Ready to Edit</h4>
                      <p className="text-sm text-gray-600">Open in our editor with your enhanced content</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
