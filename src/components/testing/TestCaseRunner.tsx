import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, XCircle, Clock } from "lucide-react";

interface TestCase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
}

interface TestCaseRunnerProps {
  testCases: TestCase[];
  onRunTest: (testId: string) => Promise<void>;
}

export function TestCaseRunner({ testCases, onRunTest }: TestCaseRunnerProps) {
  return (
    <div className="space-y-4">
      {testCases.map((testCase) => (
        <Card key={testCase.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">{testCase.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{testCase.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {testCase.status === 'passed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {testCase.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                {testCase.status === 'running' && <Clock className="h-4 w-4 text-blue-500 animate-spin" />}
                <Badge variant={testCase.status === 'passed' ? 'default' : testCase.status === 'failed' ? 'destructive' : 'outline'}>
                  {testCase.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          {testCase.error && (
            <CardContent>
              <p className="text-sm text-red-500">{testCase.error}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}