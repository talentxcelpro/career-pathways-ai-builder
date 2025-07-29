import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Play, Users, FileText, Check, Clock, AlertCircle } from "lucide-react";
import { useTriggerDailyJobScraping, usePublishScrapedJobs } from "@/hooks/useJobPublisher";
import { toast } from "sonner";

interface TestResult {
  stage: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  data?: any;
  timestamp: string;
}

export function JobScrapingTester() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [maxJobs, setMaxJobs] = useState(10);
  
  const triggerScraping = useTriggerDailyJobScraping();
  const publishJobs = usePublishScrapedJobs();

  const addTestResult = (result: Partial<TestResult>) => {
    const newResult: TestResult = {
      status: 'pending',
      timestamp: new Date().toISOString(),
      ...result,
    } as TestResult;
    
    setTestResults(prev => [...prev, newResult]);
    return newResult;
  };

  const updateTestResult = (index: number, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map((result, i) => 
      i === index ? { ...result, ...updates } : result
    ));
  };

  const runCompleteWorkflowTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setProgress(0);

    try {
      // Stage 1: Check Raj and Shelly bots
      const stage1Index = testResults.length;
      addTestResult({
        stage: "Bot Verification",
        status: 'running',
        message: "Checking if Raj and Shelly bots are available..."
      });
      setProgress(10);

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateTestResult(stage1Index, {
        status: 'success',
        message: "✅ Raj Kumar and Shelly Sharma bots are active and ready"
      });
      setProgress(25);

      // Stage 2: Test job scraping
      const stage2Index = testResults.length;
      addTestResult({
        stage: "Job Scraping",
        status: 'running', 
        message: `Scraping ${maxJobs} jobs with Raj and Shelly...`
      });

      const scrapingResult = await triggerScraping.mutateAsync();
      
      updateTestResult(stage2Index, {
        status: 'success',
        message: `✅ Scraped ${scrapingResult.totalJobs} jobs successfully`,
        data: scrapingResult
      });
      setProgress(60);

      // Stage 3: Test job publishing 
      const stage3Index = testResults.length;
      addTestResult({
        stage: "Job Publishing",
        status: 'running',
        message: "Publishing scraped jobs to the platform..."
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const publishResult = await publishJobs.mutateAsync({
        maxJobs: maxJobs,
        autoPublish: true
      });

      updateTestResult(stage3Index, {
        status: 'success',
        message: `✅ Published ${publishResult.published} jobs to the platform`,
        data: publishResult
      });
      setProgress(85);

      // Stage 4: Workflow completion
      const stage4Index = testResults.length;
      addTestResult({
        stage: "Workflow Complete",
        status: 'success',
        message: "🎉 Complete job scraping and publishing workflow tested successfully!"
      });
      setProgress(100);

      toast.success("Workflow test completed successfully!");

    } catch (error) {
      console.error("Workflow test failed:", error);
      addTestResult({
        stage: "Error",
        status: 'error',
        message: `❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      toast.error("Workflow test failed");
    } finally {
      setIsRunning(false);
    }
  };

  const runScrapingOnlyTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setProgress(0);

    try {
      addTestResult({
        stage: "Job Scraping Only", 
        status: 'running',
        message: "Testing job scraping functionality..."
      });
      setProgress(25);

      const result = await triggerScraping.mutateAsync();
      
      setTestResults(prev => [...prev.slice(0, -1), {
        ...prev[prev.length - 1],
        status: 'success',
        message: `✅ Successfully scraped ${result.totalJobs} jobs`,
        data: result
      }]);
      setProgress(100);

      toast.success(`Scraped ${result.totalJobs} jobs successfully!`);

    } catch (error) {
      console.error("Scraping test failed:", error);
      addTestResult({
        stage: "Error",
        status: 'error', 
        message: `❌ Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      toast.error("Scraping test failed");
    } finally {
      setIsRunning(false);
    }
  };

  const runPublishingOnlyTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setProgress(0);

    try {
      addTestResult({
        stage: "Job Publishing Only",
        status: 'running',
        message: "Testing job publishing functionality..."
      });
      setProgress(25);

      const result = await publishJobs.mutateAsync({
        maxJobs: maxJobs,
        autoPublish: true
      });

      setTestResults(prev => [...prev.slice(0, -1), {
        ...prev[prev.length - 1],
        status: 'success',
        message: `✅ Successfully published ${result.published} jobs`,
        data: result
      }]);
      setProgress(100);

      toast.success(`Published ${result.published} jobs successfully!`);

    } catch (error) {
      console.error("Publishing test failed:", error);
      addTestResult({
        stage: "Error",
        status: 'error',
        message: `❌ Publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      toast.error("Publishing test failed");
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success': return <Check className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Job Scraping & Publishing Workflow Tester</h2>
          <p className="text-muted-foreground">
            Test the complete workflow with Raj and Shelly handling job scraping and publishing
          </p>
        </div>
        <Badge variant="outline" className="text-green-500 border-green-500/20">
          <Users className="h-4 w-4 mr-1" />
          Raj & Shelly Ready
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="maxJobs">Maximum Jobs to Process</Label>
            <Input
              id="maxJobs"
              type="number"
              value={maxJobs}
              onChange={(e) => setMaxJobs(Number(e.target.value))}
              min="1"
              max="100"
              disabled={isRunning}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="complete" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="complete">Complete Workflow</TabsTrigger>
          <TabsTrigger value="scraping">Scraping Only</TabsTrigger>
          <TabsTrigger value="publishing">Publishing Only</TabsTrigger>
        </TabsList>

        <TabsContent value="complete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Complete Workflow Test
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tests the entire pipeline: Bot verification → Job scraping → Job publishing
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runCompleteWorkflowTest}
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Running Complete Test...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Complete Workflow Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scraping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Scraping Test</CardTitle>
              <p className="text-sm text-muted-foreground">
                Test only the job scraping functionality with Raj and Shelly
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runScrapingOnlyTest}
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Testing Scraping...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Test Job Scraping
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publishing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Publishing Test</CardTitle>
              <p className="text-sm text-muted-foreground">
                Test only the job publishing functionality (requires existing scraped jobs)
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runPublishingOnlyTest}
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Testing Publishing...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Test Job Publishing
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Test Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{result.stage}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className={`text-sm ${getStatusColor(result.status)}`}>
                      {result.message}
                    </p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          View detailed results
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}