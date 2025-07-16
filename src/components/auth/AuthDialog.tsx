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
      <DialogContent className="max-w-sm p-0 bg-transparent border-0 shadow-none">
        <div className="relative">
          {/* Simplified background */}
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20"></div>
          
          {/* Minimal decorative elements */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-30"></div>
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20"></div>
          
          {/* Content */}
          <div className="relative z-10 p-6">
            <UnifiedAuthForm onSuccess={handleSuccess} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};