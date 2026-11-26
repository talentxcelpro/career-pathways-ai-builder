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
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useUniversalSearch } from '@/hooks/useUniversalSearch';
import type { SearchEntityType, UniversalSearchItem } from '@/services/search/universal/types';
import {
  Briefcase,
  Users,
  FileText,
  BookOpen,
  Crown,
  Target,
  Settings,
  User,
  Play,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Building2,
  Globe,
  MessageSquare,
  GraduationCap,
  Clock,
  Loader2,
} from 'lucide-react';

function getEntityIcon(type: SearchEntityType) {
  switch (type) {
    case 'jobs':
      return <Briefcase className="mr-2 h-4 w-4 text-blue-500 shrink-0" />;
    case 'people':
    case 'talent':
    case 'connections':
      return <Users className="mr-2 h-4 w-4 text-purple-500 shrink-0" />;
    case 'companies':
      return <Building2 className="mr-2 h-4 w-4 text-emerald-500 shrink-0" />;
    case 'communities':
      return <Globe className="mr-2 h-4 w-4 text-cyan-500 shrink-0" />;
    case 'posts':
      return <FileText className="mr-2 h-4 w-4 text-amber-500 shrink-0" />;
    case 'articles':
    case 'courses':
      return <BookOpen className="mr-2 h-4 w-4 text-indigo-500 shrink-0" />;
    case 'reels':
      return <Play className="mr-2 h-4 w-4 text-rose-500 shrink-0" />;
    case 'colleges':
      return <GraduationCap className="mr-2 h-4 w-4 text-teal-500 shrink-0" />;
    case 'messages':
      return <MessageSquare className="mr-2 h-4 w-4 text-sky-500 shrink-0" />;
    default:
      return <Search className="mr-2 h-4 w-4 shrink-0" />;
  }
}

interface UniversalSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  externalQuery?: string;
}

export const UniversalSearch: React.FC<UniversalSearchProps> = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  externalQuery,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const navigate = useNavigate();

  const {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    response,
    isLoading,
    suggestions,
    recentSearches,
    recordClick,
  } = useUniversalSearch({ enabled: open, debounceMs: 220, limitPerScope: 5 });

  useEffect(() => {
    if (open && externalQuery !== undefined && externalQuery !== query) {
      setQuery(externalQuery);
    }
  }, [open, externalQuery, setQuery]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const handleSelectItem = useCallback(
    (item: UniversalSearchItem) => {
      recordClick(item.type, item.id);
      setOpen(false);
      navigate(item.url);
    },
    [navigate, recordClick]
  );

  const hasQuery = query.trim().length >= 2;
  const availableGroups = response
    ? Object.values(response.groups).filter((g): g is NonNullable<typeof g> => Boolean(g && g.items.length > 0))
    : [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Universal Search"
        className="relative inline-flex items-center justify-start px-3 py-1.5 text-xs font-medium transition-all bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-[230px] text-slate-300 hover:bg-white/10 hover:border-white/20 group overflow-hidden"
      >
        <Search className="mr-2 h-3.5 w-3.5 transition-transform group-hover:scale-110 shrink-0" />
        <span className="truncate">Search TalentXcel...</span>
        <kbd className="pointer-events-none absolute right-2 top-[50%] translate-y-[-50%] select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium opacity-100 hidden sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Ask anything: e.g. 'HR managers in Bengaluru with 10+ yrs' or 'remote Python jobs'..."
          value={query}
          onValueChange={setQuery}
        />

        {/* Intent Understanding Chips & Category Switcher */}
        {hasQuery && response && (
          <div className="px-3 py-2 border-b bg-muted/30 space-y-2">
            {response.intent.explanationChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary shrink-0" />
                <span className="text-[11px] font-medium text-muted-foreground">Understood:</span>
                {response.intent.explanationChips.map((chip) => (
                  <Badge key={chip} variant="secondary" className="text-[10px] py-0 px-1.5">
                    {chip}
                  </Badge>
                ))}
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {response.latencyMs}ms • {response.source}
                </span>
              </div>
            )}

            {availableGroups.length > 1 && (
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({response.totalCount})
                </button>
                {availableGroups.map((group) => (
                  <button
                    key={group.type}
                    type="button"
                    onClick={() => setActiveCategory(group.type)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                      activeCategory === group.type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {group.label} ({group.totalCount})
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <CommandList className="max-h-[460px]">
          {isLoading && hasQuery && (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Searching across TalentXcel...</span>
            </div>
          )}

          {/* Live Search Results */}
          {!isLoading && hasQuery && availableGroups.length > 0 && (
            <>
              {availableGroups.map((group) => (
                <CommandGroup key={group.type} heading={`${group.label} (${group.totalCount})`}>
                  {group.items.map((item) => (
                    <CommandItem
                      key={`${item.type}-${item.id}`}
                      value={`${item.type}-${item.id}-${item.title}`}
                      onSelect={() => handleSelectItem(item)}
                      className="flex items-start gap-2 py-2.5 cursor-pointer"
                    >
                      <div className="mt-0.5">{getEntityIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{item.title}</span>
                          {item.badge && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 shrink-0">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                        )}
                        {item.matchReasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.matchReasons.map((reason) => (
                              <span
                                key={reason}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </>
          )}

          {/* Empty Results Intelligence */}
          {!isLoading && hasQuery && availableGroups.length === 0 && (
            <CommandEmpty className="py-6 px-4 text-center">
              <p className="text-sm font-medium mb-1">No matching results found for "{query}"</p>
              <p className="text-xs text-muted-foreground mb-3">
                Try one of these alternatives based on your query:
              </p>
              {response?.emptyAlternatives && response.emptyAlternatives.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {response.emptyAlternatives.map((alt) => (
                    <button
                      key={alt.query}
                      type="button"
                      onClick={() => setQuery(alt.query)}
                      className="px-2.5 py-1 rounded-full text-xs border bg-background hover:bg-accent transition-colors"
                      title={alt.reason}
                    >
                      {alt.label}
                    </button>
                  ))}
                </div>
              )}
            </CommandEmpty>
          )}

          {/* Default State: Recent Searches, Smart Suggestions & Quick Navigation */}
          {!hasQuery && (
            <>
              {recentSearches.length > 0 && (
                <>
                  <CommandGroup heading="Recent Searches">
                    {recentSearches.slice(0, 4).map((recent) => (
                      <CommandItem key={recent} onSelect={() => setQuery(recent)}>
                        <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">{recent}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              <CommandGroup heading="Try Natural Language Search">
                {suggestions.slice(0, 4).map((s) => (
                  <CommandItem key={s} onSelect={() => setQuery(s)}>
                    <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                    <span className="text-xs">{s}</span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

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
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
