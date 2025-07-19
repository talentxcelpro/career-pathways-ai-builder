
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Award, Download } from "lucide-react";
import { EnhancedFileUpload } from "@/components/resume/EnhancedFileUpload";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { useNavigate } from 'react-router-dom';

const AppleResumeChecker = () => {
  const navigate = useNavigate();
  const { uploadResume, progress, isUploading } = useResumeUpload();
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileSelect = async (files: FileList) => {
    const file = files[0];
    setUploadedFile(file);
    
    console.log('Resume Checker: Starting upload for file:', file.name);
    
    try {
      const result = await uploadResume(file);
      
      if (result.success) {
        console.log('Resume Checker: Upload successful:', result);
        setAnalysisResult({
          atsScore: result.atsScore,
          parsedData: result.parsedData,
          success: true
        });
      } else {
        console.error('Resume Checker: Upload failed:', result.error);
        setAnalysisResult({
          error: result.error,
          success: false
        });
      }
    } catch (error) {
      console.error('Resume Checker: Error during upload:', error);
      setAnalysisResult({
        error: error instanceof Error ? error.message : 'Analysis failed',
        success: false
      });
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setUploadedFile(null);
  };

  if (analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Check Another Resume
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {analysisResult.success ? (
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Analysis Complete</h1>
                <p className="text-lg text-gray-600">Here's how your resume performs</p>
              </div>

              {/* ATS Score */}
              <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardContent className="p-8 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-90" />
                  <h2 className="text-2xl font-bold mb-2">ATS Compatibility Score</h2>
                  <div className="text-5xl font-bold mb-4">{analysisResult.atsScore || 0}/100</div>
                  <p className="text-blue-100">
                    {(analysisResult.atsScore || 0) >= 80 ? 'Excellent! Your resume is highly ATS-compatible.' :
                     (analysisResult.atsScore || 0) >= 60 ? 'Good score with room for improvement.' :
                     'Consider optimizing your resume for better ATS compatibility.'}
                  </p>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Strengths Found
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.parsedData?.personalInfo?.name && (
                        <li className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Contact information extracted
                        </li>
                      )}
                      {analysisResult.parsedData?.workExperience?.length > 0 && (
                        <li className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          {analysisResult.parsedData.workExperience.length} work experience entries
                        </li>
                      )}
                      {analysisResult.parsedData?.skills?.length > 0 && (
                        <li className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          {analysisResult.parsedData.skills.length} skills identified
                        </li>
                      )}
                      {analysisResult.parsedData?.education?.length > 0 && (
                        <li className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Education background present
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-600">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Improvement Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        Add more industry-specific keywords
                      </li>
                      <li className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        Optimize formatting for ATS systems
                      </li>
                      <li className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        Enhance achievement descriptions
                      </li>
                      <li className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        Consider adding quantified results
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Ready to Optimize Your Resume?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Take your resume to the next level with our AI-powered resume builder and optimization tools.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => navigate('/resume-builder/upload')}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Optimize This Resume
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/resume-builder')}
                      className="flex-1"
                    >
                      Build New Resume
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Error State
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Analysis Failed</h1>
                <p className="text-gray-600 mb-6">{analysisResult.error}</p>
                
                <Button onClick={handleReset} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Free Resume Checker</h1>
          <p className="text-xl text-gray-600">Get instant feedback on your resume's ATS compatibility</p>
        </div>

        {isUploading ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-blue-600 animate-pulse" />
                </div>
                
                <h3 className="text-xl font-semibold">Analyzing Your Resume</h3>
                <p className="text-gray-600">{progress.step}</p>
                
                <div className="space-y-2">
                  <Progress value={progress.percentage} className="w-full" />
                  <p className="text-sm text-gray-500">
                    {progress.percentage.toFixed(0)}% Complete
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EnhancedFileUpload
            onFileSelect={handleFileSelect}
            isProcessing={isUploading}
            processingProgress={progress.percentage}
            processingStatus={progress.step}
            className="max-w-2xl mx-auto"
          />
        )}
      </div>
    </div>
  );
};

export default AppleResumeChecker;
