import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

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

interface TestResultsProps {
  results: TestResult[];
}

export function TestResults({ results }: TestResultsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'passed': return 'default';
      case 'failed': return 'destructive';
      case 'warning': return 'outline';
      default: return 'secondary';
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.suiteName]) {
      acc[result.suiteName] = [];
    }
    acc[result.suiteName].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);

  const overallStats = {
    total: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    warnings: results.filter(r => r.status === 'warning').length,
    avgScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0
  };

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No test results yet. Run some tests to see results here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{overallStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{overallStats.passed}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{overallStats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{overallStats.warnings}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{overallStats.avgScore}%</div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Pass Rate</span>
              <span>{Math.round((overallStats.passed / overallStats.total) * 100)}%</span>
            </div>
            <Progress value={(overallStats.passed / overallStats.total) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Test Results by Suite */}
      {Object.entries(groupedResults).map(([suiteName, suiteResults]) => (
        <Card key={suiteName}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{suiteName}</span>
              <Badge variant="outline">
                {suiteResults.length} tests
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suiteResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.testName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(result.status)}>
                        {result.score}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {result.duration}ms
                      </span>
                    </div>
                  </div>
                  
                  {result.details && (
                    <div className="space-y-2 text-sm">
                      {result.details.error && (
                        <div className="bg-red-50 p-2 rounded">
                          <strong className="text-red-700">Error:</strong> {result.details.error}
                        </div>
                      )}
                      
                      {result.details.expected && result.details.actual && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 p-2 rounded">
                            <strong>Expected:</strong> {result.details.expected}
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <strong>Actual:</strong> {result.details.actual}
                          </div>
                        </div>
                      )}
                      
                      {result.details.metrics && (
                        <div className="bg-blue-50 p-2 rounded">
                          <strong>Metrics:</strong>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {Object.entries(result.details.metrics).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                {key}: {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}