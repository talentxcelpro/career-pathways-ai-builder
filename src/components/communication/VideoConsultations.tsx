import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Video, User, MapPin, DollarSign, Star, Zap, Shield, Radio, Activity, Globe, Sparkles, ArrowUpRight } from "lucide-react";
import { useCommunication } from "@/hooks/useCommunication";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays } from "date-fns";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const VideoConsultations = () => {
  const { user } = useAuth();
  const { videoConsultations, bookConsultation, isLoading } = useCommunication();
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({
    title: '',
    description: '',
    duration: 30,
    scheduledAt: '',
    consultationType: 'career-guidance'
  });

  const mockExperts = [
    { id: '1', name: 'Dr. Sarah Johnson', speciality: 'Career Strategy', rating: 4.9, hourlyRate: 150, avatar: '', location: 'New York, USA', nextAvailable: new Date() },
    { id: '2', name: 'Michael Chen', speciality: 'Tech Leadership', rating: 4.8, hourlyRate: 200, avatar: '', location: 'San Francisco, USA', nextAvailable: addDays(new Date(), 1) },
    { id: '3', name: 'Emma Rodriguez', speciality: 'Interview Coaching', rating: 4.9, hourlyRate: 120, avatar: '', location: 'London, UK', nextAvailable: addDays(new Date(), 2) }
  ];

  const handleBookConsultation = async () => {
    if (!selectedExpert || !bookingForm.title || !bookingForm.scheduledAt) return;
    try {
      await bookConsultation({ expertId: selectedExpert, ...bookingForm, scheduledAt: new Date(bookingForm.scheduledAt) });
      setBookingForm({ title: '', description: '', duration: 30, scheduledAt: '', consultationType: 'career-guidance' });
      setSelectedExpert(null);
    } catch (error) { console.error('Failed to book consultation:', error); }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Professional Mentors */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest">Professional Mentors</h2>
           </div>
           <Badge className="bg-slate-950 text-white border-0 rounded-lg px-2 py-0.5 font-apple-heavy text-[9px] tracking-widest uppercase">3 ONLINE</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockExperts.map((expert, i) => (
            <motion.div key={expert.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
              <Card 
                className={cn(
                  "rounded-[40px] border border-white/20 bg-white/60 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden",
                  selectedExpert === expert.id ? 'ring-2 ring-blue-600' : ''
                )}
                onClick={() => setSelectedExpert(expert.id)}
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                   <Video className="h-24 w-24 text-blue-600" />
                </div>
                
                <div className="flex items-start gap-5 mb-8 relative z-10">
                  <Avatar className="h-16 w-16 rounded-[24px] shadow-xl border-2 border-white">
                    <AvatarImage src={expert.avatar} />
                    <AvatarFallback className="bg-slate-950 text-white font-apple-heavy">{expert.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-apple-heavy text-slate-950 text-lg tracking-tight truncate">{expert.name}</h3>
                    <p className="text-xs font-apple-bold text-slate-400 uppercase tracking-widest mt-0.5">{expert.speciality}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                       <Star className="h-3 w-3 text-amber-500 fill-current" />
                       <span className="text-[10px] font-apple-heavy text-slate-950">{expert.rating} Rating</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8 relative z-10">
                  {[
                    { icon: MapPin, text: expert.location },
                    { icon: DollarSign, text: `${expert.hourlyRate}/hour` },
                    { icon: Calendar, text: `Available ${format(expert.nextAvailable, 'MMM dd')}` }
                  ].map((info, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs font-apple-medium text-slate-500">
                      <info.icon className="h-4 w-4 text-slate-300" />
                      {info.text}
                    </div>
                  ))}
                </div>

                <Button 
                  className={cn(
                    "w-full h-12 rounded-[20px] font-apple-heavy text-xs transition-all",
                    selectedExpert === expert.id 
                      ? "bg-slate-950 text-white" 
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                  )}
                >
                  {selectedExpert === expert.id ? 'Expert Selected' : 'Book Session'} <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Booking Interface */}
      <AnimatePresence>
        {selectedExpert && (
          <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Card className="rounded-[48px] bg-slate-950 text-white p-10 shadow-2xl relative overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
                 <Calendar className="h-48 w-48" />
              </div>
              
              <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-apple-heavy tracking-tight">Session Configuration</h3>
                    <p className="text-[10px] font-apple-bold text-slate-500 uppercase tracking-widest mt-1">Configure your professional consultation</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest ml-1">Session Goal</Label>
                      <Input
                        placeholder="Describe what you want to achieve..."
                        value={bookingForm.title}
                        onChange={(e) => setBookingForm({...bookingForm, title: e.target.value})}
                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-700 font-apple-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest ml-1">Session Type</Label>
                      <Select 
                        value={bookingForm.consultationType} 
                        onValueChange={(v) => setBookingForm({...bookingForm, consultationType: v})}
                      >
                        <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-apple-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="career-guidance">Career Strategy</SelectItem>
                          <SelectItem value="interview-prep">Interview Prep</SelectItem>
                          <SelectItem value="resume-review">Resume Review</SelectItem>
                          <SelectItem value="leadership-coaching">Leadership Coaching</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest ml-1">Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={bookingForm.scheduledAt}
                        onChange={(e) => setBookingForm({...bookingForm, scheduledAt: e.target.value})}
                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-apple-bold [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest ml-1">Session Duration</Label>
                      <Select 
                        value={bookingForm.duration.toString()} 
                        onValueChange={(v) => setBookingForm({...bookingForm, duration: parseInt(v)})}
                      >
                        <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-apple-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="30">30 Minutes</SelectItem>
                          <SelectItem value="60">60 Minutes</SelectItem>
                          <SelectItem value="90">90 Minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest ml-1">Additional Details</Label>
                  <Textarea
                    placeholder="Provide background information for the expert..."
                    value={bookingForm.description}
                    onChange={(e) => setBookingForm({...bookingForm, description: e.target.value})}
                    rows={3}
                    className="rounded-[32px] bg-white/5 border-white/10 text-white placeholder:text-slate-700 font-apple-medium p-6 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    onClick={handleBookConsultation}
                    disabled={!bookingForm.title || !bookingForm.scheduledAt || isLoading}
                    className="flex-1 h-16 rounded-[24px] bg-blue-600 text-white font-apple-heavy shadow-2xl shadow-blue-600/20 hover:scale-[1.02] transition-all"
                  >
                    <Video className="h-5 w-5 mr-3" />
                    Book Session
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => setSelectedExpert(null)}
                    className="h-16 px-10 rounded-[24px] bg-white/5 border-0 font-apple-heavy text-slate-400 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Upcoming Sessions */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <Activity className="h-4 w-4 text-emerald-600" />
           <h2 className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest">Upcoming Sessions</h2>
        </div>
        <Card className="rounded-[40px] bg-white border border-slate-200/50 p-10 shadow-xl overflow-hidden relative">
          {isLoading ? (
            <div className="text-center py-12">
               <div className="h-8 w-48 bg-slate-100 rounded-lg mx-auto animate-pulse" />
            </div>
          ) : videoConsultations && videoConsultations.length > 0 ? (
            <div className="space-y-6">
              {videoConsultations.map((consultation) => (
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={consultation.id} className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[32px] bg-slate-50/50 border border-slate-100/50 group hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center gap-6 mb-4 md:mb-0">
                    <Avatar className="h-14 w-14 rounded-2xl shadow-lg border-2 border-white">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-slate-950 text-white font-apple-heavy">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-apple-heavy text-slate-950 text-lg">{consultation.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <Badge className="bg-blue-100 text-blue-700 border-0 rounded-lg px-2 py-0.5 font-apple-bold text-[9px] uppercase tracking-widest">
                            {consultation.status}
                         </Badge>
                         <span className="text-xs font-apple-medium text-slate-400">
                           {format(new Date(consultation.scheduled_at), 'PPp')}
                         </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" className="rounded-xl h-11 px-6 font-apple-heavy text-slate-400 hover:text-rose-600">Cancel</Button>
                    <Button className="rounded-2xl h-12 px-8 bg-slate-950 text-white font-apple-heavy shadow-xl shadow-slate-950/10 hover:scale-105 transition-all">
                      <Video className="h-4 w-4 mr-2" />
                      Join Call
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <div className="h-16 w-16 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto">
                 <Shield className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-sm font-apple-heavy text-slate-400 uppercase tracking-widest">No sessions booked</p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
};

export default VideoConsultations;
