import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Download,
  Upload,
  Wand2,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkOperation {
  id: string;
  type: 'meta-description' | 'title-tags' | 'alt-text' | 'schema' | 'internal-links';
  name: string;
  description: string;
  pages: Array<{
    url: string;
    title: string;
    currentValue: string;
    suggestedValue: string;
    selected: boolean;
  }>;
  template?: string;
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'paused' | 'error';
}

export const SEOBulkOperations: React.FC = () => {
  const [operations, setOperations] = useState<BulkOperation[]>([
    {
      id: '1',
      type: 'meta-description',
      name: 'Add Missing Meta Descriptions',
      description: 'Generate and add meta descriptions for pages that are missing them',
      pages: [
        {
          url: '/jobs/software-engineer-bangalore',
          title: 'Software Engineer Jobs in Bangalore',
          currentValue: '',
          suggestedValue: 'Find top software engineer jobs in Bangalore. Browse 500+ opportunities from leading tech companies. Apply now!',
          selected: true
        },
        {
          url: '/jobs/data-scientist-mumbai',
          title: 'Data Scientist Jobs in Mumbai',
          currentValue: '',
          suggestedValue: 'Discover data scientist careers in Mumbai. 200+ openings from top companies. Competitive salaries and benefits.',
          selected: true
        },
        {
          url: '/companies/microsoft',
          title: 'Microsoft Careers - Job Openings',
          currentValue: '',
          suggestedValue: 'Explore Microsoft career opportunities. Join a global tech leader. View current job openings and apply today.',
          selected: false
        }
      ],
      progress: 0,
      status: 'pending'
    },
    {
      id: '2', 
      type: 'title-tags',
      name: 'Optimize Title Tags',
      description: 'Improve title tags to include target keywords and location',
      pages: [
        {
          url: '/jobs/frontend-developer',
          title: 'Frontend Developer',
          currentValue: 'Frontend Developer',
          suggestedValue: 'Frontend Developer Jobs - React, Angular, Vue | TalentXcel',
          selected: true
        },
        {
          url: '/jobs/backend-developer',
          title: 'Backend Developer',
          currentValue: 'Backend Developer',
          suggestedValue: 'Backend Developer Jobs - Node.js, Python, Java | TalentXcel',
          selected: true
        }
      ],
      progress: 0,
      status: 'pending'
    }
  ]);

  const [selectedOperation, setSelectedOperation] = useState<string>('1');
  const [bulkTemplate, setBulkTemplate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStartOperation = async (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    setOperations(prev => 
      prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'running', progress: 0 }
          : op
      )
    );

    const selectedPages = operation.pages.filter(page => page.selected);
    const totalPages = selectedPages.length;

    for (let i = 0; i < totalPages; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const progress = ((i + 1) / totalPages) * 100;
      setOperations(prev => 
        prev.map(op => 
          op.id === operationId 
            ? { ...op, progress }
            : op
        )
      );
    }

    setOperations(prev => 
      prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'completed', progress: 100 }
          : op
      )
    );

    toast.success(`Bulk operation completed for ${totalPages} pages!`);
  };

  const handlePauseOperation = (operationId: string) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === operationId && op.status === 'running'
          ? { ...op, status: 'paused' }
          : op
      )
    );
    toast.info('Operation paused');
  };

  const handleStopOperation = (operationId: string) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === operationId
          ? { ...op, status: 'pending', progress: 0 }
          : op
      )
    );
    toast.info('Operation stopped');
  };

  const handleGenerateAIContent = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const operation = operations.find(op => op.id === selectedOperation);
      if (!operation) return;

      const updatedPages = operation.pages.map(page => {
        let suggestedValue = '';
        
        if (operation.type === 'meta-description') {
          suggestedValue = `Discover ${page.title.toLowerCase()} opportunities. Join top companies and advance your career with competitive packages and benefits.`;
        } else if (operation.type === 'title-tags') {
          suggestedValue = `${page.title} - Top Opportunities | TalentXcel Jobs`;
        }
        
        return { ...page, suggestedValue };
      });

      setOperations(prev => 
        prev.map(op => 
          op.id === selectedOperation
            ? { ...op, pages: updatedPages }
            : op
        )
      );

      toast.success('AI suggestions generated for all pages!');
    } catch (error) {
      toast.error('Failed to generate AI content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePageSelection = (operationId: string, pageIndex: number) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === operationId
          ? {
              ...op,
              pages: op.pages.map((page, index) => 
                index === pageIndex 
                  ? { ...page, selected: !page.selected }
                  : page
              )
            }
          : op
      )
    );
  };

  const handleSelectAllPages = (operationId: string, selected: boolean) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === operationId
          ? {
              ...op,
              pages: op.pages.map(page => ({ ...page, selected }))
            }
          : op
      )
    );
  };

  const currentOperation = operations.find(op => op.id === selectedOperation);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'meta-description': return FileText;
      case 'title-tags': return Settings;
      case 'alt-text': return FileText;
      case 'schema': return Settings;
      case 'internal-links': return FileText;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Bulk SEO Operations</h2>
          <p className="text-muted-foreground">Efficiently manage SEO changes across multiple pages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import URLs
          </Button>
        </div>
      </div>

      {/* Operations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {operations.map((operation) => {
          const OperationIcon = getOperationIcon(operation.type);
          const selectedCount = operation.pages.filter(p => p.selected).length;
          
          return (
            <Card 
              key={operation.id}
              className={`cursor-pointer transition-all ${
                selectedOperation === operation.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedOperation(operation.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <OperationIcon className="h-5 w-5 text-primary" />
                  <Badge className={getStatusColor(operation.status)}>
                    {operation.status}
                  </Badge>
                </div>
                <CardTitle className="text-sm">{operation.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    {selectedCount} of {operation.pages.length} pages selected
                  </div>
                  {operation.progress > 0 && (
                    <Progress value={operation.progress} className="h-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Operation Details */}
      {currentOperation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{currentOperation.name}</CardTitle>
                <CardDescription>{currentOperation.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {currentOperation.status === 'pending' && (
                  <Button onClick={() => handleStartOperation(currentOperation.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Operation
                  </Button>
                )}
                {currentOperation.status === 'running' && (
                  <>
                    <Button variant="outline" onClick={() => handlePauseOperation(currentOperation.id)}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                    <Button variant="destructive" onClick={() => handleStopOperation(currentOperation.id)}>
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
                {currentOperation.status === 'paused' && (
                  <Button onClick={() => handleStartOperation(currentOperation.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pages" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pages">Pages ({currentOperation.pages.length})</TabsTrigger>
                <TabsTrigger value="template">Template</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="pages">
                <div className="space-y-4">
                  {/* Bulk Actions */}
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={currentOperation.pages.every(p => p.selected)}
                          onCheckedChange={(checked) => 
                            handleSelectAllPages(currentOperation.id, checked as boolean)
                          }
                        />
                        <span className="text-sm font-medium">Select All</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleGenerateAIContent}
                        disabled={isGenerating}
                      >
                        <Wand2 className="h-3 w-3 mr-1" />
                        {isGenerating ? 'Generating...' : 'AI Generate All'}
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {currentOperation.pages.filter(p => p.selected).length} pages selected
                    </div>
                  </div>

                  {/* Pages List */}
                  <div className="space-y-3">
                    {currentOperation.pages.map((page, index) => (
                      <Card key={index} className={page.selected ? 'ring-1 ring-primary/20' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={page.selected}
                              onCheckedChange={() => handleTogglePageSelection(currentOperation.id, index)}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <div>
                                <div className="font-medium">{page.title}</div>
                                <div className="text-sm text-muted-foreground">{page.url}</div>
                              </div>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs font-medium text-muted-foreground mb-1">Current</div>
                                  <div className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                                    {page.currentValue || <em className="text-muted-foreground">Missing</em>}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-muted-foreground mb-1">Suggested</div>
                                  <div className="text-sm p-2 bg-green-50 border border-green-200 rounded">
                                    {page.suggestedValue}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="template">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Template</CardTitle>
                    <CardDescription>
                      Create a template for generating consistent content across pages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        value={bulkTemplate}
                        onChange={(e) => setBulkTemplate(e.target.value)}
                        placeholder="Enter template with variables like {title}, {location}, {company}..."
                        rows={4}
                      />
                      <div className="text-sm text-muted-foreground">
                        Available variables: {'{title}'}, {'{location}'}, {'{company}'}, {'{job_type}'}
                      </div>
                      <Button>Apply Template to Selected Pages</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Operation Settings</CardTitle>
                    <CardDescription>
                      Configure how the bulk operation should run
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Processing Speed</label>
                        <select className="w-full p-2 border rounded">
                          <option>Slow (1 page/second) - Safe</option>
                          <option>Medium (2 pages/second) - Balanced</option>
                          <option>Fast (5 pages/second) - Quick</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Error Handling</label>
                        <select className="w-full p-2 border rounded">
                          <option>Stop on first error</option>
                          <option>Skip errors and continue</option>
                          <option>Retry failed pages once</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Checkbox />
                        <span className="text-sm">Create backup before making changes</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Checkbox />
                        <span className="text-sm">Send notification when completed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};