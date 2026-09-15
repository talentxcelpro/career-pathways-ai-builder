import { CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExtractionQualityProps {
  validationResult?: {
    score: number;
    isValid: boolean;
    issues: Array<{
      severity: 'error' | 'warning' | 'info';
      field: string;
      message: string;
      suggestion?: string;
    }>;
    recommendations: string[];
  };
  extractionConfidence?: number;
  metadata?: {
    extractionMethod?: string;
    validationScore?: number;
    needsManualReview?: boolean;
  };
}

export const ExtractionQualityIndicator = ({
  validationResult,
  extractionConfidence,
  metadata
}: ExtractionQualityProps) => {
  if (!validationResult && !extractionConfidence) {
    return null;
  }

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Review";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const score = validationResult?.score || (extractionConfidence || 0) * 100;
  const confidence = extractionConfidence || 0;

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Extraction Quality Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Quality</span>
            <Badge variant={score >= 60 ? "default" : "destructive"}>
              {getQualityLabel(score)}
            </Badge>
          </div>
          <Progress value={score} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Extraction Score: {score.toFixed(0)}/100</span>
            <span>Confidence: {(confidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Extraction Method */}
        {metadata?.extractionMethod && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Method:</span>
            <Badge variant="outline">
              {metadata.extractionMethod === 'OCR + AI' ? 'OCR Enhanced' : 
               metadata.extractionMethod === 'ai-powered' ? 'AI Direct' : 
               'Basic Extraction'}
            </Badge>
          </div>
        )}

        {/* Manual Review Indicator */}
        {metadata?.needsManualReview && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Manual review recommended for optimal results
            </span>
          </div>
        )}

        {/* Issues Summary */}
        {validationResult?.issues && validationResult.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Data Quality Issues</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {validationResult.issues.slice(0, 5).map((issue, index) => (
                <div key={index} className="flex items-start gap-2 text-xs p-2 bg-muted/50 rounded">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="font-medium">{issue.message}</div>
                    {issue.suggestion && (
                      <div className="text-muted-foreground mt-1">{issue.suggestion}</div>
                    )}
                  </div>
                </div>
              ))}
              {validationResult.issues.length > 5 && (
                <div className="text-xs text-muted-foreground text-center py-1">
                  +{validationResult.issues.length - 5} more issues
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {validationResult?.recommendations && validationResult.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommendations</h4>
            <ul className="space-y-1">
              {validationResult.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                  <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};