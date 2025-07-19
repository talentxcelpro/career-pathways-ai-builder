import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';
import { Brain, TestTube } from 'lucide-react';

const AISystemTester: React.FC = () => {
  const [testInput, setTestInput] = useState('');
  const [selectedTool, setSelectedTool] = useState('resume-enhancer');
  const [testResult, setTestResult] = useState<any>(null);
  
  const { 
    invokeAITool, 
    enhanceResume, 
    optimizeForATS, 
    generateCoverLetter,
    analyzeCareerPath,
    prepareForInterview,
    analyzeSalary,
    isProcessing,
    currentOperation 
  } = useAIService();

  const testTools = [
    { value: 'resume-enhancer', label: 'Resume Enhancer', description: 'Test resume content enhancement' },
    { value: 'ats-optimizer', label: 'ATS Optimizer', description: 'Test ATS optimization' },
    { value: 'cover-letter-generator', label: 'Cover Letter Generator', description: 'Test cover letter generation' },
    { value: 'career-advisor', label: 'Career Advisor', description: 'Test career guidance' },
    { value: 'interview-prep', label: 'Interview Prep', description: 'Test interview preparation' },
    { value: 'salary-analyzer', label: 'Salary Analyzer', description: 'Test salary analysis' }
  ];

  const getTestData = (toolSlug: string) => {
    switch (toolSlug) {
      case 'resume-enhancer':
        return {
          summary: 'Software developer with 3 years experience',
          experience: 'Worked at tech startup building web applications',
          skills: 'JavaScript, React, Node.js',
          education: 'BS Computer Science'
        };
      case 'ats-optimizer':
        return {
          resumeContent: { summary: 'Software developer with experience' },
          jobDescription: 'Looking for React developer with JavaScript skills'
        };
      case 'cover-letter-generator':
        return {
          resumeContent: { name: 'John Doe', skills: 'React, JavaScript' },
          jobData: { title: 'Frontend Developer', company: 'Tech Corp' }
        };
      case 'career-advisor':
        return {
          userProfile: { experience: 3, skills: ['React', 'JavaScript'], currentRole: 'Developer' },
          targetRole: 'Senior Developer'
        };
      case 'interview-prep':
        return {
          jobData: { title: 'Frontend Developer', requirements: ['React', 'JavaScript'] },
          userProfile: { experience: 3, skills: ['React'] }
        };
      case 'salary-analyzer':
        return {
          role: 'Software Developer',
          location: 'San Francisco',
          experience: 3
        };
      default:
        return {};
    }
  };

  const handleTest = async () => {
    try {
      const testData = testInput ? JSON.parse(testInput) : getTestData(selectedTool);
      
      console.log(`Testing ${selectedTool} with data:`, testData);
      
      const result = await invokeAITool({
        toolSlug: selectedTool,
        inputData: testData,
        category: 'test'
      });
      
      setTestResult(result);
      
      if (result.success) {
        toast.success(`${selectedTool} test completed successfully!`);
      } else {
        toast.error(`${selectedTool} test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Invalid test data - please check JSON format');
    }
  };

  const handleQuickTest = async (toolType: string) => {
    try {
      let result;
      
      switch (toolType) {
        case 'enhance':
          result = await enhanceResume({
            summary: 'Software developer with 3 years experience',
            experience: 'Built web applications using modern frameworks',
            skills: 'JavaScript, React, Node.js, MongoDB',
            education: 'Bachelor of Science in Computer Science'
          });
          break;
        case 'optimize':
          result = await optimizeForATS({
            summary: 'Software developer',
            skills: 'JavaScript, React'
          }, 'Looking for React developer with strong JavaScript skills');
          break;
        case 'career':
          result = await analyzeCareerPath({
            experience: 3,
            skills: ['React', 'JavaScript'],
            currentRole: 'Developer'
          }, 'Senior Full Stack Developer');
          break;
        case 'salary':
          result = await analyzeSalary('Software Developer', 'San Francisco', 3);
          break;
        default:
          toast.error('Unknown test type');
          return;
      }
      
      setTestResult(result);
    } catch (error) {
      console.error('Quick test error:', error);
      toast.error('Quick test failed');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <TestTube className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">AI System Tester</h1>
          <p className="text-muted-foreground">Test the unified AI system and tools</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Tool Tester
            </CardTitle>
            <CardDescription>
              Test individual AI tools with custom or default data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tool-select">Select AI Tool</Label>
              <Select value={selectedTool} onValueChange={setSelectedTool}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {testTools.map((tool) => (
                    <SelectItem key={tool.value} value={tool.value}>
                      {tool.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {testTools.find(t => t.value === selectedTool)?.description}
              </p>
            </div>

            <div>
              <Label htmlFor="test-input">Test Data (JSON)</Label>
              <Textarea
                id="test-input"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder={`Leave empty to use default test data for ${selectedTool}`}
                rows={6}
              />
            </div>

            <Button 
              onClick={handleTest} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? `Testing ${currentOperation}...` : 'Test AI Tool'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
            <CardDescription>
              Run predefined tests for common AI operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => handleQuickTest('enhance')} 
              disabled={isProcessing}
              variant="outline"
              className="w-full justify-start"
            >
              Test Resume Enhancement
            </Button>
            <Button 
              onClick={() => handleQuickTest('optimize')} 
              disabled={isProcessing}
              variant="outline"
              className="w-full justify-start"
            >
              Test ATS Optimization
            </Button>
            <Button 
              onClick={() => handleQuickTest('career')} 
              disabled={isProcessing}
              variant="outline"
              className="w-full justify-start"
            >
              Test Career Analysis
            </Button>
            <Button 
              onClick={() => handleQuickTest('salary')} 
              disabled={isProcessing}
              variant="outline"
              className="w-full justify-start"
            >
              Test Salary Analysis
            </Button>
          </CardContent>
        </Card>
      </div>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Latest AI tool test output
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
            
            {testResult.success && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {testResult.tokensUsed && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Tokens Used</Label>
                    <p className="font-medium">{testResult.tokensUsed}</p>
                  </div>
                )}
                {testResult.cost && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Cost</Label>
                    <p className="font-medium">${testResult.cost.toFixed(4)}</p>
                  </div>
                )}
                {testResult.responseTime && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Response Time</Label>
                    <p className="font-medium">{testResult.responseTime}ms</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Processing {currentOperation}...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISystemTester;