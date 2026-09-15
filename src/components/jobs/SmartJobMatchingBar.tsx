import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  Search, 
  TrendingUp, 
  Zap, 
  Target,
  Sparkles,
  Lightbulb,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface AIJobMatchProps {
  currentUser?: any;
  onFiltersChange: (filters: any) => void;
  onSearch: () => void;
}

const smartSearchSuggestions = [
  "Remote React developer jobs in India",
  "Data scientist roles with 3+ years experience",
  "Product manager positions at startups in Bangalore",
  "Frontend developer jobs with salary above 10 LPA",
  "Python developer remote work opportunities",
  "UI/UX designer jobs at tech companies",
  "DevOps engineer positions in Mumbai",
  "Machine learning engineer roles",
  "Full stack developer jobs with React and Node.js",
  "Digital marketing specialist remote positions"
];

const aiMatchingFeatures = [
  { icon: Brain, label: "Skill Matching", description: "AI analyzes your skills" },
  { icon: Target, label: "Role Fit", description: "Perfect position alignment" },
  { icon: TrendingUp, label: "Career Growth", description: "Future-ready opportunities" },
  { icon: Zap, label: "Quick Apply", description: "One-click applications" }
];

export const SmartJobMatchingBar: React.FC<AIJobMatchProps> = ({
  currentUser,
  onFiltersChange,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  // Rotate search suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => 
        (prev + 1) % smartSearchSuggestions.length
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAISearch = async (query: string) => {
    if (!query.trim()) return;

    setIsAIThinking(true);
    try {
      // Simulate AI processing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Parse natural language query into filters
      const aiFilters = parseNaturalLanguageQuery(query);
      
      onFiltersChange(aiFilters);
      setSearchQuery(query);
      onSearch();
      
      toast.success('🧠 AI found the perfect matches for you!');
    } catch (error) {
      toast.error('AI search failed. Please try again.');
    } finally {
      setIsAIThinking(false);
      setShowSuggestions(false);
    }
  };

  const parseNaturalLanguageQuery = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const filters: any = { search: query };

    // Extract experience level
    if (lowerQuery.includes('fresher') || lowerQuery.includes('0') || lowerQuery.includes('entry')) {
      filters.experience_level = ['entry'];
    } else if (lowerQuery.includes('senior') || lowerQuery.includes('lead')) {
      filters.experience_level = ['senior'];
    } else if (lowerQuery.includes('mid') || lowerQuery.includes('3+') || lowerQuery.includes('4+')) {
      filters.experience_level = ['mid'];
    }

    // Extract location
    const locations = ['mumbai', 'bangalore', 'delhi', 'pune', 'hyderabad', 'chennai', 'kolkata', 'gurgaon', 'noida'];
    for (const location of locations) {
      if (lowerQuery.includes(location)) {
        filters.location = location.charAt(0).toUpperCase() + location.slice(1);
        break;
      }
    }

    // Extract remote preference
    if (lowerQuery.includes('remote') || lowerQuery.includes('work from home') || lowerQuery.includes('wfh')) {
      filters.is_remote = true;
    }

    // Extract skills
    const skills = ['react', 'node', 'python', 'javascript', 'java', 'angular', 'vue', 'php', 'golang', 'ruby'];
    const foundSkills = skills.filter(skill => lowerQuery.includes(skill));
    if (foundSkills.length > 0) {
      filters.skills = foundSkills;
    }

    // Extract salary
    const salaryMatch = lowerQuery.match(/(\d+)\s*(lpa|lakhs?|l)/);
    if (salaryMatch) {
      const amount = parseInt(salaryMatch[1]);
      if (lowerQuery.includes('above') || lowerQuery.includes('more than') || lowerQuery.includes('>')) {
        filters.salary_min = amount * 100000;
      } else if (lowerQuery.includes('below') || lowerQuery.includes('less than') || lowerQuery.includes('<')) {
        filters.salary_max = amount * 100000;
      }
    }

    return filters;
  };

  const handleSmartApply = async () => {
    if (!currentUser) {
      toast.error('Please login to use AI job matching');
      return;
    }

    setIsAIThinking(true);
    try {
      // Get user profile for personalized matching
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      // Generate personalized search based on user profile
      let aiQuery = 'Jobs matching my profile';
      if (profile?.title) {
        aiQuery = `${profile.title} positions`;
      }
      if (profile?.location) {
        aiQuery += ` in ${profile.location}`;
      }
      
      await handleAISearch(aiQuery);
      
    } catch (error) {
      toast.error('Failed to get your profile data');
      setIsAIThinking(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Powered Search Bar */}
      <Card className="border-2 border-gradient-to-r from-blue-200 to-purple-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800">AI Career Assistant</span>
            </div>
            <Badge className="bg-purple-100 text-purple-800 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart Search
            </Badge>
          </div>
          
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={smartSearchSuggestions[currentSuggestionIndex]}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAISearch(searchQuery);
                    }
                  }}
                  className="pl-10 pr-4 h-10 border-purple-200 focus:border-purple-400 focus:ring-purple-100"
                  disabled={isAIThinking}
                />
                
                {isAIThinking && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center gap-2 text-xs text-purple-600">
                      <div className="animate-spin h-3 w-3 border border-purple-600 border-t-transparent rounded-full"></div>
                      AI thinking...
                    </div>
                  </div>
                )}
              </div>
              
              <Button
                onClick={() => handleAISearch(searchQuery)}
                disabled={isAIThinking || !searchQuery.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6"
              >
                {isAIThinking ? (
                  <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-1" />
                    AI Search
                  </>
                )}
              </Button>
            </div>

            {/* Quick Suggestions */}
            {showSuggestions && !isAIThinking && (
              <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    Try these AI-powered searches:
                  </div>
                  <div className="space-y-1">
                    {smartSearchSuggestions.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleAISearch(suggestion)}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-purple-50 rounded transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick AI Actions */}
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSmartApply}
              disabled={isAIThinking}
              className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Target className="h-3 w-3 mr-1" />
              Jobs for Me
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAISearch('Remote jobs in tech companies')}
              disabled={isAIThinking}
              className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Zap className="h-3 w-3 mr-1" />
              Remote Tech
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAISearch('High salary software engineer jobs')}
              disabled={isAIThinking}
              className="text-xs border-green-200 text-green-700 hover:bg-green-50"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              High Salary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Showcase */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {aiMatchingFeatures.map((feature, index) => (
          <Card key={index} className="border-none bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-3 text-center">
              <feature.icon className="h-6 w-6 mx-auto mb-1 text-purple-600" />
              <div className="text-xs font-medium text-gray-900">{feature.label}</div>
              <div className="text-xs text-gray-600">{feature.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};