import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Download, 
  Save, 
  Check, 
  ChevronDown,
  Sparkles,
  FileCheck,
  Upload,
  Mic,
  BarChart3,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { resumeTemplates } from '@/data/resumeTemplates';

interface TopToolbarProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
  onATSCheck: () => void;
  onImproveSection: () => void;
  onExport: (format: 'pdf' | 'docx') => void;
  onUploadResume: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date;
  onToggleVoice?: () => void;
  onToggleAnalytics?: () => void;
  onToggleCollaboration?: () => void;
  showVoice?: boolean;
  showAnalytics?: boolean;
  showCollaboration?: boolean;
}

const templates = resumeTemplates.slice(0, 8).map(t => ({
  id: t.id,
  name: t.name
}));

export const TopToolbar: React.FC<TopToolbarProps> = ({
  selectedTemplate,
  onTemplateChange,
  onATSCheck,
  onImproveSection,
  onExport,
  onUploadResume,
  saveStatus,
  lastSaved,
  onToggleVoice,
  onToggleAnalytics,
  onToggleCollaboration,
  showVoice = false,
  showAnalytics = false,
  showCollaboration = false
}) => {
  const getSaveStatusInfo = () => {
    switch (saveStatus) {
      case 'saving':
        return { text: 'Saving...', variant: 'secondary' as const, icon: <Save className="h-3 w-3 animate-spin" /> };
      case 'saved':
        return { text: 'Saved', variant: 'default' as const, icon: <Check className="h-3 w-3" /> };
      case 'error':
        return { text: 'Error', variant: 'destructive' as const, icon: <Save className="h-3 w-3" /> };
      default:
        return { text: 'Idle', variant: 'outline' as const, icon: <Save className="h-3 w-3" /> };
    }
  };

  const saveInfo = getSaveStatusInfo();

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Template Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Template:</span>
            <Select value={selectedTemplate} onValueChange={onTemplateChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* AI Tools */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadResume}
              className="gap-2"
              disabled
              title="Coming soon"
              aria-disabled="true"
            >
              <Upload className="h-4 w-4" />
              Upload Resume (Coming Soon)
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onATSCheck}
              className="gap-2"
            >
              <FileCheck className="h-4 w-4" />
              Run ATS Check
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onImproveSection}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Improve Section
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Game-Changing Features */}
          <div className="flex items-center gap-2">
            <Button
              variant={showVoice ? "default" : "outline"}
              size="sm"
              onClick={onToggleVoice}
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              Voice Commands
            </Button>
            
            <Button
              variant={showAnalytics ? "default" : "outline"}
              size="sm"
              onClick={onToggleAnalytics}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              AI Analytics
            </Button>
            
            <Button
              variant={showCollaboration ? "default" : "outline"}
              size="sm"
              onClick={onToggleCollaboration}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Collaborate
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Export Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('docx')}>
                Export as DOCX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* Save Status */}
          <div className="flex items-center gap-2">
            <Badge variant={saveInfo.variant} className="gap-1">
              {saveInfo.icon}
              {saveInfo.text}
            </Badge>
            {saveStatus === 'saved' && (
              <span className="text-xs text-muted-foreground">
                {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};