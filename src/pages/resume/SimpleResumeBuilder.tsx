
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Sparkles, Download, ExternalLink } from 'lucide-react';
import { useResumeEnhancement } from '@/hooks/useResumeEnhancement';
import { toast } from 'sonner';

const SimpleResumeBuilder = () => {
  const [resumeText, setResumeText] = useState('');
  const [enhancedContent, setEnhancedContent] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<'input' | 'enhanced' | 'download'>('input');
  
  const { enhanceResumeText, isEnhancing } = useResumeEnhancement();

  const handleEnhance = async () => {
    if (!resumeText.trim()) {
      toast.error('Please paste your resume text first');
      return;
    }

    const result = await enhanceResumeText(resumeText, {
      enhancementType: 'professional'
    });

    if (result) {
      setEnhancedContent(result);
      setCurrentStep('enhanced');
    }
  };

  const handleDownload = () => {
    if (!enhancedContent) return;
    
    // Create formatted text for download
    const formattedText = formatResumeForDownload(enhancedContent);
    const blob = new Blob([formattedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enhanced-resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setCurrentStep('download');
    toast.success('Resume downloaded successfully!');
  };

  const formatResumeForDownload = (content: any) => {
    let formatted = '';
    
    const formatValue = (value: any) => {
      if (typeof value === 'string') return value;
      if (typeof value === 'object') return JSON.stringify(value, null, 2);
      return String(value);
    };
    
    if (content.summary) {
      formatted += 'PROFESSIONAL SUMMARY\n';
      formatted += formatValue(content.summary) + '\n\n';
    }
    
    if (content.experience) {
      formatted += 'PROFESSIONAL EXPERIENCE\n';
      formatted += formatValue(content.experience) + '\n\n';
    }
    
    if (content.education) {
      formatted += 'EDUCATION\n';
      formatted += formatValue(content.education) + '\n\n';
    }
    
    if (content.skills) {
      formatted += 'SKILLS\n';
      formatted += formatValue(content.skills) + '\n\n';
    }
    
    return formatted;
  };

  const resetForm = () => {
    setResumeText('');
    setEnhancedContent(null);
    setCurrentStep('input');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple Resume Builder
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Paste your resume and let AI enhance it professionally
          </p>
          
          {/* Upsell Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Want Advanced Features?</span>
            </div>
            <p className="text-sm mb-3">
              Get 20+ professional templates, ATS optimization, and more!
            </p>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => window.open('https://talentxcel.net/', '_blank')}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Upgrade to TalentXcel Pro
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'input' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Paste Resume</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'enhanced' ? 'bg-blue-600 text-white' : 
                currentStep === 'download' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">AI Enhancement</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'download' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Download</span>
            </div>
          </div>
        </div>

        {currentStep === 'input' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Step 1: Paste Your Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste your existing resume text here... Include all sections like work experience, education, skills, etc."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[300px] text-sm"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {resumeText.length} characters
                  </span>
                  <Button 
                    onClick={handleEnhance}
                    disabled={!resumeText.trim() || isEnhancing}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isEnhancing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Enhance with AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'enhanced' && enhancedContent && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Step 2: AI Enhanced Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Original */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-700">Original:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap text-gray-600">
                        {resumeText}
                      </pre>
                    </div>
                  </div>
                  
                  {/* Enhanced */}
                  <div>
                    <h3 className="font-semibold mb-3 text-green-700">Enhanced:</h3>
                    <div className="bg-green-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <div className="text-sm space-y-4">
                        {enhancedContent.summary && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Professional Summary</h4>
                            <p className="text-gray-700">{enhancedContent.summary}</p>
                          </div>
                        )}
                        {enhancedContent.experience && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Experience</h4>
                            <div className="text-gray-700 whitespace-pre-wrap">
                              {typeof enhancedContent.experience === 'string' 
                                ? enhancedContent.experience 
                                : JSON.stringify(enhancedContent.experience, null, 2)
                              }
                            </div>
                          </div>
                        )}
                        {enhancedContent.education && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Education</h4>
                            <div className="text-gray-700 whitespace-pre-wrap">
                              {typeof enhancedContent.education === 'string' 
                                ? enhancedContent.education 
                                : JSON.stringify(enhancedContent.education, null, 2)
                              }
                            </div>
                          </div>
                        )}
                        {enhancedContent.skills && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Skills</h4>
                            <div className="text-gray-700 whitespace-pre-wrap">
                              {typeof enhancedContent.skills === 'string' 
                                ? enhancedContent.skills 
                                : JSON.stringify(enhancedContent.skills, null, 2)
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={resetForm}>
                    Start Over
                  </Button>
                  <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Enhanced Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'download' && (
          <Card className="shadow-lg text-center">
            <CardContent className="py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Resume Downloaded!</h3>
              <p className="text-gray-600 mb-6">
                Your enhanced resume has been downloaded. Ready to apply for your dream job?
              </p>
              
              {/* Upsell Section */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg mb-6">
                <h4 className="text-xl font-bold mb-3">Take Your Resume to the Next Level!</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <Sparkles className="h-6 w-6 mx-auto mb-2" />
                    <div>20+ Professional Templates</div>
                  </div>
                  <div>
                    <FileText className="h-6 w-6 mx-auto mb-2" />
                    <div>ATS Optimization</div>
                  </div>
                  <div>
                    <ExternalLink className="h-6 w-6 mx-auto mb-2" />
                    <div>PDF Export & More</div>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => window.open('https://talentxcel.net/', '_blank')}
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Upgrade to TalentXcel Pro
                </Button>
              </div>
              
              <Button onClick={resetForm} variant="outline" size="lg">
                Create Another Resume
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SimpleResumeBuilder;
