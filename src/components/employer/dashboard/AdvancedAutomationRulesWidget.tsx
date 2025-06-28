
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bot, Zap, Clock, Users, Filter, Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  runsToday: number;
  successRate: number;
  lastRun: string;
  complexity: 'simple' | 'medium' | 'advanced';
  category: 'screening' | 'scheduling' | 'communication' | 'analytics';
}

export const AdvancedAutomationRulesWidget = () => {
  const navigate = useNavigate();
  
  const automationRules: AutomationRule[] = [
    {
      id: '1',
      name: 'Smart Candidate Scoring',
      trigger: 'New application received',
      action: 'Auto-score based on AI analysis',
      isActive: true,
      runsToday: 23,
      successRate: 94,
      lastRun: '12 mins ago',
      complexity: 'advanced',
      category: 'screening'
    },
    {
      id: '2',
      name: 'Interview Reminder Sequence',
      trigger: 'Interview scheduled',
      action: 'Send reminder emails at 24h, 2h, 30m',
      isActive: true,
      runsToday: 8,
      successRate: 100,
      lastRun: '1 hour ago',
      complexity: 'medium',
      category: 'scheduling'
    },
    {
      id: '3',
      name: 'Auto-Reject Unqualified',
      trigger: 'Application score < 40%',
      action: 'Send rejection email + feedback',
      isActive: false,
      runsToday: 0,
      successRate: 87,
      lastRun: 'Yesterday',
      complexity: 'simple',
      category: 'screening'
    },
    {
      id: '4',
      name: 'Team Notification Hub',
      trigger: 'High-priority candidate',
      action: 'Notify hiring manager instantly',
      isActive: true,
      runsToday: 5,
      successRate: 96,
      lastRun: '3 hours ago',
      complexity: 'medium',
      category: 'communication'
    }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'screening': return <Filter className="h-3 w-3" />;
      case 'scheduling': return <Clock className="h-3 w-3" />;
      case 'communication': return <Users className="h-3 w-3" />;
      case 'analytics': return <Bot className="h-3 w-3" />;
      default: return <Zap className="h-3 w-3" />;
    }
  };

  const activeRules = automationRules.filter(rule => rule.isActive).length;
  const totalRuns = automationRules.reduce((acc, rule) => acc + rule.runsToday, 0);

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Automation Rules</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {activeRules} active • {totalRuns} runs today
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/automation/rules')}
          >
            Create Rule
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {automationRules.slice(0, 3).map((rule) => (
          <div 
            key={rule.id}
            className={`flex items-start gap-3 p-3 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer ${
              rule.isActive ? 'bg-slate-50/50' : 'bg-slate-50/30 opacity-70'
            }`}
            onClick={() => navigate(`/employer/automation/rules/${rule.id}`)}
          >
            <div className="p-1.5 bg-orange-100 rounded-md">
              {getCategoryIcon(rule.category)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800">{rule.name}</h4>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getComplexityColor(rule.complexity)}`}>
                    {rule.complexity}
                  </Badge>
                  <Switch checked={rule.isActive} size="sm" />
                </div>
              </div>
              
              <div className="space-y-1 mb-2">
                <p className="text-xs text-slate-600">
                  <span className="font-medium">When:</span> {rule.trigger}
                </p>
                <p className="text-xs text-slate-600">
                  <span className="font-medium">Then:</span> {rule.action}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">Runs: {rule.runsToday}</span>
                  <span className="text-xs text-green-600">Success: {rule.successRate}%</span>
                </div>
                <span className="text-xs text-slate-500">{rule.lastRun}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2">
            <div 
              className="flex items-center justify-center gap-2 p-2 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
              onClick={() => navigate('/employer/automation/rules')}
            >
              <span className="text-sm font-semibold text-orange-700">View All</span>
              <Bot className="h-3 w-3 text-orange-700" />
            </div>
            <div 
              className="flex items-center justify-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => navigate('/employer/automation/rules/create')}
            >
              <span className="text-sm font-semibold text-slate-700">New Rule</span>
              <Plus className="h-3 w-3 text-slate-700" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
