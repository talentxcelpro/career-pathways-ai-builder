import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UnifiedAuthForm } from './UnifiedAuthForm';
import { LogIn } from 'lucide-react';

interface AuthDialogProps {
  children?: React.ReactNode;
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const AuthDialog = ({ 
  children, 
  buttonText = "Sign In", 
  variant = "default" 
}: AuthDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={variant} className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            {buttonText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0 bg-transparent border-0 shadow-none">
        <div className="relative">
          {/* Beautiful background with gradient and blur effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/90 to-purple-50/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"></div>
          
          {/* Floating decorative elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-15 animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 -right-2 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-25 animate-bounce delay-2000"></div>
          
          {/* Content with relative positioning */}
          <div className="relative z-10 p-8">
            <UnifiedAuthForm onSuccess={handleSuccess} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};