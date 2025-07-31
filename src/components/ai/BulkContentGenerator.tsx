import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAIContentGenerator } from '@/hooks/useAIContentGenerator';
import { Upload, Download, Trash2, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface BulkContentItem {
  id: string;
  topic: string;
  contentType: string;
  industry?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  result?: string;
}

export const BulkContentGenerator = () => {
  const { generateBulkContent, isGenerating, generationProgress } = useAIContentGenerator();
  
  const [contentItems, setContentItems] = useState<BulkContentItem[]>([
    { id: '1', topic: '', contentType: 'job_description', status: 'pending' }
  ]);
  
  const [globalSettings, setGlobalSettings] = useState({
    targetAudience: 'Job seekers and professionals',
    tone: 'professional',
    wordCount: 500,
    keywords: ''
  });

  const addContentItem = () => {
    const newItem: BulkContentItem = {
      id: Date.now().toString(),
      topic: '',
      contentType: 'job_description',
      status: 'pending'
    };
    setContentItems([...contentItems, newItem]);
  };

  const removeContentItem = (id: string) => {
    setContentItems(contentItems.filter(item => item.id !== id));
  };

  const updateContentItem = (id: string, field: keyof BulkContentItem, value: string) => {
    setContentItems(contentItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleBulkGenerate = async () => {
    const validItems = contentItems.filter(item => item.topic.trim());
    
    if (validItems.length === 0) {
      toast.error('Please add at least one topic');
      return;
    }

    const keywords = globalSettings.keywords.split(',').map(k => k.trim()).filter(k => k);
    
    const requests = validItems.map(item => ({
      contentType: item.contentType as any,
      topic: item.topic,
      targetAudience: globalSettings.targetAudience,
      tone: globalSettings.tone as any,
      keywords,
      industry: item.industry,
      wordCount: globalSettings.wordCount
    }));

    // Update status to generating
    setContentItems(prev => 
      prev.map(item => 
        validItems.find(v => v.id === item.id) 
          ? { ...item, status: 'generating' as const }
          : item
      )
    );

    const results = await generateBulkContent(requests);
    
    // Update with results
    setContentItems(prev => 
      prev.map(item => {
        const index = validItems.findIndex(v => v.id === item.id);
        if (index !== -1 && results[index]) {
          return {
            ...item,
            status: results[index].success ? 'completed' : 'failed',
            result: results[index].content
          };
        }
        return item;
      })
    );
  };

  const exportResults = () => {
    const completedItems = contentItems.filter(item => item.status === 'completed' && item.result);
    
    if (completedItems.length === 0) {
      toast.error('No completed content to export');
      return;
    }

    const exportData = completedItems.map(item => ({
      topic: item.topic,
      contentType: item.contentType,
      industry: item.industry || 'N/A',
      content: item.result
    }));

    const csvContent = [
      ['Topic', 'Content Type', 'Industry', 'Generated Content'],
      ...exportData.map(item => [
        item.topic,
        item.contentType,
        item.industry,
        `"${item.content?.replace(/"/g, '""')}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_content_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Content exported successfully!');
  };

  const loadFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        const newItems: BulkContentItem[] = lines.slice(1).map((line, index) => {
          const values = line.split(',');
          return {
            id: `imported_${index}`,
            topic: values[0] || '',
            contentType: values[1] || 'job_description',
            industry: values[2] || '',
            status: 'pending' as const
          };
        });

        setContentItems(newItems);
        toast.success(`Imported ${newItems.length} items from CSV`);
      } catch (error) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Bulk Content Generator
          </CardTitle>
          <CardDescription>
            Generate multiple pieces of content at once with consistent settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={globalSettings.targetAudience}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select 
                value={globalSettings.tone} 
                onValueChange={(value) => setGlobalSettings(prev => ({ ...prev, tone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="informative">Informative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="wordCount">Word Count</Label>
              <Select 
                value={globalSettings.wordCount.toString()} 
                onValueChange={(value) => setGlobalSettings(prev => ({ ...prev, wordCount: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">300 words</SelectItem>
                  <SelectItem value="500">500 words</SelectItem>
                  <SelectItem value="750">750 words</SelectItem>
                  <SelectItem value="1000">1000 words</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="keywords">Global Keywords</Label>
              <Input
                id="keywords"
                placeholder="comma-separated"
                value={globalSettings.keywords}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, keywords: e.target.value }))}
              />
            </div>
          </div>

          {/* Import/Export Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={addContentItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            
            <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={loadFromCSV}
            />
            
            <Button variant="outline" onClick={exportResults}>
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>

          {/* Content Items */}
          <div className="space-y-4">
            {contentItems.map((item, index) => (
              <Card key={item.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <Label>Topic</Label>
                      <Input
                        placeholder="e.g., Senior React Developer"
                        value={item.topic}
                        onChange={(e) => updateContentItem(item.id, 'topic', e.target.value)}
                        disabled={item.status === 'generating'}
                      />
                    </div>
                    
                    <div>
                      <Label>Content Type</Label>
                      <Select 
                        value={item.contentType} 
                        onValueChange={(value) => updateContentItem(item.id, 'contentType', value)}
                        disabled={item.status === 'generating'}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="job_description">Job Description</SelectItem>
                          <SelectItem value="company_page">Company Page</SelectItem>
                          <SelectItem value="blog_post">Blog Post</SelectItem>
                          <SelectItem value="landing_page">Landing Page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Industry (Optional)</Label>
                      <Input
                        placeholder="e.g., Technology"
                        value={item.industry || ''}
                        onChange={(e) => updateContentItem(item.id, 'industry', e.target.value)}
                        disabled={item.status === 'generating'}
                      />
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeContentItem(item.id)}
                        disabled={item.status === 'generating'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {item.result && (
                    <div className="mt-4">
                      <Label>Generated Content</Label>
                      <Textarea
                        value={item.result}
                        readOnly
                        className="mt-1 min-h-[100px] text-sm"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleBulkGenerate}
              disabled={isGenerating}
              size="lg"
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate All Content
                </>
              )}
            </Button>
          </div>

          {/* Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={generationProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Processing bulk content generation...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};