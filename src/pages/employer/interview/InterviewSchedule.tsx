
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ArrowLeft, Clock, Users, Video, MapPin, Plus, CheckCircle, Mail } from "lucide-react";
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScheduledInterview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  date: string;
  time: string;
  mode: string;
  notes?: string;
  status: 'confirmed' | 'completed' | 'cancelled';
}

const InterviewSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(id || '');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [interviewMode, setInterviewMode] = useState('Google Meet');
  const [notes, setNotes] = useState('');

  // Persisted local scheduled interviews for session
  const [scheduledList, setScheduledList] = useState<ScheduledInterview[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('txc_scheduled_interviews');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });

  // Query real jobs from Supabase
  const { data: userJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['employer-schedule-jobs'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      let query = supabase.from('jobs').select('id, title, location, company_name').eq('is_active', true);
      if (user.user) {
        // Prefer jobs by user, but if none yet, fetch available active jobs
        const { data: personalJobs } = await supabase
          .from('jobs')
          .select('id, title, location, company_name')
          .eq('posted_by', user.user.id);
        
        if (personalJobs && personalJobs.length > 0) {
          return personalJobs;
        }
      }
      const { data: generalJobs } = await query.limit(10);
      return generalJobs || [];
    },
  });

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim() || !interviewDate) {
      toast.error('Please enter candidate name, email, and interview date');
      return;
    }

    const job = userJobs?.find(j => j.id === selectedJobId);
    const newInterview: ScheduledInterview = {
      id: 'intv-' + Date.now(),
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim(),
      jobTitle: job?.title || 'General Position',
      date: interviewDate,
      time: interviewTime,
      mode: interviewMode,
      notes: notes.trim(),
      status: 'confirmed',
    };

    const updated = [newInterview, ...scheduledList];
    setScheduledList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('txc_scheduled_interviews', JSON.stringify(updated));
    }

    toast.success(`Interview scheduled with ${candidateName}!`);
    setCandidateName('');
    setCandidateEmail('');
    setNotes('');
    setShowScheduleForm(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => id ? navigate(`/jobs/manage/${id}`) : navigate('/dashboard?view=role')}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Schedule Interview</h1>
            <p className="text-xs text-slate-500">Coordinate and manage candidate interview rounds</p>
          </div>
        </div>

        <Button 
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showScheduleForm ? 'Close Form' : 'Schedule New Interview'}
        </Button>
      </div>

      {/* Schedule Form */}
      {showScheduleForm && (
        <Card className="border-purple-100 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">New Interview Details</CardTitle>
            <CardDescription>Enter candidate information and preferred interview slot</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="candidateName">Candidate Full Name *</Label>
                  <Input 
                    id="candidateName" 
                    placeholder="e.g. Alex Sharma" 
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="candidateEmail">Candidate Email Address *</Label>
                  <Input 
                    id="candidateEmail" 
                    type="email" 
                    placeholder="alex@example.com" 
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="jobSelect">Job Opening</Label>
                  <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                    <SelectTrigger id="jobSelect">
                      <SelectValue placeholder="Select relevant opening" />
                    </SelectTrigger>
                    <SelectContent>
                      {(userJobs || []).map(j => (
                        <SelectItem key={j.id} value={j.id}>
                          {j.title} {j.company_name ? `(${j.company_name})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="interviewMode">Meeting Platform / Mode</Label>
                  <Select value={interviewMode} onValueChange={setInterviewMode}>
                    <SelectTrigger id="interviewMode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="Zoom Video">Zoom Video</SelectItem>
                      <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                      <SelectItem value="Phone Call">Phone Screening</SelectItem>
                      <SelectItem value="In-Person Office">In-Person Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="interviewDate">Interview Date *</Label>
                  <Input 
                    id="interviewDate" 
                    type="date" 
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="interviewTime">Time Slot</Label>
                  <Input 
                    id="interviewTime" 
                    type="time" 
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Agenda / Preparation Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="e.g. Technical system design round, review past projects" 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowScheduleForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                  Confirm & Schedule
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Scheduled List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center justify-between">
            <span>Scheduled Interviews ({scheduledList.length})</span>
            <Badge variant="outline" className="text-xs font-semibold">
              Real-time Active
            </Badge>
          </CardTitle>
          <CardDescription>Upcoming interviews scheduled through your employer workspace</CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledList.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-14 w-14 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No interviews scheduled yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                Schedule your first interview round with candidates who have applied to your active positions.
              </p>
              <Button 
                onClick={() => setShowScheduleForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Schedule Interview Now
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledList.map((interview) => (
                <div key={interview.id} className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{interview.candidateName}</h4>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                        {interview.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-blue-600">{interview.jobTitle}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {interview.candidateEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(interview.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {interview.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3 text-purple-500" /> {interview.mode}
                      </span>
                    </div>
                    {interview.notes && (
                      <p className="text-[11px] text-slate-400 italic pt-1">Note: {interview.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => {
                        const updated = scheduledList.filter(i => i.id !== interview.id);
                        setScheduledList(updated);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('txc_scheduled_interviews', JSON.stringify(updated));
                        }
                        toast.info('Interview cancelled');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewSchedule;
