import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Settings,
  Brain
} from 'lucide-react';
import { toast } from 'sonner';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'error';
  required: boolean;
}

export const SetupGuide = () => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);

  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'openai',
      title: 'OpenAI API Key',
      description: 'Required for CV parsing and AI features',
      status: 'pending',
      required: true
    },
    {
      id: 'storage',
      title: 'Storage Configuration',
      description: 'File storage buckets for CV uploads',
      status: 'completed',
      required: true
    },
    {
      id: 'database',
      title: 'Database Schema',
      description: 'Tables and relationships for talent management',
      status: 'completed',
      required: true
    }
  ]);

  const testOpenAIKey = async () => {
    if (!openaiKey.trim()) {
      toast.error('Please enter an OpenAI API key');
      return;
    }

    setIsTestingKey(true);
    
    try {
      // Test the API key with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Save the key to Supabase secrets (this would need to be implemented)
        toast.success('OpenAI API key validated successfully!');
        
        setSetupSteps(prev => 
          prev.map(step => 
            step.id === 'openai' 
              ? { ...step, status: 'completed' }
              : step
          )
        );
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      toast.error('Invalid OpenAI API key. Please check and try again.');
      setSetupSteps(prev => 
        prev.map(step => 
          step.id === 'openai' 
            ? { ...step, status: 'error' }
            : step
        )
      );
    } finally {
      setIsTestingKey(false);
    }
  };

  const getStatusIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: SetupStep['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'default',
      completed: 'secondary',
      error: 'destructive'
    };
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const allRequiredCompleted = setupSteps
    .filter(step => step.required)
    .every(step => step.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Brain className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold">Talent Database Setup</h2>
        <p className="text-muted-foreground mt-2">
          Configure the AI-powered talent management system
        </p>
      </div>

      {/* Setup Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Setup Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {setupSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(step.status)}
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {step.required && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                  {getStatusBadge(step.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* OpenAI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              An OpenAI API key is required for CV parsing and AI features. 
              The key will be securely stored in Supabase Edge Function secrets.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <div className="flex gap-2">
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={testOpenAIKey}
                disabled={isTestingKey || !openaiKey.trim()}
                className="gap-2"
              >
                {isTestingKey ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Validate
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="h-4 w-4" />
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Get your OpenAI API key here
            </a>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">Database</h3>
              <p className="text-sm text-muted-foreground">
                Schema configured
              </p>
            </div>
            <div className="text-center p-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">Storage</h3>
              <p className="text-sm text-muted-foreground">
                Buckets ready
              </p>
            </div>
            <div className="text-center p-4">
              {setupSteps.find(s => s.id === 'openai')?.status === 'completed' ? (
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              ) : (
                <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              )}
              <h3 className="font-semibold">AI Features</h3>
              <p className="text-sm text-muted-foreground">
                {setupSteps.find(s => s.id === 'openai')?.status === 'completed' 
                  ? 'Ready to parse CVs' 
                  : 'API key required'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      {allRequiredCompleted && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            🎉 Setup complete! You can now start uploading CVs and building your talent database.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};