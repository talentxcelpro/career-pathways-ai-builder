
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import ComprehensiveJobApplicationForm from './ComprehensiveJobApplicationForm';

interface ApplyButtonProps {
  job: {
    id: string;
    title: string;
    companies?: {
      name: string;
      logo_url?: string;
    } | null;
    skills_required?: string[];
  };
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export default function ApplyButton({ job, variant = "default", size = "default", className }: ApplyButtonProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowForm(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Send className="h-4 w-4 mr-2" />
        Apply Now
      </Button>

      <ComprehensiveJobApplicationForm
        open={showForm}
        onOpenChange={setShowForm}
        job={job}
      />
    </>
  );
}
