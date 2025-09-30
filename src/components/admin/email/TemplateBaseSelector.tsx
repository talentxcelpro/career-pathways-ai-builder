import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BASE_EMAIL_TEMPLATE, WELCOME_TEMPLATE, JOB_NOTIFICATION_TEMPLATE, SECURITY_ALERT_TEMPLATE } from '@/utils/emailTemplates';
import { Check } from 'lucide-react';

interface TemplateBaseSelectorProps {
  onSelect: (template: string, name: string) => void;
  selectedTemplate?: string;
}

const BASE_TEMPLATES = [
  {
    id: 'base',
    name: 'Base Template',
    icon: '📧',
    description: 'Clean, customizable base template',
    template: BASE_EMAIL_TEMPLATE,
  },
  {
    id: 'welcome',
    name: 'Welcome Email',
    icon: '👋',
    description: 'Onboarding and welcome messages',
    template: WELCOME_TEMPLATE,
  },
  {
    id: 'job',
    name: 'Job Notification',
    icon: '💼',
    description: 'Job alerts and recommendations',
    template: JOB_NOTIFICATION_TEMPLATE,
  },
  {
    id: 'security',
    name: 'Security Alert',
    icon: '🔒',
    description: 'Security notifications and alerts',
    template: SECURITY_ALERT_TEMPLATE,
  },
];

export const TemplateBaseSelector = ({ onSelect, selectedTemplate }: TemplateBaseSelectorProps) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Start with a Base Template</h4>
      <div className="grid grid-cols-2 gap-3">
        {BASE_TEMPLATES.map((template) => {
          const isSelected = selectedTemplate === template.template;
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelect(template.template, template.name)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{template.icon}</span>
                  {isSelected && <Check className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <h5 className="font-semibold text-sm">{template.name}</h5>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
