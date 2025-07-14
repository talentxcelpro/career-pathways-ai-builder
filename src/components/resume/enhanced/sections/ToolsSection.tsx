import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import { ToolsSection as ToolsSectionType } from "@/types/enhanced-resume";

interface ToolsSectionProps {
  data: ToolsSectionType;
  onChange: (data: ToolsSectionType) => void;
}

export const ToolsSection: React.FC<ToolsSectionProps> = ({
  data,
  onChange
}) => {
  const updateTools = (category: keyof ToolsSectionType, toolsStr: string) => {
    const tools = toolsStr.split(',').map(t => t.trim()).filter(t => t);
    onChange({
      ...data,
      [category]: tools
    });
  };

  const toolCategories = [
    { key: 'development' as const, label: 'Development Tools', placeholder: 'e.g., VS Code, Git, Docker, AWS' },
    { key: 'design' as const, label: 'Design Tools', placeholder: 'e.g., Figma, Adobe Creative Suite, Sketch' },
    { key: 'analytics' as const, label: 'Analytics Tools', placeholder: 'e.g., Google Analytics, Tableau, Power BI' },
    { key: 'productivity' as const, label: 'Productivity Tools', placeholder: 'e.g., Slack, Notion, Trello, Jira' },
    { key: 'other' as const, label: 'Other Tools', placeholder: 'e.g., Salesforce, HubSpot, Zapier' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Tools & Technologies</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Professional Tools</CardTitle>
          <p className="text-sm text-muted-foreground">
            List the tools, software, and platforms you're proficient with
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {toolCategories.map((category) => (
            <div key={category.key}>
              <Label htmlFor={category.key}>{category.label}</Label>
              <Input
                id={category.key}
                value={data[category.key].join(', ')}
                onChange={(e) => updateTools(category.key, e.target.value)}
                placeholder={category.placeholder}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple tools with commas
              </p>
              {data[category.key].length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {data[category.key].map((tool, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">💡 Tips for Tools & Technologies:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Focus on tools relevant to your target role</li>
          <li>• Include proficiency level if significantly different</li>
          <li>• Group similar tools together (e.g., "Adobe Creative Suite" instead of listing each app)</li>
          <li>• Prioritize tools you use frequently or are expert in</li>
        </ul>
      </div>
    </div>
  );
};