
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import JobApplicationModal from './JobApplicationModal';

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
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Send className="h-4 w-4 mr-2" />
        Apply Now
      </Button>

      <JobApplicationModal
        open={showModal}
        onOpenChange={setShowModal}
        job={job}
      />
    </>
  );
}
