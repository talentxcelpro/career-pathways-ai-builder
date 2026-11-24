// src/components/network/UnifiedNetworkSearchDialog.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  fetchDiscoverableProfiles, 
  fetchLocationCommunities, 
  fetchLocationDiscussions, 
  fetchLocationEvents,
  DiscoverableProfessional,
  DiscoverableCommunity,
  DiscoverableDiscussion,
  DiscoverableEvent
} from '@/lib/network/discovery';
import { searchLocations } from '@/lib/geography/resolver';
import { ResolvedGeographicLocation } from '@/lib/geography/types';
import { 
  Search, 
  Users, 
  Layers, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';

interface UnifiedNetworkSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

export const UnifiedNetworkSearchDialog: React.FC<UnifiedNetworkSearchDialogProps> = ({
  open,
  onOpenChange,
  initialQuery = ''
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'communities' | 'discussions' | 'events'>('all');
  const [loading, setLoading] = useState(false);

  const [people, setPeople] = useState<DiscoverableProfessional[]>([]);
  const [communities, setCommunities] = useState<DiscoverableCommunity[]>([]);
  const [discussions, setDiscussions] = useState<DiscoverableDiscussion[]>([]);
  const [events, setEvents] = useState<DiscoverableEvent[]>([]);
  const [locations, setLocations] = useState<ResolvedGeographicLocation[]>([]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setPeople([]);
      setCommunities([]);
      setDiscussions([]);
      setEvents([]);
      setLocations([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [profRes, commList, discList, eventList] = await Promise.all([
          fetchDiscoverableProfiles({ query: trimmed, pageSize: 8 }),
          fetchLocationCommunities({ query: trimmed }),
          fetchLocationDiscussions({ query: trimmed }),
          fetchLocationEvents({ isVirtualEvent: true })
        ]);

        const matchedLocs = searchLocations(trimmed, 4);

        setPeople(profRes.professionals);
        setCommunities(commList.slice(0, 6));
        setDiscussions(discList.slice(0, 6));
        setEvents(eventList.slice(0, 6));
        setLocations(matchedLocs);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open]);

  const totalResults = people.length + communities.length + discussions.length + events.length + locations.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border/80 shadow-2xl">
        
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 dark:border-border/60 flex items-center gap-3">
          <Search className="h-5 w-5 text-blue-600 shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search verified professionals, skills, communities, events, or topics..."
            className="border-0 bg-transparent text-sm font-medium focus-visible:ring-0 p-0 h-8 placeholder:text-muted-foreground"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
        </div>

        {/* Tab Filters */}
        <div className="px-4 py-2 bg-slate-50/70 dark:bg-muted/40 border-b border-slate-100 dark:border-border/60 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: `All Results (${totalResults})` },
            { id: 'people', label: `Professionals (${people.length})` },
            { id: 'communities', label: `Communities (${communities.length})` },
            { id: 'discussions', label: `Discussions (${discussions.length})` },
            { id: 'events', label: `Events (${events.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
          {query.trim().length < 2 && (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Type at least 2 characters to search across the TalentXcel Global Network.
            </div>
          )}

          {query.trim().length >= 2 && !loading && totalResults === 0 && (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No matching public network results found for "{query}".
            </div>
          )}

          {/* Location Hubs (Intelligent Geographic Discovery Match) */}
          {activeTab === 'all' && locations.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                <span>Geographic Hubs</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {locations.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(loc.canonicalPath);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{loc.country.flag}</span>
                    <span>{loc.displayName}</span>
                    <ArrowRight className="h-3 w-3 text-blue-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 1. People Section */}
          {(activeTab === 'all' || activeTab === 'people') && people.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                <span>Verified Professionals</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {people.map(prof => (
                  <div
                    key={prof.id}
                    onClick={() => {
                      onOpenChange(false);
                      navigate(prof.canonicalPath || `/u/${prof.id}`);
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-400 bg-white dark:bg-card cursor-pointer transition-all flex items-start gap-2.5 group"
                  >
                    <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700 shrink-0">
                      <AvatarImage src={prof.avatarUrl} />
                      <AvatarFallback className="bg-slate-800 text-white font-bold text-xs">
                        {prof.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-foreground truncate group-hover:text-blue-600">
                        {prof.fullName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{prof.title}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{prof.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Communities Section */}
          {(activeTab === 'all' || activeTab === 'communities') && communities.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                <span>Communities &amp; Circles</span>
              </h3>
              <div className="space-y-2">
                {communities.map(comm => (
                  <div
                    key={comm.id}
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/network/communities');
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-card cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{comm.name}</h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{comm.headline}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{comm.memberCount} members</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Discussions Section */}
          {(activeTab === 'all' || activeTab === 'discussions') && discussions.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                <span>Discussions</span>
              </h3>
              <div className="space-y-2">
                {discussions.map(disc => (
                  <div
                    key={disc.id}
                    onClick={() => {
                      onOpenChange(false);
                      navigate(disc.canonicalUrl);
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-purple-400 bg-white dark:bg-card cursor-pointer transition-all space-y-1"
                  >
                    <p className="text-xs text-foreground line-clamp-2">{disc.content}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                      <span>By {disc.authorName}</span>
                      <span>❤️ {disc.likesCount}</span>
                      <span>💬 {disc.commentsCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Events Section */}
          {(activeTab === 'all' || activeTab === 'events') && events.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-pink-600" />
                <span>Events &amp; Meetups</span>
              </h3>
              <div className="space-y-2">
                {events.map(evt => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      onOpenChange(false);
                      navigate(evt.canonicalUrl);
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-pink-400 bg-white dark:bg-card cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{evt.title}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        📅 {new Date(evt.startTime).toLocaleDateString()} • {evt.isVirtual ? 'Virtual' : evt.location}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{evt.currentAttendees} attending</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </DialogContent>
    </Dialog>
  );
};

export default UnifiedNetworkSearchDialog;
