import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Video, Users, Zap, Radio, Globe, Activity, Shield, Sparkles, MessageCircle } from "lucide-react";
import DirectMessaging from "@/components/communication/DirectMessaging";
import VideoConsultations from "@/components/communication/VideoConsultations";
import GroupChatSystem from "@/components/communication/GroupChatSystem";
import { MobileMessaging } from "@/components/mobile/MobileMessaging";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const Communication = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-950 overflow-hidden edge-to-edge">
        <MobileMessaging />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge pb-32">
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

      {/* Premium Collaboration Header */}
      <header className="sticky top-0 z-50 glass-pro border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
              <MessageSquare className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-apple-heavy text-slate-950 tracking-tight">Communication Hub</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-100 text-blue-700 border-0 rounded-lg px-2 py-0.5 font-apple-bold text-[9px] uppercase tracking-widest">SECURE NETWORK</Badge>
                <span className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest">Active Professional Collaboration</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-apple-heavy text-emerald-600 uppercase tracking-widest">Connected</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <Tabs defaultValue="messages" className="w-full space-y-12">
          <div className="flex justify-center">
            <TabsList className="bg-white/40 backdrop-blur-md p-1.5 rounded-[24px] border border-slate-200/50 h-16 w-full max-w-2xl shadow-xl">
              <TabsTrigger value="messages" className="rounded-xl px-8 font-apple-heavy text-sm data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all flex items-center gap-3">
                <MessageCircle className="h-4 w-4" /> Messages
              </TabsTrigger>
              <TabsTrigger value="video" className="rounded-xl px-8 font-apple-heavy text-sm data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all flex items-center gap-3">
                <Video className="h-4 w-4" /> Video Calls
              </TabsTrigger>
              <TabsTrigger value="groups" className="rounded-xl px-8 font-apple-heavy text-sm data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all flex items-center gap-3">
                <Users className="h-4 w-4" /> Communities
              </TabsTrigger>
            </TabsList>
          </div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <TabsContent value="messages" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
               <div className="rounded-[48px] bg-white/40 backdrop-blur-3xl border border-white/20 shadow-2xl overflow-hidden min-h-[700px]">
                  <DirectMessaging />
               </div>
            </TabsContent>

            <TabsContent value="video" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
               <div className="rounded-[48px] bg-white/40 backdrop-blur-3xl border border-white/20 shadow-2xl overflow-hidden min-h-[700px]">
                  <VideoConsultations />
               </div>
            </TabsContent>

            <TabsContent value="groups" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
               <div className="rounded-[48px] bg-white/40 backdrop-blur-3xl border border-white/20 shadow-2xl overflow-hidden min-h-[700px]">
                  <GroupChatSystem />
               </div>
            </TabsContent>
          </motion.div>
        </Tabs>
      </main>

      {/* Premium Collaboration Footer Status */}
      <footer className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40">
         <div className="glass-pro rounded-full px-8 py-4 border border-white/20 shadow-2xl flex items-center gap-8">
            <div className="flex items-center gap-2">
               <Shield className="h-4 w-4 text-blue-600" />
               <span className="text-[10px] font-apple-heavy text-slate-500 uppercase tracking-widest">Secure Encryption</span>
            </div>
            <div className="h-1 w-1 bg-slate-200 rounded-full" />
            <div className="flex items-center gap-2">
               <Globe className="h-4 w-4 text-slate-400" />
               <span className="text-[10px] font-apple-heavy text-slate-500 uppercase tracking-widest">Global Network Active</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Communication;