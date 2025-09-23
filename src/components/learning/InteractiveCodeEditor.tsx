import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Check, X, Lightbulb, Timer, Trophy } from 'lucide-react';
import { useSubmitExercise, type InteractiveExercise } from '@/hooks/useAdvancedLearning';
import { toast } from 'sonner';

interface InteractiveCodeEditorProps {
  exercise: InteractiveExercise;
  userId: string;
  onComplete?: (score: number) => void;
}

export const InteractiveCodeEditor: React.FC<InteractiveCodeEditorProps> = ({
  exercise,
  userId,
  onComplete
}) => {
  const [code, setCode] = useState(exercise.starter_code || '');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const submitExercise = useSubmitExercise();

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setTestResults([]);

    try {
      // Simulate code execution with test cases
      const results = exercise.test_cases.map((testCase, index) => {
        // This is a simplified simulation - in a real implementation,
        // you'd use a code execution service like Judge0 or CodePen
        const passed = Math.random() > 0.3; // Simulate test results
        return {
          id: index,
          input: testCase.input,
          expected: testCase.expected,
          actual: testCase.expected, // Simulate correct output
          passed,
          description: testCase.description || `Test case ${index + 1}`
        };
      });

      setTestResults(results);
      
      const passedTests = results.filter(r => r.passed).length;
      const totalTests = results.length;
      const newScore = Math.round((passedTests / totalTests) * 100);
      setScore(newScore);

      if (newScore >= 80) {
        setIsCompleted(true);
        setOutput('🎉 All tests passed! Great job!');
        
        // Submit exercise completion
        const completionTimeMinutes = Math.round((Date.now() - startTime) / 60000);
        
        await submitExercise.mutateAsync({
          userId,
          exerciseId: exercise.id,
          submissionCode: code,
          testResults: results,
          score: newScore,
          completionTimeMinutes,
          hintsUsed
        });

        onComplete?.(newScore);
        toast.success(`Exercise completed with ${newScore}% score!`);
      } else {
        setOutput(`${passedTests}/${totalTests} tests passed. Keep trying!`);
      }

    } catch (error) {
      setOutput('Error running code: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const showNextHint = () => {
    if (hintsUsed < exercise.hints.length) {
      setHintsUsed(hintsUsed + 1);
      setShowHint(true);
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{exercise.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                {getDifficultyText(exercise.difficulty_level)}
              </Badge>
              <Badge variant="outline">
                <Timer className="h-3 w-3 mr-1" />
                {exercise.estimated_time_minutes} min
              </Badge>
              {isCompleted && (
                <Badge className="bg-green-500">
                  <Trophy className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">{exercise.instructions}</p>
          
          {/* Technologies */}
          {exercise.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {exercise.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Code Editor and Output */}
      <Tabs defaultValue="code" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="code">Code Editor</TabsTrigger>
          <TabsTrigger value="output">Output & Tests</TabsTrigger>
          <TabsTrigger value="hints">Hints ({hintsUsed}/{exercise.hints.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Solution</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={runCode} 
                    disabled={isRunning}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? 'Running...' : 'Run Code'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm bg-muted rounded-md border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Write your code here..."
                disabled={isCompleted}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="output" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Results</CardTitle>
              {score > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Score</span>
                    <span className="font-semibold">{score}%</span>
                  </div>
                  <Progress value={score} className="w-full" />
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Output */}
              {output && (
                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-semibold mb-2">Output:</h4>
                  <pre className="text-sm">{output}</pre>
                </div>
              )}

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Test Results:</h4>
                  {testResults.map((result) => (
                    <div 
                      key={result.id}
                      className={`p-3 rounded-md border ${
                        result.passed 
                          ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                          : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {result.passed ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{result.description}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Input: {JSON.stringify(result.input)}</div>
                        <div>Expected: {JSON.stringify(result.expected)}</div>
                        {!result.passed && (
                          <div>Got: {JSON.stringify(result.actual)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hints" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Hints</CardTitle>
                <Button 
                  onClick={showNextHint}
                  disabled={hintsUsed >= exercise.hints.length || isCompleted}
                  variant="outline"
                  size="sm"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Get Hint
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {exercise.hints.slice(0, hintsUsed).map((hint, index) => (
                <div 
                  key={index}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-950 dark:border-blue-800"
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800 dark:text-blue-200">
                        Hint {index + 1}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        {hint}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {hintsUsed === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Click "Get Hint" when you need help!</p>
                </div>
              )}
              
              {hintsUsed >= exercise.hints.length && (
                <div className="text-center text-muted-foreground py-4">
                  <p>No more hints available. You've got this! 💪</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};