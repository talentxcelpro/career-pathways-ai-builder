import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cpu, 
  Activity, 
  Zap, 
  Brain, 
  TrendingUp, 
  Users,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface EngineMetrics {
  status: 'active' | 'processing' | 'optimizing';
  learningRate: number;
  activeLearners: number;
  completionRate: number;
  aiProcessingTime: number;
}

export const LearningEngineStatus: React.FC = () => {
  const [metrics, setMetrics] = useState<EngineMetrics>({
    status: 'active',
    learningRate: 94.5,
    activeLearners: 1247,
    completionRate: 89.2,
    aiProcessingTime: 0.3
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        learningRate: Math.max(85, Math.min(99, prev.learningRate + (Math.random() - 0.5) * 2)),
        activeLearners: Math.max(1000, Math.min(2000, prev.activeLearners + Math.floor((Math.random() - 0.5) * 20))),
        completionRate: Math.max(80, Math.min(95, prev.completionRate + (Math.random() - 0.5) * 1)),
        aiProcessingTime: Math.max(0.1, Math.min(0.8, prev.aiProcessingTime + (Math.random() - 0.5) * 0.1))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (metrics.status) {
      case 'active':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          icon: Activity,
          label: 'Active',
          description: 'Learning engine running optimally'
        };
      case 'processing':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          icon: Cpu,
          label: 'Processing',
          description: 'Analyzing learning patterns'
        };
      case 'optimizing':
        return {
          color: 'text-ai-violet-dark',
          bgColor: 'bg-ai-violet/10',
          borderColor: 'border-ai-violet/20',
          icon: Brain,
          label: 'Optimizing',
          description: 'AI improving recommendations'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-apple border-glass-border shadow-elegant relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-ai-violet/5 to-success/5 animate-gradient-x"></div>
      
      <CardContent className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              <StatusIcon className={`w-5 h-5 ${statusConfig.color} animate-pulse`} />
            </div>
            <div>
              <h3 className="font-heading text-subheading text-foreground">Learning Engine</h3>
              <p className="text-caption text-muted-foreground">{statusConfig.description}</p>
            </div>
          </div>
          <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0 animate-pulse`}>
            <div className="w-2 h-2 bg-current rounded-full mr-2"></div>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-card backdrop-blur-apple apple-rounded-lg apple-padding-sm border border-glass-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-caption text-muted-foreground">Learning Rate</span>
            </div>
            <div className="text-subheading font-bold text-foreground">{metrics.learningRate.toFixed(1)}%</div>
            <div className="text-xs text-success">+2.3% today</div>
          </div>

          <div className="bg-gradient-card backdrop-blur-apple apple-rounded-lg apple-padding-sm border border-glass-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-ai-violet-dark" />
              <span className="text-caption text-muted-foreground">Active Now</span>
            </div>
            <div className="text-subheading font-bold text-foreground">{metrics.activeLearners.toLocaleString()}</div>
            <div className="text-xs text-success">+15% vs yesterday</div>
          </div>

          <div className="bg-gradient-card backdrop-blur-apple apple-rounded-lg apple-padding-sm border border-glass-border">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-warning animate-spin-slow" />
              <span className="text-caption text-muted-foreground">Completion</span>
            </div>
            <div className="text-subheading font-bold text-foreground">{metrics.completionRate.toFixed(1)}%</div>
            <div className="text-xs text-success">Above average</div>
          </div>

          <div className="bg-gradient-card backdrop-blur-apple apple-rounded-lg apple-padding-sm border border-glass-border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-success animate-pulse" />
              <span className="text-caption text-muted-foreground">AI Response</span>
            </div>
            <div className="text-subheading font-bold text-foreground">{metrics.aiProcessingTime.toFixed(1)}s</div>
            <div className="text-xs text-success">Ultra fast</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="group"
            >
              <Brain className="w-4 h-4 mr-2 group-hover:animate-spin" />
              Engine Details
              <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            Last updated: now
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-glass-border animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">AI Processing</h4>
                <div className="space-y-2 text-caption">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Neural Networks:</span>
                    <span className="text-success">5 active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ML Models:</span>
                    <span className="text-success">12 running</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Processing:</span>
                    <span className="text-success">Real-time</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Performance</h4>
                <div className="space-y-2 text-caption">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="text-success">98.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="text-success">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Load:</span>
                    <span className="text-warning">Moderate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};