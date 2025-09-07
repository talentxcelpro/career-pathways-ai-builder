import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Zap, CheckCircle, AlertCircle, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ParsedData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  skills: string[];
}

const UploadParser = () => {
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'review' | 'enhance'>('upload');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setCurrentStep('processing');
    setUploadProgress(0);

    try {
      // Simulate file upload and parsing process
      const steps = [
        { progress: 20, message: 'Uploading file...' },
        { progress: 40, message: 'Extracting text content...' },
        { progress: 60, message: 'AI parsing resume sections...' },
        { progress: 80, message: 'Identifying skills and experience...' },
        { progress: 100, message: 'Processing complete!' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setUploadProgress(step.progress);
        toast(step.message);
      }

      // Mock parsed data
      const mockParsedData: ParsedData = {
        personalInfo: {
          fullName: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          summary: 'Experienced software engineer with 5+ years developing scalable web applications using React, Node.js, and cloud technologies.'
        },
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            duration: '2021 - Present',
            description: 'Led development of microservices architecture serving 1M+ users. Improved system performance by 40% through optimization.'
          },
          {
            title: 'Software Engineer',
            company: 'StartupXYZ',
            duration: '2019 - 2021',
            description: 'Built full-stack web applications using React and Node.js. Collaborated with design team to implement responsive UI components.'
          }
        ],
        education: [
          {
            degree: 'Bachelor of Science in Computer Science',
            school: 'University of California, Berkeley',
            year: '2019'
          }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'Git']
      };

      setParsedData(mockParsedData);
      setCurrentStep('review');
      toast.success('Resume parsed successfully!');
    } catch (error) {
      console.error('Failed to parse resume:', error);
      toast.error('Failed to parse resume. Please try again.');
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1
  });

  const handleLinkedInImport = async () => {
    if (!linkedinUrl) return;
    
    setIsProcessing(true);
    setCurrentStep('processing');
    
    try {
      // Simulate LinkedIn import
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('LinkedIn profile imported successfully!');
      setCurrentStep('review');
    } catch (error) {
      toast.error('Failed to import LinkedIn profile');
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnhanceWithJob = async () => {
    setCurrentStep('enhance');
    toast.success('Optimizing resume for job description...');
    
    // Navigate to builder with enhanced data
    setTimeout(() => {
      navigate('/builder', { state: { parsedData, jobDescription: jobDescriptionUrl } });
    }, 1500);
  };

  const handleProceedToBuilder = () => {
    navigate('/builder', { state: { parsedData } });
  };

  return (
    <>
      <Helmet>
        <title>Upload Resume | Smart AI Parser | TalentXcel</title>
        <meta 
          name="description" 
          content="Upload your PDF/DOCX resume for instant AI parsing. Import from LinkedIn, enhance with job descriptions, and build better resumes." 
        />
        <link rel="canonical" href="https://talentxcel.in/upload" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Smart Resume Parser
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your existing resume or import from LinkedIn. Our AI will parse and enhance your content instantly.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {[
                { step: 'upload', label: 'Upload', icon: Upload },
                { step: 'processing', label: 'Processing', icon: Zap },
                { step: 'review', label: 'Review', icon: CheckCircle },
                { step: 'enhance', label: 'Enhance', icon: FileText }
              ].map(({ step, label, icon: Icon }, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep === step ? 'border-primary bg-primary text-primary-foreground' :
                    index < ['upload', 'processing', 'review', 'enhance'].indexOf(currentStep) ? 'border-primary bg-primary text-primary-foreground' :
                    'border-muted bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium">{label}</span>
                  {index < 3 && <div className="ml-4 w-8 h-0.5 bg-muted" />}
                </div>
              ))}
            </div>
          </div>

          {/* Content based on current step */}
          {currentStep === 'upload' && (
            <Tabs defaultValue="file" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="file">Upload File</TabsTrigger>
                <TabsTrigger value="linkedin">LinkedIn Import</TabsTrigger>
                <TabsTrigger value="url">From URL</TabsTrigger>
              </TabsList>

              <TabsContent value="file">
                <Card>
                  <CardContent className="pt-6">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">
                        {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Drag and drop your PDF or DOCX file, or click to browse
                      </p>
                      <Button variant="outline">Choose File</Button>
                    </div>
                    
                    <div className="mt-6">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Supported formats: PDF, DOCX, DOC. Maximum file size: 10MB.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="linkedin">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Linkedin className="h-5 w-5 text-blue-600" />
                      Import from LinkedIn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                      <Input
                        id="linkedin-url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleLinkedInImport}
                      disabled={!linkedinUrl}
                      className="w-full"
                    >
                      Import from LinkedIn
                    </Button>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Make sure your LinkedIn profile is public or provide a shareable link.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="url">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Import from URL
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="resume-url">Resume URL</Label>
                      <Input
                        id="resume-url"
                        placeholder="https://example.com/resume.pdf"
                      />
                    </div>
                    <Button className="w-full">Import from URL</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {currentStep === 'processing' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Processing Your Resume</h3>
                    <p className="text-muted-foreground">Our AI is analyzing your resume content...</p>
                  </div>
                  <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'review' && parsedData && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Parsing Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Successfully extracted {parsedData.experience.length} work experiences, {parsedData.education.length} education entries, and {parsedData.skills.length} skills.
                    </AlertDescription>
                  </Alert>

                  {/* Quick preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Personal Info</h4>
                      <p className="text-sm">{parsedData.personalInfo.fullName}</p>
                      <p className="text-sm text-muted-foreground">{parsedData.personalInfo.email}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Skills ({parsedData.skills.length})</h4>
                      <p className="text-sm text-muted-foreground">
                        {parsedData.skills.slice(0, 5).join(', ')}
                        {parsedData.skills.length > 5 && '...'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Description Enhancement */}
              <Card>
                <CardHeader>
                  <CardTitle>Optimize for Specific Job (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="job-url">Job Description URL or Paste Text</Label>
                    <Input
                      id="job-url"
                      placeholder="Paste job description URL or text to optimize your resume"
                      value={jobDescriptionUrl}
                      onChange={(e) => setJobDescriptionUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={handleEnhanceWithJob} disabled={!jobDescriptionUrl}>
                      <Zap className="h-4 w-4 mr-2" />
                      Optimize for Job
                    </Button>
                    <Button variant="outline" onClick={handleProceedToBuilder}>
                      Continue Without Optimization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 'enhance' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <Zap className="h-12 w-12 text-primary mx-auto animate-pulse" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">AI Enhancement in Progress</h3>
                    <p className="text-muted-foreground">
                      Optimizing your resume content for the target job description...
                    </p>
                  </div>
                  <Progress value={75} className="w-full max-w-md mx-auto" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadParser;