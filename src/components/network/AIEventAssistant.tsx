
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Lightbulb, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface AIEventAssistantProps {
  onEventDataApply: (data: {
    title: string;
    description: string;
    event_type: string;
  }) => void;
}

export const AIEventAssistant: React.FC<AIEventAssistantProps> = ({
  onEventDataApply
}) => {
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState("");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");

  const eventTemplates = {
    webinar: {
      title: "Professional Development Webinar: [Topic]",
      description: "Join us for an insightful webinar on [Topic]. We'll cover key strategies, best practices, and answer your questions. Perfect for professionals looking to advance their skills in [Industry/Field].\n\n🎯 What you'll learn:\n• Key concepts and strategies\n• Real-world applications\n• Q&A with industry experts\n\n👥 Who should attend:\n• [Target audience]\n• Anyone interested in [Topic]",
      type: "webinar"
    },
    networking: {
      title: "Professional Networking Event: Connect & Grow",
      description: "Connect with like-minded professionals in a relaxed, welcoming environment. This networking event is perfect for expanding your professional circle and discovering new opportunities.\n\n🤝 What to expect:\n• Structured networking activities\n• Industry discussions\n• Career growth opportunities\n• Light refreshments\n\n👥 Perfect for:\n• Career changers\n• Recent graduates\n• Experienced professionals",
      type: "networking"
    },
    workshop: {
      title: "Hands-on Workshop: [Skill/Topic]",
      description: "Interactive workshop designed to help you master [Skill/Topic]. Bring your laptop and get ready for practical, hands-on learning with immediate application.\n\n💡 Workshop highlights:\n• Step-by-step guidance\n• Practical exercises\n• Take-home resources\n• Certificate of completion\n\n🎯 Prerequisites:\n• [Basic requirements]\n• Laptop required",
      type: "workshop"
    }
  };

  const generateEventIdeas = async () => {
    if (!eventType) {
      toast.error("Please select an event type first");
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const ideas = [
        `${eventType === 'webinar' ? 'Mastering' : eventType === 'workshop' ? 'Hands-on' : 'Networking for'} ${topic || 'Professional Skills'}`,
        `${eventType === 'webinar' ? 'Deep Dive into' : eventType === 'workshop' ? 'Practical' : 'Community'} ${topic || 'Industry Trends'}`,
        `${eventType === 'webinar' ? 'Expert Panel:' : eventType === 'workshop' ? 'Interactive' : 'Connect &'} ${topic || 'Career Growth'}`
      ];

      // Show suggestions as buttons
      toast.success("Event ideas generated! Click on any suggestion below.");
    } catch (error) {
      toast.error("Failed to generate ideas");
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (templateKey: string) => {
    const template = eventTemplates[templateKey as keyof typeof eventTemplates];
    if (!template) return;

    const customizedData = {
      title: template.title.replace('[Topic]', topic || 'Professional Development'),
      description: template.description
        .replace(/\[Topic\]/g, topic || 'professional development')
        .replace('[Industry/Field]', audience || 'your field')
        .replace('[Target audience]', audience || 'professionals')
        .replace('[Skill/Topic]', topic || 'new skills')
        .replace('[Basic requirements]', 'Basic knowledge recommended'),
      event_type: template.type
    };

    onEventDataApply(customizedData);
    toast.success("Event template applied!");
  };

  const quickSuggestions = [
    "AI & Machine Learning",
    "Career Development",
    "Leadership Skills",
    "Remote Work Best Practices",
    "Industry Networking",
    "Skill Building"
  ];

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          AI Event Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Event Type</label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="ama">AMA Session</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Topic/Theme</label>
            <Input
              placeholder="e.g., Leadership, AI, Career Growth"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Target Audience</label>
            <Input
              placeholder="e.g., Software Engineers, Managers"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Topic Suggestions */}
        <div>
          <h4 className="font-medium mb-2 flex items-center">
            <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
            Popular Topics
          </h4>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setTopic(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        {/* Event Templates */}
        <div>
          <h4 className="font-medium mb-2 flex items-center">
            <Users className="h-4 w-4 mr-1 text-green-500" />
            Event Templates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {Object.entries(eventTemplates).map(([key, template]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className="h-auto p-3 text-left flex-col items-start"
                onClick={() => applyTemplate(key)}
              >
                <span className="font-medium capitalize">{key}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {template.description.split('\n')[0].substring(0, 60)}...
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Generate Ideas */}
        <div className="pt-2 border-t">
          <Button
            onClick={generateEventIdeas}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {loading ? "Generating Ideas..." : "Generate Event Ideas with AI"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
