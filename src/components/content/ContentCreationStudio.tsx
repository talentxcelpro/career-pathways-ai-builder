import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Edit, Eye, Share2, Sparkles, TrendingUp } from "lucide-react";

import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';

export const ContentCreationStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [template, setTemplate] = useState("achievement");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic) {
      toast.error("Please enter a topic first");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          prompt: `Generate a professional LinkedIn-style ${template} post about: ${topic}. Include relevant hashtags.`,
          systemPrompt: "You are a professional career content creator. Write engaging, high-performance content."
        }
      });

      if (error) throw error;
      setContent(data.response);
      toast.success("Content generated!");
    } catch (error) {
      toast.error("Failed to generate content.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <Edit className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">12,840</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">1,680</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Rate</p>
                <p className="text-2xl font-bold">13.1%</p>
              </div>
              <Share2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Content</TabsTrigger>
          <TabsTrigger value="schedule">Scheduled Posts</TabsTrigger>
          <TabsTrigger value="CareerAnalytics">CareerAnalytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Content Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="achievement">Achievement Post</SelectItem>
                  <SelectItem value="learning">Learning Share</SelectItem>
                  <SelectItem value="insight">Industry Insight</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input 
                  placeholder="Topic/Keywords (e.g., Finished a React project)" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate
                </Button>
              </div>
              <Textarea 
                placeholder="Write or edit your content..." 
                className="min-h-[200px]" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button className="w-full" onClick={() => toast.success("Content scheduled!")}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Post
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No scheduled posts yet.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="CareerAnalytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">CareerAnalytics coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};



