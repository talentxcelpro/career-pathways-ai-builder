import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, Eye } from "lucide-react";

interface BiasResult {
  type: 'gender' | 'race' | 'age' | 'location';
  severity: 'low' | 'medium' | 'high';
  description: string;
  example: string;
  suggestion: string;
}

export function BiasDetector() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [biasResults, setBiasResults] = useState<BiasResult[]>([]);

  const runBiasDetection = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setBiasResults([]);

    // Simulate bias detection process
    const mockResults: BiasResult[] = [
      {
        type: 'gender',
        severity: 'medium',
        description: 'Gender-biased language detected in job descriptions',
        example: 'Using "rockstar developer" or "ninja programmer"',
        suggestion: 'Use neutral terms like "skilled developer" or "experienced programmer"'
      },
      {
        type: 'age',
        severity: 'low',
        description: 'Age-related assumptions in resume suggestions',
        example: 'Assuming recent graduates lack experience',
        suggestion: 'Focus on skills and competencies rather than years of experience'
      }
    ];

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setScanProgress(i);
    }

    setBiasResults(mockResults);
    setIsScanning(false);
  };

  const getBiasIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBiasVariant = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Bias Detection
          </CardTitle>
          <Button
            onClick={runBiasDetection}
            disabled={isScanning}
            size="sm"
          >
            {isScanning ? 'Scanning...' : 'Run Scan'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isScanning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Scanning for bias patterns...</span>
              <span>{scanProgress}%</span>
            </div>
            <Progress value={scanProgress} />
          </div>
        )}

        {biasResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Detection Results</h4>
            {biasResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getBiasIcon(result.severity)}
                    <span className="font-medium capitalize">{result.type} Bias</span>
                  </div>
                  <Badge variant={getBiasVariant(result.severity)}>
                    {result.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{result.description}</p>
                <div className="text-xs bg-muted p-2 rounded">
                  <strong>Example:</strong> {result.example}
                </div>
                <div className="text-xs bg-blue-50 p-2 rounded">
                  <strong>Suggestion:</strong> {result.suggestion}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isScanning && biasResults.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2" />
            <p>No bias detection results yet. Run a scan to begin.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}