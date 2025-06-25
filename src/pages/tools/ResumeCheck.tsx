
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const ResumeCheck = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setResults(null);
    }
  };

  const analyzeResume = async () => {
    if (!file) return;
    
    setAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setResults({
        overallScore: 78,
        atsCompatibility: 85,
        sections: {
          keywords: { score: 72, status: 'warning' },
          format: { score: 90, status: 'good' },
          length: { score: 80, status: 'good' },
          structure: { score: 75, status: 'warning' }
        },
        suggestions: [
          'Add more relevant keywords for your target role',
          'Include quantifiable achievements with numbers',
          'Optimize bullet points for ATS scanning',
          'Add a skills section with technical competencies'
        ],
        keywords: {
          found: ['JavaScript', 'React', 'Node.js', 'SQL'],
          missing: ['TypeScript', 'AWS', 'Docker', 'Agile']
        }
      });
      setAnalyzing(false);
    }, 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'poor':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume ATS Checker</h1>
          <p className="text-gray-600">
            Upload your resume to check ATS compatibility and get optimization suggestions
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Resume
            </CardTitle>
            <CardDescription>
              Supported formats: PDF, DOC, DOCX (Max 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resume-upload">Choose File</Label>
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>
              
              {file && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <FileCheck className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                  <Button onClick={analyzeResume} disabled={analyzing}>
                    {analyzing ? 'Analyzing...' : 'Analyze Resume'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
                      {results.overallScore}%
                    </div>
                    <p className="text-gray-600">Overall Score</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(results.atsCompatibility)}`}>
                      {results.atsCompatibility}%
                    </div>
                    <p className="text-gray-600">ATS Compatibility</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Section Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(results.sections).map(([section, data]: [string, any]) => (
                    <div key={section} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(data.status)}
                        <span className="font-medium capitalize">{section}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={data.score} className="w-24" />
                        <span className={`font-medium ${getScoreColor(data.score)}`}>
                          {data.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Keywords Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Keywords Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Found Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {results.keywords.found.map((keyword: string, index: number) => (
                        <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {results.keywords.missing.map((keyword: string, index: number) => (
                        <Badge key={index} variant="destructive" className="bg-red-100 text-red-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Improvement Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {results.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                      </div>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {analyzing && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Analyzing Your Resume</h3>
              <p className="text-gray-600">This may take a few moments...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResumeCheck;
