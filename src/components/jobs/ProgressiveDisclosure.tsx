import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ProgressiveDisclosureProps {
  children: React.ReactNode;
  isNewUser?: boolean;
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  children,
  isNewUser = false
}) => {
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(!isNewUser);
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);

  const toggleWidget = (widgetId: string) => {
    setHiddenWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Feature Toggle Bar */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">
                  {isNewUser ? 'Welcome to TalentXcel!' : 'Advanced Features'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isNewUser 
                    ? 'Start with basic job search or unlock advanced features'
                    : 'Manage your job search experience'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                className="gap-2"
              >
                {showAdvancedFeatures ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Simplify
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show All Features
                  </>
                )}
              </Button>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute right-0 top-full mt-2 z-10">
                  <Card className="w-64 p-4 shadow-lg">
                    <h4 className="font-semibold mb-3">Customize Your View</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'personal-dashboard', label: 'Personal Dashboard' },
                        { id: 'ai-matching', label: 'AI Job Matching' },
                        { id: 'salary-widget', label: 'Salary Transparency' },
                        { id: 'quick-apply', label: 'Quick Apply Widget' },
                        { id: 'top-companies', label: 'Top Companies' },
                        { id: 'industries', label: 'Industry Explorer' }
                      ].map((widget) => (
                        <div key={widget.id} className="flex items-center justify-between">
                          <span className="text-sm">{widget.label}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleWidget(widget.id)}
                            className="h-6 w-6 p-0"
                          >
                            {hiddenWidgets.includes(widget.id) ? 
                              <EyeOff className="h-3 w-3" /> : 
                              <Eye className="h-3 w-3" />
                            }
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {isNewUser && !showAdvancedFeatures && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                💡 Tip: Use filters to narrow down jobs
              </Badge>
              <Badge variant="outline" className="text-xs">
                🎯 Tip: Save jobs you're interested in
              </Badge>
              <Badge variant="outline" className="text-xs">
                ⚡ Tip: Enable quick apply for faster applications
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progressive Content */}
      <div className="space-y-6">
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child;

          const widgetId = child.props?.['data-widget-id'];
          
          // Hide widget if it's in hidden list
          if (widgetId && hiddenWidgets.includes(widgetId)) {
            return null;
          }

          // Show only basic features for new users
          if (isNewUser && !showAdvancedFeatures) {
            const basicWidgets = ['job-search', 'featured-jobs', 'main-jobs', 'job-categories'];
            if (widgetId && !basicWidgets.includes(widgetId)) {
              return null;
            }
          }

          return (
            <Collapsible defaultOpen={true}>
              <div className="space-y-2">
                {/* Widget Header for Advanced Features */}
                {showAdvancedFeatures && widgetId && index > 0 && (
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {widgetId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Optional
                        </Badge>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                )}
                
                <CollapsibleContent>
                  {child}
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      {/* New User Onboarding */}
      {isNewUser && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-blue-900">Getting Started</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Browse jobs above or use the search bar to find opportunities. 
                  Click "Show All Features" to access AI matching, salary insights, and more advanced tools.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 text-blue-700 border-blue-300"
                  onClick={() => setShowAdvancedFeatures(true)}
                >
                  Unlock Advanced Features
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};