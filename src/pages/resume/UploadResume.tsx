
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const UploadResume = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setIsUploading(true);
    setUploadedFile(file);
    
    try {
      // Simulate AI processing with a delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create a new resume entry in the database
      const { data, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: `Resume from ${file.name}`,
          content: {
            personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: []
          },
          ats_score: Math.floor(Math.random() * 30) + 70 // Random score between 70-100
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setUploadSuccess(true);
      
      // Navigate to edit mode after a short delay
      setTimeout(() => {
        navigate(`/resume/edit/${data.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error processing resume:', error);
      alert('Error processing resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
                  {uploadSuccess ? (
                    <div className="space-y-4">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Upload Successful!</h3>
                        <p className="text-sm text-gray-600">Redirecting to editor...</p>
                      </div>
                    </div>
                  ) : isUploading ? (
                    <div className="space-y-4">
                      <Loader2 className="h-12 w-12 mx-auto text-blue-600 animate-spin" />
                      <div>
                        <h3 className="font-medium text-gray-900">Processing your resume...</h3>
                        <p className="text-sm text-gray-600">AI is extracting and optimizing your content</p>
                        {uploadedFile && (
                          <p className="text-xs text-gray-500 mt-2">Processing: {uploadedFile.name}</p>
                        )}
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
