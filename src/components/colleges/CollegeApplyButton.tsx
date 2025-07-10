import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface CollegeApplyButtonProps {
  college: {
    id: string;
    name: string;
    logo_url?: string;
  };
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export default function CollegeApplyButton({ 
  college, 
  variant = "default", 
  size = "default", 
  className 
}: CollegeApplyButtonProps) {
  const navigate = useNavigate();

  const handleApply = () => {
    navigate(`/colleges/${college.id}/apply`);
  };

  return (
    <Button
      onClick={handleApply}
      variant={variant}
      size={size}
      className={className}
    >
      <GraduationCap className="h-4 w-4 mr-2" />
      Apply Now
    </Button>
  );
}