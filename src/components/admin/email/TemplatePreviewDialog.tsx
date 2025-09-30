import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
}

export const TemplatePreviewDialog = ({ open, onOpenChange, template }: TemplatePreviewDialogProps) => {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle>{template.template_name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={template.is_active ? 'default' : 'secondary'}>
                {template.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm text-muted-foreground">Version {template.current_version}</span>
            </div>
            <p className="text-sm font-semibold">Subject: {template.subject}</p>
          </div>
        </DialogHeader>

        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="html">HTML Preview</TabsTrigger>
            <TabsTrigger value="text">Text Version</TabsTrigger>
          </TabsList>
          <TabsContent value="html" className="space-y-4">
            <div className="border rounded-lg p-4 bg-white">
              <iframe
                srcDoc={template.html_content}
                className="w-full min-h-[500px] border-0"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
            <details className="space-y-2">
              <summary className="cursor-pointer text-sm font-medium">View HTML Source</summary>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                <code>{template.html_content}</code>
              </pre>
            </details>
          </TabsContent>
          <TabsContent value="text">
            <div className="border rounded-lg p-4 bg-muted">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {template.text_content || 'No plain text version available'}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
