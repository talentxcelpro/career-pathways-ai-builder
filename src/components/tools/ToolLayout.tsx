import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Clock, Users, Star, ArrowLeft, Download, Share2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ToolStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isCompleted?: boolean;
  isActive?: boolean;
}

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  estimatedTime: string;
  isPremium?: boolean;
  popularity?: number;
  steps: ToolStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  results?: any;
  onSave?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  isProcessing?: boolean;
  children?: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  title,
  description,
  category,
  estimatedTime,
  isPremium = false,
  popularity = 0,
  steps,
  currentStep,
  onStepChange,
  results,
  onSave,
  onExport,
  onShare,
  isProcessing = false,
  children
}) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isCompleted = currentStep === steps.length - 1 && results;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'resume': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'interview': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'career': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'salary': return 'bg-green-100 text-green-700 border-green-200';
      case 'market': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'ai': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'profile': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/tools')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tools
              </Button>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={getCategoryColor(category)}>
                  {category}
                </Badge>
                {isPremium && (
                  <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {popularity > 0 && (
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{popularity}% Popular</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>{estimatedTime}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <Users className="h-4 w-4" />
                <span>1.2k users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Steps */}
          <div className={`lg:col-span-3 ${isCollapsed ? 'lg:col-span-1' : ''} transition-all duration-300`}>
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Progress</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="lg:hidden"
                  >
                    {isCollapsed ? '→' : '←'}
                  </Button>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-slate-600">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </CardHeader>
              
              {!isCollapsed && (
                <CardContent className="space-y-3">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        index === currentStep
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : index < currentStep
                          ? 'border-green-200 bg-green-50'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                      onClick={() => onStepChange(index)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            index < currentStep
                              ? 'bg-green-500 text-white'
                              : index === currentStep
                              ? 'bg-primary text-white'
                              : 'bg-slate-300 text-slate-600'
                          }`}
                        >
                          {index < currentStep ? '✓' : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{step.title}</p>
                          <p className="text-xs text-slate-600 truncate">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Main Content */}
          <div className={`lg:col-span-9 ${isCollapsed ? 'lg:col-span-11' : ''} transition-all duration-300`}>
            {/* Tool Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
              <p className="text-lg text-slate-600 max-w-3xl">{description}</p>
            </div>

            {/* Current Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="min-h-[600px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary">Step {currentStep + 1}:</span>
                    {steps[currentStep]?.title}
                  </CardTitle>
                  <p className="text-slate-600">{steps[currentStep]?.description}</p>
                </CardHeader>
                <CardContent>
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                      <p className="text-slate-600">Processing your request...</p>
                    </div>
                  ) : (
                    steps[currentStep]?.component || children
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onStepChange(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                >
                  Next
                </Button>
              </div>

              {isCompleted && (
                <div className="flex gap-3">
                  {onSave && (
                    <Button variant="outline" onClick={onSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  )}
                  {onExport && (
                    <Button variant="outline" onClick={onExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  )}
                  {onShare && (
                    <Button variant="outline" onClick={onShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};