import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { TestCaseRunner } from "./TestCaseRunner";
import { BiasDetector } from "./BiasDetector";
import { GrammarValidator } from "./GrammarValidator";
import { TestResults } from "./TestResults";
import { JobScrapingTester } from "./JobScrapingTester";
import { useTestEngine } from "../../hooks/useTestEngine";

export function PromptTestingEngine() {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    isRunning,
    progress,
    results,
    runAllTests,
    runTestSuite,
    clearResults
  } = useTestEngine();

  const testSuites = [
    {
      id: "resume-generation",
      name: "Resume Generation",
      description: "Tests AI resume generation with diverse personas",
      testCount: 15
    },
    {
      id: "job-matching",
      name: "Job Matching",
      description: "Validates job matching accuracy and scoring",
      testCount: 20
    },
    {
      id: "cover-letter",
      name: "Cover Letter AI",
      description: "Tests cover letter personalization and quality",
      testCount: 12
    },
    {
      id: "bias-detection",
      name: "Bias Detection",
      description: "Scans for gender, race, and location biases",
      testCount: 25
    },
    {
      id: "edge-cases",
      name: "Edge Cases",
      description: "Empty fields, gaps, poor formatting scenarios",
      testCount: 18
    }
  ];

  const handleRunSuite = async (suiteId: string) => {
    try {
      toast.info(`Running ${suiteId} test suite...`);
      await runTestSuite(suiteId);
      toast.success(`${suiteId} tests completed`);
    } catch (error) {
      toast.error("Test suite failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Testing Engine</h1>
          <p className="text-muted-foreground">
            Automated testing for AI prompts, outputs, and bias detection
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? <Clock className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run All Tests
          </Button>
          <Button
            variant="outline"
            onClick={clearResults}
            disabled={isRunning}
          >
            Clear Results
          </Button>
        </div>
      </div>

      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Running tests...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="workflow">Job Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">90</div>
                <p className="text-xs text-muted-foreground">
                  Across all test suites
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bias Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">3</div>
                <p className="text-xs text-muted-foreground">
                  Detected this week
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Test Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { suite: "Resume Generation", status: "passed", time: "2 minutes ago", score: 96 },
                  { suite: "Bias Detection", status: "warning", time: "15 minutes ago", score: 88 },
                  { suite: "Job Matching", status: "passed", time: "1 hour ago", score: 94 },
                  { suite: "Cover Letter AI", status: "failed", time: "2 hours ago", score: 72 }
                ].map((test, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {test.status === "passed" && <CheckCircle className="h-4 w-4 text-success" />}
                      {test.status === "warning" && <AlertTriangle className="h-4 w-4 text-warning" />}
                      {test.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
                      <div>
                        <p className="font-medium">{test.suite}</p>
                        <p className="text-sm text-muted-foreground">{test.time}</p>
                      </div>
                    </div>
                    <Badge variant={test.status === "passed" ? "default" : test.status === "warning" ? "outline" : "destructive"}>
                      {test.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid gap-4">
            {testSuites.map((suite) => (
              <Card key={suite.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{suite.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{suite.description}</p>
                    </div>
                    <Button
                      onClick={() => handleRunSuite(suite.id)}
                      disabled={isRunning}
                      variant="outline"
                      size="sm"
                    >
                      Run Suite
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {suite.testCount} test cases
                    </span>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <TestResults results={results} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BiasDetector />
            <GrammarValidator />
          </div>
        </TabsContent>

        <TabsContent value="workflow">
          <JobScrapingTester />
        </TabsContent>
      </Tabs>
    </div>
  );
}