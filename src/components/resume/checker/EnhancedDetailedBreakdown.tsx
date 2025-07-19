
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, CheckCircle, XCircle, AlertCircle, Lock, Lightbulb } from 'lucide-react';

interface DetailedCheck {
  name: string;
  passed: boolean;
  description: string;
  impact: 'high' | 'medium' | 'low';
  suggestion?: string;
  isPremium?: boolean;
}

interface DetailedCategory {
  category: string;
  score: number;
  maxScore: number;
  checks: DetailedCheck[];
  icon: React.ReactNode;
  color: string;
}

interface EnhancedDetailedBreakdownProps {
  categories: DetailedCategory[];
  showPremiumUpgrade?: boolean;
}

export const EnhancedDetailedBreakdown: React.FC<EnhancedDetailedBreakdownProps> = ({
  categories,
  showPremiumUpgrade = true
}) => {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = (index: number) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(index)) {
      newOpenSections.delete(index);
    } else {
      newOpenSections.add(index);
    }
    setOpenSections(newOpenSections);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return { variant: 'destructive' as const, text: 'High Impact' };
      case 'medium': return { variant: 'secondary' as const, text: 'Medium Impact' };
      case 'low': return { variant: 'outline' as const, text: 'Low Impact' };
      default: return { variant: 'outline' as const, text: 'Low Impact' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Detailed Analysis</h3>
        <Badge variant="secondary" className="text-xs">
          {categories.reduce((acc, cat) => acc + cat.checks.filter(c => c.passed).length, 0)} of{' '}
          {categories.reduce((acc, cat) => acc + cat.checks.length, 0)} checks passed
        </Badge>
      </div>
      
      {categories.map((category, categoryIndex) => (
        <Collapsible 
          key={categoryIndex} 
          open={openSections.has(categoryIndex)}
          onOpenChange={() => toggleSection(categoryIndex)}
        >
          <Card className={`border-2 transition-all duration-200 ${getScoreBgColor(category.score)}`}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-white/50 transition-colors">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {category.category}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {category.checks.filter(c => c.passed).length}/{category.checks.length} passed
                        </Badge>
                        {category.checks.some(c => c.isPremium) && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                        {category.score}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {category.checks.filter(c => !c.passed).length} issues
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                      openSections.has(categoryIndex) ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {category.checks.map((check, checkIndex) => (
                    <div key={checkIndex} className="relative">
                      <div className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-200 ${
                        check.isPremium 
                          ? 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200' 
                          : 'bg-white/70 border border-gray-200 hover:bg-white/90'
                      }`}>
                        <div className="flex-shrink-0 mt-0.5">
                          {check.isPremium ? (
                            <Lock className="h-5 w-5 text-purple-500" />
                          ) : check.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-semibold text-sm ${
                              check.isPremium ? 'text-purple-900' : 'text-gray-900'
                            }`}>
                              {check.name}
                            </h4>
                            <Badge {...getImpactBadge(check.impact)} className="text-xs">
                              {getImpactBadge(check.impact).text}
                            </Badge>
                          </div>
                          
                          <p className={`text-sm ${
                            check.isPremium ? 'text-purple-700' : 'text-gray-600'
                          }`}>
                            {check.description}
                          </p>

                          {!check.passed && check.suggestion && !check.isPremium && (
                            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                              <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-blue-900 text-sm mb-1">
                                  Suggestion
                                </div>
                                <p className="text-sm text-blue-800">{check.suggestion}</p>
                              </div>
                            </div>
                          )}

                          {check.isPremium && (
                            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <Lock className="h-4 w-4 text-purple-500" />
                              <span className="text-sm text-purple-700 font-medium">
                                Unlock detailed analysis and suggestions
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}

      {showPremiumUpgrade && (
        <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-white/20 rounded-full">
                  <Lock className="h-8 w-8" />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Unlock Full Analysis Report
                </h3>
                <p className="text-purple-100 mb-4">
                  Get detailed suggestions, industry comparisons, and personalized recommendations to boost your resume score to 90+
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>ATS Optimization Tips</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>Keyword Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>Industry Benchmarks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>Custom Templates</span>
                </div>
              </div>

              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                Upgrade to TalentXcel Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
