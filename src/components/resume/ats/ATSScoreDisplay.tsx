import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, RefreshCw, Loader2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { ATSAnalysisResult } from "@/services/atsAnalyzerService";

interface ATSScoreDisplayProps {
  score: number;
  analysis?: ATSAnalysisResult;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export const ATSScoreDisplay: React.FC<ATSScoreDisplayProps> = ({
  score,
  analysis,
  isAnalyzing,
  onAnalyze
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">ATS Score</span>
        </div>
        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <div className={`text-4xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
          {score}
        </div>
        <div className="text-xl text-muted-foreground mb-1">/100</div>
        <Badge variant="secondary" className="mb-1">{getScoreLabel(score)}</Badge>
      </div>

      <div className="w-full bg-muted rounded-full h-2 mb-3">
        <div 
          className={`bg-gradient-to-r ${getScoreColor(score)} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      {analysis && (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Keywords</span>
            <span className="font-medium">{analysis.keywordScore}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Format</span>
            <span className="font-medium">{analysis.formatScore}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Content</span>
            <span className="font-medium">{analysis.contentScore}/100</span>
          </div>
        </div>
      )}

      {!analysis && !isAnalyzing && (
        <p className="text-xs text-muted-foreground mt-2">
          Click refresh for detailed analysis
        </p>
      )}
    </div>
  );
};

interface ATSDetailedAnalysisProps {
  analysis: ATSAnalysisResult;
}

export const ATSDetailedAnalysis: React.FC<ATSDetailedAnalysisProps> = ({ analysis }) => {
  const b = analysis.breakdown || {
    mustHaveScore: Math.round(analysis.score * 0.35),
    preferredScore: Math.round(analysis.score * 0.15),
    experienceScore: Math.round(analysis.score * 0.20),
    hardSkillsScore: Math.round(analysis.score * 0.15),
    semanticScore: Math.round(analysis.score * 0.10),
    assessmentScore: Math.round(analysis.score * 0.05)
  };

  return (
    <div className="space-y-6">
      {/* Explainable Score Breakdown Card */}
      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
        <h4 className="font-bold text-sm text-foreground flex items-center justify-between">
          <span>Explainable ATS Fit Breakdown</span>
          <span className="text-primary">{analysis.score}/100</span>
        </h4>
        {analysis.explanation && (
          <p className="text-xs text-muted-foreground leading-relaxed">{analysis.explanation}</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="p-2 rounded bg-background border space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Must-Have Requirements</span>
            <span className="font-bold text-foreground">{b.mustHaveScore} / 35</span>
          </div>
          <div className="p-2 rounded bg-background border space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Preferred Requirements</span>
            <span className="font-bold text-foreground">{b.preferredScore} / 15</span>
          </div>
          <div className="p-2 rounded bg-background border space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Experience Fit</span>
            <span className="font-bold text-foreground">{b.experienceScore} / 20</span>
          </div>
          <div className="p-2 rounded bg-background border space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Hard Skills Density</span>
            <span className="font-bold text-foreground">{b.hardSkillsScore} / 15</span>
          </div>
          <div className="p-2 rounded bg-background border space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Semantic Context Fit</span>
            <span className="font-bold text-foreground">{b.semanticScore} / 10</span>
          </div>
          <div className="p-2 rounded bg-background border space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Assessment / Evidence</span>
            <span className="font-bold text-foreground">{b.assessmentScore} / 5</span>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {analysis.strengthsFound.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Verified Strengths
          </h4>
          <div className="space-y-2">
            {analysis.strengthsFound.map((strength, idx) => (
              <div key={idx} className="p-3 border-l-4 border-green-500 bg-green-500/10 rounded-r text-sm">
                {strength}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {analysis.issuesFound.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            Issues to Fix
          </h4>
          <div className="space-y-2">
            {analysis.issuesFound.map((issue, idx) => (
              <div key={idx} className="p-3 border-l-4 border-red-500 bg-red-500/10 rounded-r text-sm">
                {issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Actionable Recommendations
          </h4>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 border-l-4 border-yellow-500 bg-yellow-500/10 rounded-r text-sm">
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      <div className="grid grid-cols-2 gap-4">
        {analysis.matchedKeywords.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-sm text-green-600">Matched Keywords</h4>
            <div className="flex flex-wrap gap-1">
              {analysis.matchedKeywords.map((kw, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-green-500/20">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {analysis.missingKeywords.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-sm text-red-600">Missing Keywords</h4>
            <div className="flex flex-wrap gap-1">
              {analysis.missingKeywords.map((kw, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-red-500/20">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
