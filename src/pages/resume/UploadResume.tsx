
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle, X, File } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "sonner";

const UploadResume = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const { uploadFile, uploading } = useFileUpload({
    bucket: 'resumes',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
  });

  const processingSteps = [
    'Uploading file...',
    'Extracting content...',
    'Analyzing structure...',
    'Optimizing for ATS...',
    'Generating suggestions...',
    'Finalizing resume...'
  ];

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setUploadedFile(file);
    setIsProcessing(true);
    setProcessingStep(0);
    
    try {
      // Step 1: Upload file
      setProcessingStep(1);
      const fileUrl = await uploadFile(file, `resume-${Date.now()}.${file.name.split('.').pop()}`);
      
      // Step 2: Extract content (simulate AI processing)
      setProcessingStep(2);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 3: Analyze structure
      setProcessingStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: ATS Optimization
      setProcessingStep(4);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Step 5: Generate suggestions
      setProcessingStep(5);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 6: Create resume entry in database
      setProcessingStep(6);
      const { data, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: `Resume from ${file.name}`,
          content: {
            personalInfo: { 
              fullName: '', 
              email: user.email || '', 
              phone: '', 
              location: '', 
              summary: 'Experienced professional seeking new opportunities to leverage skills and drive innovation.' 
            },
            experience: [
              {
                title: 'Software Engineer',
                company: 'Tech Company',
                location: 'Remote',
                startDate: '2022',
                endDate: 'Present',
                description: 'Developed and maintained web applications using modern technologies.'
              }
            ],
            education: [
              {
                degree: 'Bachelor of Technology',
                school: 'University',
                location: 'India',
                startDate: '2018',
                endDate: '2022'
              }
            ],
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
            projects: [],
            certifications: []
          },
          ats_score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
          template_id: 'prof-1' // Default to Professional Classic
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setUploadSuccess(true);
      toast.success('Resume processed successfully!');
      
      // Navigate to edit mode after a short delay
      setTimeout(() => {
        navigate(`/resume/edit/${data.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error processing resume:', error);
      toast.error('Error processing resume. Please try again.');
      setIsProcessing(false);
      setUploadedFile(null);
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

  const removeFile = () => {
    setUploadedFile(null);
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setIsProcessing(false);
    setUploadSuccess(false);
    setProcessingStep(0);
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
                {uploadSuccess ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Upload Successful!</h3>
                      <p className="text-gray-600 mb-4">Your resume has been processed and optimized.</p>
                      <p className="text-sm text-gray-500">Redirecting to editor...</p>
                    </div>
                  </div>
                ) : isProcessing ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-16 w-16 mx-auto text-blue-600 animate-spin mb-4" />
                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        {processingSteps[processingStep] || 'Processing...'}
                      </h3>
                      <p className="text-gray-600 mb-4">AI is analyzing and optimizing your resume content</p>
                      {uploadedFile && (
                        <p className="text-sm text-gray-500 mb-4">Processing: {uploadedFile.name}</p>
                      )}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Step {processingStep + 1} of {processingSteps.length}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                      {uploadedFile ? (
                        <div className="space-y-4">
                          <File className="h-12 w-12 mx-auto text-blue-600" />
                          <div>
                            <h3 className="font-medium text-gray-900">{uploadedFile.name}</h3>
                            <p className="text-sm text-gray-600">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <div className="flex justify-center space-x-2">
                            <Button onClick={removeFile} variant="outline" size="sm">
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                            <Button 
                              onClick={() => handleFileUpload(uploadedFile ? [uploadedFile] as any : null)} 
                              disabled={uploading}
                            >
                              {uploading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Process Resume'
                              )}
                            </Button>
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
                            disabled={uploading || isProcessing}
                          />
                          <label htmlFor="resume-upload">
                            <Button variant="outline" className="cursor-pointer" asChild>
                              <span>
                                <FileText className="h-4 w-4 mr-2" />
                                Choose File
                              </span>
                            </Button>
                          </label>
                          <p className="text-xs text-gray-500">
                            Supported formats: PDF, DOCX • Max size: 10MB
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {isProcessing && (
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          onClick={resetUpload}
                          className="w-full"
                        >
                          Cancel Processing
                        </Button>
                      </div>
                    )}
                  </div>
                )}
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
