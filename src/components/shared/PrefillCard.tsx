import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PrefillButton } from '@/components/ui/prefill-button';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Sparkles } from 'lucide-react';

interface PrefillCardProps {
  title: string;
  description: string;
  modules: string[];
  onApply: () => void;
  isLoading?: boolean;
  type: 'ai' | 'template' | 'bulk';
  estimatedTime?: string;
  isPremium?: boolean;
}

export function PrefillCard({
  title,
  description,
  modules,
  onApply,
  isLoading = false,
  type,
  estimatedTime = '< 1s',
  isPremium = false,
}: PrefillCardProps) {
  const getTypeIcon = () => {
    switch (type) {
      case 'ai':
        return <Sparkles className="h-5 w-5 text-purple-500" />;
      case 'template':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'bulk':
        return <Zap className="h-5 w-5 text-green-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'ai':
        return 'AI Generated';
      case 'template':
        return 'Template';
      case 'bulk':
        return 'Bulk Setup';
    }
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      {isPremium && (
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            Premium
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          {getTypeIcon()}
          <Badge variant="outline" className="text-xs">
            {getTypeLabel()}
          </Badge>
        </div>
        
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {modules.map((module) => (
            <Badge key={module} variant="secondary" className="text-xs capitalize">
              {module.replace('_', ' ')}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{estimatedTime}</span>
          </div>
          
          <PrefillButton
            onClick={onApply}
            isLoading={isLoading}
            variant={type}
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}