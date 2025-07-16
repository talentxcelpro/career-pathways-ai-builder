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
      <DialogContent className="max-w-md p-0 bg-transparent border-0">
        <UnifiedAuthForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};