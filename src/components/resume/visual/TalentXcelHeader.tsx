
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Settings } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const TalentXcelHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="h-20 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Left - Logo & Back */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TX</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">TalentXcel</h1>
              <p className="text-xs text-muted-foreground">Resume Builder</p>
            </div>
          </div>
        </div>

        {/* Center - Title */}
        <div className="text-center">
          <h2 className="text-lg font-semibold">Visual Resume Builder</h2>
          <p className="text-sm text-muted-foreground">Create stunning resumes in minutes</p>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-medium text-sm">U</span>
          </div>
        </div>
      </div>
    </header>
  );
};
