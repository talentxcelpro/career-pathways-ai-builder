
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, X, Minimize2, Maximize2 } from 'lucide-react';
import { TalentXcelAIAgent } from './TalentXcelAIAgent';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

export const FloatingAIWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const location = useLocation();

  // Auto-minimize after 30 seconds of inactivity
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
        setHasNewNotification(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  // Get module context from current route
  const getModuleFromRoute = (pathname: string): string | undefined => {
    if (pathname.startsWith('/network')) return 'network';
    if (pathname.startsWith('/jobs')) return 'jobs';
    if (pathname.startsWith('/employer')) return 'employer';
    if (pathname.startsWith('/companies')) return 'companies';
    if (pathname.startsWith('/resume')) return 'resume';
    if (pathname.startsWith('/tools')) return 'tools';
    if (pathname.startsWith('/services')) return 'services';
    if (pathname.startsWith('/learning')) return 'learning';
    if (pathname.startsWith('/colleges')) return 'colleges';
    if (pathname.startsWith('/career-map')) return 'career_map';
    return undefined;
  };

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setHasNewNotification(false);
    } else {
      if (isMinimized) {
        setIsMinimized(false);
        setHasNewNotification(false);
      } else {
        setIsOpen(false);
        setIsMinimized(false);
      }
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleToggle}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
            "bg-primary hover:bg-primary/90 text-white",
            hasNewNotification && "animate-pulse"
          )}
        >
          <Bot className="h-6 w-6" />
          {hasNewNotification && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping" />
          )}
        </Button>
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-6 z-40 transition-all duration-300",
            isMinimized 
              ? "w-80 h-16" 
              : "w-96 h-[600px] max-h-[calc(100vh-8rem)]"
          )}
        >
          {isMinimized ? (
            <div className="bg-white border rounded-lg shadow-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">TalentXcel AI</span>
                {hasNewNotification && (
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(false);
                    setHasNewNotification(false);
                  }}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg shadow-xl h-full">
              <TalentXcelAIAgent
                className="h-full border-0 shadow-none"
                onClose={handleClose}
                defaultModule={getModuleFromRoute(location.pathname)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-12 h-8 w-8 p-0"
                onClick={handleMinimize}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingAIWidget;
