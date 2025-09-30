import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { EMAIL_VARIABLES } from '@/utils/emailTemplates';

interface VariableInsertHelperProps {
  onInsert: (variable: string) => void;
}

export const VariableInsertHelper = ({ onInsert }: VariableInsertHelperProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <Plus className="h-4 w-4 mr-2" />
          Insert Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Available Variables</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Click to insert variables into your template
              </p>
            </div>

            {Object.entries(EMAIL_VARIABLES).map(([category, variables]) => (
              <div key={category} className="space-y-2">
                <h5 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                  {category}
                </h5>
                <div className="space-y-1">
                  {variables.map((variable) => (
                    <button
                      key={variable.key}
                      type="button"
                      onClick={() => onInsert(`{{${variable.key}}}`)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className="font-mono text-sm text-primary">
                        {`{{${variable.key}}}`}
                      </div>
                      <div className="text-xs text-muted-foreground">{variable.label}</div>
                      <div className="text-xs text-muted-foreground italic mt-1">
                        e.g., {variable.example}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
