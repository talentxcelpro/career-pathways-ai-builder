
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
  Award 
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

interface Tool {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType;
  popular?: boolean;
}

const tools: Tool[] = [
  {
    id: 'resume-check',
    title: 'Resume Checker',
    icon: FileCheck,
    component: ResumeCheck,
    popular: true
  },
  {
    id: 'cover-letter',
    title: 'Cover Letter',
    icon: FileText,
    component: CoverLetter,
    popular: true
  },
  {
    id: 'salary-analyzer',
    title: 'Salary Analyzer',
    icon: DollarSign,
    component: SalaryAnalyzer
  },
  {
    id: 'market-insights',
    title: 'Market Insights',
    icon: TrendingUp,
    component: MarketInsights
  },
  {
    id: 'interview-prep',
    title: 'Interview Prep',
    icon: MessageSquare,
    component: InterviewPrep,
    popular: true
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    icon: Brain,
    component: AICareerAssistant
  },
  {
    id: 'profile-score',
    title: 'Profile Score',
    icon: Award,
    component: ProfileScore
  }
];

const ToolsTabsInterface = () => {
  const [activeTab, setActiveTab] = useState('tools');
  const [activeTool, setActiveTool] = useState('resume-check');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Career Tools</h1>
          <p className="text-gray-600">Comprehensive toolkit for your career development</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="tools" className="flex items-center space-x-2">
              <Wrench className="h-4 w-4" />
              <span>Tools</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Favorites</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Tool Selection Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Available Tools</h3>
                  <div className="space-y-2">
                    {tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                          activeTool === tool.id
                            ? 'bg-blue-50 border-blue-200 border'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <tool.icon className={`h-5 w-5 ${
                          activeTool === tool.id ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                        <div className="flex-1">
                          <span className={`text-sm font-medium ${
                            activeTool === tool.id ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {tool.title}
                          </span>
                          {tool.popular && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Tool Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-sm border">
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
            <ToolResultsHistory />
          </TabsContent>

          <TabsContent value="analytics">
            <ToolsAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="favorites">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Favorite Tools & Results</h2>
              <p className="text-gray-600">Your starred tools and saved results will appear here.</p>
              {/* This would filter and display favorite items from ToolResultsHistory */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ToolsTabsInterface;
