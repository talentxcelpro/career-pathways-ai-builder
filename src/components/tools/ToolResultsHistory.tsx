
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Star, 
  StarOff, 
  Trash2, 
  FileText, 
  Clock,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SavedResult {
  id: string;
  tool_name: string;
  title: string;
  content: any;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

const ToolResultsHistory = () => {
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SavedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState('all');
  const { toast } = useToast();

  const toolNames = ['resume-check', 'cover-letter', 'salary-analyzer', 'interview-prep', 'ai-assistant', 'profile-score', 'market-insights'];

  useEffect(() => {
    fetchSavedResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [savedResults, searchTerm, selectedTool]);

  const fetchSavedResults = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_tool_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedResults(data || []);
    } catch (error) {
      console.error('Error fetching saved results:', error);
      toast({
        title: "Error",
        description: "Failed to load saved results.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = savedResults;

    if (selectedTool !== 'all') {
      filtered = filtered.filter(result => result.tool_name === selectedTool);
    }

    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.tool_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredResults(filtered);
  };

  const toggleFavorite = async (resultId: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_tool_results')
        .update({ is_favorite: !isFavorite })
        .eq('id', resultId);

      if (error) throw error;

      setSavedResults(prev =>
        prev.map(result =>
          result.id === resultId ? { ...result, is_favorite: !isFavorite } : result
        )
      );

      toast({
        title: "Success",
        description: `Result ${!isFavorite ? 'added to' : 'removed from'} favorites.`,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  };

  const deleteResult = async (resultId: string) => {
    try {
      const { error } = await supabase
        .from('saved_tool_results')
        .delete()
        .eq('id', resultId);

      if (error) throw error;

      setSavedResults(prev => prev.filter(result => result.id !== resultId));
      toast({
        title: "Success",
        description: "Result deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting result:', error);
      toast({
        title: "Error",
        description: "Failed to delete result.",
        variant: "destructive",
      });
    }
  };

  const exportResult = (result: SavedResult, format: 'json' | 'pdf') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(result, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `${result.tool_name}_${result.title}_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const getToolDisplayName = (toolName: string) => {
    const nameMap: { [key: string]: string } = {
      'resume-check': 'Resume Checker',
      'cover-letter': 'Cover Letter Generator',
      'salary-analyzer': 'Salary Analyzer',
      'interview-prep': 'Interview Prep',
      'ai-assistant': 'AI Career Assistant',
      'profile-score': 'Profile Score',
      'market-insights': 'Market Insights'
    };
    return nameMap[toolName] || toolName;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your saved results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedTool}
          onChange={(e) => setSelectedTool(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tools</option>
          {toolNames.map(tool => (
            <option key={tool} value={tool}>{getToolDisplayName(tool)}</option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredResults.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved results</h3>
                <p className="text-gray-600">Use the tools to generate and save results.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">{getToolDisplayName(result.tool_name)}</Badge>
                        {result.is_favorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(result.id, result.is_favorite)}
                        >
                          {result.is_favorite ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportResult(result, 'json')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteResult(result.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(result.created_at).toLocaleDateString()}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {JSON.stringify(result.content, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {filteredResults.filter(r => r.is_favorite).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-600">Star your favorite results to see them here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredResults.filter(r => r.is_favorite).map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  {/* Same card structure as above */}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {filteredResults.slice(0, 10).map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                {/* Same card structure as above */}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ToolResultsHistory;
