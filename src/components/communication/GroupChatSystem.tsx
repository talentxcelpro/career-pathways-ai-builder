import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Settings, Search, MessageSquare, Hash, Zap, Shield, Radio, Activity, Globe, Sparkles, ArrowUpRight, Lock, MessageCircle } from "lucide-react";
import { useCommunication } from "@/hooks/useCommunication";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const GroupChatSystem = () => {
  const { user } = useAuth();
  const { groupChats, createGroupChat, isLoading } = useCommunication();
  const [newGroupForm, setNewGroupForm] = useState({ name: '', description: '', isPrivate: false });
  const [searchQuery, setSearchQuery] = useState('');

  const mockGroups = [
    { id: '1', name: 'Strategic Growth', description: 'Advanced career strategy and professional growth optimization.', memberCount: 145, lastActivity: '2m ago', isPrivate: false, avatar: '', category: 'Strategy' },
    { id: '2', name: 'Tech Leadership', description: 'Deep tech leadership and system architecture discussions.', memberCount: 82, lastActivity: '12m ago', isPrivate: false, avatar: '', category: 'Tech' },
    { id: '3', name: 'Executive Hub', description: 'Private community for executive performance and leadership.', memberCount: 24, lastActivity: '1h ago', isPrivate: true, avatar: '', category: 'Elite' },
    { id: '4', name: 'Global Feed', description: 'General professional news and market insights.', memberCount: 567, lastActivity: 'Now', isPrivate: false, avatar: '', category: 'Global' }
  ];

  const handleCreateGroup = async () => {
    if (!newGroupForm.name.trim()) return;
    try {
      await createGroupChat({ name: newGroupForm.name, description: newGroupForm.description, isPrivate: newGroupForm.isPrivate });
      setNewGroupForm({ name: '', description: '', isPrivate: false });
    } catch (error) { console.error('Failed to create group:', error); }
  };

  const filteredGroups = mockGroups.filter(group =>
    searchQuery === '' || group.name.toLowerCase().includes(searchQuery.toLowerCase()) || group.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Search & Create Community */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between px-2">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-white border-slate-100 rounded-2xl font-apple-bold text-slate-950 placeholder:text-slate-300 shadow-sm"
          />
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 rounded-2xl bg-slate-950 text-white font-apple-heavy shadow-2xl shadow-slate-950/20 hover:scale-105 transition-all">
              <Plus className="h-5 w-5 mr-3" /> Create Community
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[40px] bg-white border-0 shadow-2xl p-10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-apple-heavy tracking-tight text-slate-950">Create Community</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest ml-1">Community Name</Label>
                <Input placeholder="Enter community name..." value={newGroupForm.name} onChange={(e) => setNewGroupForm({...newGroupForm, name: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-apple-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest ml-1">Community Description</Label>
                <Input placeholder="What is this community about?" value={newGroupForm.description} onChange={(e) => setNewGroupForm({...newGroupForm, description: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-apple-bold" />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <input type="checkbox" id="isPrivate" checked={newGroupForm.isPrivate} onChange={(e) => setNewGroupForm({...newGroupForm, isPrivate: e.target.checked})} className="h-4 w-4 rounded-md accent-slate-950" />
                <Label htmlFor="isPrivate" className="text-sm font-apple-bold text-slate-700">Private Community</Label>
              </div>
              <Button onClick={handleCreateGroup} disabled={!newGroupForm.name.trim()} className="w-full h-14 rounded-2xl bg-slate-950 text-white font-apple-heavy shadow-xl">
                Create TalentXcel Community
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categorical Filters */}
      <div className="flex gap-3 flex-wrap px-2">
        {['All Communities', 'Strategic Growth', 'Tech Leadership', 'Executive Hub', 'Global Feed'].map((cat) => (
          <Badge key={cat} className="h-10 px-6 rounded-xl bg-white border border-slate-200 text-slate-500 font-apple-bold hover:bg-slate-50 hover:text-slate-950 transition-all cursor-pointer">
            {cat}
          </Badge>
        ))}
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGroups.map((group, i) => (
          <motion.div key={group.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className="rounded-[40px] border border-white/20 bg-white/60 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden border">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                 <Hash className="h-24 w-24 text-blue-600" />
              </div>

              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <UserAvatar src={group.avatar} size="lg" className="rounded-[24px] shadow-xl border-2 border-white" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-apple-heavy text-slate-950 tracking-tight text-lg truncate">{group.name}</h3>
                      {group.isPrivate && <Badge className="bg-slate-100 text-slate-400 border-0 rounded-lg px-2 py-0 font-apple-bold text-[8px] uppercase tracking-widest">PRIVATE</Badge>}
                    </div>
                    <p className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest">{group.category}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-slate-950 hover:bg-slate-50">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-0 space-y-6 relative z-10">
                <p className="text-sm font-apple-medium text-slate-500 line-clamp-2 leading-relaxed">
                  {group.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-[10px] font-apple-heavy text-slate-950">{group.memberCount} Members</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <Activity className="h-3 w-3 text-emerald-500" />
                     <span className="text-[9px] font-apple-bold text-slate-400 uppercase tracking-widest">{group.lastActivity}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button className="flex-1 h-12 rounded-2xl bg-slate-950 text-white font-apple-heavy text-xs shadow-xl shadow-slate-950/10 hover:scale-[1.02] transition-all">
                    <MessageSquare className="h-4 w-4 mr-2" /> Join Community
                  </Button>
                  <Button variant="ghost" className="h-12 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-apple-bold text-slate-600 text-xs hover:bg-slate-100">View Details</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* My Communities */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <Zap className="h-4 w-4 text-amber-500" />
           <h2 className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest">My Communities</h2>
        </div>
        <Card className="rounded-[48px] bg-slate-950 text-white p-10 shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
             <MessageCircle className="h-48 w-48 text-blue-500" />
          </div>

          <div className="relative z-10">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500 font-apple-bold uppercase text-[10px] tracking-widest animate-pulse">Loading Communities...</div>
            ) : groupChats && groupChats.length > 0 ? (
              <ScrollArea className="h-80 pr-6">
                <div className="grid gap-4">
                  {groupChats.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-6 rounded-[32px] bg-white/5 border border-white/10 group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-6">
                        <UserAvatar src="" size="lg" className="rounded-2xl border-2 border-white/10" />
                        <div>
                          <h4 className="font-apple-heavy text-white text-lg tracking-tight">{group.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                             <Badge className="bg-white/10 text-slate-400 border-0 rounded-lg px-2 py-0.5 font-apple-bold text-[8px] uppercase tracking-widest">ACTIVE</Badge>
                             <span className="text-[10px] font-apple-bold text-slate-600 uppercase tracking-widest">{group.members?.length || 0} Members</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/5 border-0 hover:bg-white/10">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-20 space-y-6">
                <div className="h-20 w-20 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto border border-white/10">
                   <Lock className="h-8 w-8 text-slate-700" />
                </div>
                <p className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest">No community memberships found</p>
                <Button className="rounded-2xl h-14 px-10 bg-white text-slate-950 font-apple-heavy shadow-2xl shadow-white/10">Explore Communities</Button>
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default GroupChatSystem;