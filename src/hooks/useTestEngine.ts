import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TestResult {
  id: string;
  suiteName: string;
  testName: string;
  status: 'passed' | 'failed' | 'warning' | 'running';
  score: number;
  duration: number;
  timestamp: string;
  details?: {
    expected?: string;
    actual?: string;
    error?: string;
    metrics?: Record<string, number>;
  };
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  persona?: string;
  input: any;
  expectedOutput?: any;
  biasChecks?: string[];
}

export function useTestEngine() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);

  // Test personas for diverse testing
  const testPersonas = {
    student: {
      name: "Recent Graduate",
      profile: {
        education: "Bachelor's in Computer Science",
        experience: "Internship experience only",
        skills: ["JavaScript", "Python", "React"],
        age: 22
      }
    },
    experienced: {
      name: "Senior Professional",
      profile: {
        education: "Master's in Engineering",
        experience: "10+ years in tech",
        skills: ["Leadership", "Architecture", "Multiple technologies"],
        age: 35
      }
    },
    freelancer: {
      name: "Freelance Professional",
      profile: {
        education: "Self-taught",
        experience: "5 years freelancing",
        skills: ["Full-stack development", "Client management"],
        workStyle: "Remote, project-based"
      }
    },
    career_switcher: {
      name: "Career Switcher",
      profile: {
        education: "Business background",
        experience: "Transitioning to tech",
        skills: ["Basic programming", "Business acumen"],
        challenges: ["Skill gaps", "No formal tech experience"]
      }
    }
  };

  // Bias detection patterns
  const biasPatterns = {
    gender: [
      { pattern: /\b(guys?|dudes?|bros?)\b/i, issue: "Gender-exclusive language" },
      { pattern: /\b(rockstar|ninja|guru)\b/i, issue: "Gender-coded job descriptions" },
      { pattern: /\b(aggressive|competitive)\b/i, issue: "Masculine-coded traits" }
    ],
    age: [
      { pattern: /\b(young|energetic|fresh)\b/i, issue: "Age-biased language favoring youth" },
      { pattern: /\b(experienced|seasoned|mature)\b/i, issue: "Age-biased language favoring seniority" }
    ],
    race: [
      { pattern: /\b(cultural fit|team fit)\b/i, issue: "Potentially exclusionary culture language" }
    ],
    location: [
      { pattern: /\b(local|native|from here)\b/i, issue: "Location-based discrimination" }
    ]
  };

  const runBiasDetection = useCallback((text: string) => {
    const detectedBias = [];
    
    Object.entries(biasPatterns).forEach(([biasType, patterns]) => {
      patterns.forEach(({ pattern, issue }) => {
        if (pattern.test(text)) {
          detectedBias.push({
            type: biasType,
            issue,
            severity: 'medium'
          });
        }
      });
    });
    
    return detectedBias;
  }, []);

  const runGrammarCheck = useCallback((text: string) => {
    // Simplified grammar checking - in production, integrate with language processing API
    const issues = [];
    
    // Check for common issues
    if (text.includes('...')) {
      issues.push({ type: 'style', message: 'Avoid ellipsis in professional content' });
    }
    
    if (text.length > 0 && text[0] !== text[0].toUpperCase()) {
      issues.push({ type: 'grammar', message: 'Content should start with capital letter' });
    }
    
    // Check sentence length
    const sentences = text.split(/[.!?]+/);
    const longSentences = sentences.filter(s => s.trim().split(' ').length > 25);
    if (longSentences.length > 0) {
      issues.push({ type: 'readability', message: 'Some sentences are too long' });
    }
    
    return {
      issues,
      score: Math.max(0, 100 - (issues.length * 10))
    };
  }, []);

  const runTestSuite = useCallback(async (suiteId: string) => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      let testCases: TestCase[] = [];
      
      // Generate test cases based on suite
      switch (suiteId) {
        case 'resume-generation':
          testCases = Object.values(testPersonas).map((persona, index) => ({
            id: `resume-${index}`,
            name: `Resume Generation - ${persona.name}`,
            description: `Test AI resume generation for ${persona.name}`,
            persona: persona.name,
            input: persona.profile
          }));
          break;
          
        case 'job-matching':
          testCases = [
            {
              id: 'job-match-1',
              name: 'High Match Score Accuracy',
              description: 'Test accurate job matching for relevant skills',
              input: { skills: ['React', 'JavaScript', 'Node.js'], role: 'Frontend Developer' }
            },
            {
              id: 'job-match-2', 
              name: 'Low Match Score Accuracy',
              description: 'Test accurate job matching for irrelevant skills',
              input: { skills: ['Java', 'Spring'], role: 'Frontend Developer' }
            }
          ];
          break;
          
        case 'bias-detection':
          testCases = [
            {
              id: 'bias-1',
              name: 'Gender Bias Detection',
              description: 'Detect gender-biased language',
              input: { text: 'Looking for a rockstar developer who can work with the guys' },
              biasChecks: ['gender']
            },
            {
              id: 'bias-2',
              name: 'Age Bias Detection', 
              description: 'Detect age-biased language',
              input: { text: 'Seeking young and energetic team members' },
              biasChecks: ['age']
            }
          ];
          break;
          
        default:
          testCases = [];
      }
      
      // Execute test cases
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const startTime = Date.now();
        
        try {
          let result: TestResult;
          
          if (suiteId === 'bias-detection') {
            const biasResults = runBiasDetection(testCase.input.text);
            const hasBias = biasResults.length > 0;
            
            result = {
              id: testCase.id,
              suiteName: 'Bias Detection',
              testName: testCase.name,
              status: hasBias ? 'warning' : 'passed',
              score: hasBias ? 70 : 100,
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString(),
              details: {
                metrics: { biasIssues: biasResults.length },
                expected: 'No bias detected',
                actual: hasBias ? `${biasResults.length} bias issues found` : 'No bias detected'
              }
            };
          } else {
            // Simulate AI processing
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
            
            // Mock test result
            const mockScore = 70 + Math.random() * 30;
            const isPass = mockScore >= 75;
            
            result = {
              id: testCase.id,
              suiteName: suiteId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
              testName: testCase.name,
              status: isPass ? 'passed' : 'failed',
              score: Math.round(mockScore),
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString(),
              details: {
                metrics: { 
                  accuracy: mockScore,
                  relevance: 80 + Math.random() * 20
                }
              }
            };
          }
          
          setResults(prev => [...prev, result]);
          
        } catch (error) {
          const failedResult: TestResult = {
            id: testCase.id,
            suiteName: suiteId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            testName: testCase.name,
            status: 'failed',
            score: 0,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            details: {
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          };
          
          setResults(prev => [...prev, failedResult]);
        }
        
        setProgress(((i + 1) / testCases.length) * 100);
      }
      
    } catch (error) {
      toast.error("Test suite execution failed");
      console.error("Test suite error:", error);
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  }, [runBiasDetection]);

  const runAllTests = useCallback(async () => {
    const allSuites = ['resume-generation', 'job-matching', 'bias-detection', 'cover-letter', 'edge-cases'];
    
    for (const suite of allSuites) {
      await runTestSuite(suite);
    }
  }, [runTestSuite]);

  const clearResults = useCallback(() => {
    setResults([]);
    setProgress(0);
  }, []);

  return {
    isRunning,
    progress,
    results,
    runAllTests,
    runTestSuite,
    clearResults,
    runBiasDetection,
    runGrammarCheck
  };
}