import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Users, Mail, Zap, Brain } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AIBusinessToolkit = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const tools = [
    {
      id: 'service-optimizer',
      title: 'Service Optimizer AI',
      description: 'Enhance your service titles, descriptions, and pricing for better visibility',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      status: 'available'
    },
    {
      id: 'proposal-generator',
      title: 'Smart Proposal Generator',
      description: 'Generate professional proposals and quotes with one click',
      icon: <FileText className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: 'available'
    },
    {
      id: 'lead-matcher',
      title: 'Lead Match AI',
      description: 'Find potential clients from your network using AI matching',
      icon: <Users className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      status: 'coming-soon'
    },
    {
      id: 'auto-reply',
      title: 'Auto-Reply Generator',
      description: 'Generate smart email and message responses automatically',
      icon: <Mail className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      status: 'coming-soon'
    }
  ];

  const [activeToolInputs, setActiveToolInputs] = useState({
    'service-optimizer': {
      title: '',
      description: '',
      category: '',
      currentPrice: ''
    },
    'proposal-generator': {
      clientName: '',
      projectDescription: '',
      timeline: '',
      budget: ''
    }
  });

  const handleToolAction = async (toolId: string) => {
    setLoading(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (toolId) {
        case 'service-optimizer':
          handleServiceOptimization();
          break;
        case 'proposal-generator':
          handleProposalGeneration();
          break;
        default:
          toast({ 
            title: 'Coming Soon', 
            description: 'This AI tool will be available in the next update!' 
          });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleServiceOptimization = () => {
    const inputs = activeToolInputs['service-optimizer'];
    
    // Mock AI optimization results
    const optimizedResults = {
      title: `Professional ${inputs.title} Services - Expert Solutions`,
      description: `${inputs.description} Our comprehensive ${inputs.category.toLowerCase()} services are designed to deliver exceptional results with proven methodologies and industry expertise.`,
      suggestedPrice: Math.round(parseFloat(inputs.currentPrice || '0') * 1.2),
      seoKeywords: ['professional', 'expert', 'certified', 'premium', inputs.category.toLowerCase()]
    };

    toast({
      title: 'Service Optimized!',
      description: 'AI has enhanced your service details for better visibility and conversion.'
    });

    // Here you would typically update the actual service data
    console.log('Optimized Results:', optimizedResults);
  };

  const handleProposalGeneration = () => {
    const inputs = activeToolInputs['proposal-generator'];
    
    // Mock AI proposal generation
    const proposal = `
Dear ${inputs.clientName},

Thank you for considering our services for your project. Based on your requirements for "${inputs.projectDescription}", I'm excited to present this comprehensive proposal.

**Project Overview:**
${inputs.projectDescription}

**Proposed Timeline:**
${inputs.timeline}

**Investment:**
₹${inputs.budget}

**What's Included:**
- Comprehensive project planning and strategy
- Regular progress updates and communication
- Quality assurance and testing
- Post-delivery support

I look forward to working with you on this exciting project.

Best regards,
[Your Name]
    `;

    toast({
      title: 'Proposal Generated!',
      description: 'Your professional proposal is ready to send.'
    });

    // Here you would typically save or display the proposal
    console.log('Generated Proposal:', proposal);
  };

  const updateToolInput = (toolId: string, field: string, value: string) => {
    setActiveToolInputs(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Business Toolkit</h1>
        <Badge variant="secondary">Pro Feature</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Card key={tool.id} className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${tool.bgColor}`}>
                  <div className={tool.color}>{tool.icon}</div>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                </div>
                {tool.status === 'coming-soon' && (
                  <Badge variant="outline">Coming Soon</Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {tool.status === 'available' && (
                <div className="space-y-4">
                  {tool.id === 'service-optimizer' && (
                    <>
                      <Input
                        placeholder="Service title"
                        value={activeToolInputs['service-optimizer'].title}
                        onChange={(e) => updateToolInput('service-optimizer', 'title', e.target.value)}
                      />
                      <Textarea
                        placeholder="Service description"
                        value={activeToolInputs['service-optimizer'].description}
                        onChange={(e) => updateToolInput('service-optimizer', 'description', e.target.value)}
                        rows={3}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Category"
                          value={activeToolInputs['service-optimizer'].category}
                          onChange={(e) => updateToolInput('service-optimizer', 'category', e.target.value)}
                        />
                        <Input
                          placeholder="Current price (₹)"
                          type="number"
                          value={activeToolInputs['service-optimizer'].currentPrice}
                          onChange={(e) => updateToolInput('service-optimizer', 'currentPrice', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {tool.id === 'proposal-generator' && (
                    <>
                      <Input
                        placeholder="Client name"
                        value={activeToolInputs['proposal-generator'].clientName}
                        onChange={(e) => updateToolInput('proposal-generator', 'clientName', e.target.value)}
                      />
                      <Textarea
                        placeholder="Project description"
                        value={activeToolInputs['proposal-generator'].projectDescription}
                        onChange={(e) => updateToolInput('proposal-generator', 'projectDescription', e.target.value)}
                        rows={2}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Timeline (e.g., 2 weeks)"
                          value={activeToolInputs['proposal-generator'].timeline}
                          onChange={(e) => updateToolInput('proposal-generator', 'timeline', e.target.value)}
                        />
                        <Input
                          placeholder="Budget (₹)"
                          type="number"
                          value={activeToolInputs['proposal-generator'].budget}
                          onChange={(e) => updateToolInput('proposal-generator', 'budget', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <Button 
                    onClick={() => handleToolAction(tool.id)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              )}

              {tool.status === 'coming-soon' && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">This powerful AI tool is coming soon!</p>
                  <Button variant="outline" disabled>
                    Notify When Ready
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>AI Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-muted-foreground">Services Optimized</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-sm text-muted-foreground">Proposals Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">24</div>
              <div className="text-sm text-muted-foreground">Leads Matched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-muted-foreground">Auto Replies</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIBusinessToolkit;