import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessionalPulse } from "@/components/Pulse/ProfessionalPulse";
import { CareerContentHub } from "@/components/social/CareerContentHub";
import { CareerGPTNavigator } from "@/components/social/CareerGPTNavigator";
import { GroupsHub } from "@/components/social/GroupsHub";
import { AdvancedSearchHub } from "@/components/social/AdvancedSearchHub";
import { NewsPulse } from "@/components/Pulse/NewsPulse";
import { LiveStreamingHub } from "@/components/social/LiveStreamingHub";
import { CareerAnalyticsCommandCenter } from "@/components/social/AnalyticsDashboard";
import { CreatorMonetizationHub } from "@/components/social/CreatorMonetizationHub";
import { VirtualSpacesHub } from "@/components/social/VirtualSpacesHub";
import { EnterpriseHub } from "@/components/enterprise/EnterpriseHub";
import { AIContentNavigator } from "@/components/ai/AIContentNavigator";
import { RealtimeCollabWorkspace } from "@/components/collaboration/RealtimeCollabWorkspace";
import { NetworkingIntelligenceHub } from "@/components/networking/NetworkingIntelligenceHub";
import { 
  Users, BookOpen, Sparkles, Newspaper, Search, UsersIcon, 
  Radio, BarChart3, DollarSign, Headphones, Building2, 
  FileText, Network, Zap, Shield, ArrowRight, Plus 
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const tabItems = [
  { value: "Pulse", label: "Talent Pulse", icon: Users, description: "Professional networking" },
  { value: "content", label: "Knowledge", icon: BookOpen, description: "Career development" },
  { value: "news", label: "Market News", icon: Newspaper, description: "Real-time updates" },
  { value: "groups", label: "Hubs", icon: UsersIcon, description: "Organization groups" },
  { value: "search", label: "Discovery", icon: Search, description: "Find opportunities" },
  { value: "streaming", label: "Live", icon: Radio, description: "Real-time events" },
  { value: "career-analytics", label: "Intelligence", icon: BarChart3, description: "Performance data" },
  { value: "monetization", label: "Creator", icon: DollarSign, description: "Monetize skills" },
  { value: "virtual", label: "AR/VR", icon: Headphones, description: "Immersive spaces" },
  { value: "navigator", label: "Navigator", icon: Sparkles, description: "AI strategy" },
  { value: "enterprise", label: "Enterprise", icon: Building2, description: "Business solutions" },
  { value: "collaboration", label: "Workspace", icon: FileText, description: "Real-time collab" },
  { value: "networking-intelligence", label: "Network", icon: Network, description: "Talent mapping" },
];

export default function SocialHub() {
  return (
    <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge">
      {/* Premium Header Section */}
      <div className="relative pt-16 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-blue-600 text-white border-0 rounded-lg font-apple-bold px-3 py-1">TALENTXCEL</Badge>
                <div className="h-1 w-1 bg-slate-300 rounded-full" />
                <span className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest">Ecosystem Hub</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-apple-heavy text-slate-950 tracking-tighter mb-4">
                Professional <br /> <span className="text-blue-600">Intelligence</span> Hub
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl font-apple-medium leading-relaxed">
                Unlock the full potential of your career with real-time networking, 
                collaborative intelligence, and immersive professional growth tools.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden lg:block">
                <p className="text-xs font-apple-bold text-slate-400 uppercase tracking-widest">Active Professionals</p>
                <p className="text-2xl font-apple-heavy text-slate-950">1,284,092</p>
              </div>
              <Button size="lg" className="rounded-2xl bg-slate-950 text-white font-apple-bold px-8 shadow-xl shadow-slate-900/10 hover:scale-105 transition-all">
                New Post <Plus className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="Pulse" className="w-full space-y-8">
            <div className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl py-4 -mx-6 px-6">
              <TabsList className="flex w-full h-auto bg-white/40 p-2 rounded-[28px] border border-slate-200/50 shadow-sm overflow-x-auto scrollbar-hide gap-1">
                {tabItems.map((item) => (
                  <TabsTrigger 
                    key={item.value} 
                    value={item.value} 
                    className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-[20px] transition-all duration-500 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-lg"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-apple-bold text-sm">{item.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Content Sections */}
            <div className="mt-8">
              <TabsContent value="Pulse" className="mt-0 focus-visible:outline-none">
                <ProfessionalPulse />
              </TabsContent>

              <TabsContent value="content" className="mt-0 focus-visible:outline-none">
                <CareerContentHub />
              </TabsContent>

              <TabsContent value="news" className="mt-0 focus-visible:outline-none">
                <NewsPulse />
              </TabsContent>

              <TabsContent value="groups" className="mt-0 focus-visible:outline-none">
                <GroupsHub />
              </TabsContent>

              <TabsContent value="search" className="mt-0 focus-visible:outline-none">
                <AdvancedSearchHub />
              </TabsContent>

              <TabsContent value="streaming" className="mt-0 focus-visible:outline-none">
                <LiveStreamingHub />
              </TabsContent>

              <TabsContent value="career-analytics" className="mt-0 focus-visible:outline-none">
                <CareerAnalyticsCommandCenter />
              </TabsContent>

              <TabsContent value="monetization" className="mt-0 focus-visible:outline-none">
                <CreatorMonetizationHub />
              </TabsContent>

              <TabsContent value="virtual" className="mt-0 focus-visible:outline-none">
                <VirtualSpacesHub />
              </TabsContent>

              <TabsContent value="enterprise" className="mt-0 focus-visible:outline-none">
                <EnterpriseHub />
              </TabsContent>

              <TabsContent value="collaboration" className="mt-0 focus-visible:outline-none">
                <RealtimeCollabWorkspace />
              </TabsContent>

              <TabsContent value="networking-intelligence" className="mt-0 focus-visible:outline-none">
                <NetworkingIntelligenceHub />
              </TabsContent>

              <TabsContent value="navigator" className="mt-0 focus-visible:outline-none">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <Card className="rounded-[32px] border-white/20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                    <CardHeader className="p-10 relative z-10">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-4xl font-apple-heavy mb-4">Talent AI Navigator</CardTitle>
                      <p className="text-blue-50 text-xl font-apple-medium max-w-2xl">
                        Your strategic professional intelligence partner. Map your next move, 
                        prepare for high-stakes interviews, and optimize your market identity.
                      </p>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 group cursor-pointer hover:bg-white/20 transition-all">
                          <Zap className="h-6 w-6 mb-4 text-blue-200" />
                          <h4 className="font-apple-heavy mb-1">Strategy Map</h4>
                          <p className="text-xs text-blue-100">AI-driven career roadmapping</p>
                        </div>
                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 group cursor-pointer hover:bg-white/20 transition-all">
                          <Shield className="h-6 w-6 mb-4 text-blue-200" />
                          <h4 className="font-apple-heavy mb-1">Interview Sim</h4>
                          <p className="text-xs text-blue-100">Live recruitment intelligence</p>
                        </div>
                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 group cursor-pointer hover:bg-white/20 transition-all flex items-center justify-between">
                          <div>
                            <h4 className="font-apple-heavy mb-1">Launch Navigator</h4>
                            <p className="text-xs text-blue-100">Start AI Career Planning</p>
                          </div>
                          <ArrowRight className="h-6 w-6 text-white group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="mt-8">
                    <CareerGPTNavigator />
                  </div>
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
