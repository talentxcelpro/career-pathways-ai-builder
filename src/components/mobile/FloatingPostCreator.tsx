import React, { useState } from 'react';
import { Plus, Edit3 } from 'lucide-react';
import { MobilePostCreation } from './MobilePostCreation';
import { cn } from '@/lib/utils';

interface FloatingPostCreatorProps {
  className?: string;
}

export const FloatingPostCreator: React.FC<FloatingPostCreatorProps> = ({ className }) => {
  const [showCreator, setShowCreator] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreator(true)}
        className={cn(
          "fixed bottom-20 right-4 z-40 w-14 h-14 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-full shadow-2xl shadow-primary/40",
          "flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300",
          "border-2 border-white/20 backdrop-blur-sm",
          "animate-bounce-in",
          className
        )}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <div className="relative">
          <Plus className="h-6 w-6" />
          <Edit3 className="h-3 w-3 absolute -top-1 -right-1 opacity-80" />
        </div>
      </button>

      {/* Creation Modal */}
      {showCreator && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end animate-fade-in">
          <div className="w-full animate-slide-in-up">
            <MobilePostCreation
              onClose={() => setShowCreator(false)}
              onPostCreated={() => setShowCreator(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};