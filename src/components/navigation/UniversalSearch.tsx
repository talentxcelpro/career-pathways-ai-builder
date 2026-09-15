import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { 
  Briefcase, 
  Users, 
  FileText, 
  BookOpen, 
  Crown,
  TrendingUp, 
  Target, 
  Settings,
  User,
  Zap,
  Play,
  Rocket,
  Search,
  MessageSquare,
  Trophy,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export const UniversalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative inline-flex items-center justify-start px-4 py-2 text-sm font-medium transition-all bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-[260px] text-muted-foreground hover:bg-white/10 hover:border-white/20 group overflow-hidden"
      >
        <Search className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
        <span className="truncate">Search anything...</span>
        <kbd className="pointer-events-none absolute right-3 top-[50%] translate-y-[-50%] select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium opacity-100 hidden sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="max-h-[500px]">
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Core Modules">
            <CommandItem onSelect={() => runCommand(() => navigate('/jobs'))}>
              <Briefcase className="mr-2 h-4 w-4 text-blue-500" />
              <span>Job Search</span>
              <CommandShortcut>⌘J</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/network'))}>
              <Users className="mr-2 h-4 w-4 text-purple-500" />
              <span>Professional Network</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/profile'))}>
              <User className="mr-2 h-4 w-4 text-green-500" />
              <span>My Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="CareerIntelligence (AI)">
            <CommandItem onSelect={() => runCommand(() => navigate('/ai-career-hub'))}>
              <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
              <span>AI Career Hub</span>
              <CommandShortcut>⌘A</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/resume/ats-check'))}>
              <Shield className="mr-2 h-4 w-4 text-orange-500" />
              <span>ATS Resume Scanner</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/pro/CommandCenter'))}>
              <Crown className="mr-2 h-4 w-4 text-purple-500" />
              <span>Pro CommandCenter</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/skills-assessment'))}>
              <Target className="mr-2 h-4 w-4 text-red-500" />
              <span>Skill Gap Analysis</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Tools & Learning">
            <CommandItem onSelect={() => runCommand(() => navigate('/resume'))}>
              <FileText className="mr-2 h-4 w-4 text-indigo-500" />
              <span>Resume Builder</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/learning'))}>
              <BookOpen className="mr-2 h-4 w-4 text-cyan-500" />
              <span>Learning Center</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/mobile/reels'))}>
              <Play className="mr-2 h-4 w-4 text-rose-500" />
              <span>Career Reels</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="System">
            <CommandItem onSelect={() => runCommand(() => navigate('/profile?tab=settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/launch/final'))}>
              <Rocket className="mr-2 h-4 w-4" />
              <span>Admin Console</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};


