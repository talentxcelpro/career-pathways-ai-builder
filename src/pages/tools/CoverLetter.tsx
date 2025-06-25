
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, Copy, Download, RefreshCw } from 'lucide-react';

const CoverLetter = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    tone: 'professional'
  });
  const [generating, setGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');

  const tones = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic and passionate' },
    { value: 'confident', label: 'Confident', description: 'Bold and assertive' },
    { value: 'creative', label: 'Creative', description: 'Unique and innovative' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCoverLetter = async () => {
    setGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedLetter(`Dear Hiring Manager,

I am writing to express my strong interest in the ${formData.jobTitle} position at ${formData.companyName}. With my extensive background in software development and passion for innovative technology solutions, I am excited about the opportunity to contribute to your team's success.

In my previous roles, I have successfully developed and deployed multiple web applications using modern technologies including React, TypeScript, and Node.js. My experience aligns perfectly with the requirements outlined in your job posting, particularly in areas of full-stack development and collaborative team environments.

What particularly attracts me to ${formData.companyName} is your commitment to technological innovation and creating meaningful solutions that impact users' lives. I am eager to bring my technical expertise, problem-solving abilities, and collaborative mindset to help drive your projects forward.

I have attached my resume for your review and would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team's continued success. Thank you for your time and consideration.

Sincerely,
[Your Name]`);
      setGenerating(false);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
  };

  const downloadLetter = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${formData.companyName || 'job'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Cover Letter Generator</h1>
          <p className="text-gray-600">
            Create personalized, professional cover letters tailored to any job opportunity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Job Details
              </CardTitle>
              <CardDescription>
                Provide job information to generate a targeted cover letter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="e.g., Frontend Developer"
                />
              </div>

              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="e.g., Tech Corp"
                />
              </div>

              <div>
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  value={formData.jobDescription}
                  onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                  placeholder="Paste the job description here..."
                  className="min-h-32"
                />
              </div>

              <div>
                <Label>Writing Tone</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {tones.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => handleInputChange('tone', tone.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.tone === tone.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{tone.label}</div>
                      <div className="text-sm text-gray-600">{tone.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={generateCoverLetter}
                disabled={generating || !formData.jobTitle || !formData.companyName}
                className="w-full"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Letter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generated Cover Letter
                </span>
                {generatedLetter && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadLetter}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
              {formData.tone && (
                <Badge variant="secondary" className="w-fit">
                  {tones.find(t => t.value === formData.tone)?.label} Tone
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {generating ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Creating your personalized cover letter...</p>
                </div>
              ) : generatedLetter ? (
                <div className="space-y-4">
                  <Textarea
                    value={generatedLetter}
                    onChange={(e) => setGeneratedLetter(e.target.value)}
                    className="min-h-96 font-mono text-sm"
                  />
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{generatedLetter.split(' ').length} words</span>
                    <span>{generatedLetter.split('\n\n').length} paragraphs</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Fill in the job details and click generate to create your cover letter</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Cover Letter Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-medium mb-1">Customize</h4>
                <p className="text-sm text-gray-600">Tailor each letter to the specific job and company</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h4 className="font-medium mb-1">Show Value</h4>
                <p className="text-sm text-gray-600">Highlight what you can bring to the company</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-medium mb-1">Keep Concise</h4>
                <p className="text-sm text-gray-600">Aim for 3-4 paragraphs and one page maximum</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoverLetter;
