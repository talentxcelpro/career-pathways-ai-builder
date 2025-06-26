
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  History, 
  BarChart3, 
  Star,
  FileCheck, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  Brain, 
  Award,
  Users,
  Target,
  Lightbulb,
  Activity,
  Zap
} from 'lucide-react';

// Import existing tool components
import ResumeCheck from '@/pages/tools/ResumeCheck';
import CoverLetter from '@/pages/tools/CoverLetter';
import SalaryAnalyzer from '@/pages/tools/SalaryAnalyzer';
import MarketInsights from '@/pages/tools/MarketInsights';
import InterviewPrep from '@/pages/tools/InterviewPrep';
import AICareerAssistant from '@/pages/tools/AICareerAssistant';
import ProfileScore from '@/pages/tools/ProfileScore';

// Import new components
import ToolResultsHistory from './ToolResultsHistory';
import ToolsAnalyticsDashboard from './ToolsAnalyticsDashboard';
import RealTimeCollaboration from './RealTimeCollaboration';
import AdvancedAnalytics from './AdvancedAnalytics';
import ProfileIntegration from './ProfileIntegration';
import AutomatedSuggestions from './AutomatedSuggestions';

interface Tool {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType;
  popular?: boolean;
  gradient: string;
  usage: string;
}

const tools: Tool[] = [
  {
    id: 'resume-check',
    title: 'Resume Checker',
    icon: FileCheck,
    component: ResumeCheck,
    popular: true,
    gradient: 'from-blue-500 to-blue-600',
    usage: '2.3k'
  },
  {
    id: 'cover-letter',
    title: 'Cover Letter AI',
    icon: FileText,
    component: CoverLetter,
    popular: true,
    gradient: 'from-green-500 to-emerald-600',
    usage: '1.8k'
  },
  {
    id: 'salary-analyzer',
    title: 'Salary Intelligence',
    icon: DollarSign,
    component: SalaryAnalyzer,
    gradient: 'from-yellow-500 to-orange-500',
    usage: '956'
  },
  {
    id: 'market-insights',
    title: 'Market Pulse',
    icon: TrendingUp,
    component: MarketInsights,
    gradient: 'from-purple-500 to-indigo-600',
    usage: '743'
  },
  {
    id: 'interview-prep',
    title: 'Interview Simulator',
    icon: MessageSquare,
    component: InterviewPrep,
    popular: true,
    gradient: 'from-orange-500 to-red-500',
    usage: '1.2k'
  },
  {
    id: 'ai-assistant',
    title: 'Career Copilot',
    icon: Brain,
    component: AICareerAssistant,
    gradient: 'from-indigo-500 to-purple-500',
    usage: '891'
  },
  {
    id: 'profile-score',
    title: 'Profile Optimizer',
    icon: Award,
    component: ProfileScore,
    gradient: 'from-red-500 to-pink-500',
    usage: '654'
  }
];

const ToolsTabsInterface = () => {
  const [activeTab, setActiveTab] = useState('tools');
  const [activeTool, setActiveTool] = useState('resume-check');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-6 mb-6 shadow-xl">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">AI Career Tools Dashboard</h1>
                <p className="text-sm text-blue-100">Advanced toolkit for career development and optimization</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white text-xs">Pro Suite</Badge>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-6 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
            <TabsTrigger value="tools" className="flex items-center space-x-2 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Wrench className="h-3 w-3" />
              <span>Tools</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2 text-xs data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <History className="h-3 w-3" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <BarChart3 className="h-3 w-3" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center space-x-2 text-xs data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              <Star className="h-3 w-3" />
              <span>Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex items-center space-x-2 text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Users className="h-3 w-3" />
              <span>Collaborate</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center space-x-2 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Target className="h-3 w-3" />
              <span>Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2 text-xs data-[state=active]:bg-pink-600 data-[state=active]:text-white">
              <Award className="h-3 w-3" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center space-x-2 text-xs data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              <Lightbulb className="h-3 w-3" />
              <span>AI Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Enhanced Tool Selection Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4 sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Available Tools</h3>
                    <Badge variant="secondary" className="text-xs">{tools.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-300 ${
                          activeTool === tool.id
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 border shadow-sm transform scale-[1.02]'
                            : 'hover:bg-gray-50/80 hover:transform hover:scale-[1.01]'
                        }`}
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.gradient} shadow-sm`}>
                          <tool.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium truncate ${
                              activeTool === tool.id ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {tool.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {tool.popular && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                                Popular
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">{tool.usage}</Badge>
                          </div>
                        </div>
                        {activeTool === tool.id && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Tool Content */}
              <div className="lg:col-span-3">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 overflow-hidden">
                  {(() => {
                    const activeTool_obj = tools.find(t => t.id === activeTool);
                    if (activeTool_obj) {
                      const ToolComponent = activeTool_obj.component;
                      return <ToolComponent />;
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
              <ToolResultsHistory />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
              <ToolsAnalyticsDashboard />
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <h2 className="text-lg font-semibold mb-2 text-gray-900">Favorite Tools & Results</h2>
                <p className="text-sm text-gray-600 mb-4">Your starred tools and saved results will appear here.</p>
                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collaboration">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
              <RealTimeCollaboration 
                toolName={activeTool} 
                toolData={{ currentTool: activeTool, timestamp: new Date().toISOString() }} 
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
              <AdvancedAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
              <ProfileIntegration />
            </div>
          </TabsContent>

          <TabsContent value="suggestions">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
              <AutomatedSuggestions />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ToolsTabsInterface;
